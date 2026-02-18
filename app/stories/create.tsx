/**
 * stories/create.tsx — Create a Car Story
 * Image/video picker + metadata form → Firestore `stories` write
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/styles/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../src/services/firebase';
import { logger } from '../../src/services/logger-service';

type StoryType = 'review' | 'roadtrip' | 'build' | 'tips';

const TYPE_OPTIONS: { key: StoryType; label: string; icon: string }[] = [
  { key: 'review', label: 'Ревю', icon: 'star-outline' },
  { key: 'roadtrip', label: 'Пътуване', icon: 'car-sport-outline' },
  { key: 'build', label: 'Проект', icon: 'construct-outline' },
  { key: 'tips', label: 'Съвет', icon: 'bulb-outline' },
];

export default function CreateStoryScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [storyType, setStoryType] = useState<StoryType>('review');
  const [images, setImages] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Разрешение', 'Имаме нужда от достъп до галерията.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 5));
    }
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadImage = async (uri: string, index: number): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `stories/${user!.uid}/${Date.now()}_${index}.jpg`;
    const storageRef = ref(storage, filename);
    const task = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        null,
        (err) => reject(err),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handlePublish = async () => {
    if (!user) {
      Alert.alert('Вход', 'Влезте в профила си, за да публикувате.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Грешка', 'Моля, добавете заглавие.');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Грешка', 'Моля, добавете поне една снимка.');
      return;
    }

    setPosting(true);
    try {
      // Upload images
      const imageUrls = await Promise.all(
        images.map((uri, idx) => uploadImage(uri, idx))
      );

      // Write to Firestore
      await addDoc(collection(db, 'stories'), {
        title: title.trim(),
        description: description.trim(),
        type: storyType,
        imageUrl: imageUrls[0], // Primary image
        images: imageUrls,
        creatorId: user.uid,
        creatorName: user.displayName || 'Потребител',
        creatorAvatar: user.photoURL || '',
        likes: 0,
        views: 0,
        isLive: false,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Успех! 🎉', 'Вашата история е публикувана.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      logger.error('Story publish failed', err);
      Alert.alert('Грешка', 'Неуспешно публикуване. Опитайте отново.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Нова история</Text>
            <TouchableOpacity
              onPress={handlePublish}
              disabled={posting}
              style={[styles.publishBtn, posting && { opacity: 0.5 }]}
            >
              {posting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.publishText}>Публикувай</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Type Selector */}
          <Text style={styles.sectionLabel}>Категория</Text>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.typeChip,
                  storyType === opt.key && styles.typeChipActive,
                ]}
                onPress={() => setStoryType(opt.key)}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={18}
                  color={storyType === opt.key ? '#fff' : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    storyType === opt.key && styles.typeChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={styles.sectionLabel}>Заглавие</Text>
          <TextInput
            style={styles.input}
            placeholder="Напр. Тест драйв на BMW M3"
            placeholderTextColor={colors.text.disabled}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Description */}
          <Text style={styles.sectionLabel}>Описание (по избор)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Разкажете вашата история..."
            placeholderTextColor={colors.text.disabled}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          {/* Image Picker */}
          <Text style={styles.sectionLabel}>
            Снимки ({images.length}/5)
          </Text>
          <View style={styles.imageRow}>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imageThumb}>
                <Image source={{ uri }} style={styles.thumbImg} contentFit="cover" />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(idx)}>
                  <Ionicons name="close-circle" size={22} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <Ionicons name="camera-outline" size={28} color={colors.text.disabled} />
                <Text style={styles.addImageText}>Добави</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  scroll: { padding: 20, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  publishBtn: {
    backgroundColor: colors.brand.orange,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  publishText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
    marginTop: 16,
  },
  typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.paper,
  },
  typeChipActive: {
    backgroundColor: colors.brand.orange,
    borderColor: colors.brand.orange,
  },
  typeChipText: { fontSize: 13, fontWeight: '500', color: colors.text.secondary },
  typeChipTextActive: { color: '#fff', fontWeight: '600' },
  input: {
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text.primary,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageThumb: { width: 90, height: 90, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  thumbImg: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 2, right: 2 },
  addImageBtn: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: { fontSize: 11, color: colors.text.disabled, marginTop: 2 },
});
