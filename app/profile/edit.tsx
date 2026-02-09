import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { useAuth } from '../../src/contexts/AuthContext';
import { updateUserProfile } from '../../src/services/userService';
import { MobileHeader } from '../../src/components/common/MobileHeader';
import { theme } from '../../src/styles/theme';
import {
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const FormSection = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  padding: 20px;
  margin-bottom: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const SectionTitle = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-bottom: 16px;
  letter-spacing: 1px;
`;

const InputGroup = styled.View`
  margin-bottom: 20px;
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const StyledInput = styled.TextInput`
  background-color: ${props => props.theme.colors.background.default};
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  color: ${props => props.theme.colors.text.primary};
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const BioInput = styled(StyledInput)`
  height: 100px;
  text-align-vertical: top;
`;

const AvatarSection = styled.View`
  align-items: center;
  padding: 32px 20px;
  background-color: ${props => props.theme.colors.background.paper};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const AvatarContainer = styled.TouchableOpacity`
  position: relative;
`;

const Avatar = styled.Image`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: ${props => props.theme.colors.background.dark};
`;

const CameraBadge = styled.View`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: ${props => props.theme.colors.primary.main};
  width: 36px;
  height: 36px;
  border-radius: 18px;
  justify-content: center;
  align-items: center;
  border-width: 3px;
  border-color: ${props => props.theme.colors.background.paper};
`;

const SaveButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary.main};
  margin: 20px;
  padding: 18px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
`;

const SaveButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 700;
`;

export default function EditProfileScreen() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        bio: '',
        city: '',
        photoURL: ''
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                displayName: profile.displayName || '',
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                phoneNumber: profile.phoneNumber || '',
                bio: profile.bio || '',
                city: profile.location?.city || '',
                photoURL: profile.photoURL || ''
            });
        }
    }, [profile]);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setFormData(prev => ({ ...prev, photoURL: result.assets[0].uri }));
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await updateUserProfile(user.uid, {
                displayName: formData.displayName,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                bio: formData.bio,
                location: {
                    ...profile?.location,
                    city: formData.city,
                } as any,
                photoURL: formData.photoURL
            });
            Alert.alert("Success", "Profile updated successfully!");
            router.back();
        } catch (error) {
            console.error("Update Error:", error);
            Alert.alert("Error", "Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container theme={theme}>
            <MobileHeader title="Edit Profile" back />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <Content showsVerticalScrollIndicator={false}>
                    <AvatarSection theme={theme}>
                        <AvatarContainer onPress={handlePickImage}>
                            <Avatar source={{ uri: formData.photoURL || undefined }} />
                            <CameraBadge theme={theme}>
                                <Ionicons name="camera" size={20} color="white" />
                            </CameraBadge>
                        </AvatarContainer>
                    </AvatarSection>

                    <FormSection theme={theme}>
                        <SectionTitle theme={theme}>Basic Information</SectionTitle>

                        <InputGroup>
                            <Label theme={theme}>Public Display Name</Label>
                            <StyledInput
                                theme={theme}
                                value={formData.displayName}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
                                placeholder="How others see you"
                            />
                        </InputGroup>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <InputGroup style={{ flex: 1 }}>
                                <Label theme={theme}>First Name</Label>
                                <StyledInput
                                    theme={theme}
                                    value={formData.firstName}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                                    placeholder="First Name"
                                />
                            </InputGroup>
                            <InputGroup style={{ flex: 1 }}>
                                <Label theme={theme}>Last Name</Label>
                                <StyledInput
                                    theme={theme}
                                    value={formData.lastName}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                                    placeholder="Last Name"
                                />
                            </InputGroup>
                        </View>
                    </FormSection>

                    <FormSection theme={theme}>
                        <SectionTitle theme={theme}>Contact & Bio</SectionTitle>

                        <InputGroup>
                            <Label theme={theme}>Phone Number</Label>
                            <StyledInput
                                theme={theme}
                                value={formData.phoneNumber}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                                placeholder="+359 ..."
                                keyboardType="phone-pad"
                            />
                        </InputGroup>

                        <InputGroup>
                            <Label theme={theme}>City</Label>
                            <StyledInput
                                theme={theme}
                                value={formData.city}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
                                placeholder="Sofia, Plovdiv, etc."
                            />
                        </InputGroup>

                        <InputGroup>
                            <Label theme={theme}>Bio</Label>
                            <BioInput
                                theme={theme}
                                value={formData.bio}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                                placeholder="Tell us a bit about yourself..."
                                multiline
                                numberOfLines={4}
                            />
                        </InputGroup>
                    </FormSection>

                    <SaveButton theme={theme} onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <SaveButtonText>Save Changes</SaveButtonText>
                        )}
                    </SaveButton>

                    <View style={{ height: 40 }} />
                </Content>
            </KeyboardAvoidingView>
        </Container>
    );
}
