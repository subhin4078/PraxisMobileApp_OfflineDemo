const LightTheme = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CORE COLORS – Background, Text, Primary, Accents
  // ═══════════════════════════════════════════════════════════════════════════

  // Background colors
  background: "#F9F7F7",
  surface: "#FFFFFF",
  cardBackground: "#FFFFFF",
  secondaryBackground: "#f5f1ed",

  // Text colors
  primaryText: "#112D4E",
  secondaryText: "#FF9213",
  mutedText: "#9BA1A6",
  whiteText: "#FFFFFF",
  blackText: "#000000",
  emptyStateDescriptionText: "#999999",

  // Primary brand colors
  primary: "#FF9C22",
  primaryDark: "#FF6B00",
  primaryIcon: "#FF9C22",
  accent: "#FFB43D",
  primary100: "#FFBE6F",
  primary300: "#FFB355",
  primary500: "#FFA73C",
  primary900: "#FF9108",
  primary1100: "#EE8300",
  primary1300: "#D57500",

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPONENT COLORS – UI Framework Elements
  // ═══════════════════════════════════════════════════════════════════════════

  // Tab bar
  tabBackground: "#FFFFFF",
  tabActiveIcon: "#FF9C22",
  tabInactiveIcon: "#9CA3AF",
  tabActiveText: "#FF9C22",
  tabInactiveText: "#9CA3AF",

  // Gradients
  gradientPrimary: "#FF9C22",
  gradientSecondary: "#FF8705",

  // Shadows & Borders
  shadowColor: "rgba(255, 156, 34, 0.08)",
  cardShadow: "rgba(255, 156, 34, 0.08)",
  tabShadow: "rgba(255, 156, 34, 0.06)",
  borderColor: "rgba(255, 156, 34, 0.12)",
  cardBorder: "rgba(255, 156, 34, 0.12)",
  headerBorder: "#f9bc68",
  separator: "#ded7ca",

  // Input fields
  inputPlaceholder: "#9CA3AF",
  inputBorder: "#E5E7EB",
  inputBackground: "#F9FAFB",
  inputBackgroundFocused: "#FFFFFF",
  errorInputBackground: "#FEF2F2",
  iconInactive: "#9CA3AF",

  // Notifications & Progress
  notificationBadge: "#EF4444",
  progressTrack: "#F0F0F0",
  progressFill: "#FF9C22",

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS & FEEDBACK – Status indicators, Toasts, Difficulty
  // ═══════════════════════════════════════════════════════════════════════════

  // Status colors
  success: "#22c55e",
  warning: "#f97316",
  error: "#ef4444",
  info: "#3b82f6",

  // Difficulty levels
  difficultyEasy: "#22c55e",
  difficultyHard: "#f97316",
  difficultyDSE: "#ef4444",

  // Toast notifications
  toastSuccess: "#10B981",
  toastError: "#EF4444",
  toastWarning: "#FFAA00",
  toastInfo: "#AA00AA",
  toastShadow: "#000",
  sliderThumbShadow: "#000",

  // Success feedback
  successGreen: "#10B981",
  successGreenLight: "#34D399",

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT SCREEN
  // ═══════════════════════════════════════════════════════════════════════════

  chatItemBackground: "#FFFFFF",
  chatIconBackground: "#FFB43D",
  chatIcon: "#fffaf1ff",
  chatTitle: "#112D4E",
  chatTimestamp: "#FF9213",
  chatMessage: "#112D4E",
  chatMessageCount: "#FF9213",
  chatInfoBadgeColor: "#3b82f6",
  chatQuizCorrectColor: "#10B981",
  chatQuizWrongColor: "#ef4444",
  chatChevron: "#FF9C22",
  chatAddButton: "#FF9C22",
  chatEmptyIcon: "#FFB43D",
  chatEmptyTitle: "#112D4E",
  chatEmptySubtitle: "#FF9213",

  // ═══════════════════════════════════════════════════════════════════════════
  // PRACTICE SCREEN
  // ═══════════════════════════════════════════════════════════════════════════

  // Header & Navigation
  practiceEmptyTitle: "#223344",
  practiceEmptySubtitle: "#FF9213",

  // Area selection
  practiceAreaCardBg: "#ff9108",
  practiceAreaCardText: "#FFFFFF",
  practiceAreaCardActiveBg: "#ffa73c",
  practiceAreaCardActiveText: "#FFFFFF",
  practiceAreaBadgeBg: "#3b82f6",
  practiceAreaBadgeText: "#FFFFFF",

  // Topic selection
  practiceTopicSelectedBg: "#e75496",
  practiceTopicSelectedBorder: "#e75496",
  practiceTopicSelectedText: "#FFFFFF",
  practiceTopicDefaultBg: "#EBF2FF",
  practiceTopicDefaultBorder: "rgba(255, 156, 34, 0.12)",
  practiceTopicDefaultText: "#223344",

  // Difficulty & Count selection
  practiceDifficultyDefaultBg: "#F4F7F9",
  practiceDifficultyDefaultText: "#223344",
  practiceCountSelectedBg: "#3b82f6",
  practiceCountSelectedText: "#FFFFFF",
  practiceCountDefaultBg: "#FFFFFF",
  practiceCountDefaultText: "#223344",

  // Start button
  practiceStartButtonBg: "#ff6522",
  practiceStartButtonText: "#FFFFFF",
  practiceStartDisabledBg: "#9BA1A6",

  // Session & Progress
  practiceSessionCardBg: "#FFFFFF",
  practiceSessionTitle: "#223344",
  practiceSessionSubtitle: "#9BA1A6",
  practiceInProgressBg: "#FFB257",
  practiceTimerIcon: "#FFB257",
  practiceTimerText: "#223344",

  // Scoring display
  practiceScoreHigh: "#52D87A",
  practiceScoreMid: "#f97316",
  practiceScoreLow: "#ef4444",
  practiceScoreText: "#FFFFFF",

  // Question navigation
  practiceNavCurrent: "#FFB257",
  practiceNavAnswered: "#FFB43D",
  practiceNavDefault: "#FFFFFF",
  practiceNavDefaultBorder: "rgba(255, 156, 34, 0.12)",
  practiceNavCurrentText: "#FFFFFF",
  practiceNavAnsweredText: "#FFFFFF",
  practiceNavDefaultText: "#223344",

  // Answer options
  practiceOptionSelectedBg: "#FFB257",
  practiceOptionSelectedText: "#FFFFFF",
  practiceOptionDefaultBg: "#FFFFFF",
  practiceOptionDefaultText: "#223344",
  practiceOptionDefaultBorder: "rgba(255, 156, 34, 0.12)",
  practiceOptionLabelBg: "#f5f1ed",
  practiceOptionLabelSelectedBg: "#FF6B00",

  // Actions
  practiceSubmitBg: "#FFB257",
  practiceSubmitText: "#FFFFFF",
  practiceFabBg: "#FFB257",
  practiceFabIcon: "#FFFFFF",
  practiceBackButtonBg: "#FFB257",
  practiceBackButtonText: "#FFFFFF",

  // Review & Feedback
  practiceHintBg: "#FFF3E0",
  practiceHintText: "#FF9C22",
  practiceHintCardBg: "#FFF8F0",
  practiceReviewCorrectBg: "#28C76F",
  practiceReviewWrongBg: "#ef4444",
  practiceReviewIconColor: "#FFFFFF",
  practiceReviewCorrectOptionBg: "#28C76F",
  practiceReviewWrongOptionBg: "#ef4444",
  practiceReviewNeutralOptionBg: "#f5f1ed",
  practiceReviewOptionText: "#FFFFFF",
  practiceReviewNeutralText: "#223344",

  // Daily exercise review & feedback (own tokens, same values)
  dailyExerciseReviewCorrectBg: "#28C76F",
  dailyExerciseReviewWrongBg: "#ef4444",
  dailyExerciseReviewIconColor: "#FFFFFF",
  dailyExerciseReviewCorrectOptionBg: "#28C76F",
  dailyExerciseReviewWrongOptionBg: "#ef4444",
  dailyExerciseReviewOptionText: "#FFFFFF",

  // ═══════════════════════════════════════════════════════════════════════════
  // LEARNING & ABILITY CARDS
  // ═══════════════════════════════════════════════════════════════════════════

  // Learning card
  learningCardBackground: "#FFB43D",
  learningCardTitle: "#112D4E",
  learningCardSubtitle: "#FF9213",
  learningCardProgressText: "#000000",
  learningCardHint: "#112D4E",

  // Ability card
  abilityCardBackground: "#FF8705",
  abilityCardTitle: "#FFFFFF",
  abilityCardSubtitle: "#FFB43D",
  abilityCardStats: "#FF9213",
  abilityCardButton: "#FF9C22",

  // Feature cards
  featureRedBg: "#F9F7F7",
  featureRedIcon: "#FF8705",
  featureBlueBg: "#FFB43D",
  featureBlueIcon: "#FF9213",
  featureGreenBg: "#F9F7F7",
  featureGreenIcon: "#FF8705",
  featureYellowBg: "#FFB43D",
  featureYellowIcon: "#FF9213",
  featurePurpleBg: "#F9F7F7",
  featurePurpleIcon: "#FF8705",
  featureIndigoBg: "#FFB43D",
  featureIndigoIcon: "#FF9213",

  // Home activity feed
  activityBattleLostColor: "#ef4444",
  activityChatColor: "#3b82f6",
  activityPurchaseColor: "#10B981",

  // XP buff coin
  xpBuffColor: "#10B981",
  xpBuffColorLight: "#34D399",

  // Daily bonus
  dailyBonusEarnedText: "#10B981",

  // Inventory
  inventoryEquippedColor: "#22c55e",

  // ═══════════════════════════════════════════════════════════════════════════
  // STATISTICS & ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════

  statsAverageScore: "#22c55e",
  statsAverageSpeed: "#3b82f6",

  // Achievement badge colors
  achievementColorBlue: "#3b82f6",
  achievementColorGreen: "#22c55e",
  statsDifficultyScore: "#ad1d82",
  statsTopicsCovered: "#ecca05",

  // Activity chart bar colors
  chartQuestionsBar: "#22c55e",
  chartBattlesBar: "#f97316",
  chartChatBar: "#3b82f6",

  // Topic performance score tiers
  topicPerformanceHigh: "#22c55e",
  topicPerformanceMid: "#f97316",
  topicPerformanceLow: "#ef4444",

  // ═══════════════════════════════════════════════════════════════════════════
  // REWARDS – Shared across Battle, Practice, Daily Exercise screens
  // ═══════════════════════════════════════════════════════════════════════════

  rewardCoinsText: "#F59E0B",
  rewardXpText: "#10B981",

  // ═══════════════════════════════════════════════════════════════════════════
  // BATTLE SCREEN
  // ═══════════════════════════════════════════════════════════════════════════

  battleGold: "#FFB800",
  battleGoldDark: "#E5A200",
  battleOrange: "#FF6F00",
  battleGradientEnd: "#E65100",
  battleDraw: "#F59E0B",
  battleConfirmGreen: "#10B981",
  battleConfirmGreenDark: "#059669",
  battleEventOrangeDark: "#EA580C",
  battleEventGradientStart: "#FFF7ED",
  battleEventGradientEnd: "#FFFBEB",
  battleHistoryCardBg: "#FFFBF5",
  battleMyColor: "#22c55e",
  battleOpponentColor: "#ef4444",
  battleWinColor: "#22c55e",
  battleLossColor: "#ef4444",
  battleTimerNormal: "#3b82f6",
  battleTimerUrgent: "#ef4444",
  battleMutedColor: "#ef4444",
  battleQuizCorrectColor: "#22c55e",
  battleQuizWrongColor: "#ef4444",
  battleEventOrange: "#f97316",
  battleEventButtonColor: "#f97316",
  battleLobbyBorderColor: "#c2410c",
  battleDifficultyBadgeColor: "#f97316",

  // Battle result quiz review
  battleResultCorrectBg: "#28C76F",
  battleResultWrongBg: "#ef4444",
  battleResultIconColor: "#FFFFFF",
  battleResultCorrectOptionBg: "#28C76F",
  battleResultWrongOptionBg: "#ef4444",
  battleResultOptionText: "#FFFFFF",

  // ═══════════════════════════════════════════════════════════════════════════
  // UI OVERLAYS – Semi-transparent backgrounds & shadows
  // ═══════════════════════════════════════════════════════════════════════════

  overlayBackground: "rgba(0,0,0,0.5)",
  overlayDark15: "rgba(0,0,0,0.15)",
  overlayDark25: "rgba(0,0,0,0.25)",
  overlayDark80: "rgba(0,0,0,0.8)",
  overlayDark92: "rgba(20,20,20,0.92)",
  overlayLight12: "rgba(255,255,255,0.12)",
  overlayLight15: "rgba(255,255,255,0.15)",
  overlayLight18: "rgba(255,255,255,0.18)",
  overlayLight25: "rgba(255,255,255,0.25)",
  overlayLight55: "rgba(255,255,255,0.55)",
  overlayLight80: "rgba(255,255,255,0.8)",
  textShadowDark: "rgba(0,0,0,0.45)",

  // ═══════════════════════════════════════════════════════════════════════════
  // USER PROGRESSION – Ranks, Prefixes, Medals
  // ═══════════════════════════════════════════════════════════════════════════

  // Rank progression colors (1 entry per rank: 0-Newborn through 8-Meowthematician)
  prefixRankColors: [
    // 0 – Newborn Cat (lv1-9)
    {
      gradient: ["#f5f5f5", "#ebebeb"],
      borderColor: "#dddddd",
      accentColor: "#999999",
      iconColor: "#bbbbbb",
      labelBg: "#e8e8e8",
      labelText: "#888888",
    },
    // 1 – Curious Cat (lv10-19) — green
    {
      gradient: ["#E8F5E9", "#C8E6C9"],
      borderColor: "#66BB6A",
      accentColor: "#37d179",
      iconColor: "#37d179",
      labelBg: "#C8E6C9",
      labelText: "#1B5E20",
    },
    // 2 – Smart Cat (lv20-29) — blue
    {
      gradient: ["#E3F2FD", "#BBDEFB"],
      borderColor: "#64B5F6",
      accentColor: "#478ae9",
      iconColor: "#478ae9",
      labelBg: "#BBDEFB",
      labelText: "#0D47A1",
    },
    // 3 – Hunter Cat (lv30-39) — cyan
    {
      gradient: ["#E0F7FA", "#B2EBF2"],
      borderColor: "#00BCD4",
      accentColor: "#0097A7",
      iconColor: "#0097A7",
      labelBg: "#B2EBF2",
      labelText: "#00695C",
    },
    // 4 – Scholar Cat (lv40-49) — purple
    {
      gradient: ["#F3E5F5", "#E1BEE7"],
      borderColor: "#BA68C8",
      accentColor: "#923ee1",
      iconColor: "#923ee1",
      labelBg: "#E1BEE7",
      labelText: "#4A148C",
    },
    // 5 – Thinker Cat (lv50-59) — pink/magenta
    {
      gradient: ["#FCE4EC", "#F8BBD0"],
      borderColor: "#F48FB1",
      accentColor: "#fd6ae1",
      iconColor: "#fd6ae1",
      labelBg: "#F8BBD0",
      labelText: "#880E4F",
    },
    // 6 – Master Cat (lv60-69) — golden
    {
      gradient: ["#FFFACD", "#FFE680"],
      borderColor: "#FFD700",
      accentColor: "#FFB500",
      iconColor: "#FFB500",
      labelBg: "#FFE680",
      labelText: "#8B6914",
    },
    // 7 – Predator Cat (lv70-79) — red
    {
      gradient: ["#FFEBEE", "#FFCDD2"],
      borderColor: "#E57373",
      accentColor: "#ff0000",
      iconColor: "#ff0000",
      labelBg: "#FFCDD2",
      labelText: "#C62828",
    },
    // 8 – Meowthematician (lv80+, legendary) — black/gold
    {
      gradient: ["#3a3a3a", "#1f1f1f"],
      borderColor: "#FFD700",
      accentColor: "#FFFFFF",
      iconColor: "#FFFFFF",
      labelBg: "#333333",
      labelText: "#FFFFFF",
    },
  ],

  // Rainbow animation for locked legendary rank
  prefixRainbowColors: [
    "#FF0000",
    "#FF7F00",
    "#FFFF00",
    "#00FF00",
    "#0000FF",
    "#4B0082",
    "#8B00FF",
  ],

  // Locked rank display
  prefixLockedGradientStart: "#f0f0f0",
  prefixLockedGradientEnd: "#e8e8e8",
  prefixLockedDescText: "#bbbbbb",
  prefixLockedBadgeBg: "#e8e8e8",
  prefixLockedBadgeText: "#aaaaaa",

  // Rank leaderboard medals
  rankMedalGold: "#FFD700",
  rankMedalSilver: "#C0C0C0",
  rankMedalBronze: "#CD7F32",

  // ═══════════════════════════════════════════════════════════════════════════
  // SHOP & COSMETICS
  // ═══════════════════════════════════════════════════════════════════════════

  shopItemPurple: "#7C4DFF",
  shopItemOrange: "#FF6F00",

  // ═══════════════════════════════════════════════════════════════════════════
  // HOME SCREEN – Buff Buttons & Enhancements
  // ═══════════════════════════════════════════════════════════════════════════

  buffXpBg: "#ECFDF5",
  buffXpBgPressed: "#DDFCE7",
  buffXpBorder: "#34D399",
  buffCoinBg: "#FFFBEB",
  buffCoinBgPressed: "#FFF3CD",
  buffCoinBorder: "#FFB300",
  buffTooltipMutedText: "#D1D5DB",

  // ═══════════════════════════════════════════════════════════════════════════
  // DECORATIVE & SPECIAL EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // FISHING SCREEN – Rarity colors
  // ═══════════════════════════════════════════════════════════════════════════

  fishingRarityCommon: "#9CA3AF",
  fishingRarityRare: "#3b82f6",
  fishingRarityEpic: "#7C4DFF",
  fishingRarityLegendary: "#FFB800",

  // SVG & Coin display
  svgRingTrack: "#E0E0E0",
  coinSvgDark: "#FFB300",
  coinSvgLight: "#FFD54F",

  // Math background patterns
  mathBgSymbol: "#EEF0FF",

  // Confetti celebration
  confettiColors: [
    "#FF6B6B",
    "#4ECDC4",
    "#FFE66D",
    "#A78BFA",
    "#FF9F43",
    "#54A0FF",
    "#FF78C4",
    "#2ECC71",
  ],
};

export type ThemeColors = typeof LightTheme;

const DarkTheme = LightTheme; // For now, use light theme for dark mode as well

const Themes = {
  light: LightTheme,
  dark: DarkTheme,
};

export default Themes;
