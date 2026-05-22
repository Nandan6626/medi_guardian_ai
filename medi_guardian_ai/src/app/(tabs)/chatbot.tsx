import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Send, Bot, Stethoscope } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAppStore } from '../../store/useAppStore';
import { GoogleGenAI } from '@google/genai';

type Message = {
  id: string;
  text: string;
  role: 'user' | 'model';
  timestamp: Date;
};

export default function ChatbotScreen() {
  const user = useAppStore((state) => state.user);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello ${user?.name || 'Arthur'}. I notice you haven't taken your evening dose of Atorvastatin yet. Would you like me to send a reminder to your caregiver, or are you taking it now?`,
      role: 'model',
      timestamp: new Date(),
    }
  ]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMsg: Message = { 
      id: Date.now().toString(), 
      text: inputText.trim(), 
      role: 'user', 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    Keyboard.dismiss();

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key missing. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: "You are MediAI, an empathetic and highly knowledgeable geriatric assistant specializing in medication adherence, general healthcare guidance, and medicine side effects. Keep answers concise, friendly, and easy to read." }] },
          { role: 'model', parts: [{ text: "Understood. I am MediAI." }] },
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMsg.text }] }
        ]
      });
      
      if (response.text) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: response.text,
          role: 'model',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: error.message?.includes("API Key missing") 
          ? "I am currently offline. Please provide an API key in your .env file to connect me to my brain."
          : "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        role: 'model',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.headerIconWrapper}>
          <Bot size={24} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.headerTitle}>MediAI Assistant</Text>
          <Text style={styles.headerStatus}>Online • Specialized in Geriatrics</Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.chatContainer} 
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={msg.role === 'model' ? styles.aiMessageContainer : styles.userMessageContainer}
          >
            {msg.role === 'model' && (
              <View style={styles.aiAvatar}>
                <Stethoscope size={20} color={Colors.surface} />
              </View>
            )}
            
            <View style={msg.role === 'model' ? styles.aiBubble : styles.userBubble}>
              <Text style={styles.messageText}>{msg.text}</Text>
              <Text style={[styles.timeText, msg.role === 'user' && { color: 'rgba(255,255,255,0.7)' }]}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}

        {/* AI Typing Indicator */}
        {isTyping && (
          <View style={styles.aiMessageContainer}>
            <View style={styles.aiAvatar}>
              <Bot size={20} color={Colors.surface} />
            </View>
            <View style={[styles.aiBubble, styles.typingBubble]}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, { opacity: 0.7 }]} />
              <View style={[styles.typingDot, { opacity: 0.4 }]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask MediAI..."
          placeholderTextColor={Colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isTyping}>
          <Send size={20} color={Colors.surface} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  headerStatus: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 4,
  },
  chatContainer: {
    padding: 24,
    paddingBottom: 100, // Space for bottom tab bar
  },
  aiMessageContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    maxWidth: '85%',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiBubble: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  userMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  userBubble: {
    backgroundColor: Colors.secondary,
    padding: 16,
    borderRadius: 20,
    borderTopRightRadius: 4,
    maxWidth: '85%',
  },
  messageText: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  timeText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginHorizontal: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 90, // Accounts for tab bar
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 48,
    maxHeight: 120,
    color: Colors.text,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
});
