import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { ScrollView, View, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CarCard } from '../CarCard';
import { ListingService } from '../../services/ListingService';
import { ListingBase } from '../../types/ListingBase';
import { theme } from '../../styles/theme';
import { SkeletonListingCard } from '../skeleton/SkeletonListingCard';
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components/native';

const { width } = Dimensions.get('window');

// --- Styled Components ---

const SectionContainer = styled(View)`
  min-height: 500px;
  width: 100%;
  position: relative;
`;

const BackgroundGradient = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ContentContainer = styled.View`
  padding: 40px 0;
`;

const Header = styled.View`
  padding: 0 24px;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.Text<{ isDark: boolean }>`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.isDark ? '#e2e8f0' : '#1e293b'};
  text-align: center;
  margin-bottom: 8px;
`;

const Description = styled.Text<{ isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.isDark ? '#94a3b8' : '#64748b'};
  text-align: center;
  line-height: 20px;
  max-width: 90%;
`;

const FiltersContainer = styled.ScrollView`
  margin-bottom: 32px;
  padding-left: 24px;
`;

const FilterPill = styled(TouchableOpacity) <{ active: boolean; isDark: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${props => props.active
    ? (props.isDark ? 'rgba(37, 99, 235, 0.6)' : 'rgba(37, 99, 235, 0.1)')
    : (props.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)')};
  border-width: 1px;
  border-color: ${props => props.active
    ? (props.isDark ? 'rgba(37, 99, 235, 0.5)' : 'rgba(37, 99, 235, 0.3)')
    : (props.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
  margin-right: 12px;
`;

const FilterText = styled.Text<{ active: boolean; isDark: boolean }>`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.active
    ? '#ffffff'
    : (props.isDark ? '#cbd5e1' : '#475569')};
  margin-left: 6px;
`;

const ScrollContent = styled.ScrollView`
  padding-left: 24px;
`;

const FILTERS = [
  { id: 'all', label: 'All Listings', icon: 'globe-outline' },
  { id: 'vip', label: 'Sofia VIP', icon: 'diamond-outline' },
  { id: 'offroad', label: 'Balkan 4x4', icon: 'trail-sign-outline' },
  { id: 'city', label: 'Urban Daily', icon: 'business-outline' },
];

export default function FeaturedShowcase() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingBase[]>([]);
  const [filteredListings, setFilteredListings] = useState<ListingBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Theme check (simplified)
  const theme = useTheme();
  const isDark = theme.mode === 'dark';

  useEffect(() => {
    fetchFeatured();
  }, []);

  useEffect(() => {
    filterData();
  }, [activeFilter, listings]);

  const fetchFeatured = async () => {
    try {
      const data = await ListingService.getListings();
      // In real app, we might use ListingService.getFeatured()
      setListings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (activeFilter === 'all') {
      setFilteredListings(listings.slice(0, 10)); // Limit to 10
      return;
    }

    const filtered = listings.filter(car => {
      const price = car.price || 0;
      const body = car.bodyType?.toLowerCase() || '';
      const drive = car.transmission?.toLowerCase() || ''; // Not transmission, driveType missing in ListingBase? 
      // Using generic logic for now

      if (activeFilter === 'vip') return price >= 50000;
      if (activeFilter === 'offroad') return body.includes('suv') || body.includes('jeep');
      if (activeFilter === 'city') return body.includes('sedan') || body.includes('hatchback');
      return true;
    });

    setFilteredListings(filtered.slice(0, 10));
  };

  const bgColors = isDark
    ? ['#0f172a', '#1e293b', '#0f172a'] as const
    : ['#f8fafc', '#e2e8f0', '#f8fafc'] as const;

  return (
    <SectionContainer>
      <BackgroundGradient
        colors={['#0f172a', '#1e293b']} // Always dark for cinematic feel as per web? No web supports light.
        // Let's stick to Dark Cinematic for Featured as it looks premium
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ContentContainer>
        <Header>
          <Title isDark={true}>Bulgarian Premium Selection</Title>
          <Description isDark={true}>
            Discover the best carefully selected cars suitable for our roads, from the Rhodope Mountains to the Black Sea coast.
          </Description>
        </Header>

        <FiltersContainer horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map(f => (
            <FilterPill
              key={f.id}
              active={activeFilter === f.id}
              isDark={true}
              onPress={() => setActiveFilter(f.id)}
            >
              <Ionicons
                name={f.icon as any}
                size={16}
                color={activeFilter === f.id ? '#ffffff' : '#cbd5e1'}
              />
              <FilterText active={activeFilter === f.id} isDark={true}>{f.label}</FilterText>
            </FilterPill>
          ))}
          <View style={{ width: 24 }} />
        </FiltersContainer>

        {loading ? (
          <ScrollContent horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3].map(i => (
              <View key={i} style={{ marginRight: 16, width: '280px' as any }}>
                <SkeletonListingCard />
              </View>
            ))}
          </ScrollContent>
        ) : (
          <ScrollContent horizontal showsHorizontalScrollIndicator={false}>
            {filteredListings.map((car) => (
              <View key={car.id} style={{ marginRight: 16, width: '280px' as any }}>
                <CarCard listing={car} />
              </View>
            ))}
            {filteredListings.length === 0 && (
              <Description isDark={true} style={{ marginLeft: 20 }}>
                No cars found for this category.
              </Description>
            )}
            <View style={{ width: 24 }} />
          </ScrollContent>
        )}
      </ContentContainer>
    </SectionContainer>
  );
}
