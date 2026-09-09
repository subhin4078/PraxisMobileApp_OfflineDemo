import { ProfileSvgAssets } from "@/src/constants/assets/profileAssets";
import { ProfileMenuItem } from "@/src/screens/profileScreen/ProfileMenuItem";
import { shouldNavigate } from "@/src/utils";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export function ProfileMainMenu() {
  const router = useRouter();
  const { t } = useTranslation();

  const menuItems = [
    {
      id: "edit-profile",
      svgSource: ProfileSvgAssets.profile,
      label: t("profile.editProfile"),
      route: "/profile/edit" as const,
    },
    {
      id: "inventory",
      svgSource: ProfileSvgAssets.inventory,
      label: t("profile.inventory"),
      route: "/profile/inventory" as const,
    },
    {
      id: "settings",
      svgSource: ProfileSvgAssets.settings,
      label: t("profile.settings"),
      route: "/profile/settings" as const,
    },
    {
      id: "statistics",
      svgSource: ProfileSvgAssets.statistics,
      label: t("profile.statistics"),
      route: "/profile/statistics" as const,
    },
    {
      id: "achievement",
      svgSource: ProfileSvgAssets.achievement,
      label: t("profile.achievement"),
      route: "/profile/achievement" as const,
    },
  ];

  return (
    <View>
      {menuItems.map((item) => (
        <ProfileMenuItem
          key={item.id}
          svgSource={item.svgSource}
          label={item.label}
          onPress={() => {
            if (shouldNavigate()) router.push(item.route);
          }}
        />
      ))}
    </View>
  );
}
