#!/usr/bin/env bash
# docs-regen.sh — sinh lại những phần tài liệu mà MÁY SUY RA ĐƯỢC.
#
# Gọi từ docs-brief.sh (SessionStart) và doc-flush.sh (Stop). Chạy tay cũng được:
#   bash .claude/scripts/docs-regen.sh
#
# Chỉ ghi vào vùng giữa <!-- BEGIN:auto --> và <!-- END:auto -->. Không bao giờ
# chạm văn xuôi do người viết. Không cần jq.
#
# stdout = CHỈ những vấn đề cần người hoặc AI xử lý. Không có vấn đề thì im lặng.
set -uo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root" 2>/dev/null || exit 0
[ -d docs ] || exit 0

# Thứ tự đọc mong muốn. File mới không có trong danh sách vẫn được liệt kê ở cuối.
ORDER="overview journeys glossary scope nfr architecture invariants backlog"

esc()   { printf '%s' "$1" | sed 's/|/\|/g'; }
trunc() { local s="$1" n="${2:-64}"; if [ "${#s}" -gt "$n" ]; then printf '%s…' "${s:0:$n}"; else printf '%s' "$s"; fi; }
hdr()   { grep -m1 "^> \*\*$2:\*\*" "$1" 2>/dev/null | sed "s/^> \*\*$2:\*\* *//"; }

list_docs() {
  local found="" n f
  for n in $ORDER; do
    f=$(find docs -mindepth 2 -type f -name "$n.md" 2>/dev/null | sort | head -1)
    [ -n "$f" ] && { echo "$f"; found="$found $f"; }
  done
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    case " $found " in *" $f "*) ;; *) echo "$f" ;; esac
  # Bang trang thai chi liet ke TANG 1. Bo ra:
  #   decisions/  - da co dong tong ben duoi + muc luc rieng o decisions/README.md
  #   specs/      - tai lieu tang 2, mot folder moi feature, do feature-flow sinh
  #   docs/.*     - thu muc an (.claude, .superdesign), khong phai tai lieu
  done < <(find docs -mindepth 2 -type f -name '*.md' ! -name '_*' ! -name 'README.md'              ! -path 'docs/decisions/*' ! -path 'docs/specs/*' ! -path 'docs/.*'              2>/dev/null | sort)
}

# ── khối bảng trạng thái cho docs/README.md ─────────────────────────────
build_readme_block() {
  echo '| File | Trả lời câu hỏi | Trạng thái | Cập nhật khi |'
  echo '| --- | --- | --- | --- |'
  local f rel ans st wh
  while IFS= read -r f; do
    rel="${f#docs/}"
    ans=$(hdr "$f" "Trả lời"); st=$(hdr "$f" "Trạng thái"); wh=$(hdr "$f" "Cập nhật khi")
    printf '| [`%s`](%s) | %s | %s | %s |\n' "$rel" "$rel" \
      "$(esc "$(trunc "${ans:-—}" 58)")" "$(esc "$(trunc "${st:-—}" 44)")" "$(esc "$(trunc "${wh:-—}" 58)")"
  done < <(list_docs)

  local n
  n=$(find docs/decisions -type f -name '[0-9]*.md' 2>/dev/null | wc -l | tr -d ' ')
  printf '| [`decisions/`](decisions/README.md) | Tại sao lại làm thế này? | %s ADR | mỗi quyết định kỹ thuật |\n' "$n"

  if [ -f client/.env.example ]; then
    ans=$(grep -m1 '^# Trả lời câu hỏi:' client/.env.example | sed 's/^# Trả lời câu hỏi: *//')
    st=$(grep -m1 '^# Trạng thái:' client/.env.example | sed 's/^# Trạng thái: *//')
    wh=$(grep -m1 '^# Cập nhật khi:' client/.env.example | sed 's/^# Cập nhật khi: *//')
    printf '| [`../client/.env.example`](../client/.env.example) | %s | %s | %s |\n' \
      "$(esc "$(trunc "${ans:-Cần biến môi trường nào để chạy?}" 58)")" \
      "$(esc "$(trunc "${st:-—}" 44)")" "$(esc "$(trunc "${wh:-—}" 58)")"
  fi
}

# ── khối mục lục ADR cho docs/decisions/README.md ───────────────────────
build_adr_block() {
  echo '| ID | Tiêu đề | Ngày | Trạng thái |'
  echo '| --- | --- | --- | --- |'
  local any=0 f id title d st
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    any=1
    id=$(basename "$f" .md | grep -oE '^[0-9]+')
    title=$(grep -m1 '^# ' "$f" | sed 's/^# *//; s/^ADR-[0-9]*[[:space:]]*·[[:space:]]*//')
    d=$(grep -m1 '^> \*\*Ngày:\*\*' "$f" | sed 's/.*Ngày:\*\* *//')
    st=$(grep -m1 '^> \*\*Trạng thái:\*\*' "$f" | sed 's/.*Trạng thái:\*\* *//')
    printf '| [ADR-%s](%s) | %s | %s | %s |\n' "$id" "$(basename "$f")" \
      "$(esc "${title:-—}")" "${d:-—}" "$(esc "${st:-—}")"
  done < <(find docs/decisions -type f -name '[0-9]*.md' 2>/dev/null | sort)
  [ "$any" = 0 ] && echo '| — | _chưa có ADR nào_ | — | — |'
  return 0
}

# ── thay nội dung giữa hai marker ───────────────────────────────────────
splice() { # $1=file  $2=file chứa khối mới
  [ -f "$1" ] || return 0
  grep -q '<!-- BEGIN:auto' "$1" || return 0
  awk -v bf="$2" '
    /<!-- BEGIN:auto/ { print; while ((getline l < bf) > 0) print l; close(bf); s=1; next }
    /<!-- END:auto/   { s=0 }
    !s
  ' "$1" > "$1.regen.tmp" && mv "$1.regen.tmp" "$1"
}

tmp=$(mktemp 2>/dev/null || echo "$root/.claude/.regen.tmp")
build_readme_block > "$tmp"; splice docs/README.md "$tmp"
build_adr_block    > "$tmp"; splice docs/decisions/README.md "$tmp"
rm -f "$tmp"

# ── kiểm tra: biến môi trường code đọc mà .env.example không có ─────────
check_env() {
  [ -f client/.env.example ] || return 0
  local names miss="" n
  names=$(grep -rhoE '(process\.env\.[A-Z][A-Z0-9_]*|import\.meta\.env\.[A-Z][A-Z0-9_]*|os\.getenv\("[A-Z][A-Z0-9_]*"|os\.Getenv\("[A-Z][A-Z0-9_]*"|getenv\("[A-Z][A-Z0-9_]*")' . \
    --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --include='*.mjs' \
    --include='*.py' --include='*.go' --include='*.rs' --include='*.java' \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.claude --exclude-dir=automation-testing --exclude-dir=.worktrees \
    --exclude-dir=dist --exclude-dir=build --exclude-dir=.next 2>/dev/null \
    | grep -oE '[A-Z][A-Z0-9_]{2,}' | sort -u)
  for n in $names; do
    grep -qE "(^|[^A-Z0-9_])$n([^A-Z0-9_]|$)" client/.env.example || miss="$miss $n"
  done
  [ -n "$miss" ] && echo "⚠️  .env.example thiếu biến mà code đang đọc:$miss"
  return 0
}

# ── kiểm tra: ID được tham chiếu nhưng không có trong file nguồn ────────
check_ids() {
  local re src label used i miss
  chk() {
    re="$1"; src="$2"; label="$3"; miss=""
    [ -f "$src" ] || return 0
    used=$(grep -rhoE "$re" docs 2>/dev/null | sort -u)
    for i in $used; do grep -q "$i" "$src" || miss="$miss $i"; done
    [ -n "$miss" ] && echo "⚠️  ID được nhắc nhưng không có trong $label:$miss"
    return 0
  }
  chk 'FR-[0-9]+'              docs/02-requirements/scope.md   'scope.md'
  chk 'US-[0-9]+'              docs/01-product/journeys.md     'journeys.md'
  chk 'NFR-[A-Z0-9]+-[0-9]+'   docs/02-requirements/nfr.md     'nfr.md'
  return 0
}

check_env
check_ids
exit 0
