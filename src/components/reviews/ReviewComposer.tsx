import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Modal, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { ReviewService, SubmitReviewData } from '../../services/ReviewService';
import ReviewStars from './ReviewStars';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../services/logger-service';

/**
 * TASK-08: Review Composer Component
 * Form for writing and submitting a new review
 */

interface ReviewComposerProps {
    visible: boolean;
    onClose: () => void;
    sellerId: string;
    carId?: string;
    onSubmitted?: () => void;
}

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const ModalContent = styled.View`
  background-color: ${props => props.theme.colors.background.default};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  max-height: 85%;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const CloseButton = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${props => props.theme.colors.background.paper};
  align-items: center;
  justify-content: center;
`;

const FormContainer = styled.ScrollView`
  padding: 20px;
`;

const FormSection = styled.View`
  margin-bottom: 24px;
`;

const SectionLabel = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 12px;
`;

const RatingContainer = styled.View`
  align-items: center;
  padding: 20px;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
`;

const Input = styled.TextInput`
  background-color: ${props => props.theme.colors.background.paper};
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 15px;
  color: ${props => props.theme.colors.text.primary};
`;

const TextArea = styled.TextInput`
  background-color: ${props => props.theme.colors.background.paper};
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 15px;
  color: ${props => props.theme.colors.text.primary};
  min-height: 120px;
  text-align-vertical: top;
`;

const CharCount = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.disabled};
  text-align: right;
  margin-top: 4px;
`;

const SwitchRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  margin-bottom: 12px;
`;

const SwitchLabel = styled.Text`
  font-size: 15px;
  color: ${props => props.theme.colors.text.primary};
  flex: 1;
`;

const SwitchButton = styled.TouchableOpacity<{ active: boolean }>`
  width: 50px;
  height: 28px;
  border-radius: 14px;
  background-color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.border.muted};
  justify-content: center;
  padding: 2px;
`;

const SwitchThumb = styled.View<{ active: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: white;
  align-self: ${props => props.active ? 'flex-end' : 'flex-start'};
`;

const SubmitButton = styled.TouchableOpacity<{ disabled: boolean }>`
  background-color: ${props => props.disabled 
    ? props.theme.colors.border.muted 
    : props.theme.colors.primary.main};
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  margin-top: 12px;
`;

const SubmitButtonText = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: white;
`;

const HelperText = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.disabled};
  margin-top: 8px;
  line-height: 18px;
`;

const ReviewComposer: React.FC<ReviewComposerProps> = ({
    visible,
    onClose,
    sellerId,
    carId,
    onSubmitted
}) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [wouldRecommend, setWouldRecommend] = useState(true);
    const [verifiedPurchase, setVerifiedPurchase] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert('Грешка', 'Трябва да влезете, за да напишете отзив');
            return;
        }

        if (comment.trim().length < 20) {
            Alert.alert('Грешка', 'Отзивът трябва да е поне 20 символа');
            return;
        }

        setSubmitting(true);

        try {
            const reviewData: SubmitReviewData = {
                sellerId,
                carId,
                rating: rating as 1 | 2 | 3 | 4 | 5,
                title: title.trim() || comment.substring(0, 50),
                comment: comment.trim(),
                wouldRecommend,
                transactionType: verifiedPurchase ? 'purchase' : 'inquiry',
                verifiedPurchase
            };

            const result = await ReviewService.submitReview(reviewData);

            if (result.success) {
                Alert.alert(
                    'Успешно!',
                    result.message,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                onClose();
                                if (onSubmitted) onSubmitted();
                                // Reset form
                                setRating(5);
                                setTitle('');
                                setComment('');
                                setWouldRecommend(true);
                                setVerifiedPurchase(false);
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Грешка', result.message);
            }
        } catch (error) {
            logger.error('Error submitting review', error);
            Alert.alert('Грешка', 'Възникна проблем при изпращане на отзива');
        } finally {
            setSubmitting(false);
        }
    };

    const isValid = comment.trim().length >= 20 && rating > 0;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ModalOverlay>
                    <ModalContent theme={theme}>
                        <ModalHeader theme={theme}>
                            <HeaderTitle theme={theme}>Напишете отзив</HeaderTitle>
                            <CloseButton theme={theme} onPress={onClose}>
                                <Ionicons name="close" size={20} color={theme.colors.text.primary} />
                            </CloseButton>
                        </ModalHeader>

                        <FormContainer>
                            <FormSection>
                                <SectionLabel theme={theme}>Вашата оценка</SectionLabel>
                                <RatingContainer theme={theme}>
                                    <ReviewStars
                                        rating={rating}
                                        size="large"
                                        interactive
                                        onChange={setRating}
                                    />
                                </RatingContainer>
                            </FormSection>

                            <FormSection>
                                <SectionLabel theme={theme}>Заглавие (по избор)</SectionLabel>
                                <Input
                                    theme={theme}
                                    placeholder="Кратко резюме на вашия опит"
                                    placeholderTextColor={theme.colors.text.disabled}
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={100}
                                />
                            </FormSection>

                            <FormSection>
                                <SectionLabel theme={theme}>Вашият отзив *</SectionLabel>
                                <TextArea
                                    theme={theme}
                                    placeholder="Споделете вашия опит с този продавач..."
                                    placeholderTextColor={theme.colors.text.disabled}
                                    value={comment}
                                    onChangeText={setComment}
                                    multiline
                                    maxLength={1000}
                                />
                                <CharCount theme={theme}>
                                    {comment.length}/1000 ({Math.max(0, 20 - comment.length)} минимум)
                                </CharCount>
                                <HelperText theme={theme}>
                                    Моля, споделете честно мнение. Това помага на други купувачи.
                                </HelperText>
                            </FormSection>

                            <FormSection>
                                <SwitchRow theme={theme}>
                                    <SwitchLabel theme={theme}>Препоръчвам този продавач</SwitchLabel>
                                    <SwitchButton
                                        theme={theme}
                                        active={wouldRecommend}
                                        onPress={() => setWouldRecommend(!wouldRecommend)}
                                    >
                                        <SwitchThumb active={wouldRecommend} />
                                    </SwitchButton>
                                </SwitchRow>

                                <SwitchRow theme={theme}>
                                    <SwitchLabel theme={theme}>Потвърдена покупка</SwitchLabel>
                                    <SwitchButton
                                        theme={theme}
                                        active={verifiedPurchase}
                                        onPress={() => setVerifiedPurchase(!verifiedPurchase)}
                                    >
                                        <SwitchThumb active={verifiedPurchase} />
                                    </SwitchButton>
                                </SwitchRow>
                            </FormSection>

                            <SubmitButton
                                theme={theme}
                                disabled={!isValid || submitting}
                                onPress={handleSubmit}
                            >
                                <SubmitButtonText>
                                    {submitting ? 'Изпраща се...' : 'Публикуване на отзив'}
                                </SubmitButtonText>
                            </SubmitButton>
                        </FormContainer>
                    </ModalContent>
                </ModalOverlay>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default ReviewComposer;
