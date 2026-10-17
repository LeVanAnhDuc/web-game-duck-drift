'use client'

/**
 * Một núm cân bằng. `valueText` là giá trị đọc được cho người ("1.0×", "8%",
 * "tắt") và nó phải vào CẢ `aria-valuetext`: con số thô của thanh trượt nói sai —
 * 10 ở núm UFO nghĩa là TẮT, không phải wave 10.
 */
export function TuningSlider({
  id,
  label,
  value,
  valueText,
  min,
  max,
  step,
  onChange,
}: {
  id: string
  label: string
  value: number
  valueText: string
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-6">
        <label htmlFor={id} className="text-xs uppercase tracking-widest text-muted">
          {label}
        </label>
        <span className="font-mono text-lg tabular-nums text-accent">{valueText}</span>
      </div>
      {/* h-11 = 44px vùng bấm — NFR-A11Y-03. Thanh vẽ mảnh, vùng chạm thì không. */}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range h-11 w-full cursor-pointer"
      />
    </div>
  )
}
