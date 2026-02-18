import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
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
        borderRadius: 8,
        width: '100%',
        // Web-specific shadow
        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
    },
    webButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
    }
});
