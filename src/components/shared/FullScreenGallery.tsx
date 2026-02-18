/**
 * Koli One — FullScreenGallery — Pinch-to-zoom image gallery overlay
 */
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, Platform, Modal } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  images: string[];
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
}

export default function FullScreenGallery({ images, initialIndex = 0, visible, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  const goTo = (idx: number) => {
    if (idx >= 0 && idx < images.length) {
      setCurrentIndex(idx);
      flatListRef.current?.scrollToIndex({ index: idx, animated: true });
    }
  };

  const renderImage = ({ item }: { item: string }) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const pinchGesture = Gesture.Pinch()
      .onUpdate((e) => { scale.value = savedScale.value * e.scale; })
      .onEnd(() => {
        if (scale.value < 1) scale.value = withTiming(1);
        if (scale.value > 4) scale.value = withTiming(4);
        savedScale.value = scale.value;
      });

    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        if (scale.value > 1) {
          scale.value = withTiming(1);
          savedScale.value = 1;
        } else {
          scale.value = withTiming(2.5);
          savedScale.value = 2.5;
        }
      });

    const composed = Gesture.Simultaneous(pinchGesture, doubleTapGesture);

    const animStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.imageContainer, animStyle]}>
          <Image
            source={{ uri: item }}
            style={styles.fullImage}
            contentFit="contain"
            transition={200}
          />
        </Animated.View>
      </GestureDetector>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <GestureHandlerRootView style={styles.overlay}>
        {/* Header */}
        <Animated.View entering={FadeIn} style={styles.header}>
          <Text style={styles.counter}>{currentIndex + 1} / {images.length}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Gallery */}
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImage}
          keyExtractor={(_, i) => i.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(idx);
          }}
        />

        {/* Navigation Arrows (tablets/large screens) */}
        {currentIndex > 0 && (
          <TouchableOpacity style={[styles.navArrow, styles.navLeft]} onPress={() => goTo(currentIndex - 1)}>
            <ChevronLeft size={28} color="#FFF" />
          </TouchableOpacity>
        )}
        {currentIndex < images.length - 1 && (
          <TouchableOpacity style={[styles.navArrow, styles.navRight]} onPress={() => goTo(currentIndex + 1)}>
            <ChevronRight size={28} color="#FFF" />
          </TouchableOpacity>
        )}

        {/* Pagination Dots */}
        <View style={styles.dots}>
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 34, paddingHorizontal: 16, paddingBottom: 12,
  },
  counter: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  closeBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  imageContainer: { width, height, justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: width, height: height * 0.8 },
  navArrow: {
    position: 'absolute', top: '50%', marginTop: -24, width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  navLeft: { left: 12 },
  navRight: { right: 12 },
  dots: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 44 : 24, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: '#FFF', width: 20 },
});
