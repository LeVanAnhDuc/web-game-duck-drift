'use client'

import { vi } from '@/i18n/vi'

/**
 * Dòng gợi ý điều khiển — F-02 của UX review 2026-09-11.
 *
 * Vào ván rồi thì trên màn không còn chữ nào nói điều khiển bằng cách gì. Nhãn
 * `aria-label` của canvas **có** nói, nhưng nó chỉ tới tai trình đọc màn hình, không
 * tới mắt người dùng chuột. Hai persona vấp đúng chỗ đó: một người bấm chuột vào giữa
 * khung chơi rồi tự kết luận "chắc phải dùng phím", một người bỏ cuộc.
 *
 * Điều kiện hiện suy THUẦN từ `HudSnapshot` đang có — không state mới, không timer,
 * không trường mới trong `GameState` (bất biến #7, #8).
 *
 * Mốc là **wave**, không phải điểm. Bản đầu dùng `score === 0` và nó sai: viên đá giết
 * tàu cũng vỡ, và vỡ thì được điểm — nên điểm lên 20 ngay ở cú chết đầu tiên mà người
 * chơi chưa hề làm gì. Nhìn app thật mới thấy: gợi ý biến mất trước khi đọc kịp. Qua
 * được wave 1 thì mới thật sự là đã biết chơi.
 *
 * Tên phím lấy từ `vi.help.keyboard`: cùng một nội dung không được viết ở hai chỗ
 * (NFR-I18N-01), và màn Cách chơi vẫn là chỗ nói đủ cả năm phím.
 */
export function ControlsHint({ wave }: { wave: number }) {
  if (wave > 1) return null

  const k = vi.help.keyboard

  return (
    <p
      className="pointer-events-none px-2 pb-1 text-center text-[11px] uppercase tracking-widest text-muted"
      // Không phải thông báo động: nó có mặt ngay từ frame đầu của ván, nên đọc kèm
      // canvas là đủ. Đưa vào `aria-live` sẽ chen ngang các công bố thật ở
      // NFR-A11Y-06 (mất mạng, đổi wave, hết lượt).
      aria-hidden="true"
    >
      {vi.hud.controlsHint} {k.rotateKeys} · {k.thrustKeys} · {k.fireKeys}
    </p>
  )
}
