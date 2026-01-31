import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../../../styles/theme';
import { VehicleFormData } from '../../../types/sellTypes';
import { Ionicons } from '@expo/vector-icons';
import { aiService } from '../../../services/ai/ai.service';

interface AIDescriptionStepProps {
    data: Partial<VehicleFormData>;
    onUpdate: (updates: Partial<VehicleFormData>) => void;
}

const StepContainer = styled.View`
  padding: 24px 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 15px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 32px;
  line-height: 22px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
`;

const AIButton = styled.TouchableOpacity<{ loading: boolean }>`
  background-color: ${props => props.loading ? props.theme.colors.border.muted : '#6366f1'};
  padding: 8px 16px;
  border-radius: 20px;
  flex-direction: row;
  align-items: center;
`;

const AIButtonText = styled.Text`
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  margin-left: 6px;
`;

const DescriptionInput = styled.TextInput`
  background-color: ${props => props.theme.colors.background.paper};
  border-width: 1.5px;
  border-color: ${props => props.theme.colors.border.muted};
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  color: ${props => props.theme.colors.text.primary};
  min-height: 200px;
`;

const AIDescriptionStep: React.FC<AIDescriptionStepProps> = ({ data, onUpdate }) => {
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!data.make || !data.model) {
            Alert.alert("Missing Info", "Please go back and enter the Make and Model first to help the AI.");
            return;
        }

        setLoading(true);
        try {
            const result = await aiService.generateCarDescription({
                make: data.make,
                model: data.model,
                year: parseInt(data.year || '0'),
                fuelType: data.fuelType,
                mileage: parseInt(data.mileage || '0'),
                equipment: Object.values(data.equipment || {}).flat(),
                condition: data.condition
            });
            onUpdate({ description: result });
        } catch (error) {
            Alert.alert("AI Error", "Failed to generate description. Please try writing it manually.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <StepContainer theme={theme}>
            <Title theme={theme}>AI Description</Title>
            <Subtitle theme={theme}>Use our AI Assistant to write a professional, high-converting description for your vehicle.</Subtitle>

            <Header>
                <Label theme={theme}>Description</Label>
                <AIButton theme={theme} loading={loading} onPress={handleGenerate} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="sparkles" size={16} color="#fff" />}
                    <AIButtonText theme={theme}>{loading ? 'Generating...' : 'AI Generate'}</AIButtonText>
                </AIButton>
            </Header>

            <DescriptionInput
                theme={theme}
                multiline
                textAlignVertical="top"
                placeholder="Tell us more about your car..."
                value={data.description}
                onChangeText={text => onUpdate({ description: text })}
            />

            <Text style={{ marginTop: 12, fontSize: 13, color: theme.colors.text.disabled, fontStyle: 'italic' }}>
                Tip: Professional descriptions including maintenance history and special extras attract more serious buyers.
            </Text>
        </StepContainer>
    );
};

export default AIDescriptionStep;
