import { usePicker } from "@/src/components/PickerContext";
import useTheme from "@/src/hooks/useTheme";
import { cn } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

type Option = {
  label: string;
  value: string;
};

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  options: Option[];
  startIcon?: keyof typeof Ionicons.glyphMap;
};

/** Reusable form picker component for selecting from a list of options */
export function FormPicker<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  startIcon,
}: Props<T>) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const idRef = useRef(`picker-${Math.random().toString(36).slice(2)}`);
  const { openId, setOpenId } = usePicker();
  useSyncWithOpenId(idRef.current, isExpanded, setIsExpanded);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selectedOption = options.find((opt) => opt.value === value);

        return (
          <View className="mb-4">
            {label && (
              <Text className="mb-2 ml-1 font-fredokaSemiBold text-sm text-gray-700">
                {label}
              </Text>
            )}

            <View>
              {/* Trigger button */}
              <Pressable
                onPress={() => {
                  const willOpen = !isExpanded;
                  setIsExpanded(willOpen);
                  if (willOpen) setOpenId(idRef.current);
                  else setOpenId(null);
                }}
                className={cn(
                  "h-14 flex-row items-center justify-between rounded-2xl border bg-gray-50 px-4",
                  error
                    ? "border-red-500 bg-red-50"
                    : isExpanded
                      ? "rounded-b-none border-primary bg-white"
                      : "border-gray-200",
                )}
              >
                <View className="flex-1 flex-row items-center">
                  {startIcon && (
                    <Ionicons
                      name={startIcon}
                      size={20}
                      color={error ? colors.error : colors.iconInactive}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text
                    className={cn(
                      "text-base capitalize",
                      selectedOption ? "text-gray-900" : "text-gray-400",
                    )}
                  >
                    {selectedOption
                      ? selectedOption.label
                      : placeholder || t("common.selectOption")}
                  </Text>
                </View>

                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.iconInactive}
                />
              </Pressable>

              {/* Inline expanding list */}
              {isExpanded && (
                <View
                  className={cn(
                    "overflow-hidden rounded-b-2xl border border-t-0 bg-white",
                    error ? "border-red-500" : "border-primary",
                  )}
                >
                  {options.map((option, index) => {
                    const isSelected = value === option.value;
                    const isLast = index === options.length - 1;

                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => {
                          onChange(option.value);
                          setIsExpanded(false);
                          setOpenId(null);
                        }}
                        className={cn(
                          "flex-row items-center justify-between border-b border-gray-100 px-4 py-4",
                          isLast && "border-b-0",
                          isSelected && "bg-primary/5",
                        )}
                      >
                        <Text
                          className={cn(
                            "text-base capitalize",
                            isSelected
                              ? "font-fredokaSemiBold text-primary"
                              : "font-normal text-gray-700",
                          )}
                        >
                          {option.label}
                        </Text>

                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={colors.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {error && (
              <Text className="ml-1 mt-1 text-xs text-red-500">
                {error.message}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}

// sync with global openId so other pickers can close this one
function useSyncWithOpenId(
  id: string,
  isExpanded: boolean,
  setIsExpanded: (v: boolean) => void,
) {
  const { openId } = usePicker();
  useEffect(() => {
    if (isExpanded && openId && openId !== id) {
      setIsExpanded(false);
    }
  }, [openId, id, isExpanded, setIsExpanded]);
}
