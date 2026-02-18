/**
 * Koli One — Create Social Post
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Camera, ImageIcon, MapPin, Hash, X, Video, Smile } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/styles/theme';
import { db, auth, storage } from '../../src/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const QUICK_TAGS = ['#Автомобили', '#BMW', '#Mercedes', '#Тунинг', '#Drifting', '#Offroad', '#Електромобили', '#CarMeet'];

export default function CreatePostScreen() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [location, setLocation] = useState('');

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 6,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages([...images, ...result.assets.map(a => a.uri)].slice(0, 6));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setImages([...images, result.assets[0].uri].slice(0, 6));
    }
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert('Празна публикация', 'Добавете текст или снимки');
      return;
    }
    if (!auth.currentUser) {
      Alert.alert('Вход', 'Моля, влезте в профила си за да публикувате.');
      return;
    }
    setPosting(true);
    try {
      // Upload images to Storage
      const imageUrls: string[] = [];
      for (const uri of images) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = `social-posts/${auth.currentUser.uid}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }
      // Write post to Firestore
      await addDoc(collection(db, 'social_posts'), {
        authorId: auth.currentUser.uid,
        content: content.trim(),
        images: imageUrls,
        tags: selectedTags,
        location: location.trim() || null,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      Alert.alert('Грешка', 'Неуспешна публикация. Опитайте отново.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Нова публикация</Text>
        <TouchableOpacity onPress={handlePost} style={[styles.postBtn, (!content.trim() && !images.length) && styles.postBtnDisabled]}>
          <Text style={styles.postBtnText}>Публикувай</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Content Input */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <TextInput
            style={styles.textArea}
            value={content}
            onChangeText={setContent}
            placeholder="Какво ново с вашия автомобил? Споделете моментите си..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={1000}
            autoFocus
          />
          <Text style={styles.charCount}>{content.length}/1000</Text>
        </Animated.View>

        {/* Image Grid */}
        {images.length > 0 && (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.imageGrid}>
            {images.map((uri, i) => (
              <View key={i} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.previewImage} contentFit="cover" />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
                  <X size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 6 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <ImageIcon size={24} color={colors.text.disabled} />
                <Text style={styles.addImageText}>+{6 - images.length}</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* Location */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <View style={styles.locationRow}>
            <MapPin size={18} color={colors.text.secondary} />
            <TextInput
              style={styles.locationInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Добави локация..."
              placeholderTextColor={colors.text.tertiary}
            />
          </View>
        </Animated.View>

        {/* Quick Tags */}
        <Animated.View entering={FadeInUp.delay(400)}>
          <Text style={styles.tagTitle}>Бързи тагове</Text>
          <View style={styles.tagGrid}>
            {QUICK_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={pickImages}>
          <ImageIcon size={22} color={colors.text.secondary} />
          <Text style={styles.toolLabel}>Галерия</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={takePhoto}>
          <Camera size={22} color={colors.text.secondary} />
          <Text style={styles.toolLabel}>Камера</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 0.8 });
          if (!result.canceled) {
            setImages([...images, result.assets[0].uri].slice(0, 6));
          }
        }}>
          <Video size={22} color={colors.text.secondary} />
          <Text style={styles.toolLabel}>Видео</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => {
          const tagStr = selectedTags.length > 0 ? '' : QUICK_TAGS[0];
          if (tagStr) toggleTag(tagStr);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}>
          <Hash size={22} color={colors.text.secondary} />
          <Text style={styles.toolLabel}>Таг</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => {
          setContent(prev => prev + ' 🚗');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}>
          <Smile size={22} color={colors.text.secondary} />
          <Text style={styles.toolLabel}>Емоджи</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.background.paper,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  postBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.brand.orange },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  content: { padding: 16 },
  textArea: {
    fontSize: 16, lineHeight: 24, color: colors.text.primary, minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 12, color: colors.text.disabled, textAlign: 'right', marginTop: 4 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  imageWrapper: { position: 'relative' },
  previewImage: { width: 100, height: 100, borderRadius: 12 },
  removeBtn: {
    position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  addImageBtn: {
    width: 100, height: 100, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed',
    borderColor: colors.border.default, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addImageText: { fontSize: 12, color: colors.text.disabled },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, paddingVertical: 12,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border.light,
  },
  locationInput: { flex: 1, fontSize: 15, color: colors.text.primary },
  tagTitle: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginTop: 16, marginBottom: 10 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18,
    backgroundColor: colors.background.paper, borderWidth: 1, borderColor: colors.border.default,
  },
  tagChipActive: { backgroundColor: colors.brand.orange, borderColor: colors.brand.orange },
  tagText: { fontSize: 13, fontWeight: '500', color: colors.text.secondary },
  tagTextActive: { color: '#FFF' },
  toolbar: {
    flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10, backgroundColor: colors.background.paper,
    borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  toolBtn: { alignItems: 'center', gap: 2 },
  toolLabel: { fontSize: 10, color: colors.text.secondary },
});
