import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { theme } from '../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-top: 24px;
  text-align: center;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  margin-top: 12px;
`;

const PreviewImage = styled.Image`
  width: 300px;
  height: 200px;
  border-radius: 16px;
  margin-top: 32px;
`;

export default function VisualSearchScreen() {
    const { imageUri } = useLocalSearchParams();
    const [analyzing, setAnalyzing] = useState(true);

    // Mock analysis
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setAnalyzing(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Container theme={theme}>
            <Stack.Screen options={{ title: 'Visual AI Search', headerBackTitle: 'Home' }} />

            {analyzing ? (
                <>
                    <ActivityIndicator size="large" color="#FF7900" />
                    <Title>Analyzing Vehicle...</Title>
                    <Subtitle>Our AI is identifying make, model, and generation.</Subtitle>
                    {imageUri && <PreviewImage source={{ uri: imageUri as string }} resizeMode="cover" />}
                </>
            ) : (
                <>
                    <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
                    <Title>Analysis Complete</Title>
                    <Subtitle>We found 12 similar results.</Subtitle>
                    {imageUri && <PreviewImage source={{ uri: imageUri as string }} resizeMode="cover" />}
                    {/* List would go here */}
                </>
            )}
        </Container>
    );
}
