import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity, ActivityIndicator, Alert, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialPublisherService } from '../../services/OfficialPublisherService';

interface SocialPublishButtonProps {
    adId: string;
    adData: any;
}

const ButtonContainer = styled.TouchableOpacity<{ active?: boolean }>`
  background-color: ${props => props.active ? '#1877F2' : 'rgba(0,0,0,0.6)'};
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  border: 1px solid ${props => props.active ? '#fff' : 'rgba(255,255,255,0.2)'};
  shadow-color: #1877F2;
  shadow-offset: 0px 0px;
  shadow-opacity: 0.8;
  shadow-radius: 10px;
  elevation: 5;
`;

const GlowCircle = styled(Animated.View)`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 22px;
  border-width: 2px;
  border-color: #1877F2;
  z-index: -1;
`;

export const SocialPublishButton: React.FC<SocialPublishButtonProps> = ({ adId, adData }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const glowAnim = new Animated.Value(0);

    useEffect(() => {
        if (loading) {
            startGlow();
        } else {
            glowAnim.setValue(0);
        }
    }, [loading]);

    const startGlow = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const handlePublish = async () => {
        Alert.alert(
            "نشر على فيسبوك",
            "هل تريد نشر هذا الإعلان الآن على صفحة Koli One الرسمية؟",
            [
                { text: "إلغاء", style: "cancel" },
                {
                    text: "نعم، انشر الآن",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await OfficialPublisherService.publishAd(adId, adData);
                            setSuccess(true);
                            Alert.alert("تم النشر بنجاح!", "الإعلان يظهر الآن على فيسبوك.");
                        } catch (error) {
                            Alert.alert("خطأ", "فشل الاتصال بنظام النشر الآلي.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const glowScale = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.4],
    });

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 0],
    });

    if (success) {
        return (
            <ButtonContainer active={true} disabled>
                <Ionicons name="checkmark-sharp" size={24} color="#fff" />
            </ButtonContainer>
        );
    }

    return (
        <ButtonContainer onPress={handlePublish} active={loading} activeOpacity={0.8}>
            {loading && (
                <GlowCircle style={{ transform: [{ scale: glowScale }], opacity: glowOpacity }} />
            )}
            {loading ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <Ionicons name="logo-facebook" size={24} color="#fff" />
            )}
        </ButtonContainer>
    );
};
