/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        /* Background colors */
        background: "var(--background)",
        surface: "var(--surface)",
        cardBackground: "var(--cardBackground)",

        /* Text colors */
        primaryText: "var(--primaryText)",
        secondaryText: "var(--secondaryText)",
        mutedText: "var(--mutedText)",
        whiteText: "var(--whiteText)",
        blackText: "var(--blackText)",

        /* Primary colors */
        primary: "var(--primary)",
        primaryDark: "var(--primaryDark)",
        primaryIcon: "var(--primaryIcon)",
        accent: "var(--accent)",
        primary100: "var(--primary100)",
        primary300: "var(--primary300)",
        primary500: "var(--primary500)",
        primary900: "var(--primary900)",
        primary1100: "var(--primary1100)",
        primary1300: "var(--primary1300)",

        /* Tab bar colors */
        tabBackground: "var(--tabBackground)",
        tabActiveIcon: "var(--tabActiveIcon)",
        tabInactiveIcon: "var(--tabInactiveIcon)",
        tabActiveText: "var(--tabActiveText)",
        tabInactiveText: "var(--tabInactiveText)",

        /* Gradient colors */
        gradientPrimary: "var(--gradientPrimary)",
        gradientSecondary: "var(--gradientSecondary)",

        /* Feature card colors */
        featureRedBg: "var(--featureRedBg)",
        featureRedIcon: "var(--featureRedIcon)",
        featureBlueBg: "var(--featureBlueBg)",
        featureBlueIcon: "var(--featureBlueIcon)",
        featureGreenBg: "var(--featureGreenBg)",
        featureGreenIcon: "var(--featureGreenIcon)",
        featureYellowBg: "var(--featureYellowBg)",
        featureYellowIcon: "var(--featureYellowIcon)",
        featurePurpleBg: "var(--featurePurpleBg)",
        featurePurpleIcon: "var(--featurePurpleIcon)",
        featureIndigoBg: "var(--featureIndigoBg)",
        featureIndigoIcon: "var(--featureIndigoIcon)",

        /* Shadow colors */
        shadowColor: "var(--shadowColor)",
        cardShadow: "var(--cardShadow)",
        tabShadow: "var(--tabShadow)",

        /* Special colors */
        notificationBadge: "var(--notificationBadge)",
        progressTrack: "var(--progressTrack)",
        progressFill: "var(--progressFill)",

        /* Learning card colors */
        learningCardBackground: "var(--learningCardBackground)",
        learningCardTitle: "var(--learningCardTitle)",
        learningCardSubtitle: "var(--learningCardSubtitle)",
        learningCardProgressText: "var(--learningCardProgressText)",
        learningCardHint: "var(--learningCardHint)",

        /* Ability card colors */
        abilityCardBackground: "var(--abilityCardBackground)",
        abilityCardTitle: "var(--abilityCardTitle)",
        abilityCardSubtitle: "var(--abilityCardSubtitle)",
        abilityCardStats: "var(--abilityCardStats)",
        abilityCardButton: "var(--abilityCardButton)",

        /* Chat screen colors */
        chatItemBackground: "var(--chatItemBackground)",
        chatIconBackground: "var(--chatIconBackground)",
        chatIcon: "var(--chatIcon)",
        chatTitle: "var(--chatTitle)",
        chatTimestamp: "var(--chatTimestamp)",
        chatMessage: "var(--chatMessage)",
        chatMessageCount: "var(--chatMessageCount)",
        chatChevron: "var(--chatChevron)",
        chatEmptyIcon: "var(--chatEmptyIcon)",
        chatEmptyTitle: "var(--chatEmptyTitle)",
        chatEmptySubtitle: "var(--chatEmptySubtitle)",
        chatAddButton: "var(--chatAddButton)",

        /* Border colors */
        borderColor: "var(--borderColor)",
        cardBorder: "var(--cardBorder)",
        headerBorder: "var(--headerBorder)",

        /* Border - separator */
        separator: "var(--separator)",

        /* Status colors */
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",

        /* Difficulty colors */
        difficultyEasy: "var(--difficultyEasy)",
        difficultyHard: "var(--difficultyHard)",
        difficultyDSE: "var(--difficultyDSE)",

        /* Statistics colors */
        statsAverageScore: "var(--statsAverageScore)",
        statsAverageSpeed: "var(--statsAverageSpeed)",
        statsDifficultyScore: "var(--statsDifficultyScore)",
        statsTopicsCovered: "var(--statsTopicsCovered)",

        /* Toast colors */
        toastSuccess: "var(--toastSuccess)",
        toastError: "var(--toastError)",
        toastWarning: "var(--toastWarning)",
        toastInfo: "var(--toastInfo)",
        toastShadow: "var(--toastShadow)",

        /* Error input background */
        errorInputBackground: "var(--errorInputBackground)",

        /* Input colors */
        inputPlaceholder: "var(--inputPlaceholder)",
        iconInactive: "var(--iconInactive)",
        inputBorder: "var(--inputBorder)",
        inputBackground: "var(--inputBackground)",
        inputBackgroundFocused: "var(--inputBackgroundFocused)",

        /* Practice screen colors */
        practiceEmptyTitle: "var(--practiceEmptyTitle)",
        practiceEmptySubtitle: "var(--practiceEmptySubtitle)",
        practiceAreaCardBg: "var(--practiceAreaCardBg)",
        practiceAreaCardText: "var(--practiceAreaCardText)",
        practiceAreaCardActiveBg: "var(--practiceAreaCardActiveBg)",
        practiceAreaCardActiveText: "var(--practiceAreaCardActiveText)",
        practiceAreaBadgeBg: "var(--practiceAreaBadgeBg)",
        practiceAreaBadgeText: "var(--practiceAreaBadgeText)",
        practiceTopicSelectedBg: "var(--practiceTopicSelectedBg)",
        practiceTopicSelectedBorder: "var(--practiceTopicSelectedBorder)",
        practiceTopicSelectedText: "var(--practiceTopicSelectedText)",
        practiceTopicDefaultBg: "var(--practiceTopicDefaultBg)",
        practiceTopicDefaultBorder: "var(--practiceTopicDefaultBorder)",
        practiceTopicDefaultText: "var(--practiceTopicDefaultText)",
        practiceDifficultyDefaultBg: "var(--practiceDifficultyDefaultBg)",
        practiceDifficultyDefaultText: "var(--practiceDifficultyDefaultText)",
        practiceCountSelectedBg: "var(--practiceCountSelectedBg)",
        practiceCountSelectedText: "var(--practiceCountSelectedText)",
        practiceCountDefaultBg: "var(--practiceCountDefaultBg)",
        practiceCountDefaultText: "var(--practiceCountDefaultText)",
        practiceStartButtonBg: "var(--practiceStartButtonBg)",
        practiceStartButtonText: "var(--practiceStartButtonText)",
        practiceStartDisabledBg: "var(--practiceStartDisabledBg)",
        practiceFabBg: "var(--practiceFabBg)",
        practiceFabIcon: "var(--practiceFabIcon)",
        practiceSessionCardBg: "var(--practiceSessionCardBg)",
        practiceSessionTitle: "var(--practiceSessionTitle)",
        practiceSessionSubtitle: "var(--practiceSessionSubtitle)",
        practiceScoreHigh: "var(--practiceScoreHigh)",
        practiceScoreMid: "var(--practiceScoreMid)",
        practiceScoreLow: "var(--practiceScoreLow)",
        practiceScoreText: "var(--practiceScoreText)",
        practiceInProgressBg: "var(--practiceInProgressBg)",
        practiceTimerIcon: "var(--practiceTimerIcon)",
        practiceTimerText: "var(--practiceTimerText)",
        practiceNavCurrent: "var(--practiceNavCurrent)",
        practiceNavAnswered: "var(--practiceNavAnswered)",
        practiceNavDefault: "var(--practiceNavDefault)",
        practiceNavDefaultBorder: "var(--practiceNavDefaultBorder)",
        practiceNavCurrentText: "var(--practiceNavCurrentText)",
        practiceNavAnsweredText: "var(--practiceNavAnsweredText)",
        practiceNavDefaultText: "var(--practiceNavDefaultText)",
        practiceOptionSelectedBg: "var(--practiceOptionSelectedBg)",
        practiceOptionSelectedText: "var(--practiceOptionSelectedText)",
        practiceOptionDefaultBg: "var(--practiceOptionDefaultBg)",
        practiceOptionDefaultText: "var(--practiceOptionDefaultText)",
        practiceOptionDefaultBorder: "var(--practiceOptionDefaultBorder)",
        practiceOptionLabelBg: "var(--practiceOptionLabelBg)",
        practiceOptionLabelSelectedBg: "var(--practiceOptionLabelSelectedBg)",
        practiceSubmitBg: "var(--practiceSubmitBg)",
        practiceSubmitText: "var(--practiceSubmitText)",
        practiceHintBg: "var(--practiceHintBg)",
        practiceHintText: "var(--practiceHintText)",
        practiceHintCardBg: "var(--practiceHintCardBg)",
        practiceReviewCorrectBg: "var(--practiceReviewCorrectBg)",
        practiceReviewWrongBg: "var(--practiceReviewWrongBg)",
        practiceReviewIconColor: "var(--practiceReviewIconColor)",
        practiceReviewCorrectOptionBg: "var(--practiceReviewCorrectOptionBg)",
        practiceReviewWrongOptionBg: "var(--practiceReviewWrongOptionBg)",
        practiceReviewNeutralOptionBg: "var(--practiceReviewNeutralOptionBg)",
        practiceReviewOptionText: "var(--practiceReviewOptionText)",
        practiceReviewNeutralText: "var(--practiceReviewNeutralText)",
        practiceBackButtonBg: "var(--practiceBackButtonBg)",
        practiceBackButtonText: "var(--practiceBackButtonText)",

        /* Success colors */
        successGreen: "var(--successGreen)",
        successGreenLight: "var(--successGreenLight)",

        /* Shop item colors */
        shopItemPurple: "var(--shopItemPurple)",
        shopItemOrange: "var(--shopItemOrange)",

        /* Rank leaderboard medal colors */
        rankMedalGold: "var(--rankMedalGold)",
        rankMedalSilver: "var(--rankMedalSilver)",
        rankMedalBronze: "var(--rankMedalBronze)",

        /* Home header buff button colors */
        buffXpBg: "var(--buffXpBg)",
        buffXpBgPressed: "var(--buffXpBgPressed)",
        buffXpBorder: "var(--buffXpBorder)",
        buffCoinBg: "var(--buffCoinBg)",
        buffCoinBgPressed: "var(--buffCoinBgPressed)",
        buffCoinBorder: "var(--buffCoinBorder)",
        buffTooltipMutedText: "var(--buffTooltipMutedText)",

        /* SVG / ring colors */
        svgRingTrack: "var(--svgRingTrack)",
        coinSvgDark: "var(--coinSvgDark)",
        coinSvgLight: "var(--coinSvgLight)",

        /* Battle lobby colors */
        battleGold: "var(--battleGold)",
        battleGoldDark: "var(--battleGoldDark)",
        battleOrange: "var(--battleOrange)",
        battleDraw: "var(--battleDraw)",
        battleConfirmGreen: "var(--battleConfirmGreen)",
        battleConfirmGreenDark: "var(--battleConfirmGreenDark)",
        battleEventOrangeDark: "var(--battleEventOrangeDark)",
        battleEventGradientStart: "var(--battleEventGradientStart)",
        battleEventGradientEnd: "var(--battleEventGradientEnd)",

        /* Math background symbol default */
        mathBgSymbol: "var(--mathBgSymbol)",

        /* Empty state description */
        emptyStateDescriptionText: "var(--emptyStateDescriptionText)",
      },
      fontFamily: {
        sans: ["Fredoka_400Regular"],
        fredoka: ["Fredoka_400Regular"],
        fredokaRegular: ["Fredoka_400Regular"],
        fredokaMedium: ["Fredoka_500Medium"],
        fredokaSemiBold: ["Fredoka_600SemiBold"],
        fredokaBold: ["Fredoka_700Bold"],
        huninn: ["Huninn_400Regular"],
      },
    },
  },
  plugins: [],
};
