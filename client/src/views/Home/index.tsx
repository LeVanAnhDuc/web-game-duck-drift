'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useGame } from '@/hooks/useGame'
import { DIFFICULTY } from '@/game/core/constants'
import type { ScoreEntry, Tuning } from '@/game/core/types'
import { vi } from '@/i18n/vi'
import { isCoarsePointer } from '@/input/touch'
import { createLocalScoreStore, SCORE_KEYS } from '@/storage/localScoreStore'
import { createSettingsStore } from '@/storage/settingsStore'
import { CustomScreen } from './mains/CustomScreen'
import { Hud } from './mains/Hud'
import { HelpScreen } from './mains/HelpScreen'
import { HighScoresScreen } from './mains/HighScoresScreen'
import { ControlsHint } from './components/ControlsHint'
import { LiveRegion, translateAnnouncement } from './components/LiveRegion'
import { MenuScreen, type PresetId } from './mains/MenuScreen'
import { GameOverOverlay } from './components/GameOverOverlay'
import { PauseOverlay } from './components/PauseOverlay'
import { TouchControls } from './components/TouchControls'

// ghosts
import { FreezeRankAtGameOver } from './ghosts/FreezeRankAtGameOver'

/** Mức lưu trong máy có thể là `custom`; menu chỉ chọn được ba mức sẵn. */
function presetOf(id: string): PresetId {
  return id === 'easy' || id === 'hard' ? id : 'normal'
}

export function Home() {
  // Seed cố định ở lần dựng đầu để server và client render giống nhau; mỗi ván
  // mới dùng lại state đó nên không cần seed ngẫu nhiên ở đây.
  const { canvasRef, hud, announce, touch, actions } = useGame(20260904)

  const settings = useMemo(() => createSettingsStore(), [])
  const storeOf = useCallback((id: PresetId) => createLocalScoreStore(undefined, SCORE_KEYS[id]), [])

  /** Mức sẽ chơi khi bấm Chơi ở menu. */
  const [preset, setPreset] = useState<PresetId>('normal')
  /** Bốn số của chế độ Tuỳ chỉnh. Tách khỏi `preset` — chúng độc lập. */
  const [tuning, setTuning] = useState<Tuning>(DIFFICULTY.normal)
  /**
   * Mức của bảng ĐANG XEM. Tách khỏi `preset` vì xem bảng mức khác không có
   * nghĩa là đổi mức sẽ chơi.
   */
  const [table, setTable] = useState<PresetId>('normal')
  const [entries, setEntries] = useState<ScoreEntry[]>([])
  const [best, setBest] = useState<number | null>(null)
  const [highlightAt, setHighlightAt] = useState<number | null>(null)
  const [coarse, setCoarse] = useState(false)
  /**
   * Hạng của ván vừa kết thúc, chốt TRƯỚC khi điểm mới được ghi vào bảng.
   *
   * Phải là state, không phải `useRef` — ADR-0016. Trước đây nó là ref được đọc lúc
   * render, mà gán `.current` không lên lịch render: ván đầu sau khi tải trang luôn
   * hiện "Không lọt bảng" (giá trị khởi tạo) dù bảng trống, và ván sau lại hiện hạng
   * của ván trước. Đó là F-01 của UX review 2026-09-11.
   */
  const [rank, setRank] = useState<number | null>(null)

  /** Ván tuỳ chỉnh không ghi bảng nào — FR-21. */
  const canSave = hud.difficulty !== 'custom'

  // localStorage và `pointer: coarse` chỉ có ở client — đọc sau khi mount để
  // không lệch HTML giữa server và client.
  useEffect(() => {
    const saved = presetOf(settings.difficulty())
    setPreset(saved)
    setTable(saved)
    setTuning(settings.tuning())
    setEntries(storeOf(saved).top())
    setCoarse(isCoarsePointer())
  }, [settings, storeOf])

  // Điểm cao nhất ở menu là của mức SẼ chơi, không phải bảng đang xem. Đọc lại
  // khi về menu chứ không mỗi lần render: trong lúc chơi HUD đổi liên tục, mà
  // mỗi lần đọc là một lần JSON.parse.
  useEffect(() => {
    if (hud.phase !== 'menu') return
    setBest(storeOf(preset).top(1)[0]?.score ?? null)
  }, [hud.phase, preset, storeOf])

  // Hai hàm này phải ổn định: ghost FreezeRankAtGameOver chạy lại theo chúng, và
  // mỗi lần chạy là một lần JSON.parse cả bảng điểm.
  const resolveRank = useCallback(
    (id: string, score: number) => storeOf(presetOf(id)).rankOf(score),
    [storeOf],
  )
  const freezeRank = useCallback((next: number | null) => {
    setRank(next)
  }, [])

  const showTable = (id: PresetId) => {
    setTable(id)
    setEntries(storeOf(id).top())
    setHighlightAt(null)
  }

  const choosePreset = (id: PresetId) => {
    setPreset(id)
    settings.setDifficulty(id)
    setTable(id)
    setEntries(storeOf(id).top())
  }

  // Ghi vào bảng của mức VỪA CHƠI, không phải mức đang chọn ở menu — người chơi
  // đổi mức ở menu trong lúc màn Hết lượt còn mở thì điểm vẫn phải về đúng bảng.
  const submit = (initials: string) => {
    const id = presetOf(hud.difficulty)
    const entry: ScoreEntry = { initials, score: hud.score, wave: hud.wave, at: Date.now() }
    const store = storeOf(id)
    store.submit(entry)
    setTable(id)
    setEntries(store.top())
    setHighlightAt(entry.at)
    actions.show('highscores')
  }

  const playing = hud.phase === 'playing' || hud.phase === 'paused' || hud.phase === 'gameover'

  return (
    <main className="flex h-[100dvh] w-full flex-col overflow-hidden bg-bg">
      {/* Ghost: chạy side-effect, không vẽ gì. Render vô điều kiện — xem R-04. */}
      <FreezeRankAtGameOver
        phase={hud.phase}
        score={hud.score}
        difficulty={hud.difficulty}
        canSave={canSave}
        resolveRank={resolveRank}
        onFreeze={freezeRank}
      />

      <LiveRegion message={translateAnnouncement(announce)} />

      {/* Canvas luôn tồn tại: gỡ nó ra khỏi DOM sẽ phá renderer và loop. Khi
          không chơi thì nó lùi xuống làm nền. */}
      <div
        className={
          playing ? 'flex min-h-0 flex-1 flex-col' : 'pointer-events-none absolute inset-0 opacity-25'
        }
      >
        {playing ? (
          <div className="px-2 pt-2">
            <Hud hud={hud} onPause={actions.pause} />
          </div>
        ) : null}

        <div className="relative min-h-0 flex-1">
          <canvas
            ref={canvasRef}
            aria-label={vi.a11y.canvasLabel}
            role="img"
            className="block h-full w-full"
          />
        </div>

        {/* Thiết bị cảm ứng đã có năm nút thật; chỉ người dùng chuột/bàn phím mới
            cần dòng chữ. F-02 · ADR-0018. */}
        {playing && !coarse ? <ControlsHint wave={hud.wave} /> : null}

        {playing && coarse ? <TouchControls touch={touch} /> : null}
      </div>

      {hud.phase === 'menu' ? (
        <div className="relative z-10 h-full">
          <MenuScreen
            best={best}
            difficulty={preset}
            onDifficulty={choosePreset}
            onPlay={() => actions.start({ difficulty: preset, tuning: DIFFICULTY[preset] })}
            onHighScores={() => {
              showTable(table)
              actions.show('highscores')
            }}
            onHelp={() => actions.show('help')}
            onCustom={() => actions.show('custom')}
          />
        </div>
      ) : null}

      {hud.phase === 'custom' ? (
        <div className="relative z-10 h-full">
          <CustomScreen
            tuning={tuning}
            onChange={(next) => {
              setTuning(next)
              settings.setTuning(next)
            }}
            onPlay={() => actions.start({ difficulty: 'custom', tuning })}
            onBack={actions.toMenu}
          />
        </div>
      ) : null}

      {hud.phase === 'help' ? (
        <div className="relative z-10 h-full">
          <HelpScreen onBack={actions.toMenu} />
        </div>
      ) : null}

      {hud.phase === 'highscores' ? (
        <div className="relative z-10 h-full">
          <HighScoresScreen
            entries={entries}
            difficulty={table}
            onDifficulty={showTable}
            highlightAt={highlightAt}
            onBack={actions.toMenu}
            onClear={() => {
              storeOf(table).clear()
              setEntries([])
              setHighlightAt(null)
            }}
          />
        </div>
      ) : null}

      {hud.phase === 'paused' ? (
        <PauseOverlay score={hud.score} onResume={actions.resume} onMenu={actions.toMenu} />
      ) : null}

      {hud.phase === 'gameover' ? (
        <GameOverOverlay
          score={hud.score}
          wave={hud.wave}
          rank={rank}
          canSave={canSave}
          onSubmit={submit}
          onPlayAgain={actions.start}
          onMenu={actions.toMenu}
        />
      ) : null}
    </main>
  )
}
