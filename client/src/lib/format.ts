/** Dinh dang diem theo locale vi-VN. Thuan, khong render gi — nen no o lib/. */
export const formatScore = (n: number) => new Intl.NumberFormat('vi-VN').format(n)
