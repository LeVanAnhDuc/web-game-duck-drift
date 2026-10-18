# HYPERSPACE — Dịch chuyển và thời gian hồi 5 giây

Truy vết phía app: FR-08 · FR-13 · FR-14 · ADR-0005 · ADR-0015 · `docs/specs/asteroids-core/design.md` §3.

- **REQ-HYPERSPACE-01** Trong lúc chơi, bấm Shift (trái hoặc phải) đưa tàu tới một chỗ khác trong thế giới và tàu đứng yên ở đó (vận tốc về 0).
- **REQ-HYPERSPACE-02** Sau một lần dịch chuyển có 5 giây hồi: bấm Shift trong 5 giây đó không làm gì.
- **REQ-HYPERSPACE-03** Hết 5 giây hồi thì dịch chuyển dùng được lại.
- **REQ-HYPERSPACE-04** Mất mạng thì mạng mới dịch chuyển được ngay, không phải chờ nốt thời gian hồi của mạng trước.
- **REQ-HYPERSPACE-05** Trên màn cảm ứng, giữ nút "Dịch chuyển" làm đúng việc của Shift.
- **REQ-HYPERSPACE-06** Thời gian hồi còn lại hiện ngay trên nút dịch chuyển (ADR-0005 §4): trong lúc hồi, nút cho thấy nó chưa dùng được.
