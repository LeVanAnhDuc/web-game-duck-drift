'use client'

import { ASTEROID_SCORE, UFO } from '@/game/core/constants'
import type { PowerUpKind } from '@/game/core/types'
import { vi } from '@/i18n/vi'
import { PowerUpMark } from '../../components/PowerUpMark'
import { Button } from '@/components/Button'
import { Panel } from '@/components/Panel'
import { ScreenTitle } from '@/components/ScreenTitle'
import { formatScore } from '@/lib/format'

const KIND_CLASS: Record<PowerUpKind, string> = {
  shield: 'text-power-shield',
  rapid: 'text-power-rapid',
  spread: 'text-power-spread',
  pierce: 'text-power-pierce',
  life: 'text-power-life',
}

const KINDS: PowerUpKind[] = ['shield', 'rapid', 'spread', 'pierce', 'life']

export function HelpScreen({ onBack }: { onBack: () => void }) {
  const k = vi.help.keyboard

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <ScreenTitle>{vi.help.title}</ScreenTitle>

        <Panel className="p-4">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-muted">{vi.help.controlsTitle}</h2>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Row term={k.rotate} desc={k.rotateKeys} />
            <Row term={k.thrust} desc={k.thrustKeys} />
            <Row term={k.fire} desc={k.fireKeys} />
            <Row term={k.hyperspace} desc={k.hyperspaceKeys} />
            <Row term={k.pause} desc={k.pauseKeys} />
          </dl>
          <p className="mt-3 text-xs text-muted">{vi.help.touchNote}</p>
        </Panel>

        <Panel className="p-4">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-muted">{vi.help.scoringTitle}</h2>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Row term={vi.help.scoring.large} desc={formatScore(ASTEROID_SCORE.large)} />
            <Row term={vi.help.scoring.medium} desc={formatScore(ASTEROID_SCORE.medium)} />
            <Row term={vi.help.scoring.small} desc={formatScore(ASTEROID_SCORE.small)} />
            <Row term={vi.help.scoring.ufoBig} desc={formatScore(UFO.bigScore)} />
            <Row term={vi.help.scoring.ufoSmall} desc={formatScore(UFO.smallScore)} />
          </dl>
          <p className="mt-3 text-xs text-muted">{vi.help.scoring.extraLife}</p>
        </Panel>

        <Panel className="p-4">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-muted">{vi.help.powerUpsTitle}</h2>
          <ul className="flex flex-col gap-3">
            {KINDS.map((kind) => (
              <li key={kind} className="flex items-center gap-3">
                <PowerUpMark kind={kind} className={`h-6 w-6 shrink-0 ${KIND_CLASS[kind]}`} />
                <div>
                  <p className={`text-sm font-medium ${KIND_CLASS[kind]}`}>{vi.powerUps[kind].name}</p>
                  <p className="text-xs text-muted">{vi.powerUps[kind].desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">{vi.help.powerUpNote}</p>
        </Panel>

        <Button onClick={onBack} autoFocus className="self-center">
          {vi.help.back}
        </Button>
      </div>
    </div>
  )
}

function Row({ term, desc }: { term: string; desc: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-1">
      <dt className="text-sm">{term}</dt>
      <dd className="font-mono text-xs tabular-nums text-muted">{desc}</dd>
    </div>
  )
}
