# PRIVACY — Quyết định

Đi cặp với `docs/requirements/privacy.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/nfr.md` (NFR-SEC-01, NFR-SEC-03 kèm ngoại lệ có giới hạn của ADR-0021),
  `docs/01-product/overview.md` §Non-Goals, `docs/decisions/0001-nextjs-static-export-with-yarn.md`,
  `docs/decisions/0006-scorestore-interface-local-only.md`, `docs/decisions/0021-ducker-id-sign-in.md`,
  `docs/specs/ducker-id-sign-in/design.md` §4, `README.md` ("No game accounts, no server, no analytics").
- **Code:** `client/src/app/layout.tsx` (`next/font/google` — tự host lúc build), `client/src/storage/*`,
  `client/src/auth/duckerAuth.ts` ("Cờ tắt ⇒ không đọc location.search, không chạm storage").
- **Test đã gom (gợi ý):** `client/e2e/ducker-id-flag-off.spec.ts` "không có request ra ngoài origin" (nửa mạng) →
  TC-PRIVACY-001, 003; nửa "không có nút đăng nhập" ở module `ducker-id`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** "Một ván" = tải → chọn Khó → Chơi → đứng yên tới hết lượt → Lưu điểm → Bảng điểm, trên `page.clock`. Thêm vòng
  qua Cách chơi và Tuỳ chỉnh ở case console để mọi màn đều được render.
- **Q2** Font tải trễ (cùng origin, lúc chữ mono xuất hiện lần đầu) có vi phạm NFR-SEC-03 không? → Không: ngưỡng nói về
  dịch vụ **ngoài**. Hệ quả thật người chơi cảm được là "mất mạng thì có còn chơi được không" — đó là REQ-PRIVACY-02.
- **Q3** Mất mạng mô phỏng bằng `context.setOffline(true)` sau khi trang tải xong.
- **Q4** Ngoại lệ của ADR-0021 (sessionStorage `ducker.pkce`, request tới issuer) chỉ có khi cờ bật: module `ducker-id`.

## Tài khoản test

Không có.

## Ngoài phạm vi

- NFR-SEC-01 (không secret trong repo) và NFR-SEC-02 (dependency): review + `dependency-review` trong CI, không phải e2e.
- Mọi thứ của trang trên GitHub Pages (base path, không request ngoài base path): module `deploy`.

## Tech debt liên quan

_(không có)_
