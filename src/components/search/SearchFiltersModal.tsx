import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Modal, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterState } from '../../services/search/UnifiedFilterTypes';
import { Picker } from '@react-native-picker/picker';

const ModalContainer = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
  background-color: ${props => props.theme.colors.background.paper};
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const CloseButton = styled.TouchableOpacity`
  padding: 4px;
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 24px;
`;

const SectionClass = styled.View`
  margin-bottom: 24px;
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 12px;
  text-transform: uppercase;
`;

const InputRow = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const StyledInput = styled.TextInput`
  flex: 1;
  height: 48px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.default};
  border-radius: 12px;
  padding-horizontal: 16px;
  color: ${props => props.theme.colors.text.primary};
  background-color: ${props => props.theme.colors.background.paper};
`;

const PickerWrapper = styled.View`
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.default};
  border-radius: 12px;
  background-color: ${props => props.theme.colors.background.paper};
  overflow: hidden;
`;

const ApplyButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary.main};
  padding: 18px;
  align-items: center;
  margin: 24px;
  border-radius: 16px;
  elevation: 2;
`;

const ApplyButtonText = styled.Text`
  color: #fff;
  font-weight: 700;
  font-size: 16px;
`;

const ChipsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.TouchableOpacity<{ active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.border.default};
  background-color: ${props => props.active ? 'rgba(59, 130, 246, 0.1)' : props.theme.colors.background.paper};
`;

const ChipText = styled.Text<{ active: boolean }>`
  color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  font-weight: 600;
  font-size: 13px;
`;

const BRANDS = ['All', 'Audi', 'BMW', 'Mercedes-Benz', 'VW', 'Toyota', 'Honda', 'Ford', 'Renault', 'Peugeot', 'Nissan'];
const FUELS = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG'];
const TRANSMISSIONS = ['All', 'Manual', 'Automatic'];

interface SearchFiltersModalProps {
    visible: boolean;
    onClose: () => void;
    filters: FilterState;
    onApply: (filters: FilterState) => void;
    onReset: () => void;
    theme: any;
}

export const SearchFiltersModal: React.FC<SearchFiltersModalProps> = ({
    visible,
    onClose,
    filters: initialFilters,
    onApply,
    onReset,
    theme
}) => {
    const [localFilters, setLocalFilters] = useState<FilterState>(initialFilters);

    // Sync when opening
    useEffect(() => {
        if (visible) {
            setLocalFilters(initialFilters);
        }
    }, [visible, initialFilters]);

    // Handlers
    const handleChange = (key: keyof FilterState, value: any) => {
        setLocalFilters(prev => ({ ...prev, [key]: value === 'All' ? undefined : value }));
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <ModalContainer theme={theme}>
                <Header theme={theme}>
                    <TouchableOpacity onPress={onReset}>
                        <HeaderTitle theme={theme} style={{ fontSize: 14, color: theme.colors.text.secondary }}>Reset</HeaderTitle>
                    </TouchableOpacity>
                    <HeaderTitle theme={theme}>Filters</HeaderTitle>
                    <CloseButton onPress={onClose}>
                        <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                    </CloseButton>
                </Header>

                <Content>
                    {/* Make */}
                    <SectionClass>
                        <Label theme={theme}>Make</Label>
                        <PickerWrapper theme={theme}>
                            <Picker
                                selectedValue={localFilters.make || 'All'}
                                onValueChange={(v) => handleChange('make', v)}
                                style={{ color: theme.colors.text.primary }}
                            >
                                {BRANDS.map(brand => (
                                    <Picker.Item key={brand} label={brand} value={brand} />
                                ))}
                            </Picker>
                        </PickerWrapper>
                    </SectionClass>

                    {/* Model */}
                    <SectionClass>
                        <Label theme={theme}>Model</Label>
                        <StyledInput
                            theme={theme}
                            placeholder="e.g. A4, X5"
                            placeholderTextColor={theme.colors.text.disabled}
                            value={localFilters.model}
                            onChangeText={(t) => handleChange('model', t)}
                        />
                    </SectionClass>

                    {/* Price Range */}
                    <SectionClass>
                        <Label theme={theme}>Price (€)</Label>
                        <InputRow>
                            <StyledInput
                                theme={theme}
                                placeholder="Min"
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.text.disabled}
                                value={localFilters.priceMin?.toString()}
                                onChangeText={(t) => handleChange('priceMin', Number(t))}
                            />
                            <StyledInput
                                theme={theme}
                                placeholder="Max"
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.text.disabled}
                                value={localFilters.priceMax?.toString()}
                                onChangeText={(t) => handleChange('priceMax', Number(t))}
                            />
                        </InputRow>
                    </SectionClass>

                    {/* Year Range */}
                    <SectionClass>
                        <Label theme={theme}>Year</Label>
                        <InputRow>
                            <StyledInput
                                theme={theme}
                                placeholder="From"
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.text.disabled}
                                value={localFilters.yearMin?.toString()}
                                onChangeText={(t) => handleChange('yearMin', Number(t))}
                            />
                            <StyledInput
                                theme={theme}
                                placeholder="To"
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.text.disabled}
                                value={localFilters.yearMax?.toString()}
                                onChangeText={(t) => handleChange('yearMax', Number(t))}
                            />
                        </InputRow>
                    </SectionClass>

                    {/* Body Type (Chips are handled in SearchScreen usually, but good to have here too) */}

                    {/* Fuel Type */}
                    <SectionClass>
                        <Label theme={theme}>Fuel Type</Label>
                        <ChipsContainer>
                            {FUELS.map(fuel => (
                                <Chip
                                    key={fuel}
                                    active={localFilters.fuelType === (fuel === 'All' ? undefined : fuel)}
                                    theme={theme}
                                    onPress={() => handleChange('fuelType', fuel)}
                                >
                                    <ChipText active={localFilters.fuelType === (fuel === 'All' ? undefined : fuel)} theme={theme}>{fuel}</ChipText>
                                </Chip>
                            ))}
                        </ChipsContainer>
                    </SectionClass>

                    {/* Transmission */}
                    <SectionClass>
                        <Label theme={theme}>Transmission</Label>
                        <ChipsContainer>
                            {TRANSMISSIONS.map(type => (
                                <Chip
                                    key={type}
                                    active={localFilters.transmission === (type === 'All' ? undefined : type)}
                                    theme={theme}
                                    onPress={() => handleChange('transmission', type)}
                                >
                                    <ChipText active={localFilters.transmission === (type === 'All' ? undefined : type)} theme={theme}>{type}</ChipText>
                                </Chip>
                            ))}
                        </ChipsContainer>
                    </SectionClass>

                    <View style={{ height: 40 }} />
                </Content>

                <ApplyButton theme={theme} onPress={handleApply}>
                    <ApplyButtonText>Show Results</ApplyButtonText>
                </ApplyButton>
            </ModalContainer>
        </Modal>
    );
};
