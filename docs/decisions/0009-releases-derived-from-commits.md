# ADR-0009 · Số phiên bản và nội dung release note suy ra từ lịch sử commit

> **Ngày:** 2026-09-07
> **Trạng thái:** accepted
> **Liên quan:** ADR-0008

## 1. Bối cảnh

Dự án cần đánh dấu các mốc phát hành để biết bản đang chạy trên Pages là bản nào. Mọi quy trình release dựa vào việc con người **nhớ làm một việc** — sửa số version, viết note, tạo tag — sẽ bị bỏ sót đúng lúc bận nhất. Trong khi đó repo này đã có một thứ đủ để suy ra tất cả: **mọi commit đều là Conventional Commit** với subject tiếng Anh và scope theo vùng.

## 2. Quyết định

`release.yml` chạy mỗi lần push vào `main`, gọi hai script trong repo:

- `scripts/next-version.sh` — quyết định tag kế tiếp so với tag `v*` gần nhất: có commit `feat!:`/`BREAKING CHANGE:` thì **major**, có `feat:` thì **minor**, còn lại **patch**. Subject của commit HEAD ghi đè được bằng `[release major]`, `[release minor]`, hoặc `[skip release]` để không phát hành gì. In ra chuỗi rỗng nghĩa là "không release" — HEAD đã có tag, hoặc bị `[skip release]`.
- `scripts/release-notes.sh` — soạn note từ subject của các commit kể từ tag trước, nhóm theo tiền tố: breaking trước, rồi What's new (`feat`), Fixes (`fix`), Performance, Internals, Tests, Documentation, Build and tooling. Scope giữ lại làm nhãn, nên `feat(game): …` đọc thành **game**: …

Cả hai **là script trong repo, không phải shell chôn trong workflow**, và có lối gọi ở `package.json`: `pnpm release:next`, `pnpm release:notes v1.1.0`.

Marker chỉ được đọc ở **subject** của commit HEAD, không đọc trong body.

## 3. Phương án đã loại

| Phương án                                    | Vì sao loại                                                                                                                                                                                                           |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gh release create --generate-notes`         | Có sẵn, không cần script. Nhưng nó nhóm theo **nhãn của pull request**, mà repo này không gắn nhãn PR. Thứ repo này thật sự có là subject conventional trên mọi commit — cùng lượng thông tin, và nó **đang tồn tại** |
| Sửa version bằng tay + viết note bằng tay    | Linh hoạt nhất, nhưng đây đúng là loại việc bị bỏ qua đầu tiên khi gấp, và lúc đó không ai biết bản trên Pages là bản nào                                                                                             |
| `semantic-release` hoặc `changesets`         | Làm được nhiều hơn thế này, nhưng kéo theo cả một cây dependency và một file cấu hình cho một repo không publish lên npm                                                                                              |
| Viết logic version thẳng trong `release.yml` | Ít file hơn, nhưng lúc đó chỉ kiểm được bằng cách đẩy lên `main`. Một quy trình release chỉ kiểm được bằng cách chạy thật là quy trình không ai kiểm                                                                  |
| Đọc marker ở cả body commit                  | Tiện hơn khi viết, nhưng một body chỉ **nhắc đến** `[release major]` — chính ADR này, hay một dòng changelog — sẽ kích hoạt bump major                                                                                |

## 4. Hệ quả

**Được:**

- Không có bước thủ công nào giữa "merge vào main" và "có release kèm note".
- Thử được ở máy trước khi tin: `pnpm release:next` in ra cả tag và **lý do** chọn tag đó.
- Commit nào không phải Conventional Commit vẫn được liệt vào mục "Other" chứ không bị bỏ. Một release note âm thầm nuốt commit là release note đã bắt đầu nói sai.

**Mất / phải chấp nhận:**

- Chất lượng release note bằng đúng chất lượng subject commit. Một `chore: fix stuff` sẽ hiện nguyên văn như vậy trước mặt người đọc.
- Mỗi push vào `main` sinh một release, kể cả khi chỉ sửa một dòng README (nó thành patch). Đây là chủ ý: một tag rẻ hơn một câu hỏi "bản nào đang chạy".
- Chỉ subject commit vào note; body — nơi dự án này giải thích lý do khá dài — không vào. Ai cần thì theo hash.

**Điều kiện xem lại quyết định này:** nếu repo bắt đầu gắn nhãn PR một cách kỷ luật, thì `--generate-notes` mới đáng cân nhắc lại.
