# Luồng người dùng

> **Trả lời:** Người dùng đi qua những luồng nào từ đầu đến cuối?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-10 · commit —
> **Cập nhật khi:** có luồng người dùng mới · một luồng cũ đổi bản chất

## US-01 · Chơi ván đầu tiên

**Bối cảnh:** Người chơi vừa mở trang trên máy tính, chưa biết game này là gì.

**Các bước:**

1. Thấy màn hình chính: tên game, nút Chơi, nút Bảng điểm, nút Cách chơi, và điểm cao nhất của máy này.
2. Bấm Chơi. Game bắt đầu ngay, không có màn hình chờ.
3. Xoay tàu, đẩy, bắn. Thiên thạch to vỡ thành mảnh vừa, mảnh vừa vỡ thành mảnh nhỏ, mảnh nhỏ biến mất.
4. Bắn hết thiên thạch thì wave tiếp theo bắt đầu, nhiều thiên thạch hơn.
5. Va vào thiên thạch thì mất một mạng; tàu hiện lại giữa màn và nhấp nháy vài giây.
6. Hết mạng thì màn Hết lượt hiện điểm, wave đạt được và thứ hạng.

**Kết quả mong đợi:** Người chơi biết mình được bao nhiêu điểm và bấm được Chơi lại ngay tại chỗ. Điểm đã lưu trên máy này.

**Điều gì có thể sai:**

- Bấm Chơi rồi rời tay khỏi bàn phím, tàu đứng yên giữa đám thiên thạch đang bay tới. Vì vậy wave 1 sinh thiên thạch ở xa tâm và tàu có 2 giây bất tử.
- Chuyển sang tab khác giữa ván: game phải tự tạm dừng, không được chạy tiếp rồi báo chết khi quay lại.
- Trình duyệt chặn localStorage: vẫn chơi được, chỉ không lưu được điểm, và không được crash.

**Chức năng liên quan:** FR-01 · FR-02 · FR-03 · FR-04 · FR-05 · FR-06 · FR-10 · FR-11 · FR-14

---

## US-02 · Ghi tên vào bảng điểm

**Bối cảnh:** Vừa hết lượt với số điểm lọt top 10 của máy này.

**Các bước:**

1. Màn Hết lượt hiện thêm ô nhập tên ba ký tự, ký tự đầu được chọn sẵn.
2. Người chơi đổi từng ký tự — mũi tên hoặc gõ chữ trên máy tính, bấm mũi tên trên dưới trên điện thoại.
3. Xác nhận, điểm được ghi vào bảng kèm thời điểm.
4. Bảng điểm hiện ra, dòng vừa thêm được làm nổi.

**Kết quả mong đợi:** Điểm nằm đúng thứ hạng trong top 10 và còn đó sau khi tải lại trang.

**Điều gì có thể sai:**

- Điểm không lọt top 10 thì **không** hỏi tên. Hỏi rồi vứt đi tệ hơn không hỏi.
- Người chơi bỏ qua không nhập: lưu tên mặc định `AAA`.
- Dữ liệu bảng điểm bị hỏng hoặc bị sửa tay: bỏ qua, bắt đầu bảng trống, không crash.

**Chức năng liên quan:** FR-12

---

## US-03 · Chơi trên điện thoại

**Bối cảnh:** Người chơi mở trang trên điện thoại, cầm dọc bằng hai tay.

**Các bước:**

1. Nửa trên màn hình là khu vực chơi, nửa dưới là các nút cảm ứng.
2. Ngón trái giữ nút xoay trái hoặc xoay phải; ngón phải giữ nút đẩy và nút bắn.
3. Nút hyperspace nằm giữa, tách khỏi hai cụm kia vì hiếm dùng.
4. Chơi hết ván như trên máy tính.

**Kết quả mong đợi:** Điều khiển được tàu mà không phải nhìn xuống nút. Không nút nào nhỏ hơn 44px. Không thao tác nào cần hai ngón trong cùng một cụm.

**Điều gì có thể sai:**

- Giữ nút rồi trượt ngón ra ngoài: nút phải nhả, không được kẹt ở trạng thái đang bấm.
- Bấm hai nút cùng lúc (đẩy và bắn): cả hai đều phải nhận.
- Trình duyệt hiểu nhầm thành cuộn trang hoặc phóng to: phải chặn.

**Chức năng liên quan:** FR-13 · FR-17

---

## US-04 · Tạm dừng giữa ván

**Bối cảnh:** Đang chơi thì có việc.

**Các bước:**

1. Bấm Esc trên máy tính, hoặc nút tạm dừng ở góc HUD trên điện thoại. Chuyển tab cũng tự tạm dừng.
2. Overlay hiện ra, khu vực chơi mờ đi và đứng yên.
3. Bấm Tiếp tục để chơi lại từ đúng trạng thái đó, hoặc Về menu để bỏ ván.

**Kết quả mong đợi:** Không mất mạng nào vì việc tạm dừng, và không có khoảng thời gian nào bị mô phỏng bù khi quay lại.

**Điều gì có thể sai:**

- Quay lại tab sau 10 phút: không được mô phỏng bù 10 phút.
- Bấm Về menu do nhầm: mất ván. Chấp nhận, không hỏi xác nhận — một ván không đắt.

**Chức năng liên quan:** FR-11 · FR-15

---

## US-05 · Hiểu hệ power-up

**Bối cảnh:** Đang chơi wave 2, một vật thể phát sáng rơi ra từ thiên thạch vừa bắn vỡ.

**Các bước:**

1. Vật thể trôi chậm, có màu và hình riêng theo loại, nhấp nháy khi sắp biến mất.
2. Người chơi lái tàu chạm vào nó.
3. HUD hiện tên power-up kèm thanh thời gian; hiệu lực áp dụng ngay.
4. Nhặt loại vũ khí khác thì thay cái đang có; nhặt trùng loại thì cộng thêm thời gian.

**Kết quả mong đợi:** Người chơi thấy ngay mình vừa nhận được gì mà không phải đoán, kể cả khi không phân biệt được màu.

**Điều gì có thể sai:**

- Nhặt đúng lúc chết: power-up mất theo, không được giữ lại.
- Hai power-up rơi chồng lên nhau: vẫn nhặt được từng cái.

**Chức năng liên quan:** FR-09 · FR-10

---

## US-06 · Xem lại bảng điểm và cách chơi

**Bối cảnh:** Ở màn hình chính, chưa chơi hoặc vừa chơi xong.

**Các bước:**

1. Bấm Bảng điểm để xem top 10 của máy này: hạng, tên, điểm, wave, ngày.
2. Bấm Cách chơi để xem bảng phím tắt, ý nghĩa từng power-up, cách tính điểm.
3. Quay lại menu.

**Kết quả mong đợi:** Biết luật chơi mà không phải chết vài lần để đoán ra.

**Điều gì có thể sai:**

- Bảng điểm trống ở lần chơi đầu: phải nói rõ chưa có điểm nào, không hiện một bảng rỗng không giải thích.

**Chức năng liên quan:** FR-11 · FR-12

---

## US-07 · Chọn độ khó rồi chơi

**Bối cảnh:** Người chơi đã chết vài lần ở độ khó mặc định và muốn dễ hơn, hoặc đã thắng dễ dàng và muốn khó hơn.

**Các bước:**

1. Ở màn hình chính, dãy ba mức Dễ · Thường · Khó nằm ngay trên nút Chơi, mức đang chọn được làm nổi.
2. Bấm một mức khác. Dòng "Điểm cao nhất" bên dưới đổi theo, vì mỗi mức có bảng điểm riêng.
3. Bấm Chơi. Ván bắt đầu ngay với số mạng, tốc độ thiên thạch, tỉ lệ rơi vật phẩm và thời điểm UFO xuất hiện của mức đó.
4. Hết lượt, điểm được xét vào bảng của **mức vừa chơi**, không phải một bảng chung.
5. Mở Bảng điểm: ba tab, mở sẵn tab của mức đang chọn.

**Kết quả mong đợi:** Lựa chọn mức được nhớ cho lần mở trang sau. Điểm ở mức Dễ không bao giờ đứng chung hạng với điểm ở mức Khó.

**Điều gì có thể sai:**

- Bấm Chơi mà chưa từng chọn gì: phải vào mức Thường, đúng độ khó của game trước khi có tính năng này. Không được bắt chọn trước khi chơi.
- Xoá bảng điểm ở tab Khó: chỉ bảng Khó mất, hai bảng kia còn nguyên. Nút xoá phải ghi rõ nó xoá bảng nào.
- Bảng của một mức chưa có điểm nào: nói rõ chưa có điểm ở mức đó, và nút xoá biến mất hẳn.
- `localStorage` bị chặn: vẫn chọn và chơi được mức bất kỳ, chỉ không nhớ lựa chọn sau khi tải lại trang.

**Chức năng liên quan:** FR-20 · FR-22

---

## US-08 · Tự tinh chỉnh một ván

**Bối cảnh:** Ba mức sẵn không đúng ý — muốn nhiều mạng nhưng thiên thạch vẫn nhanh, hoặc muốn tắt hẳn UFO.

**Các bước:**

1. Ở màn hình chính bấm Tuỳ chỉnh, sang màn riêng.
2. Bốn thanh trượt: số mạng, tốc độ thiên thạch, tỉ lệ rơi vật phẩm, wave UFO xuất hiện. Kéo tới đâu số hiện ra tới đó.
3. Kéo thanh UFO tới mốc cuối thì nó ghi "tắt" — ván sẽ không có UFO nào.
4. Bấm Chơi. Ván chạy đúng bốn số đó.
5. Hết lượt: màn Hết lượt hiện điểm và wave, **không** hỏi tên và **không** hiện thứ hạng.

**Kết quả mong đợi:** Bốn số được nhớ cho lần sau, nên không phải kéo lại từ đầu mỗi ván. Người chơi hiểu ngay vì sao ván này không được ghi điểm — dòng cảnh báo nằm trên nút Chơi, đọc trước khi bấm.

**Điều gì có thể sai:**

- Hỏi tên rồi vứt điểm đi: tệ hơn không hỏi. Ván tuỳ chỉnh không hỏi.
- Bốn số lưu trong máy bị sửa tay ra ngoài biên: kéo về biên gần nhất, không được ra một ván không chơi được hay làm trắng màn hình.
- Đặt tốc độ 0.6× và 6 mạng rồi tưởng mình đang phá kỷ lục: dòng cảnh báo và việc không có thứ hạng phải nói rõ điều đó ngay tại màn Hết lượt.

**Chức năng liên quan:** FR-21

## US-09 · Đăng nhập Ducker ID (tuỳ chọn)

**Bối cảnh:** Chỉ có khi cờ tính năng bật và đủ cấu hình; bản trên GitHub Pages chưa có.

**Các bước:**

1. Ở menu chính, dưới dòng "Điểm chỉ lưu trên máy này", bấm "Đăng nhập".
2. Trình duyệt sang Ducker ID, đăng nhập (hoặc đã đăng nhập sẵn), rồi quay về menu.
3. Nút đổi thành avatar. Bấm vào để xem tên, email, "Mở hồ sơ Ducker ID" và "Đăng xuất".

**Kết quả mong đợi:** Điểm, cài đặt và cách chơi không đổi. Tải lại trang là về chưa đăng nhập.

**Điều gì có thể sai:**

- Huỷ hoặc từ chối ở Ducker ID, state bị sửa, hoặc Ducker ID không trả lời: về chưa đăng nhập, im lặng, URL sạch.
- Bấm "Đăng nhập" hai lần liên tiếp: chỉ một lần chuyển trang.

**Chức năng liên quan:** FR-23
