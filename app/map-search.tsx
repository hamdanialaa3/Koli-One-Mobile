/**
 * map-search.tsx - Location-Based Car Search
 * Find cars near you using GPS and interactive map
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import * as Location from 'expo-location';
import { theme } from '../src/styles/theme';
import MobileHeader from '../src/components/common/MobileHeader';
import { CarCard } from '../src/components/CarCard';
import { logger } from '../src/services/logger-service';
import { ListingService } from '../src/services/ListingService';
import { ListingBase } from '../src/types/ListingBase';
// Platform-resolved: .web.tsx stub on web, native react-native-maps on iOS/Android
import MapView, { Marker, Region } from '../src/components/map/MapComponents';

const { width } = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const LocationBar = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  background-color: ${props => props.theme.colors.background.paper};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
  gap: 8px;
`;

const LocationText = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
`;

const RadiusChip = styled.TouchableOpacity<{ active?: boolean }>`
  padding: 6px 14px;
  border-radius: 20px;
  background-color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.background.paper};
  border-width: 1px;
  border-color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.border.muted};
  margin-right: 8px;
`;

const RadiusText = styled.Text<{ active?: boolean }>`
  font-size: 13px;
  color: ${props => props.active ? '#fff' : props.theme.colors.text.secondary};
  font-weight: 600;
`;

const ResultsHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
`;

const ResultsTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const ResultsCount = styled.Text`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
`;

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

// Default center: Sofia, Bulgaria
const DEFAULT_REGION: Region = {
  latitude: 42.6977,
  longitude: 23.3219,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function MapSearchScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [radius, setRadius] = useState(25);
  const [results, setResults] = useState<ListingBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationName('Location access denied');
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        const newRegion: Region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: radius * 0.02,
          longitudeDelta: radius * 0.02,
        };
        setRegion(newRegion);

        // Reverse geocode
        const [place] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (place) {
          setLocationName(`${place.city || place.region || 'Unknown'}, ${place.country || ''}`);
        }
      } catch (err) {
        logger.error('Location error', err);
        setLocationName('Could not detect location');
      }
    })();
  }, []);

  const fetchNearbyCars = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch active listings from all vehicle collections
      const listings = await ListingService.getListings();
      setResults(listings);
    } catch (err) {
      logger.error('Failed to fetch nearby cars', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNearbyCars();
  }, [fetchNearbyCars]);

  // Update map zoom level when radius changes
  useEffect(() => {
    if (location) {
      const newRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: radius * 0.02,
        longitudeDelta: radius * 0.02,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
    }
  }, [radius]);

  const handleMarkerPress = (car: ListingBase) => {
    router.push({ pathname: '/car/[id]', params: { id: car.id! } });
  };

  const handleRefreshLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (place) setLocationName(`${place.city || place.region || 'Unknown'}, ${place.country || ''}`);

      const newRegion: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: radius * 0.02,
        longitudeDelta: radius * 0.02,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
    } catch (err) {
      Alert.alert('Error', 'Could not update location');
    }
  };

  /** Get a valid coordinate for a listing, if available */
  const getCoords = (car: ListingBase): { latitude: number; longitude: number } | null => {
    const raw = car as any;
    const lat = raw.latitude || raw.lat || raw.location?.latitude || raw.location?.lat;
    const lng = raw.longitude || raw.lng || raw.location?.longitude || raw.location?.lng;
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      return { latitude: Number(lat), longitude: Number(lng) };
    }
    return null;
  };

  const carsWithCoords = results.filter(c => getCoords(c) !== null);

  return (
    <Container theme={theme}>
      <Stack.Screen options={{ headerShown: false }} />
      <MobileHeader title="Cars Near Me" back />

      {/* Real interactive map */}
      <MapView
        ref={mapRef}
        style={{ width, height: 280 }}
        initialRegion={region}
        region={region}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {carsWithCoords.map(car => {
          const coords = getCoords(car)!;
          const title = `${car.make || ''} ${car.model || ''}`.trim();
          const priceStr = car.price ? `€${Number(car.price).toLocaleString()}` : '';
          return (
            <Marker
              key={car.id}
              coordinate={coords}
              title={title}
              description={priceStr}
              onCalloutPress={() => handleMarkerPress(car)}
            />
          );
        })}
      </MapView>

      {/* Location & Radius */}
      <LocationBar theme={theme}>
        <Ionicons name="location" size={20} color={theme.colors.primary.main} />
        <LocationText theme={theme} numberOfLines={1}>{locationName}</LocationText>
        <TouchableOpacity onPress={handleRefreshLocation}>
          <Ionicons name="refresh" size={20} color={theme.colors.primary.main} />
        </TouchableOpacity>
      </LocationBar>

      {/* Radius filter */}
      <View style={{ paddingVertical: 8, paddingLeft: 16 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={RADIUS_OPTIONS}
          keyExtractor={item => String(item)}
          renderItem={({ item }) => (
            <RadiusChip
              theme={theme}
              active={radius === item}
              onPress={() => setRadius(item)}
            >
              <RadiusText theme={theme} active={radius === item}>{item} km</RadiusText>
            </RadiusChip>
          )}
        />
      </View>

      {/* Results */}
      <ResultsHeader theme={theme}>
        <ResultsTitle theme={theme}>Nearby Cars</ResultsTitle>
        <ResultsCount theme={theme}>
          {results.length} found{carsWithCoords.length > 0 ? ` · ${carsWithCoords.length} on map` : ''}
        </ResultsCount>
      </ResultsHeader>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id!}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12 }}>
              <CarCard
                listing={item as any}
                onPress={() => router.push({ pathname: '/car/[id]', params: { id: item.id! } })}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Ionicons name="car-outline" size={48} color={theme.colors.text.disabled} />
              <Text style={{ color: theme.colors.text.secondary, marginTop: 12 }}>No cars found nearby</Text>
            </View>
          }
        />
      )}
    </Container>
  );
}
