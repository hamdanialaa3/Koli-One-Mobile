// app/(tabs)/index.tsx
import React from 'react';
import styled from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../../src/styles/theme';
import MobileHeader from '../../src/components/common/MobileHeader';

// 5 مكوّنات فقط — الأهم أولاً
import HeroSection from '../../src/components/home/HeroSection';
import FeaturedShowcase from '../../src/components/home/FeaturedShowcase';
import RecentStrips from '../../src/components/home/RecentStrips';
import SmartHeroRecommendations from '../../src/components/home/SmartHeroRecommendations';
import PopularBrands from '../../src/components/home/PopularBrands';
import TrustAndStats from '../../src/components/home/TrustAndStats';

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${(props: any) => props.theme?.colors?.background?.dark || '#0f172a'};
`;

const SectionSpacer = styled.View`
  height: 24px;
`;

export default function HomeScreen() {
  return (
    <Container theme={theme} showsVerticalScrollIndicator={false}>
      <StatusBar style="light" />
      <MobileHeader transparent dark />

      {/* 1. Hero — Search + Quick Filters */}
      <HeroSection />
      <SectionSpacer />

      {/* 2. Our Cars / Featured */}
      <FeaturedShowcase />
      <SectionSpacer />

      {/* 3. Picked for You / Popular Cars */}
      <SmartHeroRecommendations />
      <SectionSpacer />

      {/* 4. Recently Viewed & Top Deals */}
      <RecentStrips />
      <SectionSpacer />

      {/* 5. Popular Brands */}
      <PopularBrands />
      <SectionSpacer />

      {/* 6. Stats & Trust */}
      <TrustAndStats />

      {/* Bottom Padding */}
      <SectionSpacer style={{ height: 100 }} />
    </Container>
  );
}

