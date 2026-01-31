import React, { useEffect } from 'react';
import { ViewStyle, DimensionValue } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';
import styled from 'styled-components/native';

interface SkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    borderRadius?: number;
    style?: ViewStyle;
}

const SkeletonContainer = styled(Animated.View) <{ width?: DimensionValue; height?: DimensionValue; borderRadius?: number }>`
  background-color: ${theme.colors.background.dark};
  width: ${props => typeof props.width === 'number' ? `${props.width}px` : (props.width || '100%')};
  height: ${props => typeof props.height === 'number' ? `${props.height}px` : (props.height || '20px')};
  border-radius: ${props => props.borderRadius || 4}px;
  overflow: hidden;
`;

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, borderRadius = 8, style }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
            ),
            -1, // Infinite repeat
            true // Reverse
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <SkeletonContainer
            width={width}
            height={height}
            borderRadius={borderRadius}
            style={[style, animatedStyle]}
        />
    );
};
