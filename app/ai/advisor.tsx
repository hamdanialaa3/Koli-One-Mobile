/**
 * Koli One — AI Car Advisor Screen
 * Chat-based AI car recommendation assistant
 * Connected to geminiChat Cloud Function (europe-west1)
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Send, Bot, User, Sparkles, Car, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { colors } from '../../src/styles/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { app } from '../../src/services/firebase';
import { logger } from '../../src/services/logger-service';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: '🏠', label: 'Семейна кола', prompt: 'Търся семейна кола за 4 души, бюджет до 15000€' },
  { icon: '⚡', label: 'Електрическа', prompt: 'Искам електрическа кола с добър пробег' },
  { icon: '🏎️', label: 'Спортна', prompt: 'Търся спортна кола с добра динамика' },
  { icon: '💰', label: 'Бюджетна', prompt: 'Най-добрата кола до 5000€' },
  { icon: '🚙', label: 'SUV', prompt: 'Търся SUV подходящ за планински пътища' },
  { icon: '🔧', label: 'Евтина поддръжка', prompt: 'Кола с ниска цена на поддръжка' },
];

export default function AIAdvisorScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    id: '0', role: 'assistant', content:
      'Здравейте! 👋 Аз съм AI консултант на Koli One. Кажете ми какъв тип кола търсите — бюджет, предпочитания, употреба — и ще ви предложа най-добрите варианти от нашия каталог!',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const functions = getFunctions(app, 'europe-west1');

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for context
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const geminiChat = httpsCallable(functions, 'geminiChat');
      const response = await geminiChat({
        messages: history,
        systemPrompt: `Ти си AI консултант на Koli One — българска платформа за покупко-продажба на автомобили. 
Отговаряй на български (освен ако потребителят пише на английски). 
Помагай с: препоръки за коли, ценови анализ, сравнения, поддръжка, пазарни тенденции в България.
Бъди конкретен, информативен и приятелски настроен. Използвай emoji умерено.
Когато препоръчваш коли, споменавай, че могат да бъдат намерени в Koli One.`,
        context: 'car_advisor',
        userId: user?.uid || 'anonymous',
      });

      const data = response.data as any;
      const aiContent = data?.content || data?.response || data?.text || 
        'Извинете, не успях да обработя заявката. Моля, опитайте отново.';

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      logger.error('AI Advisor Error', err);
      
      // Provide meaningful fallback on error
      const errorMsg = err?.code === 'functions/resource-exhausted'
        ? 'Достигнахте лимита за AI запитвания. Моля, опитайте по-късно или надградете плана си.'
        : err?.code === 'functions/unauthenticated'
        ? 'Моля, влезте в акаунта си, за да използвате AI консултанта.'
        : 'Възникна грешка при свързване с AI. Моля, проверете интернет връзката си и опитайте отново.';
      
      setError(errorMsg);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ ${errorMsg}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, user]);

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === 'user';
    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).duration(300)}
        style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}
      >
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Bot size={18} color={colors.brand.orange} />
          </View>
        )}
        <View style={[styles.messageContent, isUser ? styles.userContent : styles.aiContent]}>
          <Text style={[styles.messageText, isUser && styles.userText]}>{item.content}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <Sparkles size={20} color={colors.brand.orange} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Консултант</Text>
            <Text style={styles.headerSub}>Вашият автомобилен експерт</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={loading ? (
          <View style={styles.typingIndicator}>
            <Bot size={16} color={colors.brand.orange} />
            <Text style={styles.typingText}>AI мисли...</Text>
            <ActivityIndicator size="small" color={colors.brand.orange} />
          </View>
        ) : null}
      />

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <Animated.View entering={FadeInDown.delay(300)} style={styles.promptsContainer}>
          <Text style={styles.promptsTitle}>Бързи въпроси:</Text>
          <View style={styles.promptsGrid}>
            {QUICK_PROMPTS.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={styles.promptChip}
                onPress={() => sendMessage(p.prompt)}
              >
                <Text style={styles.promptIcon}>{p.icon}</Text>
                <Text style={styles.promptLabel}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Опишете какво търсите..."
            placeholderTextColor={colors.text.tertiary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <LinearGradient colors={['#7B2FBE', '#9C5FE0']} style={styles.sendGrad}>
              <Send size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, backgroundColor: colors.background.paper,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 8 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,121,0,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  headerSub: { fontSize: 12, color: colors.text.secondary },
  messagesList: { padding: 16, paddingBottom: 80 },
  messageBubble: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,121,0,0.1)',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  messageContent: { maxWidth: '78%', padding: 14, borderRadius: 18 },
  userContent: {
    backgroundColor: colors.primary.main, borderBottomRightRadius: 4,
  },
  aiContent: {
    backgroundColor: colors.background.paper, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: colors.border.light,
  },
  messageText: { fontSize: 15, lineHeight: 22, color: colors.text.primary },
  userText: { color: '#FFFFFF' },
  typingIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingLeft: 48,
  },
  typingText: { fontSize: 13, color: colors.text.secondary, fontStyle: 'italic' },
  promptsContainer: { paddingHorizontal: 16, paddingBottom: 12 },
  promptsTitle: { fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 10 },
  promptsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  promptChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    backgroundColor: colors.background.paper, borderWidth: 1, borderColor: colors.border.default,
  },
  promptIcon: { fontSize: 16 },
  promptLabel: { fontSize: 13, fontWeight: '600', color: colors.text.primary },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12,
    paddingVertical: 8, backgroundColor: colors.background.paper,
    borderTopWidth: 1, borderTopColor: colors.border.light, gap: 8,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 100, borderRadius: 22,
    backgroundColor: colors.background.subtle, paddingHorizontal: 18,
    paddingVertical: 12, fontSize: 15, color: colors.text.primary,
  },
  sendBtn: { width: 44, height: 44 },
  sendDisabled: { opacity: 0.4 },
  sendGrad: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
});
