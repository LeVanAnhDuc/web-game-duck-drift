// Text the tests assert on, copied verbatim with its source path, so a copy change is fixed here, not in specs.
//   UI text: ../client/src/i18n/vi.ts (the game has one locale, Vietnamese, and no server messages)

export const copy = {
  // vi.meta.title
  appName: "Duck Drift",
  menu: {
    // vi.menu.title / play / highScores / help / custom
    title: "DUCK DRIFT",
    play: "Chơi",
    highScores: "Bảng điểm",
    help: "Cách chơi",
    custom: "Tuỳ chỉnh",
    // vi.menu.bestOf(name) + "  " + formatScore(best) (MenuScreen), vi.menu.noBestOf(name)
    bestOf: (name: string, score: string) => `Điểm cao nhất — ${name}  ${score}`,
    noBestOf: (name: string) => `Chưa có điểm nào — ${name}`,
    // vi.menu.localNote
    localNote: "Điểm chỉ lưu trên máy này",
  },
  difficulty: {
    // vi.difficulty.*
    label: "Độ khó",
    easy: "Dễ",
    normal: "Thường",
    hard: "Khó",
  },
  custom: {
    // vi.custom.*
    title: "TUỲ CHỈNH",
    startLives: "Số mạng",
    asteroidSpeed: "Tốc độ thiên thạch",
    dropChance: "Tỉ lệ rơi vật phẩm",
    ufoFirstWave: "UFO từ wave",
    ufoOff: "tắt",
    notSaved: "Ván tuỳ chỉnh không được ghi vào bảng điểm.",
    play: "Chơi",
    back: "Về menu",
  },
  hud: {
    // vi.hud.* ; the lives group is labelled `${vi.hud.lives}: ${n}`
    score: "Điểm",
    wave: "Wave",
    lives: "Mạng",
    pause: "Tạm dừng",
    controlsHint: "Điều khiển",
  },
  pause: {
    // vi.pause.*
    title: "TẠM DỪNG",
    resume: "Tiếp tục",
    toMenu: "Về menu",
    toMenuWarning: (score: string | null) =>
      score === null ? "Về menu là bỏ ván này." : `Về menu là bỏ ván này. ${score} điểm sẽ không được ghi.`,
  },
  gameOver: {
    // vi.gameOver.*
    title: "HẾT LƯỢT",
    score: "Điểm",
    wave: "Wave",
    rank: "Hạng",
    noRank: "Không lọt bảng",
    enterName: "Tên của bạn",
    save: "Lưu điểm",
    playAgain: "Chơi lại",
    toMenu: "Về menu",
    customNoSave: "Ván tuỳ chỉnh không ghi vào bảng điểm.",
    unsavedWarning: "Điểm này lọt bảng nhưng chưa lưu. Về menu là mất.",
    initialsHelp: "Tên viết tắt ba chữ. Gõ bàn phím hoặc bấm mũi tên.",
  },
  highScores: {
    // vi.highScores.*
    title: "Bảng điểm",
    tabsLabel: "Bảng điểm theo mức",
    clearOf: (name: string) => `Xoá bảng ${name}`,
    emptyOf: (name: string) => `Chưa có điểm nào ở mức ${name}. Chơi một ván đi.`,
    back: "Quay lại",
    localOnly: "Bảng điểm này chỉ lưu trên máy bạn.",
    columns: ["Hạng", "Tên", "Điểm", "Wave", "Ngày"],
  },
  help: {
    // vi.help.*
    title: "Cách chơi",
    back: "Quay lại",
    keyboard: [
      ["Xoay trái / phải", "← →  hoặc  A D"],
      ["Đẩy", "↑  hoặc  W"],
      ["Bắn", "Space"],
      ["Dịch chuyển", "Shift"],
      ["Tạm dừng", "Esc  hoặc  P"],
    ],
    // vi.help.scoring.* with ASTEROID_SCORE / UFO scores from ../client/src/game/core/constants.ts, formatScore vi-VN
    scoring: [
      ["Thiên thạch to", "20"],
      ["Thiên thạch vừa", "50"],
      ["Thiên thạch nhỏ", "100"],
      ["UFO to", "200"],
      ["UFO nhỏ", "1.000"],
    ],
    extraLife: "Thêm một mạng mỗi 10.000 điểm",
    fireKeys: "Space",
  },
  // vi.powerUps.*.name / desc
  powerUps: [
    ["Khiên", "Chặn một lần va chạm"],
    ["Bắn nhanh", "Nhịp bắn gấp đôi"],
    ["Bắn toả", "Ba viên hình quạt"],
    ["Đạn xuyên", "Đạn không mất khi trúng"],
    ["Thêm mạng", "Cộng ngay một mạng"],
  ],
  announce: {
    // vi.announce.*
    waveStart: (n: number) => `Wave ${n}`,
    lifeLost: (left: number) => `Mất một mạng. Còn ${left} mạng.`,
    gameOver: (score: number) => `Hết lượt. Tổng điểm ${score}.`,
  },
  a11y: {
    // vi.a11y.*
    canvasLabel: "Khu vực chơi. Điều khiển bằng bàn phím hoặc bằng các nút bên dưới.",
    rotateLeft: "Xoay trái",
    rotateRight: "Xoay phải",
    thrust: "Đẩy",
    fire: "Bắn",
    hyperspace: "Dịch chuyển",
  },
  account: {
    // vi.account.*
    signIn: "Đăng nhập",
    signingIn: "Đang đăng nhập…",
    menuLabel: "Tài khoản Ducker ID",
    openProfile: "Mở hồ sơ Ducker ID",
    signOut: "Đăng xuất",
  },
} as const;
