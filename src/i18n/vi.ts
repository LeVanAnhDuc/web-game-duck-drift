// Toàn bộ chuỗi hiển thị nằm ở đây — NFR-I18N-01. Component không được viết
// chuỗi tiếng Việt trực tiếp.

export const vi = {
  meta: {
    title: 'Duck Drift',
    description: 'Game bắn thiên thạch kiểu arcade, chơi ngay trong trình duyệt.',
  },

  menu: {
    title: 'DUCK DRIFT',
    play: 'Chơi',
    highScores: 'Bảng điểm',
    help: 'Cách chơi',
    custom: 'Tuỳ chỉnh',
    best: 'Điểm cao nhất',
    bestOf: (name: string) => `Điểm cao nhất — ${name}`,
    /**
     * Nêu MỨC kể cả khi chưa có điểm — F-07. Bản cũ chỉ ghi "Chưa có điểm nào", nên ở
     * đúng lúc người chơi vừa đổi mức thì menu không có chỗ nào xác nhận họ vừa đổi
     * bảng điểm nào. Persona đổi sang Dễ rồi không tin là đã đổi được.
     */
    noBestOf: (name: string) => `Chưa có điểm nào — ${name}`,
    noBest: 'Chưa có điểm nào',
    /**
     * Chỉnh kỳ vọng NGAY Ở MENU, trước cú bấm — F-08. Chữ "Bảng điểm" gợi một bảng
     * xếp hạng có người khác trong đó; persona vào với đúng kỳ vọng đó rồi hụt hẫng.
     * Bảng xếp hạng online là Non-Goal (`overview.md` §4), nên việc làm được là nói
     * trước rằng bảng này là của máy này.
     */
    localNote: 'Điểm chỉ lưu trên máy này',
  },

  /** Đăng nhập Ducker ID tuỳ chọn — ADR-0021. Chỉ hiện khi cờ tính năng bật. */
  account: {
    signIn: 'Đăng nhập',
    signingIn: 'Đang đăng nhập…',
    menuLabel: 'Tài khoản Ducker ID',
    openProfile: 'Mở hồ sơ Ducker ID',
    signOut: 'Đăng xuất',
  },

  difficulty: {
    label: 'Độ khó',
    easy: 'Dễ',
    normal: 'Thường',
    hard: 'Khó',
    custom: 'Tuỳ chỉnh',
  },

  custom: {
    title: 'TUỲ CHỈNH',
    startLives: 'Số mạng',
    asteroidSpeed: 'Tốc độ thiên thạch',
    dropChance: 'Tỉ lệ rơi vật phẩm',
    ufoFirstWave: 'UFO từ wave',
    ufoOff: 'tắt',
    notSaved: 'Ván tuỳ chỉnh không được ghi vào bảng điểm.',
    play: 'Chơi',
    back: 'Về menu',
  },

  hud: {
    score: 'Điểm',
    wave: 'Wave',
    lives: 'Mạng',
    pause: 'Tạm dừng',
    hyperspace: 'Dịch chuyển',
    /**
     * Gợi ý điều khiển, chỉ hiện lúc người chơi chưa làm gì — F-02. Tên phím KHÔNG
     * viết lại ở đây, chúng lấy từ `help.keyboard` để hai chỗ không thể lệch nhau.
     */
    controlsHint: 'Điều khiển',
  },

  pause: {
    title: 'TẠM DỪNG',
    resume: 'Tiếp tục',
    toMenu: 'Về menu',
    /**
     * Hậu quả nói TRƯỚC cú bấm — F-05. Hai persona bấm "Về menu" vì tin nó an toàn
     * rồi mất điểm đang chơi. Cùng khuôn với `gameOver.customNoSave`, khuôn đã được
     * kiểm bằng người thật và thắng (journeys.md:179).
     *
     * Chưa có điểm thì KHÔNG nhắc tới điểm: "0 điểm sẽ không được ghi" là cảnh báo về
     * một mất mát không tồn tại, và cảnh báo sai chỗ dạy người ta bỏ qua cảnh báo
     * (ADR-0019). Chỉ còn lại sự thật đơn giản là ván này bỏ.
     */
    toMenuWarning: (score: string | null) =>
      score === null ? 'Về menu là bỏ ván này.' : `Về menu là bỏ ván này. ${score} điểm sẽ không được ghi.`,
  },

  gameOver: {
    title: 'HẾT LƯỢT',
    score: 'Điểm',
    wave: 'Wave',
    rank: 'Hạng',
    noRank: 'Không lọt bảng',
    enterName: 'Tên của bạn',
    save: 'Lưu điểm',
    playAgain: 'Chơi lại',
    toMenu: 'Về menu',
    customNoSave: 'Ván tuỳ chỉnh không ghi vào bảng điểm.',
    /** Chỉ hiện khi CÓ hạng và CHƯA lưu — F-05. Sai chỗ thì dạy người ta bỏ qua cảnh báo. */
    unsavedWarning: 'Điểm này lọt bảng nhưng chưa lưu. Về menu là mất.',
    /**
     * Nhãn và hướng dẫn cho khối ba ký tự — F-04. Trước đây `enterName` chỉ vào
     * `aria-label`, nên trên màn chỉ có ba chữ A và sáu chevron: đúng hình dạng một ô
     * nhập mã. Một persona sợ nó tính tiền và bỏ luôn.
     */
    initialsHelp: 'Tên viết tắt ba chữ. Gõ bàn phím hoặc bấm mũi tên.',
  },

  highScores: {
    title: 'Bảng điểm',
    empty: 'Chưa có điểm nào. Chơi một ván đi.',
    rank: 'Hạng',
    name: 'Tên',
    score: 'Điểm',
    wave: 'Wave',
    date: 'Ngày',
    clear: 'Xoá bảng điểm',
    clearOf: (name: string) => `Xoá bảng ${name}`,
    emptyOf: (name: string) => `Chưa có điểm nào ở mức ${name}. Chơi một ván đi.`,
    tabsLabel: 'Bảng điểm theo mức',
    back: 'Quay lại',
    localOnly: 'Bảng điểm này chỉ lưu trên máy bạn.',
  },

  help: {
    title: 'Cách chơi',
    back: 'Quay lại',
    controlsTitle: 'Điều khiển',
    keyboard: {
      rotate: 'Xoay trái / phải',
      rotateKeys: '← →  hoặc  A D',
      thrust: 'Đẩy',
      thrustKeys: '↑  hoặc  W',
      fire: 'Bắn',
      fireKeys: 'Space',
      hyperspace: 'Dịch chuyển',
      hyperspaceKeys: 'Shift',
      pause: 'Tạm dừng',
      pauseKeys: 'Esc  hoặc  P',
    },
    touchNote: 'Trên điện thoại: hai cụm nút ở nửa dưới màn hình. Nút giữa là dịch chuyển.',
    scoringTitle: 'Điểm',
    scoring: {
      large: 'Thiên thạch to',
      medium: 'Thiên thạch vừa',
      small: 'Thiên thạch nhỏ',
      ufoBig: 'UFO to',
      ufoSmall: 'UFO nhỏ',
      extraLife: 'Thêm một mạng mỗi 10.000 điểm',
    },
    powerUpsTitle: 'Vật phẩm',
    powerUpNote: 'Ba loại vũ khí dùng chung một khe — nhặt cái mới thì thay cái cũ.',
  },

  powerUps: {
    shield: { name: 'Khiên', desc: 'Chặn một lần va chạm' },
    rapid: { name: 'Bắn nhanh', desc: 'Nhịp bắn gấp đôi' },
    spread: { name: 'Bắn toả', desc: 'Ba viên hình quạt' },
    pierce: { name: 'Đạn xuyên', desc: 'Đạn không mất khi trúng' },
    life: { name: 'Thêm mạng', desc: 'Cộng ngay một mạng' },
  },

  announce: {
    waveStart: (n: number) => `Wave ${n}`,
    lifeLost: (left: number) => `Mất một mạng. Còn ${left} mạng.`,
    extraLife: 'Được thêm một mạng',
    gameOver: (score: number) => `Hết lượt. Tổng điểm ${score}.`,
    powerUp: (name: string) => `Nhặt được ${name}`,
  },

  a11y: {
    canvasLabel: 'Khu vực chơi. Điều khiển bằng bàn phím hoặc bằng các nút bên dưới.',
    rotateLeft: 'Xoay trái',
    rotateRight: 'Xoay phải',
    thrust: 'Đẩy',
    fire: 'Bắn',
    hyperspace: 'Dịch chuyển',
  },
} as const

export type Strings = typeof vi
