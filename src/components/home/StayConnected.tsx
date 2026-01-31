import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Linking, View } from 'react-native';
import { SOCIAL_LINKS } from '../../constants/SocialLinks';
import { theme } from '../../styles/theme';

const Container = styled.View`
  padding: 40px 24px;
  background-color: ${props => props.theme.colors.background.paper};
  align-items: center;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.muted};
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 24px;
  text-align: center;
`;

const SocialRow = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const IconWrapper = styled.TouchableOpacity`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${props => props.theme.colors.background.default};
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const BrandFooter = styled.Text`
  margin-top: 32px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.disabled};
  text-transform: uppercase;
  letter-spacing: 2px;
`;

export default function StayConnected() {
    return (
        <Container theme={theme}>
            <Title theme={theme}>Stay Connected</Title>
            <Subtitle theme={theme}>Follow Koli One for the latest automotive trends and premium listings in Bulgaria.</Subtitle>

            <SocialRow>
                <IconWrapper onPress={() => Linking.openURL(SOCIAL_LINKS.INSTAGRAM)}>
                    <Ionicons name="logo-instagram" size={24} color={theme.colors.text.primary} />
                </IconWrapper>
                <IconWrapper onPress={() => Linking.openURL(SOCIAL_LINKS.FACEBOOK)}>
                    <Ionicons name="logo-facebook" size={24} color={theme.colors.text.primary} />
                </IconWrapper>
                <IconWrapper onPress={() => Linking.openURL(SOCIAL_LINKS.TIKTOK)}>
                    <Ionicons name="logo-tiktok" size={24} color={theme.colors.text.primary} />
                </IconWrapper>
                <IconWrapper onPress={() => Linking.openURL(SOCIAL_LINKS.X)}>
                    <Ionicons name="logo-twitter" size={24} color={theme.colors.text.primary} />
                </IconWrapper>
                <IconWrapper onPress={() => Linking.openURL(SOCIAL_LINKS.YOUTUBE)}>
                    <Ionicons name="logo-youtube" size={24} color={theme.colors.text.primary} />
                </IconWrapper>
            </SocialRow>

            <BrandFooter theme={theme}>Koli One • Premium Standard</BrandFooter>
        </Container>
    );
}
