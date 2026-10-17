# DEPLOY — Bản xuất tĩnh và base path của GitHub Pages

Truy vết phía app: ADR-0001 · ADR-0008 · ADR-0021 (`NEXT_PUBLIC_BASE_PATH`) · README §What runs on GitHub.

- **REQ-DEPLOY-01** Bản xuất tĩnh tải đủ mọi thứ nó cần: mở trang và vào một ván không có resource nào lỗi (request thất bại hay trả ≥ 400).
- **REQ-DEPLOY-02** Mọi request của site nằm dưới base path của chính nó (gốc khi chạy ở máy, `/web-game-duck-drift/` trên GitHub Pages), nên site chạy được dưới đường dẫn con.
