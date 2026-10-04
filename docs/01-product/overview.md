# Tổng quan sản phẩm

> **Trả lời:** Sản phẩm này là gì, cho ai, và **KHÔNG** làm gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-04 · commit —
> **Cập nhật khi:** định vị đổi · thêm/bớt một Non-Goal · trần chi phí đổi

## 1. Một câu định vị

Duck Drift là Asteroids bản web: game bắn thiên thạch kiểu arcade cổ điển, thêm hệ power-up, chơi được ngay trong trình duyệt bằng bàn phím hoặc bằng ngón tay, không cài đặt và không bắt buộc đăng nhập.

## 2. Vấn đề đang giải

Bản Asteroids gốc chỉ chơi được bằng bàn phím và không có gì để mong đợi trong lúc chơi ngoài điểm số. Các bản web hiện có thường rơi vào một trong hai cực: hoặc mô phỏng y hệt máy 1979 — điều khiển cứng, hình khó đọc trên màn hình nhỏ, không chơi được trên điện thoại — hoặc biến thành game bắn hiện đại đến mức mất chất Asteroids. Dự án này giữ nguyên vật lý quán tính và cách thiên thạch vỡ, thứ làm nên Asteroids, nhưng bỏ những chỗ chỉ khó chịu chứ không thú vị, và chơi được thật trên điện thoại.

## 3. Người dùng mục tiêu

Người muốn chơi vài phút trong trình duyệt, không muốn cài gì, không muốn tạo tài khoản. Nhóm chính là người dùng desktop dùng bàn phím; nhóm thứ hai là người dùng điện thoại — nhóm này được coi là người chơi thật, không phải người ghé xem.

## 4. Non-Goals — dứt khoát không làm

- **Không có tài khoản do game sở hữu, và không đồng bộ giữa thiết bị.** Game phải chơi được trong 2 giây kể từ khi mở trang; mọi thứ chắn ở giữa đều đắt hơn giá trị nó mang lại. Ngoại lệ duy nhất: đăng nhập Ducker ID **tuỳ chọn**, chỉ định danh, không backend, không đồng bộ, nằm sau cờ tính năng và chưa bật ở bản deploy (ADR-0021).
- **Không có bảng xếp hạng online ở bản này.** Bảng điểm chung cần backend, database và chống gian lận điểm — gấp đôi khối lượng việc cho một thứ chưa chắc có người dùng. Tầng lưu điểm được đặt sau một interface để mở đường, nhưng phần online nằm ngoài phạm vi.
- **Không có âm thanh ở bản đầu.** Âm thanh arcade rất dễ thành khó chịu, và nó thêm vào sau được mà không đụng gameplay.
- **Không có nhiều người chơi, không có chế độ đối kháng.**
- **Không dùng sprite hay tài sản đồ hoạ ngoài.** Mọi thứ vẽ bằng hình học trên canvas — ràng buộc chủ động, nó giữ bundle nhỏ và giữ phong cách nhất quán.
- **Không quảng cáo, không mua bán trong game.**
- **Không hỗ trợ trình duyệt thiếu Canvas 2D hoặc ES2020.**

## 5. Mô hình

| Câu hỏi                          | Trả lời                                                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Ai trả tiền                      | Không ai — dự án học tập                                                                                                   |
| Trả bằng gì                      | —                                                                                                                          |
| **Trần chi phí hạ tầng / tháng** | **0 đồng.** Build tĩnh, deploy GitHub Pages. Ràng buộc này là lý do trực tiếp khiến bảng xếp hạng online nằm ngoài phạm vi |

## 6. Thế nào là thành công

1. Người chơi mới sống qua wave 1 ngay ván đầu mà không cần mở màn "Cách chơi" — đo bằng cách tự chơi thử trên thiết bị thật.
2. Trên điện thoại giữ được **≥ 50fps** với 60 vật thể trên màn (`NFR-PERF-01`).
3. Một ván trung bình kéo dài **≥ 90 giây** ở lần chơi thứ ba — ngắn hơn nghĩa là độ khó đang tăng quá nhanh.
