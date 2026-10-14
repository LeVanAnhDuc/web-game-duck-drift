# Quyết định kiến trúc (ADR)

> **Trả lời:** Sáu tháng sau — tại sao lại làm thế này?
> **Cập nhật khi:** chốt một quyết định kỹ thuật. Ghi **ngay trong phiên đó**.

## Mục lục

<!-- BEGIN:auto — bảng dưới do .claude/scripts/docs-regen.sh sinh từ các file ADR. Đừng sửa tay. -->
| ID | Tiêu đề | Ngày | Trạng thái |
| --- | --- | --- | --- |
| [ADR-0001](0001-nextjs-static-export-with-yarn.md) | Dùng Next.js 15 static export + React 19 + Tailwind + Vitest, quản lý gói bằng Yarn classic | 2026-09-04 | accepted |
| [ADR-0002](0002-canvas-2d-with-pure-typescript-core.md) | Vẽ bằng Canvas 2D, lõi game là TypeScript thuần và React chỉ là vỏ | 2026-09-04 | accepted |
| [ADR-0003](0003-fixed-timestep-and-fixed-world-size.md) | Fixed timestep 60Hz và thế giới cố định 1600×1200, canvas chỉ scale-to-fit | 2026-09-04 | accepted |
| [ADR-0004](0004-single-weapon-slot-for-powerups.md) | Ba power-up vũ khí dùng chung một khe, khiên và mạng có khe riêng | 2026-09-04 | accepted |
| [ADR-0005](0005-hyperspace-cooldown-no-random-death.md) | Hyperspace có cooldown và không có rủi ro nổ ngẫu nhiên | 2026-09-04 | accepted |
| [ADR-0006](0006-scorestore-interface-local-only.md) | Lưu điểm qua interface `ScoreStore`, bản duy nhất là localStorage | 2026-09-04 | accepted |
| [ADR-0007](0007-design-tokens-override-pixel-art-catalog.md) | Bỏ đề xuất Pixel Art của catalog, chốt vector phát sáng với Space Grotesk + JetBrains Mono | 2026-09-04 | accepted |
| [ADR-0008](0008-ci-and-github-pages-deploy.md) | CI hai job song song, deploy GitHub Pages tự động, và e2e Playwright ở năm cấu hình | 2026-09-07 | accepted |
| [ADR-0009](0009-releases-derived-from-commits.md) | Số phiên bản và nội dung release note suy ra từ lịch sử commit | 2026-09-07 | accepted |
| [ADR-0010](0010-tuning-lives-in-gamestate.md) | Bốn số độ khó nằm trong `GameState`, không truyền theo tham số | 2026-09-10 | accepted |
| [ADR-0011](0011-one-storage-key-per-difficulty.md) | Mỗi mức độ khó một khoá `localStorage` riêng cho bảng điểm | 2026-09-10 | accepted |
| [ADR-0014](0014-adopt-the-shared-view-conventions.md) | Nhận bộ quy ước view dùng chung của workspace `web-game` | 2026-09-11 | accepted |
| [ADR-0015](0015-game-keys-are-owned-per-phase.md) | Bàn phím của game chỉ sở hữu phím ở pha `playing`, `paused` chỉ giữ phím tạm dừng | 2026-09-11 | accepted |
| [ADR-0016](0016-gameover-rank-lives-in-react-state.md) | Hạng lúc hết lượt nằm trong state React, chốt trong layout effect | 2026-09-11 | accepted |
| [ADR-0017](0017-gameover-announcement-emitted-at-end-of-step.md) | Câu thông báo hết lượt phát ở cuối `step()`, không phát trong `killShip` | 2026-09-11 | accepted |
| [ADR-0018](0018-ship-reads-first-and-controls-hint.md) | Tàu là nét nặng nhất trên canvas, và gợi ý điều khiển là DOM suy từ HUD | 2026-09-11 | accepted |
| [ADR-0019](0019-consequences-announced-before-the-click.md) | Hậu quả phá huỷ nói trước cú bấm, và nhãn phải nhìn thấy được | 2026-09-11 | accepted |
| [ADR-0020](0020-set-leaderboard-expectations-at-the-menu.md) | Chỉnh kỳ vọng về bảng điểm ngay ở menu, và trạng thái chọn không mã hoá chỉ bằng màu | 2026-09-11 | accepted |
| [ADR-0021](0021-ducker-id-sign-in.md) | Đăng nhập Ducker ID tuỳ chọn, nằm sau cờ tính năng, chưa bật ở bản deploy | 2026-10-04 | accepted |
<!-- END:auto -->

Trạng thái: `accepted` · `superseded by ADR-00xx` · `deprecated`

## Cách thêm một ADR

1. Lấy số kế tiếp, tạo `NNNN-<slug-tieng-anh>.md` từ [`_template.md`](_template.md).
   Ví dụ: `0003-dung-prisma-thay-typeorm.md`.
2. Điền. Giữ trong khoảng 15–40 dòng.
3. Thêm một dòng vào bảng trên.

## Ba quy tắc

- **Một quyết định, một file.** File thứ hai bàn cùng chuyện nghĩa là quyết định đầu chưa dứt.
- **Append-only.** ADR đã `accepted` thì **không sửa nội dung**. Đổi ý thì viết ADR mới, ghi `supersedes ADR-0007`, và đổi ADR cũ sang `superseded by`.
- **Ghi ngay khi chốt**, không để cuối phiên. Ngữ cảnh của một phiên dài có thể bị nén trước khi phiên kết thúc, và lúc đó lý do đã mất.

## Khi nào cần ADR

Cần: chọn thư viện/framework/datastore · đổi ranh giới module · chọn cách xử lý một vấn đề mà có ≥ 2 phương án hợp lý · chấp nhận một hạn chế lâu dài.

Không cần: sửa bug · thêm chức năng theo đúng khuôn có sẵn · quyết định có thể đảo trong 10 phút.
