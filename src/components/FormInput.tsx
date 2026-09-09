import useTheme from "@/src/hooks/useTheme";
import { cn } from "@/src/utils";
import { playTapSfx } from "@/src/utils/sfx";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  startIcon?: keyof typeof Ionicons.glyphMap;
} & Omit<TextInputProps, "value" | "onChangeText">;

/** Reusable form input component with icons and validation */
export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  startIcon,
  secureTextEntry,
  className,
  ...props
}: Props<T>) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Toggle password visibility if secureTextEntry is true
  const isPassword = secureTextEntry && !isPasswordVisible;

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, value, onBlur },
        fieldState: { error },
      }) => (
        <View className="mb-4">
          {label && (
            <Text className="mb-2 ml-1 font-fredokaSemiBold text-sm text-gray-700">
              {label}
            </Text>
          )}

          <View
            className={cn(
              "flex-row items-center rounded-2xl border px-4",
              error
                ? "border-red-500"
                : isFocused
                  ? "border-primary"
                  : "border-gray-200",
              className || "",
            )}
            style={{
              backgroundColor: error
                ? colors.errorInputBackground
                : colors.surface,
            }}
          >
            {startIcon && (
              <Ionicons
                name={startIcon}
                size={20}
                color={
                  error
                    ? colors.error
                    : isFocused
                      ? colors.primary
                      : colors.iconInactive
                }
                style={{ marginRight: 8 }}
              />
            )}

            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={() => {
                onBlur();
                setIsFocused(false);
              }}
              onFocus={() => setIsFocused(true)}
              secureTextEntry={isPassword}
              placeholderTextColor={colors.inputPlaceholder}
              className="h-14 flex-1 text-gray-900" // line-height will cause issue on iOS
              {...props}
            />

            {secureTextEntry && (
              <Pressable
                onPress={() => {
                  playTapSfx();
                  setIsPasswordVisible(!isPasswordVisible);
                }}
                hitSlop={10}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.iconInactive}
                />
              </Pressable>
            )}
          </View>

          {error && (
            <Text className="ml-1 mt-1 text-xs text-red-500">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
