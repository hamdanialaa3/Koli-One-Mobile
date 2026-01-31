import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../../styles/theme';
import { MobileHeader } from '../common/MobileHeader';
import { VehicleFormData } from '../../types/sellTypes';
import { SellService } from '../../services/SellService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Steps
import BasicInfoStep from './steps/BasicInfoStep';
import TechnicalSpecsStep from './steps/TechnicalSpecsStep';
import EquipmentStep from './steps/EquipmentStep';
import PhotosStep from './steps/PhotosStep';
import PricingContactStep from './steps/PricingContactStep';
import AIDescriptionStep from './steps/AIDescriptionStep';
import ReviewStep from './steps/ReviewStep';

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const Footer = styled.View`
  padding: 20px;
  background-color: ${props => props.theme.colors.background.paper};
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.muted};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ProgressContainer = styled.View`
  height: 4px;
  background-color: ${props => props.theme.colors.border.muted};
  width: 100%;
`;

const ProgressBar = styled.View<{ progress: number }>`
  height: 100%;
  background-color: ${props => props.theme.colors.primary.main};
  width: ${props => props.progress * 100}%;
`;

const NextButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${props => props.disabled ? props.theme.colors.border.muted : props.theme.colors.primary.main};
  padding: 16px 32px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
`;

const NextButtonText = styled.Text`
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  margin-right: 8px;
`;

const BackButton = styled.TouchableOpacity`
  padding: 16px;
`;

const BackButtonText = styled.Text`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 600;
  font-size: 16px;
`;

const WizardOrchestrator: React.FC = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isPublishing, setIsPublishing] = useState(false);
    const [formData, setFormData] = useState<Partial<VehicleFormData>>({
        vehicleType: 'car',
        images: [],
        equipment: { safety: [], comfort: [], infotainment: [], extras: [] }
    });

    const totalSteps = 7;

    const handleUpdate = (updates: Partial<VehicleFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleNext = async () => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        } else {
            handlePublish();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else {
            router.back();
        }
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            // 1. Upload images
            const uploadedUrls = await SellService.uploadImages(formData.images || []);

            // 2. Submit listing
            await SellService.submitListing({
                ...formData,
                images: uploadedUrls
            });

            Alert.alert(
                "Success! 🎉",
                "Your vehicle has been listed and is now live on Koli One.",
                [{ text: "Great", onPress: () => router.push('/(tabs)') }]
            );
        } catch (error) {
            Alert.alert("Error", "Something went wrong while publishing your ad. Please try again.");
            console.error(error);
        } finally {
            setIsPublishing(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <BasicInfoStep data={formData} onUpdate={handleUpdate} />;
            case 2: return <TechnicalSpecsStep data={formData} onUpdate={handleUpdate} />;
            case 3: return <EquipmentStep data={formData} onUpdate={handleUpdate} />;
            case 4: return <PhotosStep data={formData} onUpdate={handleUpdate} />;
            case 5: return <PricingContactStep data={formData} onUpdate={handleUpdate} />;
            case 6: return <AIDescriptionStep data={formData} onUpdate={handleUpdate} />;
            case 7: return <ReviewStep data={formData} />;
            default: return null;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return "Basic Info";
            case 2: return "Technical Specs";
            case 3: return "Equipment";
            case 4: return "Photos";
            case 5: return "Pricing";
            case 6: return "AI Description";
            case 7: return "Review";
            default: return "Sell Vehicle";
        }
    };

    return (
        <Container theme={theme}>
            <MobileHeader
                title={getStepTitle()}
                showLogo={false}
            />

            <ProgressContainer theme={theme}>
                <ProgressBar progress={currentStep / totalSteps} theme={theme} />
            </ProgressContainer>

            <Content>
                {renderStep()}
            </Content>

            <Footer theme={theme}>
                <BackButton onPress={handleBack}>
                    <BackButtonText theme={theme}>{currentStep === 1 ? 'Cancel' : 'Back'}</BackButtonText>
                </BackButton>

                <NextButton theme={theme} onPress={handleNext} disabled={isPublishing}>
                    {isPublishing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <NextButtonText theme={theme}>
                                {currentStep === totalSteps ? 'Publish' : 'Next'}
                            </NextButtonText>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </>
                    )}
                </NextButton>
            </Footer>
        </Container>
    );
};

export default WizardOrchestrator;
