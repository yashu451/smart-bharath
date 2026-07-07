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
} from 'react-native';
import { useRouter } from 'expo-router';

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

const MOCK_AI_RESPONSES: { [key: string]: string } = {
  'Passport Application': `To apply for a new passport or renewal:
1. Select "Office Visits" on your Dashboard.
2. Choose "Passport Office" and select your service (e.g. New Passport).
3. Select your location and preferred date/time slot.
4. Confirm details to generate your digital entry gatepass.`,

  'Government Schemes': `To find schemes matched to your profile:
1. Tapping the "Scheme Finder" card on the Dashboard opens the questionnaire.
2. Input parameters like state, age, and annual family income.
3. Our AI matches your details against 1,400+ government programs.
4. Access direct detail pages to review eligibility rules.`,

  'Report a Complaint': `If you face local public issues (potholes, sanitation, water, streetlights):
1. Navigate to "Civic Grievances" from the Dashboard.
2. Select the category (e.g. Roads & Potholes) and fill out the report form.
3. Upon submission, you will receive a secure Tracking ID.
4. Track real-time progress steps from registration to resolution.`,

  'DigiLocker Help': `DigiLocker lets you access verified official certificates safely:
1. Select "DigiLocker" from the Dashboard.
2. Complete the biometric e-KYC identity verification.
3. Once verified, navigate to "My Documents" to view Aadhaar, PAN, and other certificates.
4. These documents are legally valid under the IT Act.`,

  'Office Visit': `To schedule an office appointment:
1. Select "Office Visits" from the Dashboard.
2. Pick the department (e.g. Transport Department RTO, Municipal).
3. Select the required service.
4. Confirm date, time slot, and location. Present your QR ticket at the office gate.`,

  'Income Certificate': `To obtain an Income Certificate:
1. Go to "Office Visits" and choose the "Revenue Department".
2. Select the "Income Certificate Request" service.
3. Confirm your schedule and purpose details.
4. Present your secure ticket at your local SDM office desk.`
};

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

    const applyFallbackOrError = () => {
      const mockResponse = MOCK_AI_RESPONSES[userText];
      setIsTyping(false);
      if (mockResponse) {
        setMessages((prev) => [
          ...prev,
          { id: String(prev.length + 1), text: mockResponse, sender: 'ai', timestamp, suggestedAction: action },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: String(prev.length + 1), text: errMessage, sender: 'ai', timestamp, suggestedAction: action },
        ]);
      }
    };

    if (!apiKey || apiKey.trim() === '') {
      const errorMsg = 'Gemini API key is missing or empty. Please add EXPO_PUBLIC_GEMINI_API_KEY to your env variables.';
      console.error(errorMsg);
      applyFallbackOrError();
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
    } catch (error: any) {
      console.error('Gemini API call failed with exception, falling back to mock or error message:', error);
      console.error('Actual Error Message:', error?.message || String(error));
      applyFallbackOrError();
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
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 justify-center items-center mr-3"
        >
          <Text className="text-slate-700 font-bold text-lg">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-800">Smart AI Assistant</Text>
          <Text className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight mt-0.5">
            Your multilingual AI civic companion.
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Suggestion Chips list below header */}
        <View className="py-3 px-4 border-b border-slate-100 bg-slate-50/50">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {SUGGESTIONS.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSuggestionPress(chip)}
                className="bg-white border border-slate-200 px-4 py-2 rounded-full mr-2.5 shadow-sm shadow-black/[0.02]"
              >
                <Text className="text-slate-650 font-bold text-xs">{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Scrollable Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <View className={`mb-4 ${item.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <View className={`max-w-[80%] p-4 rounded-2xl ${item.sender === 'user'
                  ? 'bg-bharat-navy rounded-tr-none flex-col'
                  : 'bg-slate-50 border border-slate-150 rounded-tl-none flex-col'
                }`}>
                <Text className={`text-xs leading-relaxed font-semibold ${item.sender === 'user' ? 'text-white' : 'text-slate-800'
                  }`}>
                  {item.text}
                </Text>
                {item.timestamp ? (
                  <Text className={`text-[8px] mt-1.5 text-right font-extrabold uppercase ${item.sender === 'user' ? 'text-slate-300/80' : 'text-slate-400'
                    }`}>
                    {item.timestamp}
                  </Text>
                ) : null}
              </View>

              {/* Clickable suggested action card below AI bubble */}
              {item.sender === 'ai' && item.suggestedAction ? (
                <TouchableOpacity
                  onPress={() => handleSuggestedActionPress(item.suggestedAction!)}
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                  className="bg-white border border-slate-200 p-3.5 rounded-2xl mt-2 flex-row items-center w-[75%] border-l-4 border-l-bharat-accent"
                >
                  <Text className="text-lg mr-2.5">
                    {item.suggestedAction === 'Open DigiLocker' ? '📁' :
                      item.suggestedAction === 'Report Complaint' ? '📢' :
                        item.suggestedAction === 'Open Scheme Finder' ? '🌾' : '📅'}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Suggested Action</Text>
                    <Text className="text-xs font-bold text-slate-850 mt-0.5">{item.suggestedAction}</Text>
                  </View>
                  <Text className="text-slate-350 text-xs ml-2">→</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
          ListFooterComponent={() => (
            isTyping ? (
              <View className="flex-row items-center space-x-2 pl-4 py-2">
                <ActivityIndicator size="small" color="#4A90E2" />
                <Text className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">AI is typing...</Text>
              </View>
            ) : null
          )}
        />

        {/* Chat Input Bar */}
        <View className="px-5 py-4 border-t border-slate-100 bg-white flex-row items-center space-x-3">

          {/* Micro Icon (UI only) */}
          <TouchableOpacity
            onPress={() => Alert.alert('Voice Input', 'Multilingual speech recognition will be integrated in future phases.')}
            className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-full justify-center items-center"
          >
            <Text className="text-lg">🎙</Text>
          </TouchableOpacity>

          {/* Text input */}
          <TextInput
            placeholder="Type your question..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend(inputText)}
            className="flex-1 bg-slate-50 border border-slate-200 px-4 h-11 rounded-full text-xs font-semibold text-slate-800"
          />

          {/* Send Button */}
          <TouchableOpacity
            onPress={() => handleSend(inputText)}
            className="w-11 h-11 bg-bharat-accent rounded-full justify-center items-center"
          >
            <Text className="text-white text-sm font-bold">➔</Text>
          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
