import { ProfileImageAssets } from "@/src/constants/assets/profileAssets";
import useLanguage from "@/src/hooks/useLanguage";
import useTheme from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/useToast";
import { Language } from "@/src/i18n";
import { SettingsAudioCard } from "@/src/screens/profileScreen/settings/SettingsAudioCard";
import { SettingsButtonItem } from "@/src/screens/profileScreen/settings/SettingsButtonItem";
import { SettingsPickerItem } from "@/src/screens/profileScreen/settings/SettingsPickerItem";
import { SettingsToggleItem } from "@/src/screens/profileScreen/settings/SettingsToggleItem";
import { useSettingsStore } from "@/src/stores/useSettingsStore";
import { updateBgmVolume } from "@/src/utils/bgm";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();

  const {
    bgmEnabled,
    bgmVolume,
    sfxEnabled,
    sfxVolume,
    vibrationEnabled,
    setBgmEnabled,
    setBgmVolume,
    setSfxEnabled,
    setSfxVolume,
    setVibrationEnabled,
    hydrate,
  } = useSettingsStore();

  // Placeholder states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const languageOptions = [
    { label: t("settings.languageEnglish"), value: Language.EN },
    { label: t("settings.languageChinese"), value: Language.ZH },
  ];

  const handleClearCache = () => {
    // Placeholder: Implement cache clearing logic
    toast.show(t("settings.clearCacheConfirm"), "success");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="relative items-center justify-center bg-surface px-5 py-4">
        <Pressable
          className="absolute left-5 active:opacity-70"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primaryText} />
        </Pressable>
        <Text className="font-fredokaSemiBold text-lg text-primaryText">
          {t("settings.title")}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Setting Cat Image */}
        <View className="mb-6 items-center">
          <Image
            source={ProfileImageAssets.setting}
            className="h-36 w-72"
            resizeMode="contain"
          />
        </View>

        {/* General Section */}
        <Text className="text-textSecondary mb-3 px-2 font-fredokaSemiBold text-sm">
          {t("settings.general")}
        </Text>

        {/* Language */}
        <SettingsPickerItem
          icon="language-outline"
          label={t("settings.language")}
          value={language}
          options={languageOptions}
          onValueChange={(value) => setLanguage(value as Language)}
        />

        {/* Preferences Section */}
        <Text className="text-textSecondary mb-3 mt-6 px-2 font-fredokaSemiBold text-sm">
          {t("settings.preferences")}
        </Text>

        <SettingsToggleItem
          icon="notifications-outline"
          label={t("settings.notifications")}
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />

        <SettingsAudioCard
          icon="musical-notes-outline"
          label={t("settings.bgm")}
          enabled={bgmEnabled}
          onEnabledChange={(v) => {
            setBgmEnabled(v);
            void updateBgmVolume();
          }}
        />

        <SettingsAudioCard
          icon="volume-medium-outline"
          label={t("settings.soundEffects")}
          enabled={sfxEnabled}
          onEnabledChange={setSfxEnabled}
        />

        <SettingsToggleItem
          icon="vibration"
          iconFamily="MaterialIcons"
          label={t("settings.vibration")}
          value={vibrationEnabled}
          onValueChange={setVibrationEnabled}
        />

        {/* Advanced Section */}
        <Text className="text-textSecondary mb-3 mt-6 px-2 font-fredokaSemiBold text-sm">
          {t("settings.advanced")}
        </Text>

        <SettingsButtonItem
          icon="two-factor-authentication"
          iconFamily="MaterialCommunityIcons"
          label={t("settings.twoFactorAuth")}
          onPress={() => {}}
          variant="default"
        />

        <SettingsButtonItem
          icon="trash-outline"
          label={t("settings.clearCache")}
          onPress={handleClearCache}
          variant="danger"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
