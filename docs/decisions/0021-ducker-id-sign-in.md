# ADR-0021 · Đăng nhập Ducker ID tuỳ chọn, nằm sau cờ tính năng, chưa bật ở bản deploy

> **Ngày:** 2026-10-04
> **Trạng thái:** accepted
> **Liên quan:** FR-23 · US-09 · NFR-SEC-03 · ADR-0001 · ADR-0006 · ADR-0007 · ADR-0009 · ADR-0020

## 1. Bối cảnh

Yêu cầu của chủ dự án ngày 2026-10-04: mọi game trong `web-game/` có thêm "Đăng nhập bằng Ducker ID" theo đúng cơ chế đã làm ở `web-app-calculate-badminton` (OIDC Authorization Code + PKCE, public client). Phạm vi là **chỉ định danh**: nút đăng nhập, avatar + tên, menu tài khoản. Điểm, cài đặt, bảng điểm không đổi một chữ.

Hai thứ đang cản: Non-Goal đầu của `overview.md` ("không tài khoản, không đăng nhập") và **NFR-SEC-03** ("không gọi ra dịch vụ ngoài lúc chạy"). Tính năng cũng chưa được phát hành: người chơi trên GitHub Pages không được thấy nó.

## 2. Quyết định

- Thêm đăng nhập Ducker ID tuỳ chọn. Code nằm trong `src/auth/` (cấu hình → PKCE → bắt callback → request token/userinfo → store ngoài React), UI là `AccountButton` ở menu chính dưới dòng "Điểm chỉ lưu trên máy này".
- **Cờ tính năng** `NEXT_PUBLIC_FEATURE_DUCKER_SIGN_IN` chỉ bật khi đúng chuỗi `true` **và** đủ bốn giá trị `NEXT_PUBLIC_DUCKER_{ISSUER,CLIENT_ID,SCOPE,PROFILE_PATH}`. Thiếu một là tắt hẳn: không render, không đọc URL, không chạm storage, không request. Không có giá trị mặc định nào trong code.
- `deploy.yml` **không truyền** cờ lẫn `DUCKER_*` — bản trên Pages không có nút. `GITHUB_PAGES` bị thay bằng `NEXT_PUBLIC_BASE_PATH` (`/<tên-repo>`; trống = gốc).
- Hồ sơ chỉ giữ trong bộ nhớ: tải lại là về chưa đăng nhập. Đăng xuất chỉ quên hồ sơ, phiên ở Ducker ID vẫn còn.
- **Ngoại lệ có giới hạn cho NFR-SEC-03:** sessionStorage khoá `ducker.pkce` và không gì khác, xoá khi quay về; mạng chỉ tới issuer đã cấu hình, và tới URL ảnh đại diện mà issuer trả về, chỉ sau khi người chơi bấm đăng nhập; không gì cả khi cờ tắt. Ảnh có thể ở host khác nên không giới hạn `<img>`.
- Test mạng/grep (nếu có) chỉ được thêm allowlist đúng `src/auth/duckerAuth.ts` và `src/auth/requests.ts`.
- Mọi commit của nhánh này mang `[skip release]` (xem hệ quả).

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --------- | ----------- |
| Bật luôn ở bản deploy | Chưa đăng ký client trên Ducker ID cho game này; chủ dự án muốn ra mắt sau |
| Lưu token/hồ sơ vào localStorage | Mở rộng bề mặt NFR-SEC; ở đây chỉ cần định danh, tải lại đăng nhập lại một cú bấm là đủ |
| Giá trị mặc định cho issuer/client_id trong code | Chủ dự án cấm: thiếu cấu hình phải là tắt, không phải đoán |
| Thêm thư viện OIDC | PKCE + hai request nhỏ; không thêm dependency nào |

## 4. Hệ quả

**Được:**
- Có sẵn đường đăng nhập Ducker ID khi muốn bật: đăng ký client, thêm biến vào repo variables, truyền trong `deploy.yml`.
- Bản deploy hiện tại y hệt trước (kiểm bằng e2e cờ tắt: không nút, không request ra ngoài origin).

**Mất / phải chấp nhận:**
- NFR-SEC-03 và Non-Goal đầu giờ có ngoại lệ có điều kiện; phải đọc kèm ADR này.
- **Nợ `[skip release]`:** `release.yml` quét cả khoảng từ tag gần nhất, nên mọi push sau đó lên `main` cũng bị bỏ qua cho tới khi có tag mới. Lần release thật kế tiếp phải cắt tay một lần: `pnpm release:next` → `git tag vX.Y.Z && git push origin vX.Y.Z` → `gh release create vX.Y.Z --notes "$(pnpm -s release:notes)"`. Sau đó khoảng sạch và tự động hoá chạy lại.
- Cổng e2e dựng thêm một bản build (cờ bật, issuer giả) nên chạy lâu hơn một lượt `next build`. Cổng e2e dời khỏi 4173 sang 4311/4312.
- Không thêm dependency nào.
