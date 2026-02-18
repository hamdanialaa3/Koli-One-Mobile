import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { logger } from '../../services/logger-service';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PriceEstimatorService, { PriceEstimateResult, PriceEstimateInput } from '../../services/PriceEstimatorService';
import { PriceGauge } from './PriceGauge';
import { theme } from '../../styles/theme';

interface Props {
  carData: PriceEstimateInput & { currentPrice: number };
  currency?: string;
}

const Card = styled.View`
  margin: 16px 20px;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 20px;
  overflow: hidden;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
`;

const Header = styled(LinearGradient)`
  padding: 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  margin-left: 12px;
`;

const HeaderSubtitle = styled.Text`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin-left: 12px;
  margin-top: 4px;
`;

const InfoButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.2);
  align-items: center;
  justify-content: center;
`;

const LoadingContainer = styled.View`
  padding: 60px 20px;
  align-items: center;
`;

const LoadingText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 16px;
`;

const ErrorContainer = styled.View`
  padding: 40px 20px;
  align-items: center;
`;

const ErrorIcon = styled(Ionicons).attrs({
  name: 'alert-circle-outline',
  size: 48,
  color: theme.colors.status.error,
})`
  margin-bottom: 12px;
`;

const ErrorTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
  text-align: center;
`;

const ErrorText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  line-height: 20px;
`;

const GaugeContainer = styled.View`
  padding: 0;
`;

const StatsSection = styled.View`
  padding: 20px;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.muted};
`;

const StatsGrid = styled.View`
  flex-direction: row;
  justify-content: space-around;
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatValue = styled.Text`
  font-size: 18px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary.main};
  margin-bottom: 4px;
`;

const StatLabel = styled.Text`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
`;

const ConfidenceBadge = styled.View<{ level: 'high' | 'medium' | 'low' }>`
  flex-direction: row;
  align-items: center;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: ${props => 
    props.level === 'high' ? '#E8F5E9' :
    props.level === 'medium' ? '#FFF3E0' : '#FFEBEE'};
  margin-top: 16px;
  align-self: center;
`;

const ConfidenceText = styled.Text<{ level: 'high' | 'medium' | 'low' }>`
  font-size: 12px;
  font-weight: 700;
  color: ${props =>
    props.level === 'high' ? '#4CAF50' :
    props.level === 'medium' ? '#FF9800' : '#F44336'};
  margin-left: 6px;
`;

const DealBadge = styled.View<{ type: 'great-deal' | 'good-price' | 'fair-price' | 'high-price' | 'overpriced' }>`
  padding: 12px 20px;
  border-radius: 12px;
  background-color: ${props =>
    props.type === 'great-deal' ? '#E8F5E9' :
    props.type === 'good-price' ? '#E8F5E9' :
    props.type === 'fair-price' ? '#E3F2FD' :
    props.type === 'high-price' ? '#FFF3E0' : '#FFEBEE'};
  margin: 16px 20px;
  flex-direction: row;
  align-items: center;
`;

const DealBadgeText = styled.Text<{ type: 'great-deal' | 'good-price' | 'fair-price' | 'high-price' | 'overpriced' }>`
  font-size: 15px;
  font-weight: 700;
  color: ${props =>
    props.type === 'great-deal' ? '#4CAF50' :
    props.type === 'good-price' ? '#4CAF50' :
    props.type === 'fair-price' ? '#2196F3' :
    props.type === 'high-price' ? '#FF9800' : '#F44336'};
  margin-left: 8px;
  flex: 1;
`;

/**
 * PriceEstimatorCard Component
 * Displays AI-powered fair market price estimation with visual gauge
 * 
 * Features:
 * - Real-time market data analysis
 * - Visual price gauge (green/yellow/red zones)
 * - Confidence indicator based on sample size
 * - Deal rating badge (great deal / fair / overpriced)
 */
export const PriceEstimatorCard: React.FC<Props> = ({ carData, currency = '€' }) => {
  const [estimate, setEstimate] = useState<PriceEstimateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEstimate();
  }, [carData.make, carData.model, carData.year]);

  const fetchEstimate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await PriceEstimatorService.estimatePrice({
        make: carData.make,
        model: carData.model,
        year: carData.year,
        mileage: carData.mileage,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        location: carData.location
      });

      setEstimate(result);
    } catch (err) {
      logger.error('Failed to fetch price estimate', err);
      setError('Не успяхме да изчислим справедлива цена. Моля, опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  const getDealRating = () => {
    if (!estimate) return null;
    return PriceEstimatorService.comparePriceToEstimate(carData.currentPrice, estimate);
  };

  const getDealBadgeText = (rating: string) => {
    switch (rating) {
      case 'great-deal':
        return '🔥 Страхотна сделка!';
      case 'good-price':
        return '✅ Добра цена';
      case 'fair-price':
        return '✓ Справедлива цена';
      case 'high-price':
        return '⚠️ Високо ценена';
      case 'overpriced':
        return '❌ Прекалено скъпо';
      default:
        return '';
    }
  };

  const getConfidenceText = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'Високо доверие';
      case 'medium':
        return 'Средно доверие';
      case 'low':
        return 'Ниско доверие';
    }
  };

  const getConfidenceIcon = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'checkmark-circle';
      case 'medium':
        return 'alert-circle';
      case 'low':
        return 'information-circle';
    }
  };

  return (
    <Card theme={theme}>
      <Header colors={['#667eea', '#764ba2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View>
          <HeaderLeft>
            <Ionicons name="analytics-outline" size={24} color="#fff" />
            <HeaderTitle>Справедлива цена</HeaderTitle>
          </HeaderLeft>
          <HeaderSubtitle>AI анализ на пазара</HeaderSubtitle>
        </View>
        <InfoButton>
          <Ionicons name="information-outline" size={18} color="#fff" />
        </InfoButton>
      </Header>

      {loading ? (
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <LoadingText theme={theme}>Анализираме пазара...</LoadingText>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <ErrorIcon name="alert-circle-outline" />
          <ErrorTitle theme={theme}>Грешка</ErrorTitle>
          <ErrorText theme={theme}>{error}</ErrorText>
        </ErrorContainer>
      ) : estimate ? (
        <>
          {/* Price Gauge */}
          <GaugeContainer>
            <PriceGauge
              min={estimate.min}
              fair={estimate.fair}
              max={estimate.max}
              currentPrice={carData.currentPrice}
              currency={currency}
            />
          </GaugeContainer>

          {/* Deal Badge */}
          {(() => {
            const dealRating = getDealRating();
            if (!dealRating) return null;

            return (
              <DealBadge type={dealRating.rating}>
                <DealBadgeText type={dealRating.rating}>
                  {getDealBadgeText(dealRating.rating)}
                  {dealRating.savingsAmount 
                    ? ` • Спестявате ${currency}${dealRating.savingsAmount.toLocaleString('en-BG')}`
                    : ''
                  }
                </DealBadgeText>
              </DealBadge>
            );
          })()}

          {/* Stats */}
          <StatsSection theme={theme}>
            <StatsGrid>
              <StatItem>
                <StatValue theme={theme}>{estimate.sampleSize}</StatValue>
                <StatLabel theme={theme}>Подобни обяви</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue theme={theme}>
                  {currency}{estimate.average.toLocaleString('en-BG')}
                </StatValue>
                <StatLabel theme={theme}>Средна цена</StatLabel>
              </StatItem>
            </StatsGrid>

            <ConfidenceBadge level={estimate.confidence}>
              <Ionicons 
                name={getConfidenceIcon(estimate.confidence)} 
                size={14} 
                color={
                  estimate.confidence === 'high' ? '#4CAF50' :
                  estimate.confidence === 'medium' ? '#FF9800' : '#F44336'
                } 
              />
              <ConfidenceText level={estimate.confidence}>
                {getConfidenceText(estimate.confidence)}
              </ConfidenceText>
            </ConfidenceBadge>
          </StatsSection>
        </>
      ) : null}
    </Card>
  );
};

export default PriceEstimatorCard;
