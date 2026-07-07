import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MOCK_DOCUMENTS, DocumentItem } from '@/constants/mock-docs';

export default function MyDocumentsScreen() {
  const router = useRouter();

  const handleViewDetails = (docId: string) => {
    router.push({
      pathname: '/digilocker/details',
      params: { id: docId }
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 justify-center items-center mr-3"
        >
          <Text className="text-slate-700 font-bold text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Smart Bharat</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        {/* Title Section */}
        <View className="mb-6">
          <Text className="text-2xl font-extrabold text-bharat-dark">My Documents</Text>
          <Text className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            Verified Digital Locker
          </Text>
        </View>

        {/* Documents Card List */}
        <View className="space-y-4">
          {MOCK_DOCUMENTS.map((doc: DocumentItem) => (
            <View
              key={doc.id}
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
              className="bg-white border border-slate-100 rounded-2xl p-5 flex-row justify-between items-center"
            >
              {/* Document Icon & Details */}
              <View className="flex-1 flex-row items-start mr-3">
                <View 
                  style={{ backgroundColor: `${doc.color}15` }} // 15% opacity background of the brand color
                  className="w-12 h-12 rounded-xl justify-center items-center mr-4"
                >
                  <Text className="text-2xl">{doc.icon}</Text>
                </View>
                
                <View className="flex-1 space-y-1">
                  <Text className="text-base font-bold text-slate-800 leading-tight">
                    {doc.name}
                  </Text>
                  <Text className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                    {doc.authority}
                  </Text>
                  
                  {/* Info Row: Status Badge & Last Updated */}
                  <View className="flex-row items-center space-x-2.5 mt-2.5 flex-wrap">
                    <View className="bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full flex-row items-center mr-2">
                      <Text className="text-[9px] font-extrabold text-emerald-600">✓ {doc.status}</Text>
                    </View>
                    <Text className="text-[9px] font-bold text-slate-400">
                      Updated: {doc.lastUpdated}
                    </Text>
                  </View>
                </View>
              </View>

              {/* View Button */}
              <TouchableOpacity
                onPress={() => handleViewDetails(doc.id)}
                className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl"
              >
                <Text className="text-xs font-bold text-bharat-accent">View</Text>
              </TouchableOpacity>

            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
