# SCORING — Thiên thạch vỡ, điểm và mạng thưởng

Truy vết phía app: FR-04 · FR-05 · FR-10 · FR-19 · NFR-A11Y-06 · `docs/specs/asteroids-core/design.md` §3.

- **REQ-SCORING-01** Bắn trúng thiên thạch to được 20 điểm, và nó vỡ thành đúng hai thiên thạch vừa.
- **REQ-SCORING-02** Bắn trúng thiên thạch vừa được 50 điểm, và nó vỡ thành đúng hai thiên thạch nhỏ.
- **REQ-SCORING-03** Bắn trúng thiên thạch nhỏ được 100 điểm, và nó biến mất, không sinh mảnh nào.
- **REQ-SCORING-04** Điểm trên HUD là tổng cộng dồn của mọi viên đã vỡ: một thiên thạch to bắn tới hết cho 20 + 2×50 + 4×100 = 520 điểm.
- **REQ-SCORING-05** Mỗi mốc 10.000 điểm cộng thêm một mạng: số mạng trên HUD tăng 1 và vùng thông báo nói "Được thêm một mạng".
- **REQ-SCORING-06** Mỗi mốc chỉ thưởng một lần, và chưa tới mốc thì chưa thưởng.
