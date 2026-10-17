# Red Routes — Duck Drift

> Chốt ngày: 2026-09-11 · duyệt bởi: **người dùng, 2026-09-11 — duyệt cả 7**
> Nguồn: `docs/01-product/journeys.md` (US-01…US-08) · `docs/02-requirements/scope.md` (FR-01…FR-22)
> Mỗi Red Route là một **hành trình**, không phải một trang.

## Phạm vi đo được, và chỗ dừng của nó

Game chạy 60Hz; một subagent điều khiển qua MCP mất hàng giây mỗi thao tác. Nó **không chơi
được**. Vì vậy mọi `done_when` dưới đây đều nằm ở **lớp vỏ** — thứ persona đọc, hiểu và bấm —
chứ không ở kỹ năng bắn trúng. Đây là giới hạn có chủ ý, không phải thiếu sót.

Không có Red Route nào cần đăng nhập, nhập email, hay gọi mạng: game là bản export tĩnh chạy
hoàn toàn trong máy (ADR-0001).

Toàn bộ UI bằng **tiếng Việt** (`client/src/i18n/vi.ts`). Persona phải đọc được tiếng Việt.

`entry` của mọi Red Route: `http://127.0.0.1:4173/`

---

## RR-01 · Từ mở trang tới đang chơi ván đầu

- **actor:** người vừa được gửi link, chưa biết đây là game gì
- **entry:** `http://127.0.0.1:4173/`
- **done_when:** màn hình đã đổi khỏi menu; trên màn có ba con số ghi Điểm, Wave, Mạng và các
  vật thể đang chuyển động. Người chơi kể được là "tôi đang ở trong ván rồi".
- **min_steps:** 1
- **why_red:** không vào được ván thì sáu hành trình còn lại không tồn tại. Đây là hành trình
  duy nhất mà 100% người mở trang phải đi qua.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:8-29` (US-01) · `docs/02-requirements/scope.md:20` (FR-11)

## RR-02 · Biết cách điều khiển trước khi chết lần đầu

- **actor:** người quen game nhưng không quen game này, muốn xem phím trước
- **entry:** `http://127.0.0.1:4173/`
- **done_when:** người chơi nói lại được **phím bắn là Space** và **phím tạm dừng là Esc hoặc P**,
  rồi quay lại được màn hình chính.
- **min_steps:** 2
- **why_red:** `journeys.md:132` viết thẳng ra mong đợi: "Biết luật chơi mà không phải chết vài
  lần để đoán ra". Hành trình này là chỗ duy nhất kiểm được lời hứa đó.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:122-138` (US-06) · `client/src/i18n/vi.ts:89-105`

## RR-03 · Thấy game khó quá, chuyển sang mức dễ hơn rồi chơi tiếp

- **actor:** người vừa thua vài lần, muốn nhẹ tay hơn
- **entry:** `http://127.0.0.1:4173/`
- **done_when:** mức **Dễ** đang được chọn (nhìn thấy được là nó khác hai mức kia), dòng "Điểm
  cao nhất" dưới cùng đã đổi sang mức đó, và ván mới đã bắt đầu.
- **min_steps:** 2
- **why_red:** US-07 nói rõ mỗi mức có bảng điểm riêng. Nếu người chơi không nhận ra mình đang
  đổi mức, họ sẽ tưởng mình phá kỷ lục ở bảng khác — hỏng âm thầm, không báo lỗi.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:142-163` (US-07) · `docs/02-requirements/scope.md:29` (FR-20)

## RR-04 · Tự tinh chỉnh một ván, và hiểu cái giá phải trả

- **actor:** người muốn nghịch: nhiều mạng, không có UFO
- **entry:** `http://127.0.0.1:4173/`
- **done_when:** thanh **UFO từ wave** đã kéo tới mốc hiện chữ **"tắt"**, số mạng đã tăng, ván
  đã bắt đầu — **và** trước khi bấm Chơi, người chơi nói được rằng ván này **không được ghi vào
  bảng điểm**.
- **min_steps:** 4
- **why_red:** đây là chỗ duy nhất trong sản phẩm có một cái giá ẩn. `journeys.md:179` đặt cược
  vào việc dòng cảnh báo nằm **trên** nút Chơi là đủ để người chơi đọc trước khi bấm. Hành
  trình này là cách duy nhất kiểm cược đó bằng người thật.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:167-187` (US-08) · `client/src/components/CustomScreen.tsx:53-56`

## RR-05 · Tìm bảng điểm, hiểu nó là bảng của ai và của mức nào

- **actor:** người vừa chơi xong, muốn xem điểm mình đứng đâu
- **entry:** `http://127.0.0.1:4173/`
- **done_when:** đã mở bảng điểm, và nói được **hai** điều: bảng đang xem là của **mức nào**, và
  điểm này **chỉ nằm trên máy này** chứ không phải bảng xếp hạng toàn cầu. Đổi sang tab mức khác
  thì thấy nội dung đổi theo.
- **min_steps:** 3
- **why_red:** bảng trống ở lần chơi đầu là trạng thái mặc định của mọi người mới. `journeys.md:136`
  yêu cầu nó phải tự giải thích. Và hiểu nhầm "bảng điểm toàn cầu" là hiểu nhầm đắt nhất mà sản
  phẩm này có thể gây ra.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:122-138` · `:154-160` · `docs/02-requirements/scope.md:31` (FR-22)

## RR-06 · Tạm dừng giữa ván rồi quay lại đúng chỗ

- **actor:** người đang chơi thì bị gọi
- **entry:** `http://127.0.0.1:4173/`
- **done_when:** overlay **TẠM DỪNG** hiện ra và mọi thứ trên màn đứng yên; bấm **Tiếp tục** thì
  ván chạy lại với **đúng số mạng và đúng số điểm** như lúc dừng.
- **min_steps:** 3
- **why_red:** US-04 hứa "không mất mạng nào vì việc tạm dừng". Mất một mạng vì bấm tạm dừng là
  kiểu lỗi khiến người chơi bỏ game và không bao giờ báo lại.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:79-96` (US-04) · `docs/02-requirements/scope.md:24` (FR-15)

## RR-07 · Hết lượt, ghi tên mình vào bảng điểm

- **actor:** người vừa chơi xong ván đầu tiên trong đời ở game này
- **entry:** `http://127.0.0.1:4173/` — chọn mức **Khó** (2 mạng) để tới màn Hết lượt nhanh nhất
- **done_when:** ba ký tự đã đổi khỏi `AAA` thành thứ người chơi chọn, đã xác nhận, và bảng điểm
  hiện ra với **đúng dòng vừa thêm được làm nổi**.
- **min_steps:** 5
- **why_red:** đây là form duy nhất của sản phẩm, và là một form lạ — ba ô ký tự kiểu máy arcade
  1979, thứ mà người dưới 30 tuổi chưa từng thấy. Lăng kính Form design không có chỗ nào khác
  để bám vào.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:33-52` (US-02) · `docs/02-requirements/scope.md:21` (FR-12)
- **ghi chú vận hành:** tới được màn Hết lượt bằng cách **ngồi yên** — tàu đứng giữa màn sẽ bị
  thiên thạch đâm. Đó cũng chính là điều một người mới hoảng hốt hay làm, nên nó không phải
  gian lận.

---

## Không phải Red Route, và vì sao

| Thứ | Vì sao không | Nguồn |
| --- | --- | --- |
| Bắn vỡ thiên thạch, ăn power-up (US-05) | cần kỹ năng thời gian thực, subagent không làm được. Đo sẽ ra số vô nghĩa. | US-05, FR-09 |
| Chơi bằng cảm ứng trên điện thoại (US-03) | đã có suite e2e chạy thật trên Pixel 5 với pointer coarse; persona qua MCP không dựng lại được giữ-nút. Vẫn giữ **một persona điện thoại** để soi bố cục và cỡ chữ ở 375px. | US-03, `playwright.config.ts:32` |
| Tự tạm dừng khi chuyển tab (FR-15) | phụ thuộc `visibilitychange` của trình duyệt thật; đã có test. | FR-15 |
| `prefers-reduced-motion`, `aria-live` (FR-16, FR-19) | thuộc lăng kính a11y, persona a11y sẽ chạm tới trong lúc đi các RR trên, không cần hành trình riêng. | FR-16, FR-19 |

Không có mục `status: planned` nào: `scope.md` ghi cả 22 FR đều **xong**.
