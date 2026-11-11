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
    <View className="flex-row justify-between items-end mb-4">
      <View className="flex-row items-center flex-1 mr-3">
        {/* Vertical Orange Pill Indicator */}
        <View className="w-1.5 h-6 rounded-full bg-[#F97316] mr-3" />
        <View className="flex-1">
          <Text className="text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-sm font-medium text-slate-500 mt-1">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {actionText && onActionPress ? (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.7}
          className="pb-1"
        >
          <Text className="text-sm font-black text-[#14532D]">
            {actionText}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

