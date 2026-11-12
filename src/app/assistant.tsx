import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { chatApi } from '@/services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  suggestedAction?: 'Open DigiLocker' | 'Report Complaint' | 'Open Scheme Finder' | 'Book Office Visit';
}

const WELCOME_TEXT = `Hello! 👋

I am Smart Bharat AI.

I can help you with:
• Government schemes
• DigiLocker guidance
• Civic complaints
• Office appointments
• Government documents
• Public services

Ask your question in any Indian language.`;

const SUGGESTIONS = [
  'Passport Application',
  'Government Schemes',
  'Report a Complaint',
  'DigiLocker Help',
  'Office Visit',
  'Income Certificate',
];

let sessionMessagesCache: Message[] | null = null;

export default function SmartAIAssistantScreen() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>(() => {
    if (sessionMessagesCache === null) {
      const initialWelcome: Message = {
        id: '1',
        text: WELCOME_TEXT,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      return [initialWelcome];
    }
    return sessionMessagesCache;
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Clear Chat Modal and Action State
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const handleConfirmClearChat = async () => {
    setIsClearing(true);
    setClearError(null);
    try {
      await chatApi.clearHistory();
      const initialWelcome: Message = {
        id: '1',
        text: WELCOME_TEXT,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initialWelcome]);
      sessionMessagesCache = [initialWelcome];
      setShowClearConfirmModal(false);
    } catch (err: any) {
      console.error('Failed to clear chat history:', err);
      setClearError(err.message || 'Failed to clear conversation. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  // Fetch persistent user-specific chat history from MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    chatApi
      .getHistory()
      .then((res: any) => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.messages) && res.messages.length > 0) {
          const loaded: Message[] = res.messages.map((m: any, idx: number) => ({
            id: m._id || String(idx + 1),
            text: m.text,
            sender: m.sender,
            timestamp: m.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedAction: m.suggestedAction || undefined,
          }));
          setMessages(loaded);
          sessionMessagesCache = loaded;
        }
      })
      .catch((err) => {
        console.warn('Could not load chat history from backend:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state with session cache using useEffect to avoid side-effect errors during render or state updates
  useEffect(() => {
    sessionMessagesCache = messages;
  }, [messages]);

  // Centralized auto-scroll effect
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping]);

  const getSuggestedAction = (text: string): 'Open DigiLocker' | 'Report Complaint' | 'Open Scheme Finder' | 'Book Office Visit' | undefined => {
    const t = text.toLowerCase();

    if (
      t.includes('passport office') ||
      t.includes('rto') ||
      t.includes('revenue office') ||
      t.includes('office appointment') ||
      t.includes('passport application') ||
      t.includes('office visit') ||
      t.includes('income certificate')
    ) {
      return 'Book Office Visit';
    }
    if (
      t.includes('aadhaar') ||
      t.includes('pan') ||
      t.includes('passport') ||
      t.includes('driving licence') ||
      t.includes('driving license') ||
      t.includes('digilocker')
    ) {
      return 'Open DigiLocker';
    }
    if (
      t.includes('garbage') ||
      t.includes('pothole') ||
      t.includes('water leakage') ||
      t.includes('street light') ||
      t.includes('streetlights') ||
      t.includes('sewage') ||
      t.includes('drainage') ||
      t.includes('complaint') ||
      t.includes('grievance') ||
      t.includes('report')
    ) {
      return 'Report Complaint';
    }
    if (
      t.includes('scheme') ||
      t.includes('scholarship') ||
      t.includes('farmer benefit') ||
      t.includes('student benefit') ||
      t.includes('welfare')
    ) {
      return 'Open Scheme Finder';
    }
    return undefined;
  };

  const detectLanguageLocal = (text: string): 'kn' | 'hi' | 'ta' | 'te' | 'ml' | 'en' => {
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi / Marathi
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
    return 'en';
  };

  const getErrorMessageLocal = (lang: 'kn' | 'hi' | 'ta' | 'te' | 'ml' | 'en'): string => {
    switch (lang) {
      case 'kn': return "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.";
      case 'hi': return "क्षमा करें, मैं आपके अनुरोध पर कार्रवाई नहीं कर सका। कृपया पुनः प्रयास करें।";
      case 'ta': return "மன்னிக்கவும், உங்கள் கோரிக்கையைச் செயல்படுத்த முடியவில்லை. மீண்டும் முயற்சிக்கவும்.";
      case 'te': return "క్షమించండి, మీ అభ్యర్థనను ప్రాసెస్ చేయలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.";
      case 'ml': return "ക്ഷമിക്കണം, നിങ്ങളുടെ അഭ്യർത്ഥന പ്രോസസ്സ് ചെയ്യാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.";
      default: return "Sorry, I couldn't process your request. Please try again.";
    }
  };

  const triggerAIResponse = async (userText: string, currentMessages: Message[]) => {
    setIsTyping(true);

    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const userLang = detectLanguageLocal(userText);
    const errMessage = getErrorMessageLocal(userLang);
    const action = getSuggestedAction(userText);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    console.log('--- GEMINI API DEBUGGING ---');
    console.log('Model Configured:', 'gemini-2.5-flash');
    console.log('EXPO_PUBLIC_GEMINI_API_KEY length:', process.env.EXPO_PUBLIC_GEMINI_API_KEY ? process.env.EXPO_PUBLIC_GEMINI_API_KEY.length : 0);
    console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    console.log('Resolved API Key length:', apiKey ? apiKey.length : 0);

    const applyErrorReply = (customNotice?: string) => {
      setIsTyping(false);
      const reply = customNotice || errMessage;
      setMessages((prev) => [
        ...prev,
        { id: String(prev.length + 1), text: reply, sender: 'ai', timestamp, suggestedAction: action },
      ]);
    };

    if (!apiKey || apiKey.trim() === '') {
      const errorMsg = 'Gemini API key is not configured. Please verify your GEMINI_API_KEY environment variable.';
      console.error(errorMsg);
      applyErrorReply(errorMsg);
      return;
    }

    try {
      // Map user/ai roles to user/model, filtering out the static welcome message at index 0 (msg.id === '1')
      // to ensure the payload starts with the 'user' role and alternates correctly.
      const chatHistory = currentMessages
        .filter((msg) => msg.id !== '1')
        .map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));

      console.log('Sending request to Gemini API. Payload contents:', JSON.stringify(chatHistory, null, 2));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: chatHistory,
            systemInstruction: {
              parts: [
                {
                  text: 'You are Smart Bharat AI, a helpful multilingual AI civic companion for the Smart Bharat app. Assist citizens with government schemes, DigiLocker certificates, civic grievances, and appointments. CRITICAL RULE: You MUST auto-detect the language of the user message and respond in the EXACT same language (English, Hindi, Kannada, Tamil, Telugu, Malayalam, or Marathi). NEVER translate the text or switch to English unless the user explicitly requests you to translate. Respond in a highly concise, professional, and premium tone.',
                },
              ],
            },
          }),
        }
      );

      console.log('Gemini API HTTP Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error response body text');
        console.error('Gemini API request failed with status code:', response.status);
        console.error('Gemini API response error body content:', errorText);
        throw new Error(`API returned status ${response.status}: ${errorText}`);
      }

      const responseJson = await response.json();
      console.log('Gemini API Response JSON:', JSON.stringify(responseJson, null, 2));

      const aiResponse =
        responseJson.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!aiResponse) {
        throw new Error('Gemini API did not return any text contents.');
      }

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: String(prev.length + 1), text: aiResponse, sender: 'ai', timestamp, suggestedAction: action },
      ]);
      // Persist Gemini AI response to MongoDB
      chatApi
        .saveMessage({
          sender: 'ai',
          text: aiResponse,
          suggestedAction: action || null,
          timestamp,
        })
        .catch((err) => console.warn('Could not persist Gemini AI message:', err));
    } catch (error: any) {
      console.error('Gemini API call failed with exception:', error);
      console.error('Actual Error Message:', error?.message || String(error));
      applyErrorReply();
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: Message = {
      id: String(messages.length + 1),
      text: text.trim(),
      sender: 'user',
      timestamp,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputText('');

    // Persist user chat message to MongoDB
    chatApi
      .saveMessage({
        sender: 'user',
        text: text.trim(),
        timestamp,
      })
      .catch((err) => console.warn('Could not persist user message:', err));

    triggerAIResponse(text.trim(), nextMessages);
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleSuggestedActionPress = (action: 'Open DigiLocker' | 'Report Complaint' | 'Open Scheme Finder' | 'Book Office Visit') => {
    switch (action) {
      case 'Open DigiLocker':
        router.push('/digilocker');
        break;
      case 'Report Complaint':
        router.push('/grievances');
        break;
      case 'Open Scheme Finder':
        router.push('/schemes/questionnaire');
        break;
      case 'Book Office Visit':
        router.push('/appointments/select-department');
        break;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F0E8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0E8" />

      {/* Header bar */}
      <View className="px-6 py-4 border-b border-[#CADDCB] bg-[#EDF5EE]">
        <View className="max-w-4xl w-full mx-auto flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-3">
            <TouchableOpacity
              onPress={() => router.replace('/home')}
              className="w-11 h-11 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center mr-3.5 shadow-xs"
              activeOpacity={0.7}
            >
              <Text className="text-[#14532D] font-black text-lg">←</Text>
            </TouchableOpacity>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-xl font-black text-[#14532D] mr-2.5">Smart Bharat AI</Text>
                <View className="px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-[#10B981] mr-1.5" />
                  <Text className="text-xs font-black text-[#10B981] uppercase tracking-wider">Live</Text>
                </View>
              </View>
              <Text className="text-xs font-bold text-[#4B6350] tracking-wider mt-0.5">
                Multilingual Civic Companion • 22 Indian Languages
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setClearError(null);
              setShowClearConfirmModal(true);
            }}
            style={{ minHeight: 44, minWidth: 76 }}
            className="px-5 py-2.5 rounded-2xl bg-[#E0EDE1] border border-[#CADDCB] justify-center items-center shadow-xs"
            activeOpacity={0.7}
          >
            <Text className="text-sm font-black text-[#14532D]">Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Suggestion Chips list below header */}
        <View className="py-3 px-6 border-b border-[#CADDCB] bg-[#EDF5EE]">
          <View className="max-w-4xl w-full mx-auto">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {SUGGESTIONS.map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSuggestionPress(chip)}
                  className="bg-[#F3F8F4] border border-[#CADDCB] px-4.5 py-2.5 rounded-2xl mr-2.5 shadow-xs"
                  activeOpacity={0.7}
                >
                  <Text className="text-[#14532D] font-bold text-sm">{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Scrollable Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <View className="max-w-4xl w-full mx-auto">
              <View className={`mb-4 ${item.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <View
                  style={{
                    shadowColor: '#14532D',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                  className={`max-w-[84%] p-5 rounded-3xl ${
                    item.sender === 'user'
                      ? 'bg-[#14532D] rounded-tr-sm'
                      : 'bg-[#F3F8F4] border border-[#CADDCB] rounded-tl-sm'
                  }`}
                >
                  <Text
                    className={`text-base leading-relaxed font-medium ${
                      item.sender === 'user' ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {item.text}
                  </Text>
                  {item.timestamp ? (
                    <Text
                      className={`text-[10px] mt-2 text-right font-extrabold uppercase tracking-wider ${
                        item.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      {item.timestamp}
                    </Text>
                  ) : null}
                </View>

                {/* Clickable suggested action card below AI bubble */}
                {item.sender === 'ai' && item.suggestedAction ? (
                  <TouchableOpacity
                    onPress={() => handleSuggestedActionPress(item.suggestedAction!)}
                    style={{
                      shadowColor: '#14532D',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.05,
                      shadowRadius: 10,
                      elevation: 2,
                    }}
                    className="bg-[#F3F8F4] border border-[#CADDCB] p-4.5 rounded-2xl mt-2.5 flex-row items-center w-[84%] border-l-4 border-l-[#F97316]"
                    activeOpacity={0.75}
                  >
                    <Text className="text-2xl mr-3.5">
                      {item.suggestedAction === 'Open DigiLocker'
                        ? '📁'
                        : item.suggestedAction === 'Report Complaint'
                        ? '📢'
                        : item.suggestedAction === 'Open Scheme Finder'
                        ? '🌾'
                        : '📅'}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-[10px] font-black text-[#F97316] uppercase tracking-widest">
                        Recommended Action
                      </Text>
                      <Text className="text-sm font-black text-[#14532D] mt-0.5">
                        {item.suggestedAction}
                      </Text>
                    </View>
                    <Text className="text-[#14532D] text-base ml-2 font-black">→</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
          ListFooterComponent={() =>
            isTyping ? (
              <View className="max-w-4xl w-full mx-auto">
                <View className="flex-row items-center space-x-2 pl-3 py-2">
                  <ActivityIndicator size="small" color="#14532D" />
                  <Text className="text-xs text-slate-500 font-bold tracking-wider ml-2.5">
                    Assistant is preparing answer...
                  </Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Chat Input Bar */}
        <View className="px-6 py-3.5 border-t border-[#CADDCB] bg-[#EDF5EE]">
          <View className="max-w-4xl w-full mx-auto flex-row items-center">
            {/* Micro Icon */}
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Voice Input', 'Multilingual speech recognition will be available in the upcoming release.')
              }
              style={{ width: 52, height: 52 }}
              className="bg-[#E0EDE1] border border-[#CADDCB] rounded-2xl justify-center items-center mr-3 shadow-xs"
              activeOpacity={0.7}
            >
              <Text className="text-xl">🎙</Text>
            </TouchableOpacity>

            {/* Text input */}
            <TextInput
              placeholder="Ask about schemes, appointments, documents..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend(inputText)}
              style={{ height: 52 }}
              className="flex-1 bg-[#F3F8F4] border border-[#CADDCB] px-4.5 rounded-2xl text-base font-semibold text-slate-900 mr-3"
            />

            {/* Send Button in Forest Green */}
            <TouchableOpacity
              onPress={() => handleSend(inputText)}
              style={{ width: 52, height: 52 }}
              className="bg-[#14532D] rounded-2xl justify-center items-center shadow-xs"
              activeOpacity={0.8}
            >
              <Text className="text-white text-xl font-bold">➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* CLEAR CHAT CONFIRMATION MODAL */}
      <Modal
        visible={showClearConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isClearing && setShowClearConfirmModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="w-full max-w-sm bg-[#F3F8F4] border border-[#CADDCB] rounded-3xl p-6 shadow-xl">
            <View className="w-14 h-14 rounded-2xl bg-red-100 border border-red-200 justify-center items-center mb-4 self-center">
              <Text className="text-2xl">🗑️</Text>
            </View>

            <Text className="text-lg font-black text-slate-900 text-center mb-1">
              Clear Conversation?
            </Text>

            <Text className="text-xs text-slate-600 text-center mb-4 leading-relaxed font-medium">
              Are you sure you want to clear your conversation with Smart Bharat AI? This will remove all previous questions and responses from this device and your secure MongoDB cloud history.
            </Text>

            {clearError ? (
              <View className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4">
                <Text className="text-xs text-red-700 font-bold text-center">{clearError}</Text>
              </View>
            ) : null}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowClearConfirmModal(false)}
                disabled={isClearing}
                style={{ minHeight: 48 }}
                className="flex-1 py-3.5 bg-[#EDF5EE] border border-[#CADDCB] rounded-2xl justify-center items-center"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-black text-slate-700 uppercase tracking-wider">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmClearChat}
                disabled={isClearing}
                style={{ minHeight: 48 }}
                className="flex-1 py-3.5 bg-red-600 rounded-2xl justify-center items-center flex-row"
                activeOpacity={0.85}
              >
                {isClearing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-black text-white uppercase tracking-wider">
                    Clear Chat
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
