import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../../styles/theme';
import { MobileHeader } from '../common/MobileHeader';
import { VehicleFormData } from '../../types/sellTypes';
import { SellService } from '../../services/SellService';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSellStore } from '../../store/useSellStore';

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
    const params = useLocalSearchParams();

    const {
        step,
        setStep,
        form,
        setFormData,
        resetForm,
        images
    } = useSellStore();

    const [isPublishing, setIsPublishing] = useState(false);

    // TASK-14: Initialize with AI-extracted data if available
    useEffect(() => {
        // Only hydrate if we are at step 1 and have params and empty form
        if (step === 1 && Object.keys(params).length > 0 && !form.make) {
            const baseData: Partial<VehicleFormData> = {
                vehicleType: 'car',
                equipment: form.equipment || { safety: [], comfort: [], infotainment: [], extras: [] }
            };

            // Pre-fill from Smart Sell AI analysis
            if (params.make) baseData.make = params.make as string;
            if (params.model) baseData.model = params.model as string;
            if (params.year) baseData.year = params.year as string;
            if (params.condition) baseData.condition = params.condition as string;
            if (params.color) baseData.color = params.color as string;

            setFormData(baseData);
        }
    }, [params, step, form.make, setFormData]);

    const totalSteps = 7;

    const handleNext = async () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handlePublish();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            Alert.alert(
                "Cancel Listing?",
                "Are you sure you want to cancel? Your draft will be saved.",
                [
                    { text: "Keep Editing", style: "cancel" },
                    { text: "Exit", style: "destructive", onPress: () => router.back() }
                ]
            );
        }
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            // Check for pending uploads
            const pendingImages = images.filter(img => img.status === 'uploading' || img.status === 'idle');
            if (pendingImages.length > 0) {
                Alert.alert("Pending Uploads", "Some images are still uploading. Please wait a moment.");
                setIsPublishing(false);
                return;
            }

            const failedImages = images.filter(img => img.status === 'error');
            if (failedImages.length > 0) {
                Alert.alert("Upload Failed", "Some images failed to upload. Please retry or remove them.");
                setIsPublishing(false);
                return;
            }

            // Collect uploaded URLs
            const validImages = images.filter(img => img.status === 'done' || img.uri.startsWith('http')).map(img => img.uri);

            await SellService.submitListing({
                ...form,
                images: validImages
            });

            Alert.alert(
                "Success! 🎉",
                "Your vehicle has been listed and is now live on Koli One.",
                [{
                    text: "Great", onPress: () => {
                        resetForm();
                        router.push('/(tabs)');
                    }
                }]
            );
        } catch (error) {
            Alert.alert("Error", "Something went wrong while publishing your ad. Please try again.");
            console.error(error);
        } finally {
            setIsPublishing(false);
        }
    };

    const renderStep = () => {
        // Steps now consume store directly or via props
        const stepProps = { data: form, onUpdate: setFormData };

        switch (step) {
            case 1: return <BasicInfoStep {...stepProps} />;
            case 2: return <TechnicalSpecsStep {...stepProps} />;
            case 3: return <EquipmentStep {...stepProps} />;
            case 4: return <PhotosStep />; // Consumes store internally
            case 5: return <PricingContactStep {...stepProps} />;
            case 6: return <AIDescriptionStep {...stepProps} />;
            case 7: return <ReviewStep data={{ ...form, images: images.map(i => i.uri) }} />; // Pass images for review
            default: return null;
        }
    };

    const getStepTitle = () => {
        switch (step) {
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
                <ProgressBar progress={step / totalSteps} theme={theme} />
            </ProgressContainer>

            <Content>
                {renderStep()}
            </Content>

            <Footer theme={theme}>
                <BackButton onPress={handleBack}>
                    <BackButtonText theme={theme}>{step === 1 ? 'Cancel' : 'Back'}</BackButtonText>
                </BackButton>

                <NextButton theme={theme} onPress={handleNext} disabled={isPublishing}>
                    {isPublishing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <NextButtonText theme={theme}>
                                {step === totalSteps ? 'Publish' : 'Next'}
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
