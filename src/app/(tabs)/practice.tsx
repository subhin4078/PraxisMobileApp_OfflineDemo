import { PracticeTabScreen } from "@/src/screens/practiceScreen/PracticeTabScreen";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PracticeScreen() {
  return (
    <SafeAreaView className="relative flex-1 bg-background" edges={["top"]}>
      <View className="flex-1">
        <PracticeTabScreen />
      </View>
    </SafeAreaView>
  );
}
