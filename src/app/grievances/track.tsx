import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { grievanceApi, GrievanceRecord } from '@/services/api';

export default function MyComplaintsScreen() {
  const router = useRouter();

  // State
  const [complaints, setComplaints] = useState<GrievanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Edit Complaint Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<GrievanceRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editReferenceNumber, setEditReferenceNumber] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('Awaiting Updates');
  const [newNote, setNewNote] = useState<string>('');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Delete Confirmation Modal State
  const [deletingComplaint, setDeletingComplaint] = useState<GrievanceRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch real complaints strictly for the authenticated citizen from MongoDB
  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await grievanceApi.getGrievances();
      if (res.success && Array.isArray(res.grievances)) {
        setComplaints(res.grievances);
      } else {
        setComplaints([]);
      }
    } catch {
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const openExternalUrl = async (url: string) => {
    if (!url) return;
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert('Official Portal Link', `Official portal URL:\n${url}`);
    }
  };

  const handleOpenEditModal = (c: GrievanceRecord) => {
    setSelectedComplaint(c);
    setEditTitle(c.title || '');
    setEditReferenceNumber(c.referenceNumber || '');
    setEditCategory(c.category || '');
    setEditLocation(c.exactLocation || '');
    setEditDescription(c.description || '');
    setNewStatus(c.citizenStatus || 'Awaiting Updates');
    setNewNote('');
    setFeedbackRating(c.citizenFeedback?.rating || 5);
    setFeedbackNotes(c.citizenFeedback?.experienceNotes || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedComplaint) return;
    if (!editTitle.trim()) {
      Alert.alert('Validation Error', 'Complaint title cannot be empty.');
      return;
    }
    if (!editReferenceNumber.trim()) {
      Alert.alert('Validation Error', 'Official reference number cannot be empty.');
      return;
    }

    setIsUpdating(true);

    try {
      const payload: any = {
        title: editTitle.trim(),
        referenceNumber: editReferenceNumber.trim().toUpperCase(),
        category: editCategory.trim(),
        exactLocation: editLocation.trim(),
        description: editDescription.trim(),
        citizenStatus: newStatus,
      };

      if (newNote.trim()) payload.newNote = newNote.trim();
      if (newStatus === 'Resolved by Dept' || newStatus === 'Closed') {
        payload.citizenFeedback = {
          rating: feedbackRating,
          experienceNotes: feedbackNotes.trim(),
        };
      }

      const res = await grievanceApi.updateGrievance(selectedComplaint._id, payload);
      if (res.success) {
        setShowEditModal(false);
        fetchComplaints();
      } else {
        Alert.alert('Update Failed', res.message || 'Could not update complaint details.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update complaint.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePromptDelete = (c: GrievanceRecord) => {
    setDeletingComplaint(c);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingComplaint) return;
    setIsDeleting(true);

    try {
      const res = await grievanceApi.deleteGrievance(deletingComplaint._id);
      if (res.success) {
        setShowDeleteModal(false);
        setDeletingComplaint(null);
        fetchComplaints();
      } else {
        Alert.alert('Error', res.message || 'Could not delete complaint.');
      }
    } catch (err: any) {
      Alert.alert('Deletion Error', err.message || 'Failed to remove complaint from MongoDB.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesFilter =
      selectedFilter === 'all'
        ? true
        : selectedFilter === 'overdue'
        ? c.isOverdue
        : selectedFilter === 'resolved'
        ? c.citizenStatus === 'Resolved by Dept' || c.citizenStatus === 'Closed'
        : c.citizenStatus === selectedFilter;

    const matchesSearch = searchQuery.trim()
      ? c.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.portalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#CADDCB] bg-[#EDF5EE]">
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          className="w-11 h-11 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-3.5 shadow-xs"
          activeOpacity={0.7}
        >
          <Text className="text-[#14532D] font-black text-lg">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-black text-[#14532D]">My Complaints</Text>
          <Text className="text-[10px] font-bold text-[#4B6350] uppercase tracking-widest mt-0.5">
            Personal Tracking & Waiting Period Insights
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/grievances/report', params: { mode: 'save_only' } } as any)}
          className="px-3.5 py-2 bg-[#14532D] rounded-xl shadow-xs"
          activeOpacity={0.8}
        >
          <Text className="text-white text-[11px] font-black">+ Add</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          {/* Important Disclosure Banner */}
          <View className="bg-[#FFFBEB] border border-[#FDE68A] p-4 rounded-3xl mb-5 flex-row items-start">
            <Text className="text-xl mr-3 mt-0.5">ℹ️</Text>
            <View className="flex-1">
              <Text className="text-xs font-black text-amber-900 mb-0.5">
                Personal Citizen Tracking
              </Text>
              <Text className="text-[11px] text-amber-800 leading-relaxed font-medium">
                Statuses below are citizen-reported records for your personal follow-up. For official departmental action reports, tap "Check Official Portal".
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="mb-4">
            <TextInput
              placeholder="Search by Reference Number, Title, or Portal..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="w-full px-4 py-3 bg-[#F3F8F4] border border-[#CADDCB] rounded-2xl text-slate-900 font-semibold text-xs"
            />
          </View>

          {/* Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-5">
            {[
              { id: 'all', label: `All (${complaints.length})` },
              { id: 'Awaiting Updates', label: 'Awaiting Updates' },
              { id: 'overdue', label: 'Overdue Timelines ⚠️' },
              { id: 'resolved', label: 'Marked Resolved' },
            ].map((f) => {
              const isSelected = selectedFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setSelectedFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                    isSelected ? 'bg-[#14532D] border-[#14532D]' : 'bg-[#EDF5EE] border-[#CADDCB]'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-black ${
                      isSelected ? 'text-white' : 'text-[#14532D]'
                    }`}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Loading State */}
          {isLoading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#14532D" />
              <Text className="text-xs text-slate-500 font-bold mt-3">Loading your complaints...</Text>
            </View>
          ) : filteredComplaints.length === 0 ? (
            /* Empty State for New Citizens or No Matches */
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
              <View className="w-16 h-16 rounded-3xl bg-[#ECFDF5] border border-[#A7F3D0] justify-center items-center mb-4">
                <Text className="text-3xl">📢</Text>
              </View>
              <Text className="text-lg font-black text-[#14532D] text-center tracking-tight">
                {complaints.length === 0 ? 'No Complaints Recorded Yet' : 'No Matching Complaints Found'}
              </Text>
              <Text className="text-xs text-slate-500 text-center mt-2 leading-relaxed max-w-xs font-medium">
                {complaints.length === 0
                  ? 'Smart Bharat helps you identify the correct official government portal, save your reference numbers, and calculate waiting periods automatically.'
                  : 'Try clearing your search query or selecting a different status filter.'}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/grievances/report' as any)}
                className="mt-6 bg-[#14532D] px-6 py-3.5 rounded-2xl shadow-xs"
                activeOpacity={0.8}
              >
                <Text className="text-white font-black text-xs uppercase tracking-wider">
                  Find Portal & File Grievance →
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Real Complaints List */
            <View className="space-y-4">
              {filteredComplaints.map((c) => {
                const isOverdue = c.isOverdue;
                return (
                  <View
                    key={c._id}
                    style={{
                      shadowColor: '#14532D',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.04,
                      shadowRadius: 10,
                      elevation: 2,
                    }}
                    className="bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 mb-4"
                  >
                    {/* Top Row: Reference Number & Citizen-Reported Status */}
                    <View className="flex-row justify-between items-center mb-3">
                      <View className="bg-[#EDF5EE] border border-[#CADDCB] px-3 py-1 rounded-xl">
                        <Text className="text-[10.5px] font-mono font-black text-[#14532D]">
                          Ref: {c.referenceNumber}
                        </Text>
                      </View>

                      {/* Citizen Status Pill */}
                      <View className="bg-[#FFF7ED] border border-[#FED7AA] px-2.5 py-0.5 rounded-full flex-row items-center">
                        <Text className="text-[8px] font-bold text-amber-900 mr-1">Citizen Record:</Text>
                        <Text className="text-[9px] font-black text-[#D97706] uppercase">
                          {c.citizenStatus || 'Awaiting Updates'}
                        </Text>
                      </View>
                    </View>

                    {/* Title & Category */}
                    <View className="pb-3 border-b border-[#CADDCB]">
                      <Text className="text-base font-black text-[#14532D] leading-snug">
                        {c.title}
                      </Text>
                      <Text className="text-xs text-slate-500 font-semibold mt-1">
                        {c.category} • {c.state} {c.district ? `(${c.district})` : ''}
                      </Text>
                    </View>

                    {/* Government Portal & Waiting Days Analysis */}
                    <View className="py-3 space-y-2 border-b border-[#CADDCB]">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-slate-600 font-medium">Official Portal:</Text>
                        <Text className="text-xs font-black text-[#14532D]">{c.portalName}</Text>
                      </View>

                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-slate-600 font-medium">Submitted On:</Text>
                        <Text className="text-xs font-bold text-slate-800">
                          {new Date(c.submissionDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>

                      {/* Days Elapsed Pill */}
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-slate-600 font-medium">Waiting Period:</Text>
                        <View
                          className={`px-2.5 py-0.5 rounded-full ${
                            isOverdue ? 'bg-red-100 border border-red-300' : 'bg-emerald-100 border border-emerald-300'
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-black ${
                              isOverdue ? 'text-red-700' : 'text-emerald-800'
                            }`}
                          >
                            {c.daysElapsed} Days Elapsed
                          </Text>
                        </View>
                      </View>

                      {/* Expected Timeline Notice */}
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-slate-600 font-medium">Official Timeline:</Text>
                        <Text className="text-xs font-bold text-slate-700">
                          {c.expectedTimelineDays} Days
                        </Text>
                      </View>

                      {/* Overdue Alert if applicable */}
                      {isOverdue && (
                        <View className="bg-red-50 border border-red-200 p-2.5 rounded-2xl mt-1">
                          <Text className="text-[10.5px] font-black text-red-700">
                            ⚠️ Exceeded Published Timeline by {c.daysOverdue} Days
                          </Text>
                          <Text className="text-[10px] text-red-600 font-medium mt-0.5 leading-snug">
                            You may contact the department nodal officer or file a First Appeal on {c.portalName}.
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row justify-between pt-3">
                      <TouchableOpacity
                        onPress={() => openExternalUrl(c.trackingUrl || c.portalUrl)}
                        activeOpacity={0.8}
                        className="w-[31%] py-2.5 bg-[#14532D] rounded-xl justify-center items-center shadow-xs"
                      >
                        <Text className="text-white text-[10px] font-black uppercase tracking-wider">
                          Portal ↗
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleOpenEditModal(c)}
                        activeOpacity={0.8}
                        className="w-[36%] py-2.5 border border-[#CADDCB] bg-[#EDF5EE] rounded-xl justify-center items-center"
                      >
                        <Text className="text-[#14532D] text-[10px] font-black uppercase tracking-wider">
                          Edit Details ✍️
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handlePromptDelete(c)}
                        activeOpacity={0.8}
                        className="w-[28%] py-2.5 border border-red-200 bg-red-50 rounded-xl justify-center items-center"
                      >
                        <Text className="text-red-700 text-[10px] font-black uppercase tracking-wider">
                          Delete 🗑️
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* EDIT COMPLAINT DETAILS & STATUS MODAL */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-[#F3F8F4] rounded-t-3xl p-6 border-t border-[#CADDCB] max-h-[90%]">
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="text-base font-black text-[#14532D]">
                  Edit Complaint Details
                </Text>
                <Text className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                  Personal Record Tracking
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(false)} className="p-1">
                <Text className="text-slate-500 font-bold text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
              {/* Locked Authority Notice */}
              <View className="bg-[#EDF5EE] border border-[#CADDCB] p-3 rounded-2xl mb-4">
                <Text className="text-[10px] font-black text-[#4B6350] uppercase tracking-wide">
                  🏛️ Official Filing Record:
                </Text>
                <Text className="text-xs font-bold text-[#14532D] mt-0.5">
                  {selectedComplaint?.portalName}
                </Text>
                <Text className="text-[10.5px] text-slate-500 font-medium mt-0.5">
                  Submitted On: {selectedComplaint?.submissionDate ? new Date(selectedComplaint.submissionDate).toLocaleDateString('en-IN') : 'N/A'} (Locked for audit accuracy)
                </Text>
              </View>

              {/* Title */}
              <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                Complaint Title *
              </Text>
              <TextInput
                value={editTitle}
                onChangeText={setEditTitle}
                className="w-full px-3.5 py-2.5 bg-white border border-[#CADDCB] rounded-xl text-xs font-bold text-slate-900 mb-3"
              />

              {/* Reference Number */}
              <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                Official Reference / Token Number *
              </Text>
              <TextInput
                value={editReferenceNumber}
                onChangeText={(t) => setEditReferenceNumber(t.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-white border border-[#CADDCB] rounded-xl text-xs font-mono font-black text-[#14532D] mb-3"
              />

              {/* Exact Location */}
              <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                Exact Street Location / Ward / Landmark
              </Text>
              <TextInput
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder="e.g. Near Metro Pillar 142, Ward 150"
                placeholderTextColor="#94A3B8"
                className="w-full px-3.5 py-2.5 bg-white border border-[#CADDCB] rounded-xl text-xs text-slate-800 mb-3"
              />

              {/* Problem Description */}
              <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                Problem Description
              </Text>
              <TextInput
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="w-full px-3.5 py-2.5 bg-white border border-[#CADDCB] rounded-xl text-xs text-slate-800 mb-4"
                style={{ minHeight: 65 }}
              />

              {/* Citizen Reported Status */}
              <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-2">
                Citizen-Reported Status:
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {['Awaiting Updates', 'In Review', 'Action Taken', 'Resolved by Dept', 'Closed'].map((st) => {
                  const isSelected = newStatus === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setNewStatus(st)}
                      className={`px-3 py-1.5 rounded-full border ${
                        isSelected ? 'bg-[#14532D] border-[#14532D]' : 'bg-[#EDF5EE] border-[#CADDCB]'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-black ${
                          isSelected ? 'text-white' : 'text-[#14532D]'
                        }`}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Note Input */}
              <Text className="text-xs font-black text-[#14532D] uppercase tracking-wider mb-1.5">
                Add New Follow-Up Note:
              </Text>
              <TextInput
                placeholder="e.g. Contacted nodal helpline, follow-up scheduled..."
                placeholderTextColor="#94A3B8"
                value={newNote}
                onChangeText={setNewNote}
                multiline
                numberOfLines={2}
                className="w-full px-3.5 py-2.5 bg-white border border-[#CADDCB] rounded-xl text-xs text-slate-900 mb-4"
              />

              {/* Feedback reflection if resolved */}
              {(newStatus === 'Resolved by Dept' || newStatus === 'Closed') && (
                <View className="mb-4 bg-[#ECFDF5] border border-[#A7F3D0] p-3 rounded-2xl">
                  <Text className="text-xs font-black text-[#10B981] mb-1">
                    Citizen Experience Rating (1 to 5):
                  </Text>
                  <View className="flex-row space-x-2 my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setFeedbackRating(star)}
                        className={`w-8 h-8 rounded-full justify-center items-center mr-1 ${
                          feedbackRating >= star ? 'bg-[#14532D]' : 'bg-slate-200'
                        }`}
                      >
                        <Text className="text-white text-xs font-bold">{star}★</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    placeholder="Optional notes on department resolution quality..."
                    placeholderTextColor="#94A3B8"
                    value={feedbackNotes}
                    onChangeText={setFeedbackNotes}
                    className="w-full px-3 py-2 bg-white border border-[#A7F3D0] rounded-xl text-xs text-slate-800 mt-2"
                  />
                </View>
              )}
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={isUpdating}
              className="w-full py-3.5 bg-[#14532D] rounded-2xl justify-center items-center shadow-xs"
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-xs font-black uppercase tracking-wider">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setShowDeleteModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="w-full max-w-sm bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 shadow-xl">
            <View className="w-14 h-14 rounded-2xl bg-red-100 border border-red-200 justify-center items-center mb-4 self-center">
              <Text className="text-2xl">🗑️</Text>
            </View>

            <Text className="text-base font-black text-slate-900 text-center mb-1">
              Delete Tracking Record?
            </Text>

            <Text className="text-xs font-bold text-[#14532D] text-center mb-3">
              Ref #{deletingComplaint?.referenceNumber} • {deletingComplaint?.title}
            </Text>

            <View className="bg-amber-50 border border-amber-200 p-3 rounded-2xl mb-4">
              <Text className="text-[11px] text-amber-900 leading-relaxed font-medium">
                This will delete this record from your personal Smart Bharat tracking dashboard, activity history, and insights calculations.
              </Text>
              <Text className="text-[10px] text-amber-800 font-bold mt-1.5">
                ⚠️ Note: This does NOT delete, cancel, or withdraw your grievance from the official government portal ({deletingComplaint?.portalName}).
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-[#EDF5EE] border border-[#CADDCB] rounded-xl justify-center items-center"
              >
                <Text className="text-xs font-black text-slate-700">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 rounded-xl justify-center items-center"
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-xs font-black text-white">Delete Record</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
