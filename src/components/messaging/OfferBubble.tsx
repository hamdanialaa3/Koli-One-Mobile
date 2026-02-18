/**
 * OfferBubble Component
 * فقاعة عرض السعر في المحادثات
 * 
 * @description Special message bubble for price offers with distinctive styling
 * Shows offer amount with emphasis and offer/accept indicators
 */

import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RealtimeMessage } from '../../services/MessagingService';
import { useTranslation } from '../../locales/useTranslation';
import { theme } from '../../styles/theme';

interface OfferBubbleProps {
  message: RealtimeMessage;
  isOwnMessage: boolean;
}

const BubbleContainer = styled.View<{ isOwn: boolean }>`
  max-width: 80%;
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  margin-bottom: 12px;
`;

const OfferCard = styled(LinearGradient)`
  border-radius: 16px;
  padding: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
  elevation: 4;
`;

const OfferHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const OfferIcon = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.2);
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;

const OfferLabel = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  flex: 1;
`;

const OfferAmount = styled.Text`
  color: #ffffff;
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 4px;
`;

const OfferCurrency = styled.Text`
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
  margin-left: 4px;
`;

const OfferNote = styled.Text`
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  margin-top: 8px;
  font-style: italic;
`;

const TimestampText = styled.Text<{ isOwn: boolean }>`
  color: ${props => props.theme.colors.text.disabled};
  font-size: 11px;
  margin-top: 4px;
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
`;

export const OfferBubble: React.FC<OfferBubbleProps> = ({ message, isOwnMessage }) => {
  const { t } = useTranslation();
  
  // Parse offer data from message content
  // Expected format: "OFFER:12500" or full text with embedded price
  const parseOffer = (content: string): { amount: number; note?: string } => {
    const offerMatch = content.match(/OFFER:(\d+)/);
    if (offerMatch) {
      return { amount: parseInt(offerMatch[1], 10) };
    }
    
    // Fallback: extract first number as offer
    const numMatch = content.match(/(\d+)/);
    return {
      amount: numMatch ? parseInt(numMatch[1], 10) : 0,
      note: content
    };
  };

  const offer = parseOffer(message.content);
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('bg-BG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <BubbleContainer isOwn={isOwnMessage}>
      <OfferCard
        colors={isOwnMessage 
          ? [theme.colors.primary.main, theme.colors.primary.dark]
          : [theme.colors.accent.main, theme.colors.accent.dark]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <OfferHeader>
          <OfferIcon>
            <Ionicons name="pricetag" size={18} color="#ffffff" />
          </OfferIcon>
          <OfferLabel>
            {isOwnMessage 
              ? t('messages.offer.sent') || 'Направена оферта'
              : t('messages.offer.received') || 'Получена оферта'
            }
          </OfferLabel>
        </OfferHeader>
        
        <OfferAmount>
          €{offer.amount.toLocaleString()}
          <OfferCurrency>EUR</OfferCurrency>
        </OfferAmount>
        
        {offer.note && offer.note !== `OFFER:${offer.amount}` && (
          <OfferNote>{offer.note}</OfferNote>
        )}
      </OfferCard>
      
      <TimestampText isOwn={isOwnMessage}>{formattedTime}</TimestampText>
    </BubbleContainer>
  );
};
