import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { documentApi } from '@/services/api';
import { pickDocumentFile, PickedFile } from '@/services/filePicker';

export interface UserDocument {
  _id: string;
  name: string;
  category: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  status: string;
  description?: string;
  createdAt: string;
}

const CATEGORIES = [
  'Identity',
  'Education',
  'Driving & Vehicle',
  'Property & Revenue',
  'Finance & Tax',
  'Other',
];

const CATEGORY_ICONS: Record<string, string> = {
  Identity: '🪪',
  Education: '🎓',
  'Driving & Vehicle': '🚗',
  'Property & Revenue': '📑',
  'Finance & Tax': '💳',
  Other: '📁',
};

export default function MyDocumentsScreen() {
  const router = useRouter();

  // Documents state
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add Document Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PickedFile | null>(null);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('Identity');
  const [docDescription, setDocDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch real documents for authenticated user
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await documentApi.getDocuments();
      if (res.success && Array.isArray(res.documents)) {
        setDocuments(res.documents);
      } else {
        setDocuments([]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to load documents.');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDocuments();
    }, [fetchDocuments])
  );

  const handlePickFile = async () => {
    setUploadError(null);
    try {
      const file = await pickDocumentFile();
      setSelectedFile(file);
      if (!docName.trim()) {
        // Default document title from filename without extension
        const base = file.name.replace(/\.[^/.]+$/, '');
        setDocName(base);
      }
    } catch (err: any) {
      if (err.message !== 'No file selected') {
        setUploadError(err.message || 'Failed to select file.');
      }
    }
  };

  const handleSaveDocument = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file from your device.');
      return;
    }
    if (!docName.trim()) {
      setUploadError('Please provide a document title.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await documentApi.uploadDocument({
        name: docName.trim(),
        category: docCategory,
        originalFilename: selectedFile.name,
        mimeType: selectedFile.mimeType,
        base64Data: selectedFile.base64Data,
        description: docDescription.trim(),
      });

      if (res.success) {
        setShowAddModal(false);
        resetForm();
        fetchDocuments();
        Alert.alert('Document Saved', 'Your document has been stored securely in your wallet.');
      } else {
        setUploadError(res.message || 'Failed to save document.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDocName('');
    setDocCategory('Identity');
    setDocDescription('');
    setUploadError(null);
  };

  const handleDelete = (docId: string, title: string) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${title}" from your personal wallet? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await documentApi.deleteDocument(docId);
              if (res.success) {
                fetchDocuments();
                Alert.alert('Deleted', 'Document removed successfully.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete document.');
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-[#CADDCB] bg-[#EDF5EE]">
        <View className="flex-row items-center flex-1 mr-3">
          <TouchableOpacity
            onPress={() => router.replace('/home')}
            className="w-11 h-11 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-3.5 shadow-xs"
            activeOpacity={0.7}
          >
            <Text className="text-[#14532D] font-black text-lg">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-base font-black text-[#14532D]">My Documents</Text>
            <Text className="text-[10px] font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
              Personal Document Wallet
            </Text>
          </View>
        </View>

        {/* Add Document Header Shortcut */}
        <TouchableOpacity
          onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}
          activeOpacity={0.8}
          className="bg-[#14532D] px-4 py-2.5 rounded-2xl flex-row items-center shadow-xs"
        >
          <Text className="text-white text-xs font-black mr-1">+</Text>
          <Text className="text-white text-xs font-black">Add Document</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        {/* Title Details with Orange Indicator */}
        <View className="mb-5 flex-row items-center">
          <View className="w-1 h-6 rounded-full bg-[#F97316] mr-3" />
          <View>
            <Text className="text-2xl font-black text-[#14532D] tracking-tight">Your Stored Files</Text>
            <Text className="text-xs font-semibold text-slate-500 mt-0.5">
              Secure private document storage for verified citizen services
            </Text>
          </View>
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#14532D" />
            <Text className="text-xs text-slate-400 font-bold mt-3">
              Loading your documents...
            </Text>
          </View>
        ) : errorMessage ? (
          /* Error State */
          <View className="bg-white border border-red-200 rounded-3xl p-6 items-center my-4 shadow-sm">
            <Text className="text-2xl mb-2">⚠️</Text>
            <Text className="text-sm font-bold text-slate-900 text-center">Unable to load documents</Text>
            <Text className="text-xs text-slate-500 text-center mt-1 mb-4">{errorMessage}</Text>
            <TouchableOpacity
              onPress={fetchDocuments}
              className="bg-[#14532D] px-6 py-3 rounded-2xl shadow-sm"
              activeOpacity={0.8}
            >
              <Text className="text-white text-xs font-bold uppercase tracking-wider">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : documents.length === 0 ? (
          /* Empty State for New Users matching Reference */
          <View
            style={{
              shadowColor: '#14532D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-8 items-center my-4"
          >
            <View className="w-16 h-16 rounded-3xl bg-[#EEF2FF] border border-[#C7D2FE] justify-center items-center mb-4">
              <Text className="text-3xl">📁</Text>
            </View>
            <Text className="text-lg font-black text-[#14532D] text-center tracking-tight">
              No documents available yet.
            </Text>
            <Text className="text-xs text-slate-500 text-center mt-2 leading-relaxed max-w-xs font-medium">
              Upload your personal IDs, educational certificates, and documents from your device to access them securely anytime.
            </Text>
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setShowAddModal(true);
              }}
              activeOpacity={0.85}
              className="mt-6 bg-[#14532D] px-6 py-3.5 rounded-2xl shadow-xs flex-row items-center"
            >
              <Text className="text-white font-black text-xs mr-2">+</Text>
              <Text className="text-white font-black text-xs uppercase tracking-wider">
                Add Document
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Real User Documents List */
          <View className="space-y-4">
            {documents.map((doc) => {
              const icon = CATEGORY_ICONS[doc.category] || '📁';
              const isPdf = doc.mimeType === 'application/pdf';

              return (
                <View
                  key={doc._id}
                  style={{
                    shadowColor: '#14532D',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                    elevation: 2,
                  }}
                  className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 mb-3.5"
                >
                  {/* Top Row: Category and Status Badge */}
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="bg-[#EEF2FF] border border-[#C7D2FE] px-3 py-1 rounded-xl flex-row items-center">
                      <Text className="text-xs mr-1">{icon}</Text>
                      <Text className="text-[10px] font-black text-[#6366F1] uppercase tracking-wider">
                        {doc.category}
                      </Text>
                    </View>

                    {/* Status Pill */}
                    <View className="bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-0.5 rounded-full">
                      <Text className="text-[9px] font-bold text-amber-800">
                        Uploaded by you – Not officially verified
                      </Text>
                    </View>
                  </View>

                  {/* Document Name and Metadata */}
                  <View className="pb-3 border-b border-[#CADDCB]">
                    <Text className="text-base font-black text-[#14532D] leading-snug">
                      {doc.name}
                    </Text>
                    <Text className="text-xs text-slate-500 font-medium mt-1">
                      File: {doc.originalFilename} • {formatFileSize(doc.size)}
                    </Text>
                    {doc.description ? (
                      <Text className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                        {doc.description}
                      </Text>
                    ) : null}
                  </View>

                  {/* Scheduling and Date Row */}
                  <View className="flex-row justify-between items-center py-3">
                    <Text className="text-[10px] font-bold text-[#4B6350] uppercase tracking-wider">
                      Uploaded on{' '}
                      {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-[#10B981] mr-1.5" />
                      <Text className="text-[10px] font-black text-slate-600 uppercase">
                        {isPdf ? 'PDF File' : 'Image File'}
                      </Text>
                    </View>
                  </View>

                  {/* Actions Footer */}
                  <View className="flex-row justify-between pt-3 border-t border-[#CADDCB]">
                    <TouchableOpacity
                      onPress={() => {
                        router.push({
                          pathname: '/digilocker/details',
                          params: { id: doc._id },
                        } as any);
                      }}
                      activeOpacity={0.7}
                      className="w-[48%] py-3 bg-[#14532D] rounded-2xl justify-center items-center shadow-xs"
                    >
                      <Text className="text-white text-xs font-black">View / Download</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(doc._id, doc.name)}
                      activeOpacity={0.7}
                      className="w-[48%] py-3 border border-red-200 bg-red-50/70 rounded-2xl justify-center items-center"
                    >
                      <Text className="text-red-600 text-xs font-black">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Return Button */}
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          className="mt-6 border border-[#CADDCB] py-4 rounded-2xl justify-center items-center bg-[#EDF5EE] shadow-xs"
          activeOpacity={0.7}
        >
          <Text className="text-[#14532D] font-black text-xs uppercase tracking-wider">
            Return to Dashboard
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ADD DOCUMENT MODAL */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isUploading) setShowAddModal(false);
        }}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-[#F3F8F4] border-t border-[#CADDCB] rounded-t-3xl max-h-[90%] p-6">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center pb-4 border-b border-[#CADDCB] mb-4">
              <View>
                <Text className="text-lg font-black text-[#14532D] tracking-tight">Add Document</Text>
                <Text className="text-[10px] font-medium text-[#4B6350]">
                  Store personal documents securely in your wallet
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (!isUploading) setShowAddModal(false);
                }}
                className="w-8 h-8 rounded-full bg-[#E0EDE1] justify-center items-center"
              >
                <Text className="text-[#14532D] font-bold text-sm">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {uploadError ? (
                <View className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <Text className="text-red-600 text-xs font-bold text-center">{uploadError}</Text>
                </View>
              ) : null}

              {/* OPTION A: UPLOAD FROM DEVICE */}
              <View className="mb-6">
                <View className="flex-row items-center mb-2">
                  <View className="w-2 h-2 rounded-full bg-[#14532D] mr-2" />
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider">
                    Option A: Upload from Device
                  </Text>
                </View>
                <Text className="text-[11px] text-slate-500 font-medium mb-3">
                  Upload PDF, JPG, or PNG files up to 10MB (Government IDs, Certificates, Receipts).
                </Text>

                {/* File Picker Button / Area */}
                <TouchableOpacity
                  onPress={handlePickFile}
                  activeOpacity={0.75}
                  className="p-5 border-2 border-dashed border-[#A7F3D0] rounded-2xl bg-[#ECFDF5]/60 items-center justify-center mb-3"
                >
                  <Text className="text-3xl mb-1">📤</Text>
                  <Text className="text-xs font-bold text-[#14532D]">
                    {selectedFile ? 'Change Selected File' : 'Choose File from Device'}
                  </Text>
                  <Text className="text-[10px] text-slate-400 mt-0.5">
                    Supports .pdf, .jpg, .png (Max 10MB)
                  </Text>
                </TouchableOpacity>

                {/* Selected File Card Preview */}
                {selectedFile ? (
                  <View className="bg-[#EDF5EE] border border-[#CADDCB] p-3.5 rounded-xl mb-3 flex-row items-center">
                    {selectedFile.previewUri ? (
                      <Image
                        source={{ uri: selectedFile.previewUri }}
                        style={{ width: 44, height: 44, borderRadius: 8, marginRight: 12 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-11 h-11 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] justify-center items-center mr-3">
                        <Text className="text-xl">📄</Text>
                      </View>
                    )}
                    <View className="flex-1 pr-2">
                      <Text className="text-xs font-extrabold text-slate-900" numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <Text className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {formatFileSize(selectedFile.size)} • {selectedFile.mimeType}
                      </Text>
                    </View>
                    <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      <Text className="text-[9px] font-bold text-emerald-700">Ready</Text>
                    </View>
                  </View>
                ) : null}

                {/* Document Name Input */}
                <View className="mb-3">
                  <Text className="text-xs font-bold text-slate-700 mb-1 ml-0.5">Document Title *</Text>
                  <TextInput
                    placeholder="e.g. Aadhaar Card Front & Back"
                    placeholderTextColor="#94A3B8"
                    value={docName}
                    onChangeText={setDocName}
                    className="w-full px-4 py-3 bg-[#EDF5EE] border border-[#CADDCB] rounded-xl text-slate-900 font-semibold text-xs"
                  />
                </View>

                {/* Category Picker Chips */}
                <View className="mb-3">
                  <Text className="text-xs font-bold text-slate-700 mb-2 ml-0.5">Category *</Text>
                  <View className="flex-row flex-wrap">
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setDocCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl border mr-2 mb-2 ${
                          docCategory === cat
                            ? 'bg-[#14532D] border-[#14532D]'
                            : 'bg-[#EDF5EE] border-[#CADDCB]'
                        }`}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            docCategory === cat ? 'text-white' : 'text-slate-700'
                          }`}
                        >
                          {CATEGORY_ICONS[cat] || '📁'} {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Description Input */}
                <View className="mb-4">
                  <Text className="text-xs font-bold text-slate-700 mb-1 ml-0.5">
                    Notes / Description (Optional)
                  </Text>
                  <TextInput
                    placeholder="e.g. Scanned copy for college registration"
                    placeholderTextColor="#94A3B8"
                    value={docDescription}
                    onChangeText={setDocDescription}
                    className="w-full px-4 py-2.5 bg-[#EDF5EE] border border-[#CADDCB] rounded-xl text-slate-900 font-medium text-xs"
                  />
                </View>

                {/* Upload Action Buttons */}
                <View className="space-y-2">
                  <TouchableOpacity
                    onPress={handleSaveDocument}
                    disabled={isUploading || !selectedFile}
                    activeOpacity={0.85}
                    className={`w-full py-3.5 rounded-xl justify-center items-center shadow-xs ${
                      isUploading || !selectedFile ? 'bg-slate-200' : 'bg-[#14532D]'
                    }`}
                  >
                    {isUploading ? (
                      <View className="flex-row items-center space-x-2">
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text className="text-white text-xs font-bold ml-2">Saving Document...</Text>
                      </View>
                    ) : (
                      <Text
                        className={`text-xs font-bold uppercase tracking-wider ${
                          selectedFile ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        Confirm & Save to Wallet →
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (!isUploading) setShowAddModal(false);
                    }}
                    className="w-full py-2.5 rounded-xl justify-center items-center"
                  >
                    <Text className="text-slate-500 text-xs font-bold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* OPTION B: FETCH FROM DIGILOCKER */}
              <View className="border-t border-slate-100 pt-5 mt-2">
                <View className="flex-row items-center mb-1">
                  <View className="w-2 h-2 rounded-full bg-[#F97316] mr-2" />
                  <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider">
                    Option B: Fetch from DigiLocker
                  </Text>
                </View>

                <View className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 mt-2">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-base mr-2">🏛️</Text>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-amber-900">
                        Official DigiLocker Sync
                      </Text>
                      <Text className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
                        Coming Soon – Official Integration Required
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    Direct repository sync with UIDAI, Income Tax Department, and CBSE requires official MeitY API gateway integration. This capability is currently under regulatory onboarding.
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Official Integration Required',
                        'Direct DigiLocker synchronization will be enabled upon production API authorization from the Ministry of Electronics & IT.\n\nIn the meantime, you can store your personal documents directly using "Upload from Device".',
                        [{ text: 'Understood' }]
                      );
                    }}
                    className="mt-3 bg-amber-100 border border-amber-300 py-2.5 rounded-xl justify-center items-center"
                  >
                    <Text className="text-amber-900 text-xs font-bold">
                      Integration Status Details ℹ️
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
