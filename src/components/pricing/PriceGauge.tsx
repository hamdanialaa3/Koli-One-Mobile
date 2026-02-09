import React from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  min: number;
  fair: number;
  max: number;
  currentPrice: number;
  currency?: string;
}

const Container = styled.View`
  padding: 20px;
`;

const GaugeContainer = styled.View`
  position: relative;
  height: 80px;
  margin: 20px 0;
`;

const Track = styled.View`
  width: 100%;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  flex-direction: row;
`;

const GreenZone = styled.View<{ width: string }>`
  width: ${props => props.width};
  height: 100%;
  background-color: #4CAF50;
`;

const YellowZone = styled.View<{ width: string }>`
  width: ${props => props.width};
  height: 100%;
  background-color: #FFB800;
`;

const RedZone = styled.View<{ width: string }>`
  width: ${props => props.width};
  height: 100%;
  background-color: #F44336;
`;

const Marker = styled.View<{ left: string; color: string }>`
  position: absolute;
  left: ${props => props.left};
  top: -10px;
  width: 3px;
  height: 32px;
  background-color: ${props => props.color};
  border-radius: 2px;
`;

const MarkerCircle = styled.View<{ color: string }>`
  position: absolute;
  bottom: -6px;
  left: -4.5px;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${props => props.color};
  border-width: 2px;
  border-color: #fff;
`;

const CurrentPriceLabel = styled.View<{ left: string; isBelow: boolean }>`
  position: absolute;
  left: ${props => props.left};
  ${props => props.isBelow ? 'top: 40px;' : 'bottom: 40px;'}
  transform: translateX(-50%);
  background-color: #2196F3;
  padding: 6px 12px;
  border-radius: 16px;
  min-width: 80px;
  align-items: center;
`;

const CurrentPriceText = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: #fff;
`;

const LabelsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
`;

const Label = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const PriceText = styled.Text<{ bold?: boolean }>`
  font-size: ${props => props.bold ? '14px' : '12px'};
  font-weight: ${props => props.bold ? '700' : '400'};
  color: ${props => props.theme.colors.text.primary};
`;

const LegendRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-top: 16px;
  padding: 12px;
  background-color: ${props => props.theme.colors.background.dark};
  border-radius: 12px;
`;

const LegendItem = styled.View`
  align-items: center;
`;

const LegendDot = styled.View<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${props => props.color};
  margin-bottom: 4px;
`;

const LegendLabel = styled.Text`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
`;

const LegendValue = styled.Text`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-top: 2px;
`;

/**
 * PriceGauge Component
 * Visual gauge showing price range (min/fair/max) and current price position
 * 
 * Zones:
 * - Green: min to fair (good deal zone)
 * - Yellow: fair to max (fair price zone)
 * - Red: max+ (overpriced zone)
 */
export const PriceGauge: React.FC<Props> = ({
  min,
  fair,
  max,
  currentPrice,
  currency = '€'
}) => {
  // Calculate zone widths as percentages
  const range = max - min;
  const greenWidth = ((fair - min) / range) * 100;
  const yellowWidth = ((max - fair) / range) * 100;
  const redWidth = 100 - greenWidth - yellowWidth;

  // Calculate current price position
  let currentPosition: number;
  if (currentPrice <= min) {
    currentPosition = 0;
  } else if (currentPrice >= max) {
    currentPosition = 100;
  } else {
    currentPosition = ((currentPrice - min) / range) * 100;
  }

  // Determine marker color based on zone
  let markerColor: string;
  if (currentPrice <= fair) {
    markerColor = '#4CAF50'; // Green zone
  } else if (currentPrice <= max) {
    markerColor = '#FFB800'; // Yellow zone
  } else {
    markerColor = '#F44336'; // Red zone
  }

  // Format price
  const formatPrice = (price: number) => {
    return `${currency}${price.toLocaleString('en-BG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Current price label position (above track if in red zone, below otherwise)
  const isCurrentInRedZone = currentPrice > max;

  return (
    <Container>
      <GaugeContainer>
        {/* Track with zones */}
        <Track>
          <GreenZone width={`${greenWidth}%`} />
          <YellowZone width={`${yellowWidth}%`} />
          <RedZone width={`${redWidth}%`} />
        </Track>

        {/* Min marker (start of track) */}
        <Marker left="0%" color="#4CAF50">
          <MarkerCircle color="#4CAF50" />
        </Marker>

        {/* Fair marker (transition point) */}
        <Marker left={`${greenWidth}%`} color="#FFB800">
          <MarkerCircle color="#FFB800" />
        </Marker>

        {/* Max marker (end of yellow zone) */}
        <Marker left={`${greenWidth + yellowWidth}%`} color="#F44336">
          <MarkerCircle color="#F44336" />
        </Marker>

        {/* Current price marker */}
        <Marker left={`${currentPosition}%`} color={markerColor}>
          <MarkerCircle color={markerColor} />
        </Marker>

        {/* Current price label */}
        <CurrentPriceLabel left={`${currentPosition}%`} isBelow={!isCurrentInRedZone}>
          <CurrentPriceText>{formatPrice(currentPrice)}</CurrentPriceText>
        </CurrentPriceLabel>
      </GaugeContainer>

      {/* Labels below track */}
      <LabelsRow>
        <View style={{ alignItems: 'flex-start' }}>
          <Label>Минимум</Label>
          <PriceText>{formatPrice(min)}</PriceText>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Label>Справедлива</Label>
          <PriceText bold>{formatPrice(fair)}</PriceText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Label>Максимум</Label>
          <PriceText>{formatPrice(max)}</PriceText>
        </View>
      </LabelsRow>

      {/* Legend */}
      <LegendRow>
        <LegendItem>
          <LegendDot color="#4CAF50" />
          <LegendLabel>Добра сделка</LegendLabel>
        </LegendItem>
        <LegendItem>
          <LegendDot color="#FFB800" />
          <LegendLabel>Справедлива</LegendLabel>
        </LegendItem>
        <LegendItem>
          <LegendDot color="#F44336" />
          <LegendLabel>Скъпо</LegendLabel>
        </LegendItem>
      </LegendRow>
    </Container>
  );
};

export default PriceGauge;
