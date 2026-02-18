import React from 'react';
import styled from 'styled-components/native';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Zap, Briefcase, Star, Bike } from 'lucide-react-native';

// --- Small Category Card (Grid) ---

const SmallCardContainer = styled.TouchableOpacity<{ bgColor: string }>`
  background-color: ${props => props.bgColor || '#2C2C2C'};
  padding: 16px;
  border-radius: 12px;
  height: 112px;
  justify-content: space-between;
  flex: 1;
  margin: 6px;
  position: relative;
  overflow: hidden;
`;

const CardTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: white;
`;

const CardSubtitle = styled.Text`
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
`;

const IconWrapper = styled.View`
  position: absolute;
  bottom: -10px;
  right: -10px;
  opacity: 0.1;
`;

interface CategoryCardProps {
  title: string;
  subtitle: string;
  icon: 'electric' | 'leasing' | 'star' | 'bike';
  color: string;
  onPress?: () => void;
}

export const CategoryCard = ({ title, subtitle, icon, color, onPress }: CategoryCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case 'electric': return <Zap size={64} color="white" />;
      case 'leasing': return <Briefcase size={64} color="white" />;
      case 'star': return <Star size={64} color="white" />;
      case 'bike': return <Bike size={64} color="white" />;
      default: return null;
    }
  };

  return (
    <SmallCardContainer bgColor={color} onPress={onPress} activeOpacity={0.8}>
      <View>
        <CardTitle>{title}</CardTitle>
        <CardSubtitle>{subtitle}</CardSubtitle>
      </View>
      <IconWrapper>
        {getIcon()}
      </IconWrapper>
    </SmallCardContainer>
  );
};

// --- Large Category Card (Horizontal Scroll) ---

const LargeCardContainer = styled.TouchableOpacity`
  width: 260px;
  background-color: ${props => props.theme.colors.mobileDe.surface};
  border-radius: 12px;
  overflow: hidden;
  margin-right: 16px;
`;

const LargeImageContainer = styled.View`
  height: 128px;
  width: 100%;
  position: relative;
`;

const LargeImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const GradientOverlay = styled.View`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 48px;
  background-color: rgba(0,0,0,0.4); 
`;

const LargeTitle = styled.Text`
  position: absolute;
  bottom: 12px;
  left: 12px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  ${Platform.OS === 'web' ? `
    text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.75);
  ` : `
    text-shadow-color: rgba(0, 0, 0, 0.75);
    text-shadow-offset: 0px 1px;
    text-shadow-radius: 3px;
  `}
`;

const TagsContainer = styled.View`
  padding: 12px;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.View`
  background-color: #2C2C2C;
  padding: 6px 10px;
  border-radius: 6px;
`;

const TagText = styled.Text`
  color: #D1D5DB;
  font-size: 11px;
`;

interface LargeCategoryCardProps {
  title: string;
  image: string;
  tags: string[];
  onPress?: () => void;
}

export const LargeCategoryCard = ({ title, image, tags, onPress }: LargeCategoryCardProps) => {
  return (
    <LargeCardContainer onPress={onPress} activeOpacity={0.9}>
      <LargeImageContainer>
        <LargeImage source={{ uri: image }} resizeMode="cover" />
        <GradientOverlay />
        <LargeTitle>{title}</LargeTitle>
      </LargeImageContainer>
      <TagsContainer>
        {tags.map((tag, i) => (
          <Tag key={i}>
            <TagText>{tag}</TagText>
          </Tag>
        ))}
      </TagsContainer>
    </LargeCardContainer>
  );
};

// --- Filter Chip for Deals ---

const ChipButton = styled.TouchableOpacity<{ active?: boolean }>`
    flex-direction: row;
    align-items: center;
    padding: 10px 16px;
    border-radius: 8px;
    background-color: ${props => props.active ? '#2C2C2C' : props.theme.colors.mobileDe.surface};
    border-width: 1px;
    border-color: ${props => props.active ? '#4B5563' : '#374151'};
    margin-right: 12px;
`;

const ChipText = styled.Text<{ active?: boolean }>`
    color: ${props => props.active ? 'white' : '#D1D5DB'};
    font-size: 14px;
    font-weight: 500;
    margin-left: 8px;
`;

interface FilterChipProps {
  label: string;
  icon: string;
  active?: boolean;
  onPress?: () => void;
}

export const FilterChip = ({ label, icon, active, onPress }: FilterChipProps) => {
  return (
    <ChipButton active={active} onPress={onPress}>
      <Text>{icon}</Text>
      <ChipText active={active}>{label}</ChipText>
    </ChipButton>
  )
}
