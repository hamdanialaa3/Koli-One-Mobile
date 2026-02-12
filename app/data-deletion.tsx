import React, { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, View, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/styles/theme';
import { MobileHeader } from '../src/components/common/MobileHeader';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { db } from '../src/services/firebase';
import { doc, deleteDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth } from '../src/services/firebase';
import { logger } from '../src/services/logger-service';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const WarningBanner = styled.View`
  margin: 20px;
  padding: 20px;
  background-color: ${props => props.theme.colors.status.error}10;
  border-radius: 16px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.status.error}30;
  flex-direction: row;
  align-items: center;
`;

const WarningText = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${props => props.theme.colors.status.error};
  margin-left: 12px;
  line-height: 20px;
`;

const Section = styled.View`
  margin: 0 20px 20px;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 20px;
  padding: 24px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 12px;
`;

const Description = styled.Text`
  font-size: 14px;
  line-height: 22px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 16px;
`;

const BulletItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const BulletText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-left: 8px;
  flex: 1;
`;

const ConfirmInput = styled.TextInput`
  background-color: ${props => props.theme.colors.background.default};
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 16px;
  color: ${props => props.theme.colors.text.primary};
  border-width: 1px;
  border-color: ${props => props.theme.colors.status.error}40;
  margin-top: 16px;
`;

const DeleteButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${props => props.disabled
        ? props.theme.colors.text.disabled
        : props.theme.colors.status.error};
  padding: 16px;
  border-radius: 16px;
  align-items: center;
  margin-top: 16px;
`;

const DeleteButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 700;
`;

export default function DataDeletionScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [confirmText, setConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    const isConfirmed = confirmText.toLowerCase() === 'delete';

    const handleDeleteRequest = async () => {
        if (!user) {
            Alert.alert('Login Required', 'Please sign in to request data deletion.');
            return;
        }

        Alert.alert(
            'Confirm Data Deletion',
            'This action is IRREVERSIBLE. All your data, listings, messages, and account will be permanently deleted. Are you absolutely sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Everything',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            // Create deletion request record
                            await addDoc(collection(db, 'dataDeletionRequests'), {
                                userId: user.uid,
                                email: user.email,
                                displayName: user.displayName,
                                requestedAt: serverTimestamp(),
                                status: 'pending',
                            });

                            // Sign out and redirect
                            await signOut();
                            Alert.alert(
                                'Request Submitted',
                                'Your data deletion request has been submitted. Your account and data will be deleted within 30 days as per GDPR requirements.',
                                [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
                            );
                        } catch (error) {
                            logger.error('Data deletion request failed', error);
                            Alert.alert('Error', 'Failed to submit deletion request. Please try again.');
                        } finally {
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <Container theme={theme}>
            <MobileHeader title="Data Deletion" back />
            <ScrollView showsVerticalScrollIndicator={false}>
                <WarningBanner theme={theme}>
                    <Ionicons name="warning-outline" size={28} color={theme.colors.status.error} />
                    <WarningText theme={theme}>
                        Requesting data deletion will permanently remove all your personal data from Koli One.
                    </WarningText>
                </WarningBanner>

                <Section theme={theme}>
                    <Title theme={theme}>What will be deleted?</Title>
                    <Description theme={theme}>
                        When you request data deletion, the following information will be permanently removed:
                    </Description>

                    {[
                        'Your account profile and settings',
                        'All your car listings and drafts',
                        'Chat messages and conversations',
                        'Saved searches and favorites',
                        'Reviews and ratings',
                        'Analytics and activity history',
                        'Push notification preferences',
                    ].map((item, i) => (
                        <BulletItem key={i}>
                            <Ionicons name="close-circle" size={16} color={theme.colors.status.error} style={{ marginTop: 2 }} />
                            <BulletText theme={theme}>{item}</BulletText>
                        </BulletItem>
                    ))}
                </Section>

                <Section theme={theme}>
                    <Title theme={theme}>GDPR Compliance</Title>
                    <Description theme={theme}>
                        Under the General Data Protection Regulation (GDPR), you have the right to request the deletion of your personal data. We will process your request within 30 days. Some data may be retained for legal compliance purposes (e.g., transaction records required by Bulgarian law).
                    </Description>
                </Section>

                {user && (
                    <Section theme={theme}>
                        <Title theme={theme}>Confirm Deletion Request</Title>
                        <Description theme={theme}>
                            Type "DELETE" below to confirm your data deletion request.
                        </Description>
                        <ConfirmInput
                            theme={theme}
                            value={confirmText}
                            onChangeText={setConfirmText}
                            placeholder='Type "DELETE" to confirm'
                            placeholderTextColor={theme.colors.text.disabled}
                            autoCapitalize="none"
                        />
                        <DeleteButton
                            theme={theme}
                            disabled={!isConfirmed || deleting}
                            onPress={handleDeleteRequest}
                        >
                            <DeleteButtonText>
                                {deleting ? 'Processing...' : 'Request Data Deletion'}
                            </DeleteButtonText>
                        </DeleteButton>
                    </Section>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </Container>
    );
}
