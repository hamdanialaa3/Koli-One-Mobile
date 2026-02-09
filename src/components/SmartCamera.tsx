// src/components/SmartCamera.tsx
import React, { useState, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface SmartCameraProps {
    onCapture: (photo: any) => void;
    onClose: () => void;
}

const Overlay = styled.View`
  flex: 1;
  background-color: 'transparent';
  justify-content: space-between;
  padding: 20px;
`;

const GuideFrame = styled.View`
  flex: 1;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  margin: 40px 20px;
  border-style: dashed;
  justify-content: center;
  align-items: center;
`;

const GuideText = styled.Text`
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  background-color: rgba(0,0,0,0.3);
  padding: 8px 16px;
  border-radius: 8px;
`;

const ControlsRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 30px;
`;

const CaptureButton = styled.TouchableOpacity`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: rgba(255, 255, 255, 0.3);
  justify-content: center;
  align-items: center;
  border-width: 4px;
  border-color: #fff;
`;

const InnerCircle = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #fff;
`;

export default function SmartCamera({ onCapture, onClose }: SmartCameraProps) {
    const [type] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [processing, setProcessing] = useState(false);
    const cameraRef = useRef<CameraView>(null);

    if (!permission) {
        // Camera permissions are still loading
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', marginBottom: 20 }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current && !processing) {
            setProcessing(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: true,
                    skipProcessing: true // Faster capture
                });
                onCapture(photo);
            } catch (error) {
                console.error('Capture failed:', error);
            } finally {
                setProcessing(false);
            }
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={type} ref={cameraRef}>
                <Overlay>
                    <TouchableOpacity onPress={onClose} style={{ marginTop: 40, alignSelf: 'flex-start' }}>
                        <Ionicons name="close-circle" size={40} color="#fff" />
                    </TouchableOpacity>

                    <GuideFrame>
                        <GuideText>Align car within frame for AI analysis</GuideText>
                    </GuideFrame>

                    <ControlsRow>
                        {/* Flash/Flip controls could go here */}
                        <View style={{ width: '40px' as any }} />

                        {processing ? (
                            <ActivityIndicator size="large" color="#fff" />
                        ) : (
                            <CaptureButton onPress={takePicture}>
                                <InnerCircle />
                            </CaptureButton>
                        )}

                        <View style={{ width: '40px' as any }} />
                    </ControlsRow>
                </Overlay>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
});
