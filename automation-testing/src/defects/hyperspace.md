# HYPERSPACE — Bug log

## Đang mở

| Bug | Mức | TC | Tóm tắt |
|---|---|---|---|
| [BUG-HYPERSPACE-01](#bug-hyperspace-01) | Thấp | TC-HYPERSPACE-007 | Nút Dịch chuyển không cho thấy thời gian hồi |

### BUG-HYPERSPACE-01

- **TC:** TC-HYPERSPACE-007 · **Requirement:** REQ-HYPERSPACE-06
- **Bước tái hiện:** điện thoại (màn cảm ứng) → Chơi → giữ nút "Dịch chuyển" → trong 5 giây sau đó nhìn lại nút.
- **Mong đợi:** ADR-0005 §4: "cooldown còn lại, hiện ngay trên nút hyperspace" — trong lúc hồi, nút cho thấy nó chưa
  dùng được (thời gian còn lại, mờ đi, hoặc `aria-disabled`).
- **Thực tế:** nút giống hệt lúc sẵn sàng: cùng tên "Dịch chuyển", không chữ, không title / mô tả, không disabled, cùng
  class. Lõi có sẵn tín hiệu (`HudSnapshot.hyperReady`, `client/src/game/core/state.ts`) nhưng `TouchControls` không nhận
  `hud` và không thành phần nào đọc `hyperReady`; bấm trong lúc hồi thì không có gì xảy ra mà không có lời giải thích.
  Bàn phím cũng không có chỗ nào hiện thời gian hồi.

## Đã sửa

_(chưa có)_
