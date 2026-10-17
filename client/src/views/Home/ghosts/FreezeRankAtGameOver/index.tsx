'use client'

// libs
import { useLayoutEffect } from 'react'

/**
 * Chốt thứ hạng đúng lúc ván kết thúc, TRƯỚC khi điểm mới được ghi vào bảng.
 *
 * Ghost: chỉ chạy side-effect, không vẽ gì (R-04).
 *
 * `useLayoutEffect`, không phải `useEffect` — ADR-0016. Nó chạy sau khi DOM đổi nhưng
 * TRƯỚC khi paint, nên hạng đúng xuất hiện trong cùng một frame với overlay. Dùng
 * `useEffect` thì người chơi thấy "Không lọt bảng" nhấp một nhịp rồi mới đổi thành
 * `#1` — đúng dữ liệu nhưng nhìn như lỗi.
 *
 * `resolveRank` và `onFreeze` phải là hàm ỔN ĐỊNH (`useCallback`) ở chỗ gọi. Truyền
 * arrow inline vào đây là cho effect chạy lại mỗi render, và mỗi lần chạy là một lần
 * `JSON.parse` cả bảng điểm — đúng cái giá mà chỗ này cố ý tránh.
 */
export function FreezeRankAtGameOver({
  phase,
  score,
  difficulty,
  canSave,
  resolveRank,
  onFreeze,
}: {
  phase: string
  score: number
  difficulty: string
  /** `false` ở ván tuỳ chỉnh: không ghi bảng nào, nên không có hạng để chốt. */
  canSave: boolean
  resolveRank: (difficulty: string, score: number) => number | null
  onFreeze: (rank: number | null) => void
}) {
  useLayoutEffect(() => {
    if (phase !== 'gameover') return
    onFreeze(canSave ? resolveRank(difficulty, score) : null)
  }, [phase, score, difficulty, canSave, resolveRank, onFreeze])

  return null
}
