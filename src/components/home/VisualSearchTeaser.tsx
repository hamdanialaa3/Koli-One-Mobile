/**
 * VisualSearchTeaser.tsx (Mobile)
 * 🎯 UNIQUE COMPETITIVE ADVANTAGE - AI-powered Visual Search
 * 
 * Features:
 * ✅ Camera capture for car images
 * ✅ Photo gallery selection
 * ✅ AI-powered car recognition
 * ✅ Instant search from image
 */

import React, { useState } from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Upload, Sparkles, Zap } from 'lucide-react-native';
import { TouchableOpacity, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/theme';

const Container = styled.View`
  padding: 24px 16px;
  margin: 16px 0;
  background-color: rgba(15, 23, 42, 0.8);
  border-radius: 24px;
  border-width: 1px;
  border-color: rgba(147, 51, 234, 0.3);
  ${({ theme }) => Platform.OS === 'web' ? {
    boxShadow: '0px 12px 30px rgba(147, 51, 234, 0.25)'
  } : {
    shadowColor: theme.colors.accent.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8
  }}
`;

const ContentWrapper = styled.View`
  align-items: center;
`;

const Badge = styled(LinearGradient).attrs({
  colors: ['#9333ea', '#3b82f6'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 }
})`
  flex-direction: row;
  align-items: center;
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 16px;
  align-self: center;
`;

const BadgeText = styled.Text`
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-left: 6px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  line-height: 20px;
  margin-bottom: 24px;
`;

const ButtonsContainer = styled.View`
  flex-direction: row;
  gap: 16px;
  width: 100%;
  margin-top: 8px;
`;

const ActionButton = styled.Pressable<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 16px;
  background-color: ${({ variant }) =>
    variant === 'primary'
      ? '#9333ea'
      : 'rgba(59, 130, 246, 0.1)'};
  border-width: 1.5px;
  border-color: ${({ variant }) =>
    variant === 'primary'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(59, 130, 246, 0.4)'};
  ${Platform.OS === 'web' ? {
    boxShadow: '0px 0px 15px rgba(147, 51, 234, 0.4)'
  } : {}}
`;

const ButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  font-size: 14px;
  font-weight: 800;
  margin-left: 8px;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FeaturesContainer = styled.View`
  margin-top: 24px;
  padding-top: 20px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border.default}40;
`;

const FeatureRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const FeatureText = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-left: 10px;
  flex: 1;
`;

const IconWrapper = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${({ theme }) => `${theme.colors.accent.main}15`};
  align-items: center;
  justify-content: center;
`;

export default function VisualSearchTeaser() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleCameraSearch = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission',
          'We need camera access to take photos of cars for search.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        // Navigate to visual search results
        // @ts-ignore - navigation typing
        navigation.navigate('VisualSearch', { imageUri: result.assets[0].uri });
        setLoading(false);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const handleGallerySearch = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Gallery Permission',
          'We need gallery access to select car photos for search.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        // Navigate to visual search results
        // @ts-ignore - navigation typing
        navigation.navigate('VisualSearch', { imageUri: result.assets[0].uri });
        setLoading(false);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  return (
    <Container theme={theme}>
      <ContentWrapper>
        <Badge colors={['#9333ea', '#3b82f6']}>
          <Sparkles color="#ffffff" size={14} />
          <BadgeText>NEW AI FEATURE</BadgeText>
        </Badge>

        <Title theme={theme}>Search by Photo</Title>

        <Subtitle theme={theme}>
          Take a photo or upload an image of any car to find similar listings instantly with AI
        </Subtitle>

        <ButtonsContainer>
          <ActionButton
            variant="primary"
            theme={theme}
            onPress={handleCameraSearch}
            disabled={loading}
          >
            <Camera color="#ffffff" size={20} />
            <ButtonText variant="primary" theme={theme}>Camera</ButtonText>
          </ActionButton>

          <ActionButton
            variant="secondary"
            theme={theme}
            onPress={handleGallerySearch}
            disabled={loading}
          >
            <Upload color={theme.colors.accent.main} size={20} />
            <ButtonText variant="secondary" theme={theme}>Gallery</ButtonText>
          </ActionButton>
        </ButtonsContainer>

        <FeaturesContainer theme={theme}>
          <FeatureRow>
            <IconWrapper theme={theme}>
              <Zap color={theme.colors.accent.main} size={16} />
            </IconWrapper>
            <FeatureText theme={theme}>
              Instant AI-powered car recognition
            </FeatureText>
          </FeatureRow>

          <FeatureRow>
            <IconWrapper theme={theme}>
              <Sparkles color={theme.colors.accent.main} size={16} />
            </IconWrapper>
            <FeatureText theme={theme}>
              Find similar cars from any photo
            </FeatureText>
          </FeatureRow>

          <FeatureRow>
            <IconWrapper theme={theme}>
              <Camera color={theme.colors.accent.main} size={16} />
            </IconWrapper>
            <FeatureText theme={theme}>
              Works with photos from web or real life
            </FeatureText>
          </FeatureRow>
        </FeaturesContainer>
      </ContentWrapper>
    </Container>
  );
}
