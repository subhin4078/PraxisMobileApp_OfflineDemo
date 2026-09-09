import useLanguage from "@/src/hooks/useLanguage";
import useTheme from "@/src/hooks/useTheme";
import { useAuthStore } from "@/src/stores/useAuthStore";
import useUserStore from "@/src/stores/useUserStore";
import { getItem } from "@/src/utils/storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function Index() {
  const { initialized: themeInitialized } = useTheme();
  const { initialized: languageInitialized } = useLanguage();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const { setRefreshToken } = useAuthStore();
  const { setUser, setEquippedSkin } = useUserStore();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const refreshToken = await getItem<string>("refreshToken");
      const userId = await getItem<string>("userId");
      const username = await getItem<string>("username");
      const email = await getItem<string>("email");
      const equippedSkin = await getItem<string>("equippedSkin");

      setIsLoggedIn(!!refreshToken && !!userId);

      // Load refresh token and user data into stores
      if (refreshToken && userId) {
        setRefreshToken(refreshToken);
        setUser(userId, username || "", email || "");
        if (equippedSkin) setEquippedSkin(equippedSkin);
      }
    };
    if (themeInitialized && languageInitialized) {
      checkLoginStatus();
    }
  }, [themeInitialized, languageInitialized, setRefreshToken, setUser]);

  // wait for theme and language to be initialized
  if (!themeInitialized || !languageInitialized || isLoggedIn === null) {
    return <View />;
  }

  // Use Redirect component instead of router.replace
  return <Redirect href={isLoggedIn ? "/(tabs)" : "/other/welcome"} />;
}
