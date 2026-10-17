# DUCKERID — Test cases

Requirement: `docs/requirements/ducker-id.md` · quyết định: `docs/decisions/ducker-id.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Case cờ tắt chạy ở
project `app`; case cờ bật ở `app-auth` với issuer giả.

### TC-DUCKERID-001 — cờ tắt: không nút đăng nhập, không đọc URL, không sessionStorage, không request ra ngoài

- **Requirement:** REQ-DUCKERID-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Bước:** mở `./?code=x&state=y` trên bản deploy
- **Mong đợi:** không nút "Đăng nhập", không nút tài khoản; `?code=x` còn nguyên; `sessionStorage.length` = 0; mọi request cùng origin
- **Automated:** `tests/e2e/ducker-id/flag-off.e2e.ts`

### TC-DUCKERID-002 — cờ tắt: cột menu căn giữa, không phải vùng cuộn

- **Requirement:** REQ-DUCKERID-02
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 6
- **Mong đợi:** phần tử chứa tiêu đề có `justify-content: center` và `overflow-y` không phải `auto`
- **Automated:** `tests/e2e/ducker-id/flag-off.e2e.ts`

### TC-DUCKERID-003 — đăng nhập: thấy tài khoản, URL sạch, không còn khoá PKCE, không lỗi hydration

- **Requirement:** REQ-DUCKERID-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** "Đăng nhập" → issuer giả trả `code` + `state` đúng
- **Mong đợi:** nút "Tài khoản Ducker ID" hiện; `location.search` không có `code=` / `state=`; `sessionStorage['ducker.pkce']` null; không lỗi console có chữ "hydrat"
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-004 — menu tài khoản: tên, email, hồ sơ, đăng xuất; điều khiển được bằng bàn phím

- **Requirement:** REQ-DUCKERID-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** đăng nhập → mở menu → ↓ → ↓ → ↑ → Esc
- **Mong đợi:** menu có "Lê Văn Anh Đức" và "duc@ducker.id"; "Mở hồ sơ Ducker ID" trỏ `http://ducker.test/profile`, `target=_blank`; mở ra focus ở "Mở hồ sơ"; ↓ → "Đăng xuất"; ↓ vòng về "Mở hồ sơ"; ↑ → "Đăng xuất"; Esc đóng menu, focus về nút tài khoản
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-005 — đăng xuất trả lại nút Đăng nhập và đặt focus vào nó

- **Requirement:** REQ-DUCKERID-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Mong đợi:** sau "Đăng xuất": nút "Đăng nhập" hiện và có focus
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-006 — hồ sơ chỉ trong bộ nhớ: storage không giữ gì, tải lại là chưa đăng nhập

- **Requirement:** REQ-DUCKERID-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 6
- **Mong đợi:** `localStorage` và `sessionStorage` không chứa email; sau tải lại nút "Đăng nhập" hiện
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-007 — huỷ ở Ducker ID thì về chưa đăng nhập, URL sạch

- **Requirement:** REQ-DUCKERID-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** issuer giả trả `error=access_denied`; và mở thẳng `./?error=access_denied&error_description=no&state=x`
- **Mong đợi:** nút "Đăng nhập"; `location.search` rỗng; không thông báo lỗi
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-008 — state bị sửa thì về chưa đăng nhập và không gọi token

- **Requirement:** REQ-DUCKERID-07
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 6
- **Bước:** issuer giả trả `state=tampered`
- **Mong đợi:** nút "Đăng nhập"; URL sạch; token endpoint 0 lần
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-009 — Ducker ID không trả lời thì sau tối đa 15 giây về chưa đăng nhập

- **Requirement:** REQ-DUCKERID-08
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** token endpoint không bao giờ trả lời
- **Mong đợi:** token được gọi 1 lần; trong 20 giây nút "Đăng nhập" trở lại; URL sạch
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-010 — bấm Đăng nhập hai lần liên tiếp chỉ chuyển trang một lần

- **Requirement:** REQ-DUCKERID-09
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Bước:** bấm đúp "Đăng nhập"
- **Mong đợi:** `/oauth/authorize` được gọi đúng 1 lần; cuối cùng đã đăng nhập
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-011 — sessionStorage bị chặn thì bấm Đăng nhập không đưa đi đâu cả

- **Requirement:** REQ-DUCKERID-10
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Mong đợi:** không request nào tới issuer; vẫn ở menu; nút "Đăng nhập" bật và vẫn mang tên "Đăng nhập"
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-012 — nút Đăng nhập dưới dòng "chỉ lưu trên máy", ≥ 44px, không đè thứ bên cạnh

- **Requirement:** REQ-DUCKERID-11
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Mong đợi:** rộng và cao ≥ 44; nằm dưới "Điểm chỉ lưu trên máy này"; không giao với nút "Tuỳ chỉnh" hay dòng đó
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-013 — menu tài khoản không đẩy bố cục và nằm trọn trong khung nhìn ở 320, 375, 1440

- **Requirement:** REQ-DUCKERID-12
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** ở từng khổ: đăng nhập → mở menu
- **Mong đợi:** `position` tính toán của menu là `absolute`; hộp chứa nút tài khoản và nút "Chơi" không xê dịch; menu nằm trọn trong khung nhìn
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-014 — điện thoại: dọc không cuộn, ngang cuộn được mà không cắt tiêu đề

- **Requirement:** REQ-DUCKERID-13
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Bước:** 375×667 rồi 667×375: đăng nhập, đo cột menu
- **Mong đợi:** 375×667: cột không tràn (`scrollHeight ≤ clientHeight`); cả hai khổ: tiêu đề `y ≥ 0`; cuộn tới nút tài khoản thì nó nằm trong khung nhìn
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-015 — đã đăng nhập vẫn vào ván như thường

- **Requirement:** REQ-DUCKERID-14
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** đăng nhập → "Chơi"
- **Mong đợi:** HUD hiện với "Mạng: 3"
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`
