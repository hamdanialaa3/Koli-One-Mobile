import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image, ImageProps } from 'expo-image';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Skeleton } from './Skeleton';

interface AnimatedImageProps extends ImageProps {
    containerStyle?: ViewStyle;
    showSkeleton?: boolean;
}

const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

export const AnimatedImage: React.FC<AnimatedImageProps> = ({
    style,
    containerStyle,
    showSkeleton = true,
    onLoad,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isLoaded ? 1 : 0, { duration: 450 }),
    }));

    return (
        <View style={[styles.container, containerStyle]}>
            {showSkeleton && !isLoaded && (
                <View style={StyleSheet.absoluteFill}>
                    <Skeleton width="100%" height="100%" borderRadius={0} />
                </View>
            )}

            <AnimatedExpoImage
                {...props}
                style={[style, animatedStyle]}
                onLoad={(e) => {
                    setIsLoaded(true);
                    onLoad?.(e);
                }}
                transition={null} // We handle transition via Reanimated for more control
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
});
