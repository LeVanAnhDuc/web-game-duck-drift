'use client'

import { TUNING_LIMITS, UFO_NEVER } from '@/game/core/constants'
import type { Tuning } from '@/game/core/types'
import { vi } from '@/i18n/vi'
import { Button } from '@/components/Button'
import { Panel } from '@/components/Panel'
import { ScreenTitle } from '@/components/ScreenTitle'
import { TuningSlider } from '@/components/TuningSlider'

/** Bốn núm, đúng thứ tự hiện ra. Cùng một nguồn với `TUNING_LIMITS`. */
const KNOBS: readonly (keyof Tuning)[] = ['startLives', 'asteroidSpeed', 'dropChance', 'ufoFirstWave']

/**
 * Số thô của thanh trượt → chuỗi người đọc được. Cùng chuỗi này vào cả
 * `aria-valuetext`, nên nó phải đúng nghĩa chứ không chỉ đẹp mắt.
 */
function valueTextOf(knob: keyof Tuning, value: number): string {
  if (knob === 'asteroidSpeed') return `${value.toFixed(1)}×`
  if (knob === 'dropChance') return `${Math.round(value * 100)}%`
  if (knob === 'ufoFirstWave' && value >= UFO_NEVER) return vi.custom.ufoOff
  return String(value)
}

export function CustomScreen({
  tuning,
  onChange,
  onPlay,
  onBack,
}: {
  tuning: Tuning
  onChange: (tuning: Tuning) => void
  onPlay: () => void
  onBack: () => void
}) {
  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
        <ScreenTitle>{vi.custom.title}</ScreenTitle>

        <Panel className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 sm:gap-x-8">
          {KNOBS.map((knob) => (
            <TuningSlider
              key={knob}
              id={`tuning-${knob}`}
              label={vi.custom[knob]}
              value={tuning[knob]}
              valueText={valueTextOf(knob, tuning[knob])}
              min={TUNING_LIMITS[knob].min}
              max={TUNING_LIMITS[knob].max}
              step={TUNING_LIMITS[knob].step}
              onChange={(value) => onChange({ ...tuning, [knob]: value })}
            />
          ))}
        </Panel>

        {/* Nằm TRÊN hai nút, không ở đáy màn: người chơi phải đọc được nó trước
            khi bấm Chơi, không phải sau khi mất một ván. */}
        <p className="text-xs leading-relaxed text-muted">{vi.custom.notSaved}</p>

        <div className="flex justify-center gap-3">
          <Button onClick={onBack}>{vi.custom.back}</Button>
          <Button variant="primary" onClick={onPlay} autoFocus>
            {vi.custom.play}
          </Button>
        </div>
      </div>
    </div>
  )
}
