import React from 'react';
import styled from 'styled-components/native';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '../../../styles/theme';
import { VehicleFormData } from '../../../types/sellTypes';
import { Ionicons } from '@expo/vector-icons';

interface BasicInfoStepProps {
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

const StyledInput = styled.TextInput`
  background-color: ${props => props.theme.colors.background.paper};
  border-width: 1.5px;
  border-color: ${props => props.theme.colors.border.muted};
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 16px;
  color: ${props => props.theme.colors.text.primary};
`;

const TypeGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const TypeCard = styled.TouchableOpacity<{ selected: boolean }>`
  width: 48%;
  background-color: ${props => props.selected ? props.theme.colors.primary.main + '10' : props.theme.colors.background.paper};
  border-width: 2px;
  border-color: ${props => props.selected ? props.theme.colors.primary.main : props.theme.colors.border.muted};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  align-items: center;
  justify-content: center;
`;

const TypeLabel = styled.Text<{ selected: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.selected ? props.theme.colors.primary.main : props.theme.colors.text.primary};
  margin-top: 8px;
`;

const VEHICLE_TYPES = [
    { id: 'Car', icon: 'car-outline' },
    { id: 'Motorbike', icon: 'bicycle-outline' },
    { id: 'Truck', icon: 'bus-outline' },
    { id: 'Boat', icon: 'boat-outline' }
];

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onUpdate }) => {
    return (
        <StepContainer theme={theme}>
            <Title theme={theme}>Basic Information</Title>
            <Subtitle theme={theme}>Start by telling us what you are selling.</Subtitle>

            <Label theme={theme}>Vehicle Type</Label>
            <TypeGrid>
                {VEHICLE_TYPES.map(type => (
                    <TypeCard
                        key={type.id}
                        theme={theme}
                        selected={data.vehicleType === type.id}
                        onPress={() => onUpdate({ vehicleType: type.id })}
                    >
                        <Ionicons
                            name={type.icon as any}
                            size={32}
                            color={data.vehicleType === type.id ? theme.colors.primary.main : theme.colors.text.secondary}
                        />
                        <TypeLabel theme={theme} selected={data.vehicleType === type.id}>{type.id}</TypeLabel>
                    </TypeCard>
                ))}
            </TypeGrid>

            <InputGroup>
                <Label theme={theme}>Make</Label>
                <StyledInput
                    theme={theme}
                    placeholder="e.g. Mercedes-Benz"
                    value={data.make}
                    onChangeText={text => onUpdate({ make: text })}
                />
            </InputGroup>

            <InputGroup>
                <Label theme={theme}>Model</Label>
                <StyledInput
                    theme={theme}
                    placeholder="e.g. GLE Coupe"
                    value={data.model}
                    onChangeText={text => onUpdate({ model: text })}
                />
            </InputGroup>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <InputGroup style={{ width: '48%' }}>
                    <Label theme={theme}>Year</Label>
                    <StyledInput
                        theme={theme}
                        placeholder="2024"
                        keyboardType="numeric"
                        value={data.year}
                        onChangeText={text => onUpdate({ year: text })}
                    />
                </InputGroup>
                <InputGroup style={{ width: '48%' }}>
                    <Label theme={theme}>Variant</Label>
                    <StyledInput
                        theme={theme}
                        placeholder="e.g. AMG"
                        value={data.variant}
                        onChangeText={text => onUpdate({ variant: text })}
                    />
                </InputGroup>
            </View>
        </StepContainer>
    );
};

export default BasicInfoStep;
