/**
 * QuickReplies Component
 * أزرار الردود السريعة للمحادثات
 * 
 * @description 3 quick reply buttons above message input for common questions
 * Translations: BG (primary) + EN (secondary)
 */

import React from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { useTranslation } from '../../locales/useTranslation';

interface QuickRepliesProps {
  onReplyPress: (text: string) => void;
}

const Container = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  padding: 12px 16px;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.default};
`;

const ReplyButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.background.default};
  padding: 10px 16px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.primary.main};
  margin-right: 8px;
`;

const ReplyText = styled.Text`
  color: ${props => props.theme.colors.primary.main};
  font-size: 14px;
  font-weight: 600;
`;

// Predefined quick replies in BG + EN
const QUICK_REPLIES = {
  bg: [
    'Колата налична ли е?',
    'Каква е най-ниската цена?',
    'Къде мога да я видя?'
  ],
  en: [
    'Is the car available?',
    'What\'s the lowest price?',
    'Where can I see it?'
  ]
};

export const QuickReplies: React.FC<QuickRepliesProps> = ({ onReplyPress }) => {
  const { language } = useTranslation();
  const replies = QUICK_REPLIES[language] || QUICK_REPLIES.bg;

  return (
    <Container>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {replies.map((text, index) => (
          <ReplyButton
            key={index}
            onPress={() => onReplyPress(text)}
            activeOpacity={0.7}
          >
            <ReplyText>{text}</ReplyText>
          </ReplyButton>
        ))}
      </ScrollView>
    </Container>
  );
};
