import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// happy-dom giữ DOM giữa các test trong cùng file; không dọn thì test sau nhìn thấy
// cây DOM của test trước và query trả về phần tử sai.
afterEach(() => {
  cleanup()
})
