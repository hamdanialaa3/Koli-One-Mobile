import React from 'react';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';

const Container = styled.View`
  padding: 0 16px;
  margin-top: -24px;
  z-index: 10;
`;

const SearchBar = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.mobileDe.surfaceHighlight};
  border-radius: 999px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: #333;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 4.65px;
  elevation: 8;
`;

const TextContent = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.theme.colors.mobileDe.text};
  line-height: 22px;
`;

const Subtitle = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.mobileDe.textTertiary};
  margin-top: 2px;
`;

export const FloatingSearchBar = () => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Container>
      <SearchBar activeOpacity={0.8} onPress={() => router.push('/(tabs)/search')}>
        <Search size={24} color="#9CA3AF" />
        <TextContent>
          <Title>Search for...</Title>
          <Subtitle>Vehicle • Year • Mileage</Subtitle>
        </TextContent>
      </SearchBar>
    </Container>
  );
};
