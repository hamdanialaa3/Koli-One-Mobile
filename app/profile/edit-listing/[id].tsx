import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Switch,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../../src/styles/theme';
import { MobileHeader } from '../../../src/components/common/MobileHeader';
import { ListingService } from '../../../src/services/ListingService';
import { ListingBase } from '../../../src/types/ListingBase';
import { Ionicons } from '@expo/vector-icons';

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Form = styled.ScrollView`
  padding: 20px;
`;

const FormGroup = styled.View`
  margin-bottom: 20px;
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  marginBottom: 8px;
`;

const StyledInput = styled.TextInput`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 12px 16px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.default};
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
`;

const TextArea = styled(StyledInput)`
  height: 120px;
  text-align-vertical: top;
`;

const SoldContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.theme.colors.background.paper};
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.default};
`;

const SaveButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary.main};
  padding: 18px;
  border-radius: 12px;
  align-items: center;
  margin-top: 20px;
  flex-direction: row;
  justify-content: center;
`;

const SaveButtonText = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin-right: 8px;
`;

export default function EditListingScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [car, setCar] = useState<ListingBase | null>(null);

    const [price, setPrice] = useState('');
    const [mileage, setMileage] = useState('');
    const [description, setDescription] = useState('');
    const [isSold, setIsSold] = useState(false);

    useEffect(() => {
        if (id) {
            loadCar();
        }
    }, [id]);

    const loadCar = async () => {
        const data = await ListingService.getListingById(id as string);
        if (data) {
            setCar(data);
            setPrice(data.price.toString());
            setMileage(data.mileage.toString());
            setDescription(data.description || '');
            setIsSold(data.status === 'sold');
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!id || !car) return;

        setSaving(true);
        try {
            await ListingService.updateListing(id as string, {
                price: Number(price),
                mileage: Number(mileage),
                description,
                status: isSold ? 'sold' : 'active'
            });

            Alert.alert("Success", "Listing updated successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to update listing");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <Container theme={theme}>
            <MobileHeader title="Edit Listing" back />
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator color={theme.colors.primary.main} />
            </View>
        </Container>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Container theme={theme}>
                <MobileHeader title="Edit Listing" back />
                <Form>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 20 }}>
                        {car?.make} {car?.model} ({car?.year})
                    </Text>

                    <SoldContainer theme={theme}>
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text.primary }}>
                                Mark as Sold
                            </Text>
                            <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>
                                {isSold ? 'Listing is currently inactive' : 'Is this car sold?'}
                            </Text>
                        </View>
                        <Switch
                            value={isSold}
                            onValueChange={setIsSold}
                            trackColor={{ false: theme.colors.border.default, true: theme.colors.primary.main }}
                        />
                    </SoldContainer>

                    <FormGroup>
                        <Label theme={theme}>Price ({car?.currency})</Label>
                        <StyledInput
                            theme={theme}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label theme={theme}>Mileage (km)</Label>
                        <StyledInput
                            theme={theme}
                            value={mileage}
                            onChangeText={setMileage}
                            keyboardType="numeric"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label theme={theme}>Description</Label>
                        <TextArea
                            theme={theme}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={6}
                        />
                    </FormGroup>

                    <SaveButton theme={theme} onPress={handleSave} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <SaveButtonText>Save Changes</SaveButtonText>
                                <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                            </>
                        )}
                    </SaveButton>

                    <View style={{ height: 40 }} />
                </Form>
            </Container>
        </KeyboardAvoidingView>
    );
}
