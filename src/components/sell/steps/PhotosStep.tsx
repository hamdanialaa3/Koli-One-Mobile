import React from 'react';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { theme } from '../../../styles/theme';
import { VehicleFormData } from '../../../types/sellTypes';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface PhotosStepProps {
    data: Partial<VehicleFormData>;
    onUpdate: (updates: Partial<VehicleFormData>) => void;
}

const StepContainer = styled.View`
  padding: 24px 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 15px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 32px;
  line-height: 22px;
`;

const PhotoGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
`;

const AddButton = styled.TouchableOpacity`
  width: 100px;
  height: 100px;
  background-color: ${props => props.theme.colors.background.paper};
  border-width: 2px;
  border-style: dashed;
  border-color: ${props => props.theme.colors.border.muted};
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;

const PhotoItem = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
`;

const PreviewImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const RemoveButton = styled.TouchableOpacity`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(0,0,0,0.5);
  border-radius: 12px;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
`;

const PhotosStep: React.FC<PhotosStepProps> = ({ data, onUpdate }) => {
    const images = data.images || [];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newUris = result.assets.map(asset => asset.uri);
            onUpdate({ images: [...images, ...newUris].slice(0, 15) });
        }
    };

    const removeImage = (uri: string) => {
        onUpdate({ images: images.filter(i => i !== uri) });
    };

    return (
        <StepContainer theme={theme}>
            <Title theme={theme}>Photos</Title>
            <Subtitle theme={theme}>Add up to 15 high-quality photos. Ads with clear photos sell up to 5x faster.</Subtitle>

            <PhotoGrid>
                {images.map((uri, index) => (
                    <PhotoItem key={index}>
                        <PreviewImage source={{ uri }} />
                        <RemoveButton onPress={() => removeImage(uri)}>
                            <Ionicons name="close" size={16} color="#fff" />
                        </RemoveButton>
                    </PhotoItem>
                ))}
                {images.length < 15 && (
                    <AddButton theme={theme} onPress={pickImage}>
                        <Ionicons name="camera-outline" size={32} color={theme.colors.text.secondary} />
                        <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 4 }}>Add Photo</Text>
                    </AddButton>
                )}
            </PhotoGrid>

            <Text style={{ fontSize: 13, color: theme.colors.text.disabled, textAlign: 'center' }}>
                {images.length} / 15 Photos uploaded
            </Text>
        </StepContainer>
    );
};

export default PhotosStep;
