import React from 'react';
import styled from 'styled-components/native';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * TASK-08: Review Stars Component
 * Displays star ratings with optional interactivity
 */

interface ReviewStarsProps {
    rating: number;              // 0-5, supports decimals
    size?: 'small' | 'medium' | 'large';
    interactive?: boolean;       // Allow user to select rating
    onChange?: (rating: number) => void;
    showCount?: boolean;
    count?: number;
}

const Container = styled.View<{ row?: boolean }>`
  flex-direction: ${props => props.row ? 'row' : 'column'};
  align-items: center;
  gap: 8px;
`;

const StarsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 2px;
`;

const CountText = styled.Text<{ size: 'small' | 'medium' | 'large' }>`
  font-size: ${props => props.size === 'small' ? '12px' : props.size === 'medium' ? '14px' : '16px'};
  color: ${props => props.theme.colors.text.secondary};
  margin-left: 4px;
`;

const RatingText = styled.Text<{ size: 'small' | 'medium' | 'large' }>`
  font-size: ${props => props.size === 'small' ? '13px' : props.size === 'medium' ? '15px' : '18px'};
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-left: 4px;
`;

const ReviewStars: React.FC<ReviewStarsProps> = ({
    rating,
    size = 'medium',
    interactive = false,
    onChange,
    showCount = false,
    count = 0
}) => {
    const [hoverRating, setHoverRating] = React.useState<number | null>(null);

    const displayRating = hoverRating !== null ? hoverRating : rating;

    const handlePress = (starRating: number) => {
        if (interactive && onChange) {
            onChange(starRating);
        }
    };

    const getStarSize = () => {
        switch (size) {
            case 'small': return 14;
            case 'medium': return 18;
            case 'large': return 24;
            default: return 18;
        }
    };

    const renderStar = (starIndex: number) => {
        const fillPercentage = Math.max(0, Math.min(1, displayRating - starIndex + 1));
        
        let iconName: any = 'star';
        let color = '#FFB800';

        if (fillPercentage === 0) {
            iconName = 'star-outline';
            color = '#E0E0E0';
        } else if (fillPercentage < 1) {
            iconName = 'star-half';
        }

        const StarComponent = interactive ? TouchableOpacity : View;

        return (
            <StarComponent
                key={starIndex}
                onPress={() => interactive && handlePress(starIndex)}
                activeOpacity={0.7}
            >
                <Ionicons name={iconName} size={getStarSize()} color={color} />
            </StarComponent>
        );
    };

    return (
        <Container row={showCount || (!showCount && size !== 'small')}>
            <StarsRow>
                {[1, 2, 3, 4, 5].map(renderStar)}
            </StarsRow>

            {showCount && (
                <CountText size={size}>
                    ({count} {count === 1 ? 'отзив' : 'отзива'})
                </CountText>
            )}

            {!showCount && size !== 'small' && (
                <RatingText size={size}>{rating.toFixed(1)}</RatingText>
            )}
        </Container>
    );
};

export default ReviewStars;
