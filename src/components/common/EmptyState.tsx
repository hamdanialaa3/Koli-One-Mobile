import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { Platform } from 'react-native';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: ${props => props.theme.colors.background.default};
`;

const IconContainer = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: ${props => props.theme.colors.background.paper};
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
  margin-bottom: 12px;
`;

const Description = styled.Text`
  font-size: 15px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  line-height: 22px;
  margin-bottom: 32px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary.main};
  padding: 14px 28px;
  border-radius: 14px;
  elevation: 3;
  ${props => Platform.OS !== 'web' ? `
    shadow-color: ${props.theme.colors.primary.main};
    shadow-offset: 0px 4px;
    shadow-opacity: 0.3;
    shadow-radius: 8px;
  ` : `
    box-shadow: 0px 4px 8px ${props.theme.colors.primary.main}4D;
  `}
`;

const ActionButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 700;
`;

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  buttonText,
  onButtonPress
}) => {
  return (
    <Container theme={theme}>
      <IconContainer theme={theme}>
        <Ionicons name={icon} size={60} color={theme.colors.primary.light} />
      </IconContainer>
      <Title theme={theme}>{title}</Title>
      <Description theme={theme}>{description}</Description>

      {buttonText && (
        <ActionButton theme={theme} onPress={onButtonPress} activeOpacity={0.8}>
          <ActionButtonText>{buttonText}</ActionButtonText>
        </ActionButton>
      )}
    </Container>
  );
};
