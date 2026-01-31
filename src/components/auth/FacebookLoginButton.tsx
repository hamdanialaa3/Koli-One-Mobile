import React from 'react';
import { Platform, TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface FacebookLoginButtonProps {
    onPress: () => Promise<void>;
    loading?: boolean;
}

export const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({ onPress, loading }) => {
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1877F2" />
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Ionicons name="logo-facebook" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.buttonText}>Sign in with Facebook</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#1877F2', // Facebook Blue
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        marginTop: 12,
        ...Platform.select({
            web: {
                boxShadow: '0px 4px 12px rgba(24, 119, 242, 0.25)',
            },
            default: {
                shadowColor: '#1877F2',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
            }
        })
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});
