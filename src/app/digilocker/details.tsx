import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MOCK_DOCUMENTS, DocumentItem } from '@/constants/mock-docs';

export default function DocumentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Find document based on route ID parameter, fallback to Aadhaar
  const doc: DocumentItem = MOCK_DOCUMENTS.find((d) => d.id === id) || MOCK_DOCUMENTS[0];

  // Button interaction states
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      Alert.alert(
        'Document Downloaded',
        `Successfully downloaded a secure PDF of your ${doc.name} to local storage.`,
        [{ text: 'OK' }]
      );
    }, 1200);
  };

  const handleShare = () => {
    setIsSharing(true);
    setTimeout(() => {
      setIsSharing(false);
      Alert.alert(
        'Secure Share Link',
        `Generated a secure verified sharing link for your ${doc.name}.`,
        [{ text: 'OK' }]
      );
    }, 1000);
  };

  // Render document preview card depending on color theme and authority details
  const renderDocumentPreview = () => {
    return (
      <View 
        style={{ 
          backgroundColor: doc.color, 
          shadowColor: doc.color,
          shadowOffset: { width: 0, height: 6 }, 
          shadowOpacity: 0.15, 
          shadowRadius: 8, 
          elevation: 5,
          borderRadius: 20
        }}
        className="w-full p-6 relative overflow-hidden aspect-[1.6/1]"
      >
        {/* Subtle decorative background watermarks */}
        <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <View className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5" />

        {/* Card Top Branding Header */}
        <View className="flex-row justify-between items-center border-b border-white/20 pb-3 mb-4">
          <View className="flex-row items-center space-x-2">
            <Text className="text-xl mr-2">{doc.icon}</Text>
            <View>
              <Text className="text-[10px] font-bold text-white/90 uppercase tracking-widest leading-none">
                GOVERNMENT OF INDIA
              </Text>
              <Text className="text-[7px] font-semibold text-white/70 uppercase tracking-wider leading-none mt-1">
                {doc.authority.substring(0, 50)}...
              </Text>
            </View>
          </View>
          <View className="bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
            <Text className="text-[7px] font-extrabold text-emerald-400 tracking-wider uppercase">VERIFIED</Text>
          </View>
        </View>

        {/* Card Body content */}
        <View className="flex-1 flex-row justify-between items-end mt-2">
          <View className="space-y-2">
            <Text className="text-[10px] font-semibold text-white/60 uppercase tracking-wider leading-none">
              Name of Holder
            </Text>
            <Text className="text-lg font-bold text-white leading-none">
              {doc.holderName}
            </Text>

            <View className="mt-3">
              <Text className="text-[10px] font-semibold text-white/60 uppercase tracking-wider leading-none">
                Document Number
              </Text>
              <Text className="text-base font-bold text-white tracking-widest mt-1">
                {doc.number}
              </Text>
            </View>
          </View>

          {/* Citizen Photo Placeholder & Seal */}
          <View className="items-end space-y-2">
            <View className="w-14 h-16 bg-white/20 rounded border border-white/30 justify-center items-center">
              <Text className="text-white text-xl">👤</Text>
            </View>
            <Text className="text-[6px] font-extrabold text-white/50 tracking-wider">SECURE e-PASS</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 justify-center items-center mr-3"
        >
          <Text className="text-slate-700 font-bold text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Smart Bharat</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        
        {/* Document Large Preview Card */}
        <View className="mb-8">
          {renderDocumentPreview()}
        </View>

        {/* Detailed Document Metadata list */}
        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
          Credentials Details
        </Text>

        <View className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 mb-8 space-y-4">
          <View className="flex-row justify-between border-b border-slate-200/50 pb-3">
            <Text className="text-xs font-semibold text-slate-400">Document Type</Text>
            <Text className="text-xs font-bold text-slate-800">{doc.name}</Text>
          </View>

          <View className="flex-row justify-between border-b border-slate-200/50 pb-3">
            <Text className="text-xs font-semibold text-slate-400">Document Number</Text>
            <Text className="text-xs font-bold text-slate-800 tracking-wider">{doc.number}</Text>
          </View>

          <View className="flex-row justify-between border-b border-slate-200/50 pb-3">
            <Text className="text-xs font-semibold text-slate-400">Issuing Authority</Text>
            <Text className="text-xs font-bold text-slate-850 text-right flex-1 ml-6 leading-normal">
              {doc.authority}
            </Text>
          </View>

          <View className="flex-row justify-between border-b border-slate-200/50 pb-3">
            <Text className="text-xs font-semibold text-slate-400">Date of Issue</Text>
            <Text className="text-xs font-bold text-slate-800">{doc.issueDate}</Text>
          </View>

          <View className="flex-row justify-between pb-1">
            <Text className="text-xs font-semibold text-slate-400">Verification Status</Text>
            <Text className="text-xs font-bold text-emerald-600">✓ Verified Secure</Text>
          </View>
        </View>

        {/* QR Code Verification Section */}
        <View className="border border-slate-200 rounded-2xl p-5 mb-8 items-center">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Digital Signature Verification
          </Text>
          
          {/* Custom Styled QR Code Vector Visual Grid */}
          <View className="w-32 h-32 border border-slate-300 p-2 rounded-xl justify-center items-center bg-white relative">
            <View className="w-full h-full flex-row flex-wrap justify-between content-between">
              {/* Outer Corners */}
              <View className="w-6 h-6 border-2 border-slate-800 rounded-sm m-0.5 justify-center items-center">
                <View className="w-2.5 h-2.5 bg-slate-800 rounded-sm" />
              </View>
              <View className="w-6 h-6 border-2 border-slate-800 rounded-sm m-0.5 justify-center items-center">
                <View className="w-2.5 h-2.5 bg-slate-800 rounded-sm" />
              </View>
              <View className="w-6 h-6 border-2 border-slate-800 rounded-sm m-0.5 justify-center items-center">
                <View className="w-2.5 h-2.5 bg-slate-800 rounded-sm" />
              </View>
              {/* Random QR grids */}
              <View className="absolute top-[40%] left-[40%] w-6 h-6 flex-row flex-wrap justify-center items-center">
                <View className="w-2 h-2 bg-slate-800 m-0.5" />
                <View className="w-2 h-2 bg-slate-800 m-0.5" />
                <View className="w-1.5 h-1.5 bg-slate-800 m-0.5" />
                <View className="w-2.5 h-1 bg-slate-800 m-0.5" />
              </View>
            </View>
            
            {/* Center Logo watermarks */}
            <View className="absolute w-8 h-8 bg-white border border-slate-200 rounded-full justify-center items-center">
              <Text className="text-[10px] font-bold text-bharat-navy">SB</Text>
            </View>
          </View>
          
          <Text className="text-[9px] text-slate-400 font-semibold mt-3 text-center">
            Scan to instantly verify certificate validity on official portal
          </Text>
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={handleDownload}
            disabled={isDownloading}
            className="w-[48%] py-3.5 bg-bharat-navy rounded-xl justify-center items-center"
          >
            <Text className="text-white text-xs font-bold">
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            disabled={isSharing}
            className="w-[48%] py-3.5 border border-slate-250 bg-white rounded-xl justify-center items-center"
          >
            <Text className="text-slate-700 text-xs font-bold">
              {isSharing ? 'Sharing...' : 'Share Link'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
