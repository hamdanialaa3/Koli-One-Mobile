import React from 'react';
import { Platform, TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface GoogleLoginButtonProps {
    onPress: () => Promise<void>;
    loading?: boolean;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onPress, loading }) => {
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary.main} />
            </View>
        );
    }



    // NATIVE RENDER
    return (
        <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={onPress}
            style={{ width: '100%', height: 48 }}
        />
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

});
