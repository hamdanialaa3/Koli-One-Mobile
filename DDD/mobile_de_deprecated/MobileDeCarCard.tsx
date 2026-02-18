import React from 'react';
import styled from 'styled-components/native';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Heart, MapPin } from 'lucide-react-native';
import { useTheme } from 'styled-components/native';

const CardContainer = styled.TouchableOpacity`
  width: 280px;
  background-color: ${props => props.theme.colors.mobileDe.surface};
  border-radius: 12px;
  overflow: hidden;
  margin-right: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

const ImageContainer = styled.View`
  height: 176px;
  width: 100%;
  position: relative;
`;

const CarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const HeartButton = styled.TouchableOpacity`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(18, 18, 18, 0.6);
  padding: 6px;
  border-radius: 20px;
`;

const NewTag = styled.View`
  position: absolute;
  bottom: 8px;
  left: 8px;
  background-color: ${props => props.theme.colors.mobileDe.primary};
  padding: 2px 6px;
  border-radius: 4px;
`;

const NewText = styled.Text`
  color: white;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
`;

const Content = styled.View`
  padding: 12px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.mobileDe.text};
  margin-bottom: 4px;
`;

const PriceRow = styled.View`
  flex-direction: row;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
`;

const Price = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.mobileDe.text};
`;

const Rating = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.mobileDe.textTertiary};
`;

const SpecsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

const SpecTag = styled.Text`
  font-size: 11px;
  color: ${props => props.theme.colors.mobileDe.textSecondary};
`;

const LocationRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const LocationText = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.mobileDe.textTertiary};
`;

interface CarCardProps {
  image: string;
  title: string;
  price: string;
  rating: string;
  specs: string[];
  isNew?: boolean;
  location: string;
  onPress?: () => void;
}

export const MobileDeCarCard = ({ image, title, price, rating, specs, isNew, location, onPress }: CarCardProps) => {
  const theme = useTheme();

  return (
    <CardContainer activeOpacity={0.9} onPress={onPress}>
      <ImageContainer>
        <CarImage source={{ uri: image }} resizeMode="cover" />
        <HeartButton>
          <Heart size={18} color="white" />
        </HeartButton>
        {isNew && (
          <NewTag>
            <NewText>New</NewText>
          </NewTag>
        )}
      </ImageContainer>

      <Content>
        <Title numberOfLines={1}>{title}</Title>

        <PriceRow>
          <Price>{price}</Price>
          <Rating>{rating}</Rating>
        </PriceRow>

        <SpecsContainer>
          {specs.map((spec, i) => (
            <SpecTag key={i}>{spec}{i < specs.length - 1 ? ' • ' : ''}</SpecTag>
          ))}
        </SpecsContainer>

        <LocationRow>
          <MapPin size={12} color={theme.colors.mobileDe.textTertiary} />
          <LocationText numberOfLines={1}>{location}</LocationText>
        </LocationRow>
      </Content>
    </CardContainer>
  );
};
