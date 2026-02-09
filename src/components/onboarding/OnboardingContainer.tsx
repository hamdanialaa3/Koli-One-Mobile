/**
 * Onboarding Container
 * Manages the 3-step onboarding flow and saves preferences to AsyncStorage
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import OnboardingScreen1 from './OnboardingScreen1';
import OnboardingScreen2 from './OnboardingScreen2';
import OnboardingScreen3 from './OnboardingScreen3';
import {
  ONBOARDING_STORAGE_KEY,
  UserIntent,
  VehicleType,
  OnboardingPreferences,
} from '../../constants/onboarding';
import { logger } from '../../services/logger-service';

const OnboardingContainer: React.FC = () => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<Partial<OnboardingPreferences>>({});
  const router = useRouter();

  const handleIntentSelect = (intent: UserIntent) => {
    setPreferences(prev => ({ ...prev, intent }));
    setStep(2);
    logger.info('Onboarding: Intent selected', { intent });
  };

  const handleVehicleTypeSelect = (vehicleType: VehicleType) => {
    setPreferences(prev => ({ ...prev, vehicleType }));
    setStep(3);
    logger.info('Onboarding: Vehicle type selected', { vehicleType });
  };

  const handleComplete = async (city: string) => {
    try {
      const finalPreferences: OnboardingPreferences = {
        intent: preferences.intent!,
        vehicleType: preferences.vehicleType!,
        city,
        completed: true,
        completedAt: new Date().toISOString(),
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify(finalPreferences)
      );

      logger.info('Onboarding: Completed and saved', finalPreferences);

      // Navigate to main app based on intent
      if (finalPreferences.intent === 'sell') {
        router.replace('/(tabs)/sell');
      } else {
        // Buy or Browse → go to home with search
        router.replace('/(tabs)');
      }
    } catch (error) {
      logger.error('Onboarding: Failed to save preferences', error);
      // Continue anyway, don't block the user
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {step === 1 && <OnboardingScreen1 onSelect={handleIntentSelect} />}
      {step === 2 && (
        <OnboardingScreen2
          onSelect={handleVehicleTypeSelect}
          onBack={handleBack}
        />
      )}
      {step === 3 && (
        <OnboardingScreen3
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )}
    </View>
  );
};

export default OnboardingContainer;
