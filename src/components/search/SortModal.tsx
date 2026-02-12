import React from 'react';
import styled from 'styled-components/native';
import { Modal, TouchableOpacity, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

const Overlay = styled.Pressable`
  flex: 1;
  background-color: rgba(0,0,0,0.5);
  justify-content: flex-end;
`;

const Content = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 24px;
  padding-bottom: 40px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const Option = styled.TouchableOpacity<{ active?: boolean }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.default};
`;

const OptionText = styled.Text<{ active?: boolean }>`
  font-size: 16px;
  font-weight: ${props => props.active ? '700' : '500'};
  color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.text.primary};
`;

export type SortType = 'recent' | 'price_asc' | 'price_desc' | 'year_desc' | 'year_asc' | 'mileage_asc';

interface SortModalProps {
    visible: boolean;
    onClose: () => void;
    currentSort: SortType;
    onSelect: (sort: SortType) => void;
    theme: any;
}

export const SORT_OPTIONS: { label: string, value: SortType }[] = [
    { label: 'Most Recent', value: 'recent' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Year: Newest First', value: 'year_desc' },
    { label: 'Year: Oldest First', value: 'year_asc' },
    { label: 'Mileage: Low to High', value: 'mileage_asc' },
];

export const SortModal: React.FC<SortModalProps> = ({ visible, onClose, currentSort, onSelect, theme }) => {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <Overlay onPress={onClose}>
                <Content theme={theme}>
                    <Header>
                        <Title theme={theme}>Sort By</Title>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                        </TouchableOpacity>
                    </Header>

                    {SORT_OPTIONS.map((option) => (
                        <Option
                            key={option.value}
                            theme={theme}
                            active={currentSort === option.value}
                            onPress={() => {
                                onSelect(option.value);
                                onClose();
                            }}
                        >
                            <OptionText theme={theme} active={currentSort === option.value}>
                                {option.label}
                            </OptionText>
                            {currentSort === option.value && (
                                <Ionicons name="checkmark" size={20} color={theme.colors.primary.main} />
                            )}
                        </Option>
                    ))}
                </Content>
            </Overlay>
        </Modal>
    );
};
