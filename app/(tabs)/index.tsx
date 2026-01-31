// app/(tabs)/index.tsx
import React from 'react';
import styled from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../../src/styles/theme';
import { MobileHeader } from '../../src/components/common/MobileHeader';

// Transplanted Organs (Components)
import HeroSection from '../../src/components/home/HeroSection';
import CategoriesSection from '../../src/components/home/CategoriesSection';
import RecentBrowsingSection from '../../src/components/home/RecentBrowsingSection';
import AISmartSellButton from '../../src/components/home/AISmartSellButton';
import FeaturedShowcase from '../../src/components/home/FeaturedShowcase';
import SmartSellStrip from '../../src/components/home/SmartSellStrip';
import PopularBrands from '../../src/components/home/PopularBrands';
import DealersSpotlight from '../../src/components/home/DealersSpotlight';
import LoyaltyBanner from '../../src/components/home/LoyaltyBanner';
import TrustAndStats from '../../src/components/home/TrustAndStats';
import AIInsights from '../../src/components/home/AIInsights';
import StayConnected from '../../src/components/home/StayConnected';

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const SectionSpacer = styled.View`
  height: 24px;
`;

export default function HomeScreen() {
  return (
    <Container theme={theme} showsVerticalScrollIndicator={false}>
      <StatusBar style="light" />
      <MobileHeader transparent dark />

      {/* 1. Hero Section - The "Head" */}
      <HeroSection />

      {/* 2. Categories Section (Vehicle Classifications) */}
      <CategoriesSection />

      {/* 2.5 AI Smart Sell Button */}
      <AISmartSellButton />

      {/* 3. Featured Showcase */}
      <FeaturedShowcase />

      {/* 4. Recent Browsing */}
      <RecentBrowsingSection />

      <SectionSpacer />

      {/* 5. Smart Sell Strip */}
      <SmartSellStrip />

      {/* 6. Loyalty Banner */}
      <LoyaltyBanner />

      {/* 8. Popular Brands - "Navigation" */}
      <PopularBrands />

      <SectionSpacer />

      {/* 9. Dealers Spotlight - "Community" */}
      <DealersSpotlight />

      {/* 10. AI Insights - "Market Intelligence" */}
      <AIInsights />

      {/* 11. Trust & Stats - "Credibility" */}
      <TrustAndStats />

      {/* 12. Stay Connected - "Community" */}
      <StayConnected />

      {/* Bottom Padding */}
      <SectionSpacer style={{ height: 100 }} />

    </Container>
  );
}
