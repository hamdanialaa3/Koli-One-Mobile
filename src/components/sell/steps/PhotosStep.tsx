import React from 'react';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSellStore, ImageItem } from '../../../store/useSellStore';
import { useUploadQueue } from '../../../hooks/useUploadQueue';

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
  background-color: ${props => props.theme.colors.background.subtle};
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
  z-index: 2;
`;

const StatusOverlay = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0,0,0,0.6);
  padding: 4px;
  align-items: center;
  justify-content: center;
`;

const StatusText = styled.Text<{ error?: boolean }>`
  color: ${props => props.error ? props.theme.colors.status.error : '#fff'};
  font-size: 10px;
  font-weight: 600;
`;

const PhotosStep: React.FC = () => {
  const {
    images,
    addImage,
    removeImage,
    updateImage
  } = useSellStore();

  // Activate the upload queue
  useUploadQueue();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      result.assets.forEach(asset => {
        if (images.length < 15) {
          const newImage: ImageItem = {
            id: Math.random().toString(36).substring(7),
            uri: asset.uri,
            status: 'idle',
            progress: 0
          };
          addImage(newImage);
        }
      });
    }
  };

  const handleRetry = (id: string) => {
    updateImage(id, { status: 'idle', progress: 0 });
  };

  return (
    <StepContainer theme={theme}>
      <Title theme={theme}>Photos</Title>
      <Subtitle theme={theme}>Add up to 15 high-quality photos. Ads with clear photos sell up to 5x faster.</Subtitle>

      <PhotoGrid>
        {images.map((img) => {
          const isError = img.status === 'error';
          const isUploading = img.status === 'uploading';
          const isSuccess = img.status === 'done' || img.uri.startsWith('http');

          return (
            <PhotoItem key={img.id} theme={theme}>
              <PreviewImage source={{ uri: img.uri }} style={{ opacity: isUploading ? 0.7 : 1 }} />

              <RemoveButton onPress={() => removeImage(img.id)}>
                <Ionicons name="close" size={16} color="#fff" />
              </RemoveButton>

              {(isUploading || isError) && (
                <StatusOverlay>
                  {isUploading && <ActivityIndicator size="small" color="#fff" />}
                  {isError && (
                    <TouchableOpacity onPress={() => handleRetry(img.id)}>
                      <StatusText error theme={theme}>Retry</StatusText>
                    </TouchableOpacity>
                  )}
                </StatusOverlay>
              )}

              {isSuccess && (
                <View style={{ position: 'absolute', bottom: 4, right: 4 }}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.status.success} />
                </View>
              )}
            </PhotoItem>
          );
        })}

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
