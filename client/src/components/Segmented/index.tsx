'use client'

/**
 * Dãy lựa chọn dùng ở hai chỗ có HAI ngữ nghĩa khác nhau:
 *
 * - `group` (menu): nhóm nút bật/tắt — một lựa chọn để dùng SAU, khi bấm Chơi.
 * - `tablist` (bảng điểm): tab thật — nó lọc ngay cái bảng ngay bên dưới.
 *
 * Cùng một hình, khác ngữ nghĩa, nên khác role. Đừng gộp thành một role duy nhất.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  variant = 'group',
  controls,
}: {
  options: readonly { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
  label: string
  variant?: 'group' | 'tablist'
  controls?: string
}) {
  const tabs = variant === 'tablist'
  return (
    <div
      role={tabs ? 'tablist' : 'group'}
      aria-label={label}
      className="grid grid-cols-3 gap-1 rounded-[10px] border border-hairline bg-surface p-1"
    >
      {options.map((option) => {
        const on = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role={tabs ? 'tab' : undefined}
            aria-selected={tabs ? on : undefined}
            aria-pressed={tabs ? undefined : on}
            aria-controls={tabs ? controls : undefined}
            onClick={() => onChange(option.id)}
            // min-h-11 = 44px — NFR-A11Y-03
            // Trạng thái ĐANG CHỌN phải đủ khác để tin — F-07. Bản cũ chỉ khác ở
            // nền mờ và viền 60%: persona đổi sang Dễ rồi nói "hình như chọn được
            // rồi, nhưng tôi không chắc lắm nên bấm lại thêm một lần cho chắc ăn".
            // Nay thêm viền đặc, chữ đậm và một chấm chỉ thị — không mã hoá thông
            // tin CHỈ bằng màu (NFR-A11Y-04).
            className={`relative min-h-11 cursor-pointer rounded-lg border text-sm tracking-wide transition-colors ${
              on
                ? 'border-primary bg-primary/20 font-semibold text-fg'
                : 'border-transparent bg-transparent font-medium text-muted hover:text-fg'
            }`}
          >
            {option.label}
            {on ? (
              <span
                aria-hidden="true"
                className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
