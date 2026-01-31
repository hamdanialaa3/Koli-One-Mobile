import React from 'react';
import styled from 'styled-components/native';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { theme } from '../../../styles/theme';
import { VehicleFormData } from '../../../types/sellTypes';
import { Picker } from '@react-native-picker/picker';

interface PricingContactStepProps {
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

const InputGroup = styled.View`
  margin-bottom: 24px;
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PriceInput = styled.TextInput`
  font-size: 36px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary.main};
  border-bottom-width: 2px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
  padding: 10px 0;
`;

const StyledInput = styled.TextInput`
  background-color: ${props => props.theme.colors.background.paper};
  border-width: 1.5px;
  border-color: ${props => props.theme.colors.border.muted};
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 16px;
  color: ${props => props.theme.colors.text.primary};
`;

const BULGARIA_PROVINCES = [
    'Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Sliven', 'Dobrich'
];

const PricingContactStep: React.FC<PricingContactStepProps> = ({ data, onUpdate }) => {
    return (
        <StepContainer theme={theme}>
            <Title theme={theme}>Pricing & Contact</Title>
            <Subtitle theme={theme}>Set your price and tell buyers where the vehicle is located.</Subtitle>

            <InputGroup>
                <Label theme={theme}>Asking Price (EUR)</Label>
                <PriceInput
                    theme={theme}
                    placeholder="0"
                    keyboardType="numeric"
                    value={data.price}
                    onChangeText={text => onUpdate({ price: text })}
                />
            </InputGroup>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <InputGroup style={{ width: '48%' }}>
                    <Label theme={theme}>Province</Label>
                    <StyledInput
                        theme={theme}
                        placeholder="e.g. Sofia"
                        value={data.saleProvince}
                        onChangeText={text => onUpdate({ saleProvince: text })}
                    />
                </InputGroup>
                <InputGroup style={{ width: '48%' }}>
                    <Label theme={theme}>City</Label>
                    <StyledInput
                        theme={theme}
                        placeholder="e.g. Sofia"
                        value={data.saleCity}
                        onChangeText={text => onUpdate({ saleCity: text })}
                    />
                </InputGroup>
            </View>

            <InputGroup>
                <Label theme={theme}>Contact Name</Label>
                <StyledInput
                    theme={theme}
                    placeholder="Enter your full name"
                    value={data.contactName}
                    onChangeText={text => onUpdate({ contactName: text })}
                />
            </InputGroup>

            <InputGroup>
                <Label theme={theme}>Phone Number</Label>
                <StyledInput
                    theme={theme}
                    placeholder="+359 ..."
                    keyboardType="phone-pad"
                    value={data.contactPhone}
                    onChangeText={text => onUpdate({ contactPhone: text })}
                />
            </InputGroup>
        </StepContainer>
    );
};

export default PricingContactStep;
