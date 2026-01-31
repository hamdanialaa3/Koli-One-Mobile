import React from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';
import { View } from 'react-native';

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

export default function AnalyticsScreen() {
    return (
        <Container theme={theme}>
            <MobileHeader title="Analytics" back />
            <Content>
                <Title>Performance Stats</Title>
                <Subtitle>Detailed insights on your listing views and engagement. Syncing with Web Dashboard.</Subtitle>
            </Content>
        </Container>
    );
}
