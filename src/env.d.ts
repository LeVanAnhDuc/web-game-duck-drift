declare namespace NodeJS {
  interface ProcessEnv {
    /** Đường dẫn con khi deploy (`/<tên-repo>`); trống = gốc. */
    readonly NEXT_PUBLIC_BASE_PATH?: string
    /** Chỉ đúng chuỗi `true` mới bật đăng nhập Ducker ID. */
    readonly NEXT_PUBLIC_FEATURE_DUCKER_SIGN_IN?: string
    readonly NEXT_PUBLIC_DUCKER_ISSUER?: string
    readonly NEXT_PUBLIC_DUCKER_CLIENT_ID?: string
    readonly NEXT_PUBLIC_DUCKER_SCOPE?: string
    readonly NEXT_PUBLIC_DUCKER_PROFILE_PATH?: string
  }
}
