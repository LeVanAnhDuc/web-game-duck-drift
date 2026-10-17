#!/usr/bin/env bash
# docs-brief.sh — hook SessionStart (matcher: startup|clear|compact).
#
# In ra brief trạng thái tài liệu. Với hook SessionStart, stdout khi exit 0 được
# BƠM VÀO NGỮ CẢNH của model — nên đây là cách để mọi phiên (kể cả phiên tiếp tục
# sau khi context bị nén) mở đầu với bản đồ tài liệu và trạng thái thật.
#
# Dòng 🔴 là dòng quan trọng nhất: nó nói cho model biết file nào RỖNG, để không
# suy luận từ một file trống. Không có nó, một overview.md rỗng bị đọc thành
# "dự án không có Non-Goal nào".
#
# Không cần jq: grep thẳng vào JSON trên stdin là đủ, vì các khoá JSON không bao
# giờ khớp với nội dung ta cần.
set -uo pipefail

input=$(cat)
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root" 2>/dev/null || exit 0
[ -f docs/README.md ] || exit 0

json_str() { printf '%s' "$input" | grep -o "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 | sed -E 's/.*"([^"]*)"$/\1/'; }
sid=$(json_str session_id); [ -z "${sid:-}" ] && sid="default"
src=$(json_str source)

state=".claude/.doc-state"
mkdir -p "$state" 2>/dev/null || true

# Sinh lại phần máy suy ra được TRƯỚC khi đọc, để brief dùng số liệu tươi.
report=$(bash .claude/scripts/docs-regen.sh 2>/dev/null)

# Mốc git đầu phiên — để sau này tính được "phiên này đã đổi những file nào".
in_git=0
if git rev-parse --git-dir >/dev/null 2>&1; then
  in_git=1
  git rev-parse --short HEAD > "$state/$sid.baseline" 2>/dev/null || true
fi

hdr() { grep -m1 "^> \*\*$2:\*\*" "$1" 2>/dev/null | sed "s/^> \*\*$2:\*\* *//"; }
strip_comments() { awk '{ if ($0 ~ /<!--/) c=1; if (!c) print; if ($0 ~ /-->/) c=0 }'; }

# ── gom file theo trạng thái ────────────────────────────────────────────
red=""; yellow=""; white=""; green=""
for f in docs/01-product/overview.md docs/01-product/journeys.md docs/01-product/glossary.md \
         docs/02-requirements/scope.md docs/02-requirements/nfr.md \
         docs/03-design/architecture.md docs/03-design/invariants.md \
         docs/04-state/backlog.md; do
  [ -f "$f" ] || continue
  st=$(hdr "$f" "Trạng thái"); rel="${f#docs/}"
  case "$st" in
    *🔴*) red="$red $rel" ;;
    *🟡*) yellow="$yellow $rel" ;;
    *⚪*) white="$white $rel" ;;
    *🟢*) green="$green $rel" ;;
  esac
done
if [ -f client/.env.example ]; then
  est=$(grep -m1 '^# Trạng thái:' client/.env.example | sed 's/^# Trạng thái: *//')
  case "$est" in
    *🔴*) red="$red ../client/.env.example" ;;
    *🟡*) yellow="$yellow ../client/.env.example" ;;
    *⚪*) white="$white ../client/.env.example" ;;
    *🟢*) green="$green ../client/.env.example" ;;
  esac
fi

doing=$(awk '/^## Đang làm/{f=1;next} /^## /{f=0} f' docs/04-state/backlog.md 2>/dev/null \
        | strip_comments | sed '/^[[:space:]]*$/d')

adr=$(find docs/decisions -type f -name '[0-9]*.md' 2>/dev/null | wc -l | tr -d ' ')

# ── in brief ───────────────────────────────────────────────────────────
echo "📍 $(basename "$root") — trạng thái tài liệu · bản đồ: docs/README.md"
[ "$src" = "compact" ] && echo "⚠️  Phiên này vừa qua một lần NÉN CONTEXT. Những gì bàn trước đó có thể đã mất."
echo

if [ -n "$doing" ]; then
  echo "Đang làm:"
  printf '%s\n' "$doing" | sed 's/^/   /'
else
  echo "Đang làm:  (trống — backlog.md §Đang làm không ghi việc nào đang dở)"
fi
echo

[ -n "$red" ]    && echo "🔴 CHƯA ĐIỀN — đừng coi là nguồn đúng, đừng suy luận từ nội dung rỗng:$red"
[ -n "$yellow" ] && echo "🟡 mặc định đề xuất, chưa rà theo dự án:$yellow"
[ -n "$white" ]  && echo "⚪ chưa áp dụng:$white"
[ -n "$green" ]  && echo "🟢 đã đủ:$green"
echo "📒 ADR đã ghi: $adr"

if [ "$in_git" = 1 ]; then
  changed=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  [ "$changed" != "0" ] && echo "🔧 working tree: $changed file đang thay đổi chưa commit"
  if [ -f "$state/$sid.precompact" ]; then
    echo "📌 trước lần nén: $(tr '\n' ' ' < "$state/$sid.precompact")"
    rm -f "$state/$sid.precompact"
  fi
else
  echo "ℹ️  chưa git init — chưa đo được độ trôi của tài liệu so với code"
fi

[ -n "$report" ] && { echo; printf '%s\n' "$report"; }

cat <<'HINT'

Định tuyến:
   → thêm chức năng:       01-product/overview.md §Non-Goals · 02-requirements/scope.md · nfr.md
   → sửa code:             03-design/invariants.md  (bất biến — vi phạm thì sai âm thầm)
   → chốt quyết định:      viết ADR ngay trong phiên → docs/decisions/
   → đi đường tắt có ý:    ghi ngay vào 04-state/backlog.md §Nợ kỹ thuật
   → trước khi dừng phiên: cập nhật 04-state/backlog.md §Đang làm

Quy tắc: THIẾU tài liệu tốt hơn tài liệu CŨ. Không điền file 🔴 bằng phỏng đoán,
và không ghi con số nào mà bạn chưa vừa chạy ra nó.
HINT
exit 0
