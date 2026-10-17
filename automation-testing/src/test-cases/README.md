# test-cases/

**Kiểm thế nào.** Một file mỗi module: `<module>.md`.

```md
### TC-<MODULE>-NNN — <tên test, đúng như trong spec>

- **Requirement:** REQ-<MODULE>-NN
- **Layer:** e2e · **Priority:** P1 · **Tags:** @smoke
- **Tiền điều kiện:** <trạng thái cần có trước, nếu có>
- **Bước:** <thao tác> → <thao tác>
- **Mong đợi:** <điều người chơi thấy>
- **Kiểm chứng thêm:** <tín hiệu phụ, nếu có>
- **Automated:** `tests/e2e/<module>/<file>.e2e.ts`
```

Mẫu dùng chỗ giữ chỗ `<...>` chứ không dùng mã thật, để `grep "### TC-"` đếm đúng số case thật (`pnpm coverage:check` vốn bỏ qua README).

- Mã `TC-<MODULE>-NNN` cố định. Tiêu đề TC = **tên test** trong spec.
- `Automated`: đường dẫn tính từ `src/`, hoặc `manual — <lý do>`. Spec đó phải có test gắn tag `@TC-<MODULE>-NNN`.
- **Priority:** P0 = hỏng là chặn người dùng hoặc rò dữ liệu (gắn `@smoke`), P1 = luồng phụ quan trọng, P2 = biên hiếm.
- **Layer:** `api` cho tổ hợp input / biên / bảo mật / rate limit; `e2e` cho luồng người dùng thật. Không lặp tổ hợp đã phủ ở API.
