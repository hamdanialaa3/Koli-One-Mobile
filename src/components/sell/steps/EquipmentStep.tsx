import React from 'react';
import styled from 'styled-components/native';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { theme } from '../../../styles/theme';
import { VehicleFormData, EQUIPMENT_CATEGORIES } from '../../../types/sellTypes';
import { Ionicons } from '@expo/vector-icons';

interface EquipmentStepProps {
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

const CategoryContainer = styled.View`
  margin-bottom: 32px;
`;

const CategoryTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const EquipmentGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const EquipmentButton = styled.TouchableOpacity<{ selected: boolean }>`
  width: 48%;
  background-color: ${props => props.selected ? props.theme.colors.primary.main + '15' : props.theme.colors.background.paper};
  border-width: 2px;
  border-color: ${props => props.selected ? props.theme.colors.primary.main : props.theme.colors.border.muted};
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
`;

const EquipmentText = styled.Text<{ selected: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.selected ? props.theme.colors.primary.main : props.theme.colors.text.primary};
  margin-left: 8px;
  flex: 1;
`;

const FullOptionsButton = styled.TouchableOpacity<{ active: boolean }>`
  background-color: ${props => props.active ? props.theme.colors.status.success : props.theme.colors.background.paper};
  padding: 16px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  border-width: 2px;
  border-color: ${props => props.active ? props.theme.colors.status.success : props.theme.colors.border.muted};
`;

const FullOptionsText = styled.Text<{ active: boolean }>`
  color: ${props => props.active ? '#fff' : props.theme.colors.text.primary};
  font-weight: 800;
  font-size: 16px;
  margin-left: 8px;
`;

const EquipmentStep: React.FC<EquipmentStepProps> = ({ data, onUpdate }) => {
    const equipment = data.equipment || { safety: [], comfort: [], infotainment: [], extras: [] };

    const toggleItem = (category: keyof typeof EQUIPMENT_CATEGORIES, id: string) => {
        const current = equipment[category] || [];
        const isSelected = current.includes(id);
        const updated = isSelected
            ? current.filter(item => item !== id)
            : [...current, id];

        onUpdate({
            equipment: {
                ...equipment,
                [category]: updated
            }
        });
    };

    const isAllSelected = () => {
        const totalEquipment = Object.values(EQUIPMENT_CATEGORIES).flat().length;
        const selectedCount = Object.values(equipment).flat().length;
        return selectedCount === totalEquipment;
    };

    const toggleAll = () => {
        if (isAllSelected()) {
            onUpdate({
                equipment: { safety: [], comfort: [], infotainment: [], extras: [] }
            });
        } else {
            onUpdate({
                equipment: {
                    safety: EQUIPMENT_CATEGORIES.safety.map(i => i.id),
                    comfort: EQUIPMENT_CATEGORIES.comfort.map(i => i.id),
                    infotainment: EQUIPMENT_CATEGORIES.infotainment.map(i => i.id),
                    extras: EQUIPMENT_CATEGORIES.extras.map(i => i.id),
                }
            });
        }
    };

    return (
        <StepContainer theme={theme}>
            <Title theme={theme}>Features & Extras</Title>
            <Subtitle theme={theme}>Select all equipment that comes with your vehicle.</Subtitle>

            <FullOptionsButton theme={theme} active={isAllSelected()} onPress={toggleAll}>
                <Ionicons name="flash" size={20} color={isAllSelected() ? '#fff' : theme.colors.primary.main} />
                <FullOptionsText theme={theme} active={isAllSelected()}>FULL OPTIONS</FullOptionsText>
            </FullOptionsButton>

            {(Object.keys(EQUIPMENT_CATEGORIES) as Array<keyof typeof EQUIPMENT_CATEGORIES>).map(category => (
                <CategoryContainer key={category}>
                    <CategoryTitle theme={theme}>{category}</CategoryTitle>
                    <EquipmentGrid>
                        {EQUIPMENT_CATEGORIES[category].map(item => {
                            const selected = equipment[category]?.includes(item.id);
                            return (
                                <EquipmentButton
                                    key={item.id}
                                    theme={theme}
                                    selected={selected}
                                    onPress={() => toggleItem(category, item.id)}
                                >
                                    <Ionicons
                                        name={selected ? "checkbox" : "square-outline"}
                                        size={20}
                                        color={selected ? theme.colors.primary.main : theme.colors.text.secondary}
                                    />
                                    <EquipmentText theme={theme} selected={selected}>{item.labelEn}</EquipmentText>
                                </EquipmentButton>
                            );
                        })}
                    </EquipmentGrid>
                </CategoryContainer>
            ))}
        </StepContainer>
    );
};

export default EquipmentStep;
