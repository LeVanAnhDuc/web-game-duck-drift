# GAMEOVER — Bug log

## Đang mở

| Bug | Mức | TC | Tóm tắt |
|---|---|---|---|
| [BUG-GAMEOVER-01](#bug-gameover-01) | Trung bình | TC-GAMEOVER-011 | localStorage bị chặn mà màn Hết lượt vẫn xếp hạng #1, hỏi tên, rồi vứt điểm đi |

### BUG-GAMEOVER-01

- **TC:** TC-GAMEOVER-011 · **Requirement:** REQ-GAMEOVER-10
- **Bước tái hiện:** chặn localStorage (chế độ riêng tư / chặn dữ liệu trang) → mở game → mức Khó → Chơi → đứng yên tới
  khi hết lượt → "Lưu điểm".
- **Mong đợi:** (`docs/01-product/journeys.md` US-01 "Trình duyệt chặn localStorage: vẫn chơi được, chỉ không lưu được
  điểm"; US-02 và US-08 "Hỏi tên rồi vứt điểm đi: tệ hơn không hỏi") — màn Hết lượt không hỏi tên khi điểm không lưu
  được.
- **Thực tế:** màn Hết lượt hiện "Hạng #1", khối "Tên của bạn", nút "Lưu điểm" và câu "Điểm này lọt bảng nhưng chưa lưu.
  Về menu là mất."; bấm "Lưu điểm" mở Bảng điểm với "Chưa có điểm nào ở mức Khó". `createLocalScoreStore` không có
  storage thì `read()` trả `[]`, nên `rankOf` xếp mọi điểm hạng 1 (`client/src/storage/localScoreStore.ts`), còn
  `submit` lặng lẽ không ghi gì.
- **Ghi chú:** ghi ngày 2026-10-17; không sửa code game trong PR thêm bộ test.

## Đã sửa

_(chưa có)_
