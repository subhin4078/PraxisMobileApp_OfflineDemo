import useUserStore from "@/src/stores/useUserStore";
import React from "react";
import { View } from "react-native";

export function ProfileHeader() {
  return (
    <View className="px-5 pb-4 pt-2">
      {/* header spacing reduced to avoid large gap at top */}
      <View className="items-center">
        {/* Avatar, username and header background removed */}
      </View>
    </View>
  );
}
