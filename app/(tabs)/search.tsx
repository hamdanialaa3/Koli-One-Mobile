import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { FlatList, View, TouchableOpacity, Dimensions, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';
import { CarCard } from '../../src/components/CarCard';
import MobileHeader from '../../src/components/common/MobileHeader';
import { useMobileSearch } from '../../src/hooks/useMobileSearch';
import { SkeletonListingCard } from '../../src/components/skeleton/SkeletonListingCard';
import { AnalyticsService } from '../../src/services/AnalyticsService';
import { EmptyState } from '../../src/components/common/EmptyState';
import { ErrorState } from '../../src/components/common/ErrorState';
import { AnimatedButton } from '../../src/components/ui/AnimatedButton';
import { RefreshControl } from 'react-native';
import { SearchFiltersModal } from '../../src/components/search/SearchFiltersModal';
import { SortModal, SortType, SORT_OPTIONS } from '../../src/components/search/SortModal';
import { FilterState } from '../../src/services/search/UnifiedFilterTypes';
import { SavedSearchesService } from '../../src/services/SavedSearchesService';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { logger } from '../../src/services/logger-service';

const { width } = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const Header = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  padding: 16px 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const SearchBarContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const SearchInputContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.background.default};
  border-radius: 12px;
  padding: 0px 12px;
  height: 48px;
`;

const StyledTextInput = styled.TextInput`
  flex: 1;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
  margin-left: 8px;
`;

const FilterButton = styled(AnimatedButton)`
  width: 48px;
  height: 48px;
  background-color: ${props => props.theme.colors.primary.main};
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;

const ChipScroll = styled.ScrollView`
  padding: 12px 0;
`;

const Chip = styled(AnimatedButton) <{ active?: boolean }>`
  background-color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.background.paper};
  padding: 6px 16px;
  border-radius: 20px;
  margin-right: 8px;
  border-width: 1px;
  border-color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.border.muted};
`;

const ChipText = styled.Text<{ active?: boolean }>`
  color: ${props => props.active ? '#fff' : props.theme.colors.text.secondary};
  font-size: 13px;
  font-weight: 600;
`;

const ResultsHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
`;

const ResultsCount = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 600;
`;

const SortButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const SortText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.primary.main};
  font-weight: 600;
`;

const ModalBackdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.55);
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const ModalCard = styled.View`
  width: 100%;
  max-width: 360px;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  padding: 20px;
`;

const ModalTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 12px;
`;

const ModalInput = styled.TextInput`
  height: 48px;
  border-radius: 12px;
  padding: 0px 12px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
  color: ${props => props.theme.colors.text.primary};
  background-color: ${props => props.theme.colors.background.default};
`;

const ModalActions = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`;

const ModalButton = styled.TouchableOpacity<{ primary?: boolean }>`
  padding: 10px 16px;
  border-radius: 10px;
  background-color: ${props => props.primary ? props.theme.colors.primary.main : props.theme.colors.background.default};
  border-width: 1px;
  border-color: ${props => props.primary ? props.theme.colors.primary.main : props.theme.colors.border.muted};
`;

const ModalButtonText = styled.Text<{ primary?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.primary ? '#fff' : props.theme.colors.text.primary};
`;

// Categories mapping to ID
const CATEGORY_MAP: Record<string, string> = {
  'All': '',
  'Sedan': 'sedan',
  'SUV': 'suv',
  'Hatchback': 'hatchback',
  'Luxury': 'luxury',
  'Electric': 'electric',
  'Wagon': 'station_wagon' // align with listing service categories
};

export default function SearchScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    query?: string;
    vehicleType?: string;
    brand?: string;
    category?: string;
  }>();
  const {
    filters,
    results,
    loading,
    totalCount,
    updateFilter,
    resetFilters,
    search,
    setSearchQuery
  } = useMobileSearch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  // Apply incoming navigation params as filters
  useEffect(() => {
    if (params.vehicleType) {
      updateFilter('bodyType', params.vehicleType);
    }
    if (params.brand) {
      updateFilter('make', params.brand);
    }
    if (params.query) {
      // Handle category queries like "category=suv"
      if (params.query.startsWith('category=')) {
        updateFilter('bodyType', params.query.replace('category=', ''));
      } else {
        setSearchQuery(params.query);
      }
    }
    if (params.category) {
      updateFilter('bodyType', params.category);
    }
  }, [params.vehicleType, params.brand, params.query, params.category]);

  // Trigger search when filters change
  useEffect(() => {
    search();
  }, [filters, search]);

  const handleCategoryPress = (label: string) => {
    const value = CATEGORY_MAP[label];
    updateFilter('bodyType', value || undefined);
  };

  const handleFiltersApply = (newFilters: FilterState) => {
    // Batch update or reset then apply
    // Currently updateFilter handles one by one. 
    // We need to implement batch update in useMobileSearch or just loop.
    // For now, simpler: loop.
    Object.keys(newFilters).forEach(key => {
      updateFilter(key as any, (newFilters as any)[key]);
    });
    search();
  };

  const handleSaveSearch = () => {
    if (!user) {
      Alert.alert('Влезте в профила', 'Трябва да влезете, за да запазите търсене');
      return;
    }

    // Check if filters are meaningful
    const hasFilters = filters.make || filters.model || filters.bodyType || 
               filters.yearMin || filters.yearMax || filters.priceMax || filters.mileageMax;
    
    if (!hasFilters) {
      Alert.alert('Няма филтри', 'Моля, приложете някои филтри преди запазване на търсенето');
      return;
    }

    setSaveSearchName('');
    setIsSaveModalOpen(true);
  };

  const handleConfirmSaveSearch = async () => {
    if (!saveSearchName.trim()) {
      Alert.alert('Грешка', 'Името не може да бъде празно');
      return;
    }

    try {
      await SavedSearchesService.createSavedSearch({
        searchName: saveSearchName.trim(),
        make: filters.make,
        model: filters.model,
        yearMin: filters.yearMin,
        yearMax: filters.yearMax,
        priceMax: filters.priceMax,
        mileageMax: filters.mileageMax,
        bodyTypes: filters.bodyType ? [filters.bodyType] : undefined,
        fuelTypes: filters.fuelType ? [filters.fuelType] : undefined,
        transmissions: filters.transmission ? [filters.transmission] : undefined,
        regions: filters.location ? [filters.location] : undefined,
        isActive: true,
        notificationsEnabled: true
      });

      setIsSaveModalOpen(false);

      Alert.alert(
        'Успешно!',
        'Търсенето е запазено. Ще получавате известия при спад на цената.',
        [
          { text: 'OK' },
          { 
            text: 'Преглед', 
            onPress: () => router.push('/saved-searches')
          }
        ]
      );
    } catch (error) {
      logger.error('Error saving search', error);
      Alert.alert('Грешка', 'Неуспешно запазване на търсенето');
    }
  };

  const activeLabel = Object.keys(CATEGORY_MAP).find(key => CATEGORY_MAP[key] === (filters.bodyType || '')) || 'All';

  return (
    <Container theme={theme}>
      <MobileHeader 
        title="Search" 
        showLogo={false}
        rightComponent={
          <TouchableOpacity onPress={() => router.push('/saved-searches')} style={{ marginRight: 8 }}>
            <Ionicons name="bookmark-outline" size={24} color={theme.colors.primary.main} />
          </TouchableOpacity>
        }
      />
      <Header theme={theme}>
        <SearchBarContainer>
          <SearchInputContainer theme={theme}>
            <Ionicons name="search" size={20} color={theme.colors.text.disabled} />
            <StyledTextInput
              placeholder="Search by model (e.g. X5)"
              placeholderTextColor={theme.colors.text.disabled}
              value={filters.model || ''}
              onChangeText={setSearchQuery}
            />
            {filters.model ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.text.disabled} />
              </TouchableOpacity>
            ) : null}
          </SearchInputContainer>
          <FilterButton theme={theme} onPress={() => setIsModalOpen(true)}>
            <Ionicons name="options-outline" size={24} color="#fff" />
          </FilterButton>
          <FilterButton theme={theme} onPress={handleSaveSearch}>
            <Ionicons name="bookmark" size={24} color="#fff" />
          </FilterButton>
        </SearchBarContainer>

        <ChipScroll horizontal showsHorizontalScrollIndicator={false}>
          {Object.keys(CATEGORY_MAP).map((cat) => (
            <Chip
              key={cat}
              active={activeLabel === cat}
              onPress={() => handleCategoryPress(cat)}
              theme={theme}
            >
              <ChipText active={activeLabel === cat} theme={theme}>{cat}</ChipText>
            </Chip>
          ))}
        </ChipScroll>
      </Header>

      {/* Filters Modal */}
      <SearchFiltersModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        onApply={handleFiltersApply}
        onReset={resetFilters}
        theme={theme}
      />

      {/* Sort Modal */}
      <SortModal
        visible={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        currentSort={filters.sort || 'recent'}
        onSelect={(val) => updateFilter('sort', val)}
        theme={theme}
      />

      {loading ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {[1, 2, 3].map((key) => (
            <SkeletonListingCard key={key} />
          ))}
        </View>
      ) : results.length === 0 ? (
        <EmptyState
          icon="search"
          title="No Results Found"
          description="Try adjusting your filters or searching for something else."
          buttonText="Clear All Filters"
          onButtonPress={resetFilters}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 20 }}>
              {/* Ensure full width and styling parity */}
              <CarCard listing={item as any} />
            </View>
          )}
          ListHeaderComponent={
            <ResultsHeader>
              <ResultsCount theme={theme}>{totalCount} cars found</ResultsCount>
              <SortButton onPress={() => setIsSortModalOpen(true)}>
                <SortText theme={theme}>
                  {SORT_OPTIONS.find(o => o.value === (filters.sort || 'recent'))?.label || 'Sort'}
                </SortText>
                <Ionicons name="swap-vertical" size={16} color={theme.colors.primary.main} />
              </SortButton>
            </ResultsHeader>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={search}
              tintColor={theme.colors.primary.main}
              colors={[theme.colors.primary.main]}
            />
          }
        />
      )}

      <Modal
        transparent
        visible={isSaveModalOpen}
        animationType="fade"
        onRequestClose={() => setIsSaveModalOpen(false)}
      >
        <ModalBackdrop>
          <ModalCard theme={theme}>
            <ModalTitle theme={theme}>Запазване на търсене</ModalTitle>
            <ModalInput
              theme={theme}
              placeholder="Име на търсенето"
              placeholderTextColor={theme.colors.text.disabled}
              value={saveSearchName}
              onChangeText={setSaveSearchName}
              autoFocus
            />
            <ModalActions>
              <ModalButton theme={theme} onPress={() => setIsSaveModalOpen(false)}>
                <ModalButtonText theme={theme}>Отказ</ModalButtonText>
              </ModalButton>
              <ModalButton theme={theme} primary onPress={handleConfirmSaveSearch}>
                <ModalButtonText theme={theme} primary>Запази</ModalButtonText>
              </ModalButton>
            </ModalActions>
          </ModalCard>
        </ModalBackdrop>
      </Modal>
    </Container>
  );
}
