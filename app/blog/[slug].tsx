/**
 * Koli One — Blog Post Detail Screen
 * Fetches post from Firestore `blog_posts` collection by slug.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Share2, Clock, Bookmark } from 'lucide-react-native';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { colors } from '../../src/styles/theme';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  body: string;
  imageUrl: string;
  readTime: string;
  publishedAt: Date;
}

export default function BlogPostScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const q = query(collection(db, 'blog_posts'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          const data = d.data();
          const pubAt = data.publishedAt instanceof Timestamp ? data.publishedAt.toDate() : new Date(data.publishedAt || Date.now());
          setPost({
            id: d.id,
            slug: data.slug || slug,
            title: data.title || '',
            body: data.body || '',
            imageUrl: data.imageUrl || '',
            readTime: data.readTime || '',
            publishedAt: pubAt,
          });
        }
      } catch { /* collection may not exist yet */ }
      setLoading(false);
    })();
  }, [slug]);

  const handleShare = async () => {
    await Share.share({ message: `Прочети тази статия на Koli One: https://koli.one/blog/${slug}`, url: `https://koli.one/blog/${slug}` });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
          <View />
        </View>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.brand.orange} /></View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><ArrowLeft size={24} color={colors.text.primary} /></TouchableOpacity>
          <View />
        </View>
        <View style={styles.center}>
          <Bookmark size={48} color={colors.text.disabled} />
          <Text style={styles.emptyTitle}>Статията не е намерена</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = post.publishedAt.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}><Bookmark size={22} color={colors.text.primary} /></TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.iconBtn}><Share2 size={22} color={colors.text.primary} /></TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.delay(100)}>
          {post.imageUrl ? (
            <Image source={{ uri: post.imageUrl }} style={styles.heroImage} contentFit="cover" transition={400} />
          ) : null}
          <View style={styles.content}>
            <View style={styles.meta}>
              <Clock size={14} color={colors.text.tertiary} />
              <Text style={styles.metaText}>{post.readTime ? `${post.readTime} • ` : ''}{formattedDate}</Text>
            </View>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.body}>{post.body}</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.paper },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  headerActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 100 },
  heroImage: { width: '100%', height: 240 },
  content: { padding: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  metaText: { fontSize: 13, color: colors.text.tertiary },
  title: { fontSize: 26, fontWeight: '800', color: colors.text.primary, lineHeight: 34, marginBottom: 20 },
  body: { fontSize: 16, lineHeight: 26, color: colors.text.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text.secondary, marginTop: 16, textAlign: 'center' },
  backBtn: { marginTop: 24, paddingVertical: 10, paddingHorizontal: 24, backgroundColor: colors.brand.orange, borderRadius: 12 },
  backBtnText: { color: '#FFF', fontWeight: '700' },
});
