import React, { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, View, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/styles/theme';
import { MobileHeader } from '../src/components/common/MobileHeader';
import { useAuth } from '../src/contexts/AuthContext';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const HeroSection = styled.View`
  padding: 32px 24px;
  background-color: ${props => props.theme.colors.background.dark};
  align-items: center;
`;

const HeroTitle = styled.Text`
  font-size: 24px;
  font-weight: 900;
  color: #fff;
  margin-top: 16px;
  text-align: center;
`;

const HeroSubtitle = styled.Text`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
  text-align: center;
`;

const FormCard = styled.View`
  margin: 20px;
  padding: 24px;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 20px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
  margin-top: 16px;
`;

const Input = styled.TextInput`
  background-color: ${props => props.theme.colors.background.default};
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 16px;
  color: ${props => props.theme.colors.text.primary};
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const MessageInput = styled(Input)`
  min-height: 120px;
  text-align-vertical: top;
`;

const SubmitButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary.main};
  padding: 16px;
  border-radius: 16px;
  align-items: center;
  margin-top: 24px;
`;

const SubmitButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 700;
`;

const InfoCard = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  margin: 0px 20px 12px;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const InfoIconBg = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: ${props => props.theme.colors.primary.main}15;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
`;

const InfoText = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  flex: 1;
`;

const InfoSub = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

export default function ContactScreen() {
    const { user } = useAuth();
    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (!name.trim() || !email.trim() || !message.trim()) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        // Open email client with pre-filled data
        const mailtoUrl = `mailto:support@koli.one?subject=${encodeURIComponent(subject || 'Contact from App')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
        Linking.openURL(mailtoUrl);

        Alert.alert('Message Sent', 'Your email client has been opened. Thank you for reaching out!');
        setSubject('');
        setMessage('');
    };

    return (
        <Container theme={theme}>
            <MobileHeader title="Contact" back />
            <ScrollView showsVerticalScrollIndicator={false}>
                <HeroSection theme={theme}>
                    <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.secondary.main} />
                    <HeroTitle>Get in Touch</HeroTitle>
                    <HeroSubtitle>We'd love to hear from you</HeroSubtitle>
                </HeroSection>

                <View style={{ marginTop: 8 }}>
                    <InfoCard theme={theme} onPress={() => Linking.openURL('mailto:support@koli.one')}>
                        <InfoIconBg theme={theme}>
                            <Ionicons name="mail-outline" size={22} color={theme.colors.primary.main} />
                        </InfoIconBg>
                        <View style={{ flex: 1 }}>
                            <InfoText theme={theme}>Email</InfoText>
                            <InfoSub theme={theme}>support@koli.one</InfoSub>
                        </View>
                    </InfoCard>

                    <InfoCard theme={theme} onPress={() => Linking.openURL('https://koli.one')}>
                        <InfoIconBg theme={theme}>
                            <Ionicons name="globe-outline" size={22} color={theme.colors.primary.main} />
                        </InfoIconBg>
                        <View style={{ flex: 1 }}>
                            <InfoText theme={theme}>Website</InfoText>
                            <InfoSub theme={theme}>www.koli.one</InfoSub>
                        </View>
                    </InfoCard>
                </View>

                <FormCard theme={theme}>
                    <Label theme={theme} style={{ marginTop: 0 }}>Name *</Label>
                    <Input
                        theme={theme}
                        value={name}
                        onChangeText={setName}
                        placeholder="Your name"
                        placeholderTextColor={theme.colors.text.disabled}
                    />

                    <Label theme={theme}>Email *</Label>
                    <Input
                        theme={theme}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your@email.com"
                        placeholderTextColor={theme.colors.text.disabled}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Label theme={theme}>Subject</Label>
                    <Input
                        theme={theme}
                        value={subject}
                        onChangeText={setSubject}
                        placeholder="What is this about?"
                        placeholderTextColor={theme.colors.text.disabled}
                    />

                    <Label theme={theme}>Message *</Label>
                    <MessageInput
                        theme={theme}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Tell us how we can help..."
                        placeholderTextColor={theme.colors.text.disabled}
                        multiline
                        numberOfLines={5}
                    />

                    <SubmitButton theme={theme} onPress={handleSubmit}>
                        <SubmitButtonText>Send Message</SubmitButtonText>
                    </SubmitButton>
                </FormCard>

                <View style={{ height: 40 }} />
            </ScrollView>
        </Container>
    );
}
