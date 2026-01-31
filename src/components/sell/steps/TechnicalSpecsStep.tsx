import React from 'react';
import styled from 'styled-components/native';
import { View, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '../../../styles/theme';
import { VehicleFormData, FUEL_TYPES, TRANSMISSION_TYPES, DRIVE_TYPES, BODY_TYPES, DOOR_OPTIONS, SEAT_OPTIONS } from '../../../types/sellTypes';
import { Picker } from '@react-native-picker/picker';

interface TechnicalSpecsStepProps {
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

const PickerContainer = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  border-width: 1.5px;
  border-color: ${props => props.theme.colors.border.muted};
  border-radius: 12px;
  overflow: hidden;
`;

const OptionGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const OptionButton = styled.TouchableOpacity<{ selected: boolean }>`
  padding: 10px 16px;
  border-radius: 10px;
  border-width: 1.5px;
  border-color: ${props => props.selected ? props.theme.colors.primary.main : props.theme.colors.border.muted};
  background-color: ${props => props.selected ? props.theme.colors.primary.main + '10' : 'transparent'};
  margin-bottom: 10px;
  min-width: 30%;
  align-items: center;
`;

const OptionText = styled.Text<{ selected: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.selected ? props.theme.colors.primary.main : props.theme.colors.text.primary};
`;

const TechnicalSpecsStep: React.FC<TechnicalSpecsStepProps> = ({ data, onUpdate }) => {
    return (
        <StepContainer theme={theme}>
            <Title theme={theme}>Technical Details</Title>
            <Subtitle theme={theme}>Detailed specifications help buyers find your car easier.</Subtitle>

            <InputGroup>
                <Label theme={theme}>Mileage (km)</Label>
                <StyledInput
                    theme={theme}
                    placeholder="e.g. 50,000"
                    keyboardType="numeric"
                    value={data.mileage}
                    onChangeText={text => onUpdate({ mileage: text })}
                />
            </InputGroup>

            <InputGroup>
                <Label theme={theme}>Power (HP)</Label>
                <StyledInput
                    theme={theme}
                    placeholder="e.g. 150"
                    keyboardType="numeric"
                    value={data.power}
                    onChangeText={text => onUpdate({ power: text })}
                />
            </InputGroup>

            <InputGroup>
                <Label theme={theme}>Fuel Type</Label>
                <PickerContainer theme={theme}>
                    <Picker
                        selectedValue={data.fuelType}
                        onValueChange={(itemValue) => onUpdate({ fuelType: itemValue })}
                        style={{ color: theme.colors.text.primary }}
                    >
                        <Picker.Item label="Select Fuel Type" value="" />
                        {FUEL_TYPES.map(fuel => (
                            <Picker.Item key={fuel} label={fuel} value={fuel} />
                        ))}
                    </Picker>
                </PickerContainer>
            </InputGroup>

            <InputGroup>
                <Label theme={theme}>Transmission</Label>
                <OptionGrid>
                    {TRANSMISSION_TYPES.map(type => (
                        <OptionButton
                            key={type}
                            theme={theme}
                            selected={data.transmission === type}
                            onPress={() => onUpdate({ transmission: type })}
                        >
                            <OptionText theme={theme} selected={data.transmission === type}>{type.split(' ')[0]}</OptionText>
                        </OptionButton>
                    ))}
                </OptionGrid>
            </InputGroup>

            <InputGroup>
                <Label theme={theme}>Drive Type</Label>
                <PickerContainer theme={theme}>
                    <Picker
                        selectedValue={data.driveType}
                        onValueChange={(itemValue) => onUpdate({ driveType: itemValue })}
                        style={{ color: theme.colors.text.primary }}
                    >
                        <Picker.Item label="Select Drive Type" value="" />
                        {DRIVE_TYPES.map(drive => (
                            <Picker.Item key={drive} label={drive} value={drive} />
                        ))}
                    </Picker>
                </PickerContainer>
            </InputGroup>

            <InputGroup>
                <Label theme={theme}>Body Type</Label>
                <PickerContainer theme={theme}>
                    <Picker
                        selectedValue={data.bodyType}
                        onValueChange={(itemValue) => onUpdate({ bodyType: itemValue })}
                        style={{ color: theme.colors.text.primary }}
                    >
                        <Picker.Item label="Select Body Type" value="" />
                        {BODY_TYPES.map(body => (
                            <Picker.Item key={body.value} label={body.labelEn} value={body.value} />
                        ))}
                    </Picker>
                </PickerContainer>
            </InputGroup>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <InputGroup style={{ width: '48%' }}>
                    <Label theme={theme}>Doors</Label>
                    <PickerContainer theme={theme}>
                        <Picker
                            selectedValue={data.doors}
                            onValueChange={(itemValue) => onUpdate({ doors: itemValue })}
                            style={{ color: theme.colors.text.primary }}
                        >
                            {DOOR_OPTIONS.map(opt => (
                                <Picker.Item key={opt} label={opt} value={opt} />
                            ))}
                        </Picker>
                    </PickerContainer>
                </InputGroup>
                <InputGroup style={{ width: '48%' }}>
                    <Label theme={theme}>Seats</Label>
                    <PickerContainer theme={theme}>
                        <Picker
                            selectedValue={data.seats}
                            onValueChange={(itemValue) => onUpdate({ seats: itemValue })}
                            style={{ color: theme.colors.text.primary }}
                        >
                            {SEAT_OPTIONS.map(opt => (
                                <Picker.Item key={opt} label={opt} value={opt} />
                            ))}
                        </Picker>
                    </PickerContainer>
                </InputGroup>
            </View>
        </StepContainer>
    );
};

export default TechnicalSpecsStep;
