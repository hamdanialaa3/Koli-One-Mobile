/**
 * VehicleClassifications.tsx (Mobile)
 * Combined Body Types + Drive Types vehicle classifications
 */

import React from 'react';
import styled from 'styled-components/native';
import { Car, Truck, Users, Package, Bike, Bus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/theme';

interface VehicleType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  count?: number;
}

const BODY_TYPES: VehicleType[] = [
  {
    id: 'sedan',
    name: 'Sedan',
    icon: <Car color="#ffffff" size={24} />,
    color: '#3b82f6',
    count: 1250
  },
  {
    id: 'suv',
    name: 'SUV',
    icon: <Truck color="#ffffff" size={24} />,
    color: '#10b981',
    count: 980
  },
  {
    id: 'van',
    name: 'Van',
    icon: <Users color="#ffffff" size={24} />,
    color: '#f59e0b',
    count: 420
  },
  {
    id: 'truck',
    name: 'Truck',
    icon: <Package color="#ffffff" size={24} />,
    color: '#ef4444',
    count: 350
  },
  {
    id: 'motorcycle',
    name: 'Motorcycle',
    icon: <Bike color="#ffffff" size={24} />,
    color: '#8b5cf6',
    count: 280
  },
  {
    id: 'bus',
    name: 'Bus',
    icon: <Bus color="#ffffff" size={24} />,
    color: '#14b8a6',
    count: 95
  }
];

const Container = styled.View`
  padding: 24px 16px;
  margin: 16px 0;
`;

const Header = styled.View`
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 26px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 20px;
`;

const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`;

const TypeCard = styled.Pressable<{ bgColor: string }>`
  flex: 1;
  min-width: 100px;
  max-width: 48%;
  background-color: ${({ bgColor }) => bgColor};
  border-radius: 16px;
  padding: 20px 16px;
  align-items: center;
  shadow-color: ${({ bgColor }) => bgColor};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 12px;
  elevation: 6;
`;

const IconWrapper = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: rgba(255, 255, 255, 0.25);
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const TypeName = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
  text-align: center;
`;

const CountBadge = styled.View`
  background-color: rgba(255, 255, 255, 0.25);
  padding: 4px 12px;
  border-radius: 12px;
`;

const CountText = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
`;

export default function VehicleClassifications() {
  const navigation = useNavigation();

  const handleTypePress = (type: VehicleType) => {
    // @ts-ignore - navigation typing
    navigation.navigate('Search', { vehicleType: type.id });
  };

  return (
    <Container>
      <Header>
        <Title theme={theme}>Browse by Type</Title>
        <Subtitle theme={theme}>
          Find exactly what you're looking for
        </Subtitle>
      </Header>

      <Grid>
        {BODY_TYPES.map((type) => (
          <TypeCard
            key={type.id}
            bgColor={type.color}
            onPress={() => handleTypePress(type)}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
          >
            <IconWrapper>{type.icon}</IconWrapper>
            <TypeName>{type.name}</TypeName>
            {type.count && (
              <CountBadge>
                <CountText>{type.count}+</CountText>
              </CountBadge>
            )}
          </TypeCard>
        ))}
      </Grid>
    </Container>
  );
}
