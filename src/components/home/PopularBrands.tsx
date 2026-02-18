import React from 'react';
import styled from 'styled-components/native';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../styles/theme';

const brands = [
  { id: '1', name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg' }, // Using text fallback for now if SVG fails
  { id: '2', name: 'Mercedes', logo: '' },
  { id: '3', name: 'Audi', logo: '' },
  { id: '4', name: 'Toyota', logo: '' },
  { id: '5', name: 'VW', logo: '' },
  { id: '6', name: 'Porsche', logo: '' },
];

const Container = styled.View`
  margin-bottom: 32px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-left: 20px;
  margin-bottom: 16px;
`;

const BrandCard = styled.TouchableOpacity`
  width: 80px;
  height: 80px;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const BrandText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const ScrollContent = styled.ScrollView`
  padding-left: 20px;
`;

export default function PopularBrands() {
  const router = useRouter();

  return (
    <Container>
      <SectionTitle>Popular Brands</SectionTitle>
      <ScrollContent horizontal showsHorizontalScrollIndicator={false}>
        {brands.map((brand) => (
          <BrandCard key={brand.id} onPress={() => router.push({ pathname: '/(tabs)/search', params: { brand: brand.name } })}>
            {/* Future: Image component for logos */}
            <BrandText>{brand.name}</BrandText>
          </BrandCard>
        ))}
        <View style={{ width: 20 }} />
      </ScrollContent>
    </Container>
  );
}
