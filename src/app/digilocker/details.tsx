import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { documentApi } from '@/services/api';
import { downloadFileToDevice } from '@/services/filePicker';
import { UserDocument } from './documents';

export default function DocumentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [doc, setDoc] = useState<UserDocument | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDocumentData = async () => {
      if (!id) return;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const metaRes = await documentApi.getDocument(id as string);
        if (isMounted && metaRes.success && metaRes.document) {
          setDoc(metaRes.document);
        } else {
          throw new Error(metaRes.message || 'Document not found.');
        }

        // Fetch file base64 data for preview/download
        const fileRes = await documentApi.getDocumentFileBase64(id as string);
        if (isMounted && fileRes.success && fileRes.base64) {
          setFileBase64(fileRes.base64);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load document details.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDocumentData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDownload = () => {
    if (!doc || !fileBase64) {
      Alert.alert('Notice', 'File data is not ready for download.');
      return;
    }

    setIsDownloading(true);
    try {
      downloadFileToDevice(doc.originalFilename, doc.mimeType, fileBase64);
      Alert.alert('Downloaded', `Downloaded ${doc.originalFilename} to your device.`);
    } catch (err: any) {
      Alert.alert('Download Error', err.message || 'Failed to trigger file download.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    if (!doc) return;

    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const res = await documentApi.deleteDocument(doc._id);
              if (res.success) {
                Alert.alert('Document Deleted', 'The document has been removed from your wallet.');
                router.replace('/digilocker/documents' as any);
              } else {
                Alert.alert('Error', res.message || 'Failed to delete document.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete document.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = doc?.mimeType.startsWith('image/');
  const isPdf = doc?.mimeType === 'application/pdf';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <View className="max-w-4xl w-full mx-auto flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-4 shadow-xs"
            activeOpacity={0.7}
          >
            <Text className="text-[#14532D] font-black text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#14532D]" numberOfLines={1}>
              {doc?.name || 'Document Details'}
            </Text>
            <Text className="text-xs font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
              Personal Document Viewer
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
        <View className="max-w-4xl w-full mx-auto">
          {isLoading ? (
            <View className="py-24 items-center justify-center">
              <ActivityIndicator size="large" color="#14532D" />
              <Text className="text-sm text-slate-500 font-bold mt-3">
                Loading document file...
              </Text>
            </View>
          ) : errorMessage || !doc ? (
            <View className="bg-[#F3F8F4] border border-red-200 rounded-3xl p-8 items-center my-4 shadow-sm">
              <Text className="text-3xl mb-2">⚠️</Text>
              <Text className="text-base font-bold text-slate-900 text-center">Unable to load document</Text>
              <Text className="text-sm text-slate-500 text-center mt-1 mb-5">{errorMessage}</Text>
              <TouchableOpacity
                onPress={() => router.replace('/digilocker/documents' as any)}
                className="bg-[#14532D] px-7 py-3.5 rounded-2xl shadow-sm"
              >
                <Text className="text-white text-sm font-bold uppercase tracking-wider">Back to Documents</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-4">
              {/* Document Preview Card */}
              <View
                style={{
                  shadowColor: '#14532D',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  elevation: 2,
                }}
                className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 mb-4"
              >
                <View className="flex-row justify-between items-center mb-4">
                  <View className="bg-[#EEF2FF] border border-[#C7D2FE] px-3.5 py-1.5 rounded-xl">
                    <Text className="text-xs font-black text-[#6366F1] uppercase tracking-wider">
                      {doc.category}
                    </Text>
                  </View>
                  <View className="bg-[#FFFBEB] border border-[#FDE68A] px-3 py-1 rounded-full">
                    <Text className="text-xs font-bold text-amber-800">
                      Uploaded by you – Not officially verified
                    </Text>
                  </View>
                </View>

                {/* File Preview Surface */}
                <View className="bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl p-4 items-center justify-center min-h-[240px] mb-4">
                  {isImage && fileBase64 ? (
                    <Image
                      source={{ uri: `data:${doc.mimeType};base64,${fileBase64}` }}
                      style={{ width: '100%', height: 280, borderRadius: 14 }}
                      resizeMode="contain"
                    />
                  ) : isPdf ? (
                    <View className="items-center py-6">
                      <Text className="text-6xl mb-3">📄</Text>
                      <Text className="text-base font-black text-[#14532D] text-center">
                        Portable Document Format (PDF)
                      </Text>
                      <Text className="text-sm text-slate-500 font-medium mt-1">
                        {doc.originalFilename} • {formatFileSize(doc.size)}
                      </Text>
                      <View className="bg-[#ECFDF5] border border-[#A7F3D0] px-3.5 py-1.5 rounded-full mt-3">
                        <Text className="text-xs font-bold text-[#10B981]">PDF Document Ready</Text>
                      </View>
                    </View>
                  ) : (
                    <View className="items-center py-6">
                      <Text className="text-6xl mb-3">📁</Text>
                      <Text className="text-base font-bold text-slate-800">{doc.originalFilename}</Text>
                      <Text className="text-sm text-slate-500 mt-1">{formatFileSize(doc.size)}</Text>
                    </View>
                  )}
                </View>

                {/* Title & Description */}
                <Text className="text-2xl font-black text-[#14532D]">{doc.name}</Text>
                {doc.description ? (
                  <Text className="text-sm text-slate-600 font-medium mt-2 leading-relaxed">
                    {doc.description}
                  </Text>
                ) : null}
              </View>

              {/* Document Metadata Details */}
              <View
                style={{
                  shadowColor: '#14532D',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  elevation: 2,
                }}
                className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 mb-4 space-y-3"
              >
                <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-2">
                  File Information
                </Text>

                <View className="flex-row justify-between py-3 border-b border-[#CADDCB]">
                  <Text className="text-sm font-semibold text-slate-500">File Name</Text>
                  <Text className="text-sm font-bold text-slate-800 text-right flex-1 ml-4" numberOfLines={1}>
                    {doc.originalFilename}
                  </Text>
                </View>

                <View className="flex-row justify-between py-3 border-b border-[#CADDCB]">
                  <Text className="text-sm font-semibold text-slate-500">Category</Text>
                  <Text className="text-sm font-bold text-slate-800">{doc.category}</Text>
                </View>

                <View className="flex-row justify-between py-3 border-b border-[#CADDCB]">
                  <Text className="text-sm font-semibold text-slate-500">File Size</Text>
                  <Text className="text-sm font-bold text-slate-800">{formatFileSize(doc.size)}</Text>
                </View>

                <View className="flex-row justify-between py-3 border-b border-[#CADDCB]">
                  <Text className="text-sm font-semibold text-slate-500">Uploaded On</Text>
                  <Text className="text-sm font-bold text-slate-800">
                    {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View className="flex-row justify-between py-3">
                  <Text className="text-sm font-semibold text-slate-500">Status</Text>
                  <Text className="text-sm font-bold text-amber-800">Uploaded by you – Not officially verified</Text>
                </View>
              </View>

              {/* Actions */}
              <View className="space-y-3.5">
                <TouchableOpacity
                  onPress={handleDownload}
                  disabled={isDownloading || !fileBase64}
                  activeOpacity={0.85}
                  className="w-full py-4.5 bg-[#14532D] rounded-2xl justify-center items-center shadow-xs"
                >
                  <Text className="text-white text-base font-black uppercase tracking-wider">
                    {isDownloading ? 'Downloading...' : 'Download File to Device ↓'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={isDeleting}
                  activeOpacity={0.7}
                  className="w-full py-4 border border-red-200 bg-red-50/70 rounded-2xl justify-center items-center"
                >
                  <Text className="text-red-600 text-sm font-black uppercase tracking-wider">
                    {isDeleting ? 'Deleting...' : 'Delete from Wallet'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
