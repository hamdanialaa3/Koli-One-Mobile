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

    // WEB RENDER
    if (Platform.OS === 'web') {
        return (
            <TouchableOpacity
                style={styles.webButton}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.webButtonText}>Sign within Google</Text>
            </TouchableOpacity>
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
    webButton: {
        backgroundColor: '#4285F4', // Google Blue
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8, // Standard Google corner radius could be 20px, but 8px matches theme better
        width: '100%',
        ...Platform.select({
            web: {
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
            },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
            }
        })
    },
    webButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: Platform.OS === 'web' ? 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif' : undefined,
    }
});
