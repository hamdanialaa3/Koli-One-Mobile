import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

import { useMobileSectionVisibility } from '../../hooks/useMobileSectionVisibility';
import { ListingService } from '../../services/ListingService';
import { theme } from '../../styles/theme';

// ─── Sections ────────────────────────────────────────────────
import HeroSection from './HeroSection';
import SmartHeroRecommendations from './SmartHeroRecommendations';
import AIAnalysisBanner from './AIAnalysisBanner';
import RecentStrips from './RecentStrips';
import VisualSearchTeaser from './VisualSearchTeaser';
import VehicleClassifications from './VehicleClassifications';
import LifeMomentsBrowse from './LifeMomentsBrowse';
import CategoriesSection from './CategoriesSection';
import PopularBrands from './PopularBrands';
import MostDemandedCategories from './MostDemandedCategories';
import FeaturedShowcase from './FeaturedShowcase';
import UnifiedSmartSell from './UnifiedSmartSell';
import DealersSpotlight from './DealersSpotlight';
import TrustAndStats from './TrustAndStats';
import StayConnected from './StayConnected';
import LoyaltyBanner from './LoyaltyBanner';
import RecentBrowsingSection from './RecentBrowsingSection';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SECTION_COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  smart_recommendations: SmartHeroRecommendations,
  ai_analysis_banner: AIAnalysisBanner,
  hero_strips: RecentStrips,
  visual_search: VisualSearchTeaser,
  vehicle_classifications: VehicleClassifications,
  life_moments: LifeMomentsBrowse,
  categories: CategoriesSection,
  popular_brands: PopularBrands,
  most_demanded: MostDemandedCategories,
  featured_showcase: FeaturedShowcase,
  smart_sell: UnifiedSmartSell,
  dealers: DealersSpotlight,
  trust_stats: TrustAndStats,
  social: StayConnected,
  loyalty: LoyaltyBanner,
  recent_browsing: RecentBrowsingSection,
};

export default function MobileDeHome() {
  const router = useRouter();
  const { sections, isLoaded } = useMobileSectionVisibility();
  const [refreshing, setRefreshing] = useState(false);
  const [totalCars, setTotalCars] = useState('...');

  const loadStats = useCallback(async () => {
    try {
      const stats = await ListingService.getGlobalStats();
      setTotalCars(String(stats.totalListings));
    } catch {
      setTotalCars('1000+');
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  const orderedSections = useMemo(() => {
    return [...sections]
      .filter((s) => s.visible && SECTION_COMPONENT_MAP[s.key])
      .sort((a, b) => a.order - b.order);
  }, [sections]);

  if (!isLoaded) {
    return (
      <View style={[styles.root, styles.center]}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background.default} />
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background.default} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.main}
            colors={[theme.colors.primary.main]}
            progressBackgroundColor={theme.colors.background.paper}
          />
        }
      >
        {/* ─── PREMIUM HERO BANNER (Mercedes Ad Style) ─── */}
        <View style={styles.heroWrapper}>
          <ImageBackground
            source={require('../../../assets/images/placeholder-car.png')}
            style={styles.heroImage}
            imageStyle={{ opacity: 0.85 }}
          >
            <LinearGradient
              colors={['rgba(18,18,18,0.1)', 'rgba(18,18,18,0.6)', theme.colors.background.default]}
              style={styles.heroGradient}
            >
              <View style={styles.adBadge}>
                <Text style={styles.adText}>Mercedes-Benz</Text>
              </View>
              <Text style={styles.heroHeadline}>
                KURZFRISTIG SICHERN.{'\n'}LANGFRISTIG PROFITIEREN.
              </Text>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* ─── FLOATING SEARCH BAR ─── */}
        <TouchableOpacity
          style={styles.searchContainer}
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/search')}
        >
          <BlurView intensity={20} style={styles.searchBlur}>
            <Ionicons name="search" size={24} color={theme.colors.text.secondary} />
            <View style={styles.searchTexts}>
              <Text style={styles.searchTitle}>Search for...</Text>
              <Text style={styles.searchSubtitle}>Vehicle • Year • Mileage</Text>
            </View>
            <View style={styles.searchIconBg}>
              <Ionicons name="options-outline" size={20} color="#FFF" />
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* ─── AI TEASER (mobee) ─── */}
        <View style={styles.aiTeaserContainer}>
          <LinearGradient
            colors={['#1E1E1E', '#2A2A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiGradient}
          >
            <View style={styles.aiHeader}>
              <Text style={styles.aiTitle}>
                <Text style={{ color: theme.colors.primary.main }}>+</Text> mobee
              </Text>
              <View style={styles.betaTag}>
                <Text style={styles.betaText}>Beta</Text>
              </View>
            </View>
            <Text style={styles.aiDesc}>
              I'm your personal AI guide! I'll help you through the jungle of offers.
            </Text>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => router.push('/ai/advisor' as any)}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.aiButtonText}>Ask me anything!</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ─── QUICK ACTIONS / CATEGORIES ─── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
          {[
            { label: 'Leasing', icon: 'briefcase-outline' },
            { label: 'Electric', icon: 'flash-outline' },
            { label: 'Great price', icon: 'pricetag-outline' },
          ].map((chip, i) => (
            <TouchableOpacity key={i} style={styles.chip}>
              <Ionicons name={chip.icon as any} size={16} color={theme.colors.text.secondary} style={{ marginRight: 6 }} />
              <Text style={styles.chipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ─── DYNAMIC SECTIONS ─── */}
        <View style={styles.sectionsContainer}>
          {orderedSections.map((section) => {
            const Component = SECTION_COMPONENT_MAP[section.key];
            if (!Component) return null;
            return (
              <View key={section.key} style={styles.sectionWrapper}>
                <Component />
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroWrapper: {
    height: 240,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  adBadge: {
    marginBottom: 8,
  },
  adText: {
    color: '#E0E0E0',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
  },
  heroHeadline: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: -28,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 8 },
      default: { boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)' },
    }),
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  searchTexts: {
    flex: 1,
    marginLeft: 12,
  },
  searchTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  searchSubtitle: {
    color: theme.colors.text.secondary,
    fontSize: 11,
    marginTop: 2,
  },
  searchIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTeaserContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  aiGradient: {
    padding: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  betaTag: {
    marginLeft: 8,
    backgroundColor: theme.colors.background.elevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  betaText: {
    color: '#CCC',
    fontSize: 10,
    fontWeight: '600',
  },
  aiDesc: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  aiButton: {
    backgroundColor: '#6A1B9A', // Mobile.de purple for AI
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  aiButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  chipScroll: {
    marginTop: 24,
    maxHeight: 50,
  },
  chipContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  chipText: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionsContainer: {
    marginTop: 16,
  },
  sectionWrapper: {
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 100,
  },
});
