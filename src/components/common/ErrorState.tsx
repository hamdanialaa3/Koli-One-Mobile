import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry: () => void;
}

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: ${props => props.theme.colors.background.default};
`;

const IconContainer = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${props => props.theme.colors.status.error}20;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Message = styled.Text`
  font-size: 15px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  margin-bottom: 24px;
`;

const RetryButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.background.paper};
  padding: 12px 24px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.default};
`;

const RetryText = styled.Text`
  color: ${props => props.theme.colors.primary.main};
  font-size: 15px;
  font-weight: 700;
  margin-left: 8px;
`;

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = "Something went wrong",
    message = "Please check your internet connection and try again.",
    onRetry
}) => {
    return (
        <Container theme={theme}>
            <IconContainer theme={theme}>
                <Ionicons name="alert-circle" size={48} color={theme.colors.status.error} />
            </IconContainer>
            <Title theme={theme}>{title}</Title>
            <Message theme={theme}>{message}</Message>
            <RetryButton theme={theme} onPress={onRetry} activeOpacity={0.7}>
                <Ionicons name="refresh" size={20} color={theme.colors.primary.main} />
                <RetryText theme={theme}>Try Again</RetryText>
            </RetryButton>
        </Container>
    );
};
