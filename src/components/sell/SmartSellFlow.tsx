/**
 * Smart Sell Flow - TASK-14
 * "تصوير سيارة → AI يملأ الفورم"
 * 
 * Photo → AI Analysis → Auto-fill Sell Form
 * 
 * Location: Bulgaria | Languages: BG/EN
 * Created: February 2026
 */

import React, { useState } from 'react';
import {  View, Text, ActivityIndicator, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SmartCamera from '../SmartCamera';
import { aiService, CarData } from '../../services/ai/ai.service';
import { logger } from '../../services/logger-service';
import { theme } from '../../styles/theme';
import { useLanguage } from '../../contexts/LanguageContext';

// ==================== INTERFACES ====================

interface SmartSellFlowProps {
  visible: boolean;
  onClose: () => void;
}

type FlowStage = 'camera' | 'analyzing' | 'preview' | 'error';

// ==================== COMPONENT ====================

export const SmartSellFlow: React.FC<SmartSellFlowProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { language } = useLanguage();
  const isBG = language === 'bg';
  
  const [stage, setStage] = useState<FlowStage>('camera');
  const [capturedPhoto, setCapturedPhoto] = useState<any>(null);
  const [analyzedData, setAnalyzedData] = useState<Partial<CarData> | null>(null);
  const [error, setError] = useState<string>('');
  
  // Use the exported singleton instance
  
  // ==================== HANDLERS ====================
  
  const handlePhotoCapture = async (photo: any) => {
    logger.info('Photo captured for Smart Sell', { uri: photo.uri });
    
    setCapturedPhoto(photo);
    setStage('analyzing');
    
    try {
      // Analyze photo with AI
      const base64Image = photo.base64 || '';
      
      if (!base64Image) {
        throw new Error('No base64 image data');
      }
      
      logger.info('Starting AI analysis...');
      const carData = await aiService.analyzeCarImage(base64Image);
      
      if (!carData.make || !carData.model) {
        throw new Error(isBG ? 'لم يتمكن الذكاء الاصطناعي من التعرف على السيارة' : 'AI could not recognize the car');
      }
      
      logger.info('AI analysis completed', { make: carData.make, model: carData.model });
      setAnalyzedData(carData);
      setStage('preview');
      
    } catch (err) {
      logger.error('AI analysis failed', err as Error);
      setError((err as Error).message || 'Analysis failed');
      setStage('error');
    }
  };
  
  const handleRetry = () => {
    setCapturedPhoto(null);
    setAnalyzedData(null);
    setError('');
    setStage('camera');
  };
  
  const handleContinueToForm = () => {
    if (!analyzedData) return;
    
    // Navigate to sell wizard with pre-filled data
    // We'll use router push with query params
    const params: any = {};
    
    if (analyzedData.make) params.make = analyzedData.make;
    if (analyzedData.model) params.model = analyzedData.model;
    if (analyzedData.year) params.year = analyzedData.year.toString();
    if (analyzedData.condition) params.condition = analyzedData.condition;
    if (analyzedData.equipment && analyzedData.equipment.length > 0) {
      // Store color from equipment array
      params.color = analyzedData.equipment[0];
    }
    
    // Close modal
    onClose();
    
    // Navigate to sell wizard with pre-filled data
    router.push({
      pathname: '/(tabs)/sell',
      params
    });
    
    logger.info('Navigating to sell form with AI data', params);
  };
  
  const handleClose = () => {
    handleRetry();
    onClose();
  };
  
  // ==================== RENDER STAGES ====================
  
  const renderAnalyzingStage = () => (
    <AnalyzingContainer theme={theme}>
      <Image source={{ uri: capturedPhoto?.uri }} style={{ width: 200, height: 150, borderRadius: 12, marginBottom: 24 }} />
      
      <ActivityIndicator size="large" color={theme.colors.primary.main} />
      
      <Title theme={theme}>{isBG ? 'الذكاء الاصطناعي يحلل الصورة...' : 'AI Analyzing Photo...'}</Title>
      
      <Description theme={theme}>
        {isBG 
          ? 'جاري التعرف على الماركة، الموديل، السنة، اللون والحالة'
          : 'Detecting make, model, year, color and condition'}
      </Description>
      
      <AnimatedDots>🚗 🤖 ✨</AnimatedDots>
    </AnalyzingContainer>
  );
  
  const renderPreviewStage = () => (
    <PreviewContainer theme={theme}>
      <CloseButton onPress={handleClose}>
        <Ionicons name="close-circle" size={36} color={theme.colors.text.secondary} />
      </CloseButton>
      
      <Image source={{ uri: capturedPhoto?.uri }} style={{ width: '100%', height: 250, borderRadius: 16, marginBottom: 24 }} />
      
      <SuccessBadge theme={theme}>
        <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
        <SuccessText theme={theme}>
          {isBG ? 'تم التعرف على السيارة!' : 'Car Recognized!'}
        </SuccessText>
      </SuccessBadge>
      
      <DataSection theme={theme}>
        <SectionTitle theme={theme}>{isBG ? 'البيانات المستخرجة' : 'Extracted Data'}</SectionTitle>
        
        {analyzedData?.make && (
          <DataRow theme={theme}>
            <DataLabel theme={theme}>{isBG ? 'الماركة' : 'Make'}:</DataLabel>
            <DataValue theme={theme}>{analyzedData.make}</DataValue>
          </DataRow>
        )}
        
        {analyzedData?.model && (
          <DataRow theme={theme}>
            <DataLabel theme={theme}>{isBG ? 'الموديل' : 'Model'}:</DataLabel>
            <DataValue theme={theme}>{analyzedData.model}</DataValue>
          </DataRow>
        )}
        
        {analyzedData?.year && (
          <DataRow theme={theme}>
            <DataLabel theme={theme}>{isBG ? 'السنة' : 'Year'}:</DataLabel>
            <DataValue theme={theme}>{analyzedData.year}</DataValue>
          </DataRow>
        )}
        
        {analyzedData?.equipment && analyzedData.equipment.length > 0 && (
          <DataRow theme={theme}>
            <DataLabel theme={theme}>{isBG ? 'اللون' : 'Color'}:</DataLabel>
            <DataValue theme={theme}>{analyzedData.equipment[0]}</DataValue>
          </DataRow>
        )}
        
        {analyzedData?.condition && (
          <DataRow theme={theme}>
            <DataLabel theme={theme}>{isBG ? 'الحالة' : 'Condition'}:</DataLabel>
            <DataValue theme={theme}>{analyzedData.condition}</DataValue>
          </DataRow>
        )}
      </DataSection>
      
      <ActionButtons>
        <RetryButton theme={theme} onPress={handleRetry}>
          <Ionicons name="camera" size={20} color={theme.colors.text.primary} />
          <ButtonText theme={theme}>{isBG ? 'إعادة المحاولة' : 'Retry'}</ButtonText>
        </RetryButton>
        
        <ContinueButton theme={theme} onPress={handleContinueToForm}>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          <ButtonText light>{isBG ? 'متابعة إلى النموذج' : 'Continue to Form'}</ButtonText>
        </ContinueButton>
      </ActionButtons>
      
      <Hint theme={theme}>
        {isBG 
          ? 'يمكنك تعديل هذه البيانات لاحقاً في النموذج'
          : 'You can edit this data later in the form'}
      </Hint>
    </PreviewContainer>
  );
  
  const renderErrorStage = () => (
    <ErrorContainer theme={theme}>
      <CloseButton onPress={handleClose}>
        <Ionicons name="close-circle" size={36} color={theme.colors.text.secondary} />
      </CloseButton>
      
      {capturedPhoto && (
        <Image source={{ uri: capturedPhoto?.uri }} style={{ width: 200, height: 150, borderRadius: 12, marginBottom: 24, opacity: 0.5 }} />
      )}
      
      <ErrorIcon theme={theme}>
        <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
      </ErrorIcon>
      
      <ErrorTitle theme={theme}>{isBG ? 'فشل التحليل' : 'Analysis Failed'}</ErrorTitle>
      
      <ErrorMessage theme={theme}>{error}</ErrorMessage>
      
      <ErrorHint theme={theme}>
        {isBG 
          ? 'تأكد من أن الصورة واضحة وتحتوي على السيارة بالكامل'
          : 'Make sure the photo is clear and contains the full car'}
      </ErrorHint>
      
      <ActionButtons>
        <RetryButton theme={theme} onPress={handleRetry}>
          <Ionicons name="camera" size={20} color={theme.colors.text.primary} />
          <ButtonText theme={theme}>{isBG ? 'المحاولة مرة أخرى' : 'Try Again'}</ButtonText>
        </RetryButton>
        
        <ManualButton theme={theme} onPress={() => { handleClose(); router.push('/(tabs)/sell'); }}>
          <Ionicons name="create" size={20} color={theme.colors.text.primary} />
          <ButtonText theme={theme}>{isBG ? 'إدخال يدوي' : 'Manual Entry'}</ButtonText>
        </ManualButton>
      </ActionButtons>
    </ErrorContainer>
  );
  
  // ==================== RENDER ====================
  
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <Container theme={theme}>
        {stage === 'camera' && (
          <SmartCamera onCapture={handlePhotoCapture} onClose={handleClose} />
        )}
        
        {stage === 'analyzing' && renderAnalyzingStage()}
        {stage === 'preview' && renderPreviewStage()}
        {stage === 'error' && renderErrorStage()}
      </Container>
    </Modal>
  );
};

// ==================== STYLES ====================

const Container = styled.View<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const AnalyzingContainer = styled.View<{ theme: any }>`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const PreviewContainer = styled.ScrollView<{ theme: any }>`
  flex: 1;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const ErrorContainer = styled.View<{ theme: any }>`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: 50px;
  right: 20px;
  z-index: 10;
`;

const Title = styled.Text<{ theme: any }>`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: 16px;
  text-align: center;
`;

const Description = styled.Text<{ theme: any }>`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 12px;
  text-align: center;
  line-height: 24px;
`;

const AnimatedDots = styled.Text`
  font-size: 32px;
  margin-top: 24px;
`;

const SuccessBadge = styled.View<{ theme: any }>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.success}15;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const SuccessText = styled.Text<{ theme: any }>`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.success};
  margin-left: 12px;
`;

const DataSection = styled.View<{ theme: any }>`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.Text<{ theme: any }>`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 16px;
`;

const DataRow = styled.View<{ theme: any }>`
  flex-direction: row;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const DataLabel = styled.Text<{ theme: any }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
`;

const DataValue = styled.Text<{ theme: any }>`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: bold;
`;

const ActionButtons = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-bottom: 16px;
`;

const RetryButton = styled.TouchableOpacity<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ContinueButton = styled.TouchableOpacity<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary.main};
  padding: 16px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ManualButton = styled.TouchableOpacity<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ButtonText = styled.Text<{ theme?: any; light?: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme, light }) => light ? '#FFFFFF' : theme?.colors.text.primary};
`;

const Hint = styled.Text<{ theme: any }>`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  font-style: italic;
`;

const ErrorIcon = styled.View<{ theme: any }>`
  margin-bottom: 16px;
`;

const ErrorTitle = styled.Text<{ theme: any }>`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 12px;
  text-align: center;
`;

const ErrorMessage = styled.Text<{ theme: any }>`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-bottom: 12px;
  line-height: 24px;
`;

const ErrorHint = styled.Text<{ theme: any }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-bottom: 32px;
  font-style: italic;
  line-height: 20px;
`;

export default SmartSellFlow;
