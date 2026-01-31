import React from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

export default function SettingsScreen() {
    return (
        <Container theme={theme}>
            <MobileHeader title="Settings" back />
            <Content>
                <Title>Account Settings</Title>
                <Subtitle>Manage your account preferences, notifications, and privacy.</Subtitle>
            </Content>
        </Container>
    );
}
