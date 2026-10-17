// Cửa duy nhất vào luật chơi. Chỉ hàm này được sửa `GameState` — bất biến #7.
//
// `dt` tính bằng GIÂY (vòng lặp đưa vào, luôn là `FIXED_DT`), còn mọi đồng hồ
// trong state đếm bằng MILI GIÂY. Quy đổi đúng một lần ở đầu hàm, không rải
// `* 1000` khắp nơi.
//
// Thứ tự chín bước dưới đây là hợp đồng của design.md §2. Bước 9 (công bố hết lượt)
// thêm vào bởi ADR-0017 và PHẢI là bước cuối — nó đọc `state.score` sau khi mọi thứ
// còn cộng điểm trong step đã cộng xong.

import { integrateAsteroids } from './asteroids'
import { collide } from './collision'
import { ANNOUNCE } from './constants'
import { grantExtraLives } from './score'
import { applyShipInput, integrateShip, tickShip } from './ship'
import { spawnWave } from './spawn'
import { updateUfos } from './ufo'
import type { Body, GameState, InputState, Phase } from './types'
import { wrapBody } from './vector'

/** Vật thể có tuổi thọ: đạn, power-up, particle. */
interface Mortal extends Body {
  lifeMs: number
}

function integrateBodies(list: Body[], dt: number): void {
  for (let i = 0; i < list.length; i++) {
    const b = list[i]!
    b.x += b.vx * dt
    b.y += b.vy * dt
    wrapBody(b)
  }
}

function tickLifetimes(list: Mortal[], dtMs: number): void {
  for (let i = 0; i < list.length; i++) list[i]!.lifeMs -= dtMs
}

/**
 * Dồn phần tử còn sống về đầu mảng rồi cắt đuôi — không cấp phát mảng mới mỗi
 * bước, khác với `Array.prototype.filter` (`NFR-PERF-05`).
 */
function dropExpired(list: Mortal[]): void {
  let write = 0
  for (let read = 0; read < list.length; read++) {
    const item = list[read]!
    if (item.lifeMs > 0) list[write++] = item
  }
  list.length = write
}

export function step(state: GameState, input: InputState, dt: number): GameState {
  // Tạm dừng, menu, hết lượt: không mô phỏng gì cả. Trả về chính object đó để
  // tầng trên không phải phân biệt hai đường.
  //
  // Kiểm trên một bản copy, không kiểm thẳng `state.phase`: kiểm thẳng thì TypeScript
  // thu hẹp `state.phase` thành `'playing'` cho cả phần còn lại của hàm, trong khi
  // `collide()` ở bước 5 có quyền đổi nó sang `'gameover'`. Bước 9 cần so sánh được
  // với `'gameover'` mà không phải cast.
  const phaseAtStart: Phase = state.phase
  if (phaseAtStart !== 'playing') return state

  const dtMs = dt * 1000

  // 1 — input lên tàu
  applyShipInput(state, input, dt)

  // 2 — tích phân chuyển động rồi wrap
  integrateShip(state.ship, dt)
  integrateAsteroids(state.asteroids, dt)
  integrateBodies(state.bullets, dt)
  integrateBodies(state.ufos, dt)
  integrateBodies(state.powerUps, dt)
  integrateBodies(state.particles, dt)

  // 3 — mọi đồng hồ
  tickShip(state, dtMs)
  tickLifetimes(state.bullets, dtMs)
  tickLifetimes(state.powerUps, dtMs)
  tickLifetimes(state.particles, dtMs)
  if (state.shakeMs > 0) state.shakeMs = Math.max(0, state.shakeMs - dtMs)
  // Banner đếm ngược ở ĐÂY, không nằm trong nhánh "màn đã sạch" của bước 7:
  // wave vừa bắt đầu thì màn đầy thiên thạch, mà banner vẫn phải mờ đi.
  if (state.waveBannerMs > 0) state.waveBannerMs = Math.max(0, state.waveBannerMs - dtMs)

  // 4 — UFO quyết định đổi hướng và bắn
  updateUfos(state, dtMs)

  // 5 — va chạm
  collide(state)

  // 6 — mốc thưởng mạng (điểm đã được cộng ngay lúc va chạm)
  grantExtraLives(state)

  // 7 — hết thiên thạch thì nghỉ 1.5 giây rồi sang wave sau.
  // `spawnWave` tự lên đạn lại `waveClearMs`, nên ván mới (đồng hồ = 0, chưa có
  // thiên thạch nào) sinh wave 1 ngay ở bước đầu tiên thay vì bắt chờ.
  if (state.asteroids.length === 0) {
    state.waveClearMs -= dtMs
    if (state.waveClearMs <= 0) spawnWave(state)
  }

  // 8 — dọn vật thể đã hết tuổi thọ
  dropExpired(state.bullets)
  dropExpired(state.powerUps)
  dropExpired(state.particles)

  state.elapsedMs += dtMs

  // 9 — ván vừa kết thúc trong step này thì công bố điểm CUỐI, sau khi mọi thứ còn
  // cộng điểm trong step đã cộng xong (ADR-0017). Đặt ở đây, không đặt trong
  // `killShip`, vì lúc tàu chết thì viên đá giết nó còn chưa vỡ — và vỡ thì được
  // điểm. Ghi đè câu `wave`/`extraLife` của cùng step là chủ ý: hết lượt là tin
  // quan trọng nhất, và vùng `aria-live` chỉ đọc được một câu.
  //
  // Không cần cờ "pha đã đổi trong step này": hàm đã return ở trên nếu pha đầu step
  // không phải `playing`, nên tới được đây mà pha là `gameover` thì nó vừa đổi.
  if (state.phase === 'gameover') state.announce = ANNOUNCE.gameOver(state.score)

  return state
}
