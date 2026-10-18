# POWERUPS — Năm vật phẩm, khe vũ khí chung và khe khiên

Truy vết phía app: FR-09 · FR-10 · FR-03 · ADR-0004 · NFR-A11Y-04 · `docs/specs/asteroids-core/design.md` §3.

- **REQ-POWERUPS-01** Nhặt Khiên thì HUD có thêm dấu khiên cạnh số mạng; Khiên không dùng thanh vũ khí.
- **REQ-POWERUPS-02** Khiên chặn đúng một lần va chạm: lần đó không mất mạng (viên đá vẫn vỡ, vẫn được điểm) và khiên mất; lần va sau mới mất mạng.
- **REQ-POWERUPS-03** Khiên không hết hạn theo thời gian.
- **REQ-POWERUPS-04** Nhặt Thêm mạng thì số mạng tăng một ngay, không chiếm khe nào.
- **REQ-POWERUPS-05** Nhặt một trong ba vũ khí (Bắn nhanh, Bắn toả, Đạn xuyên) thì HUD hiện thanh vũ khí với tên của nó và 12 giây.
- **REQ-POWERUPS-06** Ba vũ khí dùng chung một khe: nhặt loại khác thì thay hẳn loại đang có và đếm lại từ 12 giây.
- **REQ-POWERUPS-07** Nhặt trùng loại đang có thì cộng dồn 12 giây vào thời gian còn lại, trần 20 giây.
- **REQ-POWERUPS-08** Hết thời gian thì vũ khí hết và thanh vũ khí biến mất.
- **REQ-POWERUPS-09** Khiên có khe riêng: đang có vũ khí mà nhặt Khiên thì giữ cả hai.
- **REQ-POWERUPS-10** Mất mạng thì mất cả vũ khí lẫn khiên đang có.
- **REQ-POWERUPS-11** Mỗi vũ khí đổi cách bắn đúng như tên: không vũ khí thì tối đa 4 viên trên màn; Bắn nhanh nhịp gấp đôi; Bắn toả ba viên một lần; Đạn xuyên bắn vỡ thiên thạch rồi bay tiếp, đạn thường thì mất khi trúng.
