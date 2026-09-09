import { ChatTabScreen } from "@/src/screens/chatScreen/ChatTabScreen";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  return (
    <SafeAreaView className="relative flex-1 bg-background" edges={["top"]}>
      <View className="flex-1">
        <ChatTabScreen />
      </View>
    </SafeAreaView>
  );
}
