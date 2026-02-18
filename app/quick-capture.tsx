/**
 * Quick Capture Mode
 * ──────────────────
 * Opens the camera immediately — user snaps photos of a car,
 * each photo is auto-added to the sell store as a draft.
 * When done, the user is routed to the sell wizard (step 1)
 * with images already queued, so they just fill in details.
 *
 * Requirement from Mobile_app_promt.md:
 * "زر واحد Add Car Now يفتح الكاميرا مباشرة، يحفظ كل شيء كـ Draft تلقائياً"
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SmartCamera from '../src/components/SmartCamera';
import { useSellStore, ImageItem } from '../src/store/useSellStore';
import { theme } from '../src/styles/theme';
import { logger } from '../src/services/logger-service';

export default function QuickCaptureScreen() {
    const router = useRouter();
    const { addImage, images, resetForm } = useSellStore();
    const [photoCount, setPhotoCount] = useState(0);

    /** Called each time SmartCamera captures a photo */
    const handleCapture = useCallback((photo: any) => {
        if (!photo?.uri) return;

        const newImage: ImageItem = {
            id: `qc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            uri: photo.uri,
            status: 'idle',
            progress: 0,
        };

        addImage(newImage);
        setPhotoCount(prev => prev + 1);
        logger.info('Quick Capture: photo added', { id: newImage.id });
    }, [addImage]);

    /** User taps "Done" — navigate to sell wizard with queued images */
    const handleDone = useCallback(() => {
        if (photoCount === 0) {
            // No photos taken — just go back
            router.back();
            return;
        }
        // Go to sell wizard — images are already in the store
        router.replace('/(tabs)/sell');
    }, [photoCount, router]);

    /** Cancel — discard captured images and go back */
    const handleClose = useCallback(() => {
        if (photoCount > 0) {
            // Remove only images we added in this session (qc- prefix)
            const store = useSellStore.getState();
            const qcImages = store.images.filter(i => i.id.startsWith('qc-'));
            qcImages.forEach(i => store.removeImage(i.id));
        }
        router.back();
    }, [photoCount, router]);

    return (
        <View style={styles.container}>
            <SmartCamera onCapture={handleCapture} onClose={handleClose} />

            {/* Floating counter + Done button */}
            <SafeAreaView style={[styles.overlay, { pointerEvents: 'box-none' }]}>
                <View style={styles.bottomBar}>
                    <View style={styles.counter}>
                        <Ionicons name="images" size={20} color="#fff" />
                        <Text style={styles.counterText}>{photoCount} photo{photoCount !== 1 ? 's' : ''}</Text>
                    </View>

                    {photoCount > 0 && (
                        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                            <Text style={styles.doneText}>Continue</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 120, // above camera controls
    },
    counter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    counterText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 6,
    },
    doneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary.main,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    doneText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});
