import { ProfileSvgAssets } from "@/src/constants/assets/profileAssets";
import { ProfileMenuItem } from "@/src/screens/profileScreen/ProfileMenuItem";
import { shouldNavigate } from "@/src/utils";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export function ProfileBottomMenu() {
  const { t } = useTranslation();
  const router = useRouter();

  const bottomMenuItems = [
    {
      id: "account",
      svgSource: ProfileSvgAssets.account,
      label: t("profile.account"),
      route: "/profile/account" as const,
    },
    {
      id: "help-support",
      svgSource: ProfileSvgAssets.support,
      label: t("profile.helpSupport"),
      route: "/profile/help-support" as const,
    },
    {
      id: "about",
      svgSource: ProfileSvgAssets.aboutus,
      label: t("profile.about"),
      route: "/profile/about" as const,
    },
  ];

  return (
    <View>
      {bottomMenuItems.map((item) => (
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
