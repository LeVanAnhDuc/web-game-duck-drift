# Yêu cầu phi chức năng

> **Trả lời:** Ngưỡng nào áp cho **mọi** feature, để không phải nhắc lại từng lần?
> **Trạng thái:** 🟢 đủ — đã rà theo dự án
> **Cập nhật:** 2026-09-04 · commit —
> **Cập nhật khi:** thêm loại tài nguyên mới · thêm nhóm người dùng · sau sự cố sinh ra ngưỡng mới

Bản mặc định của template viết cho ứng dụng có server: phân trang endpoint, N+1, index, migration, PII, rate limit đăng nhập. Dự án này **không có server, không có database, không có tài khoản** (`overview.md` §4), nên những dòng đó đã bị xoá thay vì để lại cho có. Danh sách dưới đây là bản dành riêng cho một game canvas chạy hoàn toàn ở client.

## Performance

| ID          | Ngưỡng                                                                                 | Cách kiểm                                                       |
| ----------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| NFR-PERF-01 | 60fps trên desktop và ≥ 50fps trên điện thoại tầm trung, với 60 vật thể trên màn       | overlay thống kê frame time ở chế độ dev, đo trên thiết bị thật |
| NFR-PERF-02 | Một bước `step()` chạy < 4ms ở trường hợp xấu nhất (60 vật thể, 200 particle)          | benchmark trong vitest                                          |
| NFR-PERF-03 | React chỉ re-render khi snapshot HUD đổi giá trị, không phải mỗi frame                 | test đếm số lần render trong 120 bước mô phỏng                  |
| NFR-PERF-04 | Bundle JS lần tải đầu ≤ 200KB gzip                                                     | `pnpm check:bundle` — đo từ HTML đã export, gate trong CI       |
| NFR-PERF-05 | Đường vẽ và đường va chạm không cấp phát mảng hay object mới cho mỗi vật thể mỗi frame | review code                                                     |

## Robustness

| ID         | Ngưỡng                                                                                                       | Cách kiểm                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| NFR-ROB-01 | Mọi dữ liệu đọc từ `localStorage` đều được validate trước khi dùng — người dùng sửa được nó                  | test với dữ liệu rác, dữ liệu thiếu trường, dữ liệu sai kiểu |
| NFR-ROB-02 | `localStorage` không dùng được (chế độ riêng tư, bị chặn) thì game vẫn chơi được, chỉ mất tính năng lưu điểm | test với storage ném lỗi                                     |
| NFR-ROB-03 | Không bao giờ mô phỏng bù quá 0.25 giây trong một frame, kể cả khi tab bị ẩn nhiều phút                      | test vòng lặp với `dt` lớn                                   |
| NFR-ROB-04 | Cùng một seed và cùng một chuỗi input cho ra cùng một trạng thái sau N bước                                  | test tái lập, chạy 1000 bước                                 |

## Security

| ID         | Ngưỡng                                                                                                                   | Cách kiểm                                                                                                                                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-SEC-01 | Không có secret nào trong repo. Dự án không có backend nên cũng không có secret nào để lộ                                | grep + review                                                                                                                                                                                                                                                                                                          |
| NFR-SEC-02 | Dependency không có lỗ hổng mức high trở lên                                                                             | `dependency-review` trên mỗi PR + Dependabot alerts là cổng chặn thật. `pnpm check:audit` chạy ở máy: `pnpm audit` đọc được advisory database thật (yarn 1 thì trả summary rỗng kèm exit 0, nên gate dựng trên nó xanh vĩnh viễn), và script vẫn TỪ CHỐI báo pass khi bản audit không thật sự quét được cây dependency |
| NFR-SEC-03 | Không gọi ra bất kỳ dịch vụ ngoài nào lúc chạy, kể cả analytics. Font được tải kèm theo build, không lấy từ CDN lúc chạy | review network tab                                                                                                                                                                                                                                                                                                     |

## Accessibility

| ID          | Ngưỡng                                                                                              | Cách kiểm                         |
| ----------- | --------------------------------------------------------------------------------------------------- | --------------------------------- |
| NFR-A11Y-01 | Tương phản chữ thường ≥ 4.5:1, chữ lớn ≥ 3:1                                                        | devtools                          |
| NFR-A11Y-02 | Mọi hành động ngoài canvas thao tác được bằng bàn phím, focus luôn thấy được                        | thử tay                           |
| NFR-A11Y-03 | Vùng bấm ≥ 44×44px trên thiết bị cảm ứng                                                            | e2e đo `boundingBox` trên Pixel 5 |
| NFR-A11Y-04 | Không mã hoá thông tin **chỉ** bằng màu. Mỗi power-up có màu, hình và tên                           | review                            |
| NFR-A11Y-05 | Tôn trọng `prefers-reduced-motion`: tắt particle, rung màn, vệt đẩy, transition. Gameplay không đổi | review CSS + test                 |
| NFR-A11Y-06 | Canvas có nhãn thay thế; đổi mạng, đổi wave và hết lượt được công bố qua `aria-live="polite"`       | thử với trình đọc màn hình        |

## i18n

| ID          | Ngưỡng                                                                                       | Cách kiểm |
| ----------- | -------------------------------------------------------------------------------------------- | --------- |
| NFR-I18N-01 | Không hardcode chuỗi hiển thị trong component. Mọi chuỗi nằm trong một module chuỗi duy nhất | grep      |
| NFR-I18N-02 | Thời điểm ghi điểm lưu ở UTC (epoch ms); đổi múi giờ chỉ xảy ra ở tầng hiển thị              | test      |
| NFR-I18N-03 | Số điểm định dạng theo locale người dùng qua `Intl.NumberFormat`                             | review    |
