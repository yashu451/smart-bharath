import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
}

export function SectionHeading({
  title,
  subtitle,
  actionText,
  onActionPress,
}: SectionHeadingProps) {
  return (
    <View className="flex-row justify-between items-end mb-3.5">
      <View className="flex-row items-center flex-1 mr-2">
        {/* Vertical Orange Pill Indicator */}
        <View className="w-1.5 h-4 rounded-full bg-[#F97316] mr-2.5" />
        <View className="flex-1">
          <Text className="text-base font-black text-slate-900 tracking-tight">
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-[11px] font-medium text-slate-500 mt-0.5">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {actionText && onActionPress ? (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.7}
          className="pb-0.5"
        >
          <Text className="text-xs font-black text-[#14532D]">
            {actionText}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

