import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnimatedButtonProps extends TouchableOpacityProps {
    scaleTo?: number;
    useHaptic?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    children,
    scaleTo = 0.96,
    useHaptic = true,
    onPress,
    onPressIn,
    onPressOut,
    style,
    ...props
}) => {
    const scale = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = (event: any) => {
        if (useHaptic && Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.spring(scale, {
            toValue: scaleTo,
            useNativeDriver: true,
            speed: 20,
            bounciness: 0,
        }).start();
        onPressIn?.(event);
    };

    const handlePressOut = (event: any) => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 0,
        }).start();
        onPressOut?.(event);
    };

    return (
        <TouchableOpacity
            {...props}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
        >
            <Animated.View style={[style, { transform: [{ scale }] }]}>
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
};
