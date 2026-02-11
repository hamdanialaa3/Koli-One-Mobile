/**
 * VIN Check Card Component
 * 
 * Displays VIN check results with trust badge
 * Shows ownership count + accident history
 * 
 * Location: Bulgaria | Languages: BG/EN
 * Created: February 2026
 */

import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { vinCheckService, VinCheckResult } from '../../services/VinCheckService';
import { logger } from '../../services/logger-service';
import { useLanguage } from '../../contexts/LanguageContext';

// ==================== PROPS ====================

interface VinCheckCardProps {
  theme: any;
  initialVin?: string;
  onCheckComplete?: (result: VinCheckResult) => void;
}

// ==================== COMPONENT ====================

const VinCheckCard: React.FC<VinCheckCardProps> = ({ theme, initialVin, onCheckComplete }) => {
  const { language } = useLanguage();
  const isBG = language === 'bg';
  
  const [vin, setVin] = useState(initialVin || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VinCheckResult | null>(null);
  
  // ==================== HANDLERS ====================
  
  const handleCheck = async () => {
    if (!vin || vin.length !== 17) {
      Alert.alert(
        isBG ? 'Грешка' : 'Error',
        isBG ? 'VIN номерът трябва да е 17 символа' : 'VIN must be 17 characters'
      );
      return;
    }
    
    try {
      setIsLoading(true);
      logger.info('User initiated VIN check', { vin: vin.substring(0, 8) + '...' });
      
      const checkResult = await vinCheckService.checkVin(vin);
      setResult(checkResult);
      
      if (onCheckComplete) {
        onCheckComplete(checkResult);
      }
      
      logger.info('VIN check completed', { 
        vin: vin.substring(0, 8) + '...',
        isValid: checkResult.isValid,
        trustScore: checkResult.trustScore.overall 
      });
      
    } catch (error) {
      logger.error('VIN check failed', error as Error);
      Alert.alert(
        isBG ? 'Грешка' : 'Error',
        isBG ? 'Неуспешна проверка на VIN. Опитайте отново.' : 'Failed to check VIN. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setVin('');
    setResult(null);
  };
  
  // ==================== RENDER HELPERS ====================
  
  const getTrustColor = (level: string): string => {
    switch (level) {
      case 'excellent':
      case 'good':
        return theme.colors.success;
      case 'fair':
        return theme.colors.warning;
      case 'poor':
      default:
        return theme.colors.error;
    }
  };
  
  // ==================== RENDER ====================
  
  return (
    <Container theme={theme}>
      {/* Header */}
      <Header>
        <Ionicons name="shield-checkmark" size={32} color={theme.colors.primary} />
        <HeaderText theme={theme}>
          {isBG ? 'Проверка на VIN' : 'VIN Check'}
        </HeaderText>
      </Header>
      
      <Description theme={theme}>
        {isBG 
          ? 'Проверете историята на автомобила, предишни собственици и инциденти'
          : 'Verify vehicle history, previous owners, and accident records'}
      </Description>
      
      {/* VIN Input */}
      <InputContainer theme={theme}>
        <VinInput
          theme={theme}
          value={vin}
          onChangeText={(text) => setVin(text.toUpperCase().replace(/\s/g, ''))}
          placeholder={isBG ? 'Въведете VIN (17 символа)' : 'Enter VIN (17 characters)'}
          placeholderTextColor={theme.colors.textSecondary}
          maxLength={17}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!isLoading && !result}
        />
        <CharCount theme={theme}>
          {vin.length}/17
        </CharCount>
      </InputContainer>
      
      {/* Check Button */}
      {!result && (
        <CheckButton
          theme={theme}
          onPress={handleCheck}
          disabled={isLoading || vin.length !== 17}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="search" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <ButtonText>
                {isBG ? 'Провери сега' : 'Check Now'}
              </ButtonText>
            </>
          )}
        </CheckButton>
      )}
      
      {/* Results */}
      {result && (
        <ResultsContainer theme={theme}>
          {/* Trust Badge */}
          <TrustBadge theme={theme} trustColor={getTrustColor(result.trustScore.level)}>
            <BadgeText theme={theme}>
              {isBG ? result.trustScore.badgeBG : result.trustScore.badge}
            </BadgeText>
            <TrustScore theme={theme}>
              {result.trustScore.overall}/100
            </TrustScore>
          </TrustBadge>
          
          {/* Vehicle Info (from NHTSA) */}
          {result.vehicleInfo && (
            <Section theme={theme}>
              <SectionTitle theme={theme}>
                <Ionicons name="car-sport" size={20} color={theme.colors.primary} />
                <SectionTitleText theme={theme}>
                  {isBG ? 'Информация за автомобила' : 'Vehicle Information'}
                </SectionTitleText>
              </SectionTitle>
              
              <InfoRow>
                <InfoLabel theme={theme}>{isBG ? 'Марка' : 'Make'}:</InfoLabel>
                <InfoValue theme={theme}>{result.vehicleInfo.make}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel theme={theme}>{isBG ? 'Модел' : 'Model'}:</InfoLabel>
                <InfoValue theme={theme}>{result.vehicleInfo.model}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel theme={theme}>{isBG ? 'Година' : 'Year'}:</InfoLabel>
                <InfoValue theme={theme}>{result.vehicleInfo.year}</InfoValue>
              </InfoRow>
              
              {result.vehicleInfo.plantCountry && (
                <InfoRow>
                  <InfoLabel theme={theme}>{isBG ? 'Произведен в' : 'Made in'}:</InfoLabel>
                  <InfoValue theme={theme}>{result.vehicleInfo.plantCountry}</InfoValue>
                </InfoRow>
              )}
            </Section>
          )}
          
          {/* History Info (from Firestore) */}
          {result.historyInfo && (
            <Section theme={theme}>
              <SectionTitle theme={theme}>
                <Ionicons name="time" size={20} color={theme.colors.primary} />
                <SectionTitleText theme={theme}>
                  {isBG ? 'История' : 'History'}
                </SectionTitleText>
              </SectionTitle>
              
              <InfoRow>
                <InfoLabel theme={theme}>{isBG ? 'Предишни собственици' : 'Previous Owners'}:</InfoLabel>
                <InfoValue theme={theme} highlight={result.historyInfo.ownershipCount > 2}>
                  {result.historyInfo.ownershipCount}
                </InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel theme={theme}>{isBG ? 'Инциденти' : 'Accident History'}:</InfoLabel>
                <InfoValue 
                  theme={theme} 
                  highlight={result.historyInfo.hasAccidentHistory}
                >
                  {result.historyInfo.hasAccidentHistory 
                    ? (isBG ? `Да (${result.historyInfo.accidentSeverity})` : `Yes (${result.historyInfo.accidentSeverity})`)
                    : (isBG ? 'Не' : 'No')
                  }
                </InfoValue>
              </InfoRow>
              
              {result.historyInfo.source && (
                <DataSource theme={theme}>
                  {isBG ? 'Източник' : 'Source'}: {
                    result.historyInfo.source === 'crowdsourced' ? (isBG ? 'Данни от общността' : 'Community Data') :
                    result.historyInfo.source === 'seller_provided' ? (isBG ? 'Предоставено от продавача' : 'Seller Provided') :
                    (isBG ? 'Недостъпно' : 'Unavailable')
                  }
                </DataSource>
              )}
            </Section>
          )}
          
          {/* Recommendation */}
          <Recommendation theme={theme} trustColor={getTrustColor(result.trustScore.level)}>
            <Ionicons 
              name={result.trustScore.level === 'excellent' || result.trustScore.level === 'good' ? 'checkmark-circle' : 'alert-circle'} 
              size={20} 
              color={getTrustColor(result.trustScore.level)} 
            />
            <RecommendationText theme={theme}>
              {isBG ? result.trustScore.recommendationBuyerBG : result.trustScore.recommendationBuyer}
            </RecommendationText>
          </Recommendation>
          
          {/* Clear Button */}
          <ClearButton onPress={handleClear}>
            <ClearButtonText theme={theme}>
              {isBG ? 'Провери друг VIN' : 'Check Another VIN'}
            </ClearButtonText>
          </ClearButton>
        </ResultsContainer>
      )}
      
      {/* Footer Note */}
      <FooterNote theme={theme}>
        <Ionicons name="information-circle" size={16} color={theme.colors.textSecondary} />
        <FooterText theme={theme}>
          {isBG 
            ? 'Данните са базирани на източници от NHTSA и информация от общността'
            : 'Data based on NHTSA sources and community-provided information'}
        </FooterText>
      </FooterNote>
    </Container>
  );
};

// ==================== STYLES ====================

const Container = styled.View<{ theme: any }>`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  margin: 16px 0;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const HeaderText = styled.Text<{ theme: any }>`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 12px;
`;

const Description = styled.Text<{ theme: any }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 20px;
  line-height: 20px;
`;

const InputContainer = styled.View<{ theme: any }>`
  position: relative;
  margin-bottom: 16px;
`;

const VinInput = styled.TextInput<{ theme: any }>`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 14px;
  padding-right: 60px;
  font-size: 16px;
  font-family: monospace;
  color: ${({ theme }) => theme.colors.text};
`;

const CharCount = styled.Text<{ theme: any }>`
  position: absolute;
  right: 14px;
  top: 15px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CheckButton = styled.TouchableOpacity<{ theme: any }>`
  background-color: ${({ theme, disabled }) => disabled ? theme.colors.disabled : theme.colors.primary};
  border-radius: 12px;
  padding: 14px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const ButtonText = styled.Text`
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
`;

const ResultsContainer = styled.View<{ theme: any }>`
  margin-top: 8px;
`;

const TrustBadge = styled.View<{ theme: any; trustColor: string }>`
  background-color: ${({ trustColor }) => trustColor}15;
  border: 2px solid ${({ trustColor }) => trustColor};
  border-radius: 12px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const BadgeText = styled.Text<{ theme: any }>`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
`;

const TrustScore = styled.Text<{ theme: any }>`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const Section = styled.View<{ theme: any }>`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.View<{ theme: any }>`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const SectionTitleText = styled.Text<{ theme: any }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 8px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;

const InfoLabel = styled.Text<{ theme: any }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex: 1;
`;

const InfoValue = styled.Text<{ theme: any; highlight?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme, highlight }) => highlight ? theme.colors.warning : theme.colors.text};
  flex: 1;
  text-align: right;
`;

const DataSource = styled.Text<{ theme: any }>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
  margin-top: 8px;
`;

const Recommendation = styled.View<{ theme: any; trustColor: string }>`
  background-color: ${({ theme }) => theme.colors.background};
  border-left-width: 4px;
  border-left-color: ${({ trustColor }) => trustColor};
  border-radius: 8px;
  padding: 12px;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const RecommendationText = styled.Text<{ theme: any }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 8px;
  flex: 1;
  line-height: 20px;
`;

const ClearButton = styled.TouchableOpacity`
  padding: 12px;
  align-items: center;
`;

const ClearButtonText = styled.Text<{ theme: any }>`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: 600;
`;

const FooterNote = styled.View<{ theme: any }>`
  flex-direction: row;
  align-items: flex-start;
  margin-top: 16px;
  padding-top: 16px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

const FooterText = styled.Text<{ theme: any }>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-left: 6px;
  flex: 1;
  line-height: 18px;
`;

export default VinCheckCard;
