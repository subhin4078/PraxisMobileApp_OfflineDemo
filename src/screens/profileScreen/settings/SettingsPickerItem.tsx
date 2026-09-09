import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface PickerOption {
  label: string;
  value: string;
}

interface SettingsPickerItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  options: PickerOption[];
  onValueChange: (value: string) => void;
}

export function SettingsPickerItem({
  icon,
  label,
  value,
  options,
  onValueChange,
}: SettingsPickerItemProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        className="mb-3 flex-row items-center justify-between rounded-2xl bg-surface px-5 py-4 active:opacity-70"
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <Ionicons name={icon} size={20} color={colors.primary} />
          </View>
          <Text className="text-text font-fredokaMedium text-base">
            {label}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-textSecondary font-fredokaMedium text-sm">
            {selectedOption?.label}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.primaryText}
          />
        </View>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 px-5"
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            className="w-full overflow-hidden rounded-2xl bg-surface"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="border-border border-b px-5 py-4">
              <Text className="text-center font-fredokaSemiBold text-lg text-primaryText">
                {label}
              </Text>
            </View>
            {options.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  onValueChange(option.value);
                  setModalVisible(false);
                }}
                className="border-border flex-row items-center justify-between border-b px-5 py-4 active:opacity-70"
              >
                <Text className="text-text font-fredokaMedium text-base">
                  {option.label}
                </Text>
                {option.value === value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
