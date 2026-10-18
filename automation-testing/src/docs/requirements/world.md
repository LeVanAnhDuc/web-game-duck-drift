# WORLD — Thế giới bọc mép và wave tăng dần

Truy vết phía app: FR-04 · FR-06 · FR-10 · FR-19 · ADR-0003 · invariant #5 · `docs/specs/asteroids-core/design.md` §2–3.

- **REQ-WORLD-01** Thế giới bọc mép: tàu bay ra một mép thì hiện lại ở mép đối diện, giữ nguyên toạ độ kia.
- **REQ-WORLD-02** Thiên thạch cũng bọc mép như tàu.
- **REQ-WORLD-03** Va chạm tính theo khoảng cách ngắn nhất qua mép: hai vật ở sát hai mép đối diện vẫn chạm nhau.
- **REQ-WORLD-04** Wave 1 có 3 thiên thạch to và không viên nào sinh ra sát tàu (cách tối thiểu 260 đơn vị).
- **REQ-WORLD-05** Bắn hết thiên thạch thì nghỉ 1,5 giây rồi sang wave sau: HUD đổi số wave và vùng thông báo nói "Wave n".
- **REQ-WORLD-06** Wave n bắt đầu với 2 + n thiên thạch to, tối đa 11.
- **REQ-WORLD-07** Wave càng cao thiên thạch càng nhanh: tốc độ nền 60–130 nhân hệ số 1 + 0,06 × (n − 1), trần 1,8.
