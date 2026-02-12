import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import MapView, { Marker, Callout } from '../../src/components/common/MapViewWrapper';
import { View, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../src/styles/theme';
import { ListingService } from '../../src/services/ListingService';
import { ListingBase } from '../../src/types/ListingBase';
import MobileHeader from '../../src/components/common/MobileHeader';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const CalloutContainer = styled.View`
  padding: 10px;
  width: 200px;
  background-color: #fff;
  border-radius: 12px;
`;

const CalloutTitle = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const CalloutPrice = styled.Text`
  font-size: 16px;
  font-weight: 800;
  color: ${props => props.theme.colors.primary.main};
  margin-top: 4px;
`;

const CustomMarker = styled.View`
  background-color: ${props => props.theme.colors.primary.main};
  padding: 6px 10px;
  border-radius: 20px;
  border-width: 2px;
  border-color: #fff;
`;

const MarkerText = styled.Text`
  color: #fff;
  font-weight: 700;
  font-size: 12px;
`;

export default function MapScreen() {
  const [listings, setListings] = useState<ListingBase[]>([]);
  const [loading, setLoading] = useState(true);

  const SofiaRegion = {
    latitude: 42.6977,
    longitude: 23.3219,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await ListingService.getListings();
      // Only show listings that have real coordinates
      const withCoords = data.filter(item => 
        item.coordinates?.lat && item.coordinates?.lng && 
        typeof item.coordinates.lat === 'number' && 
        typeof item.coordinates.lng === 'number'
      );
      setListings(withCoords);
    } catch (error) {
      // Silently handle - map will show empty
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container theme={theme}>
      <MobileHeader title="Nearby Cars" showLogo={false} />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={SofiaRegion}
        >
          {listings.map((car) => (
            <Marker
              key={car.id}
              coordinate={{
                latitude: car.coordinates!.lat,
                longitude: car.coordinates!.lng
              }}
            >
              <CustomMarker theme={theme}>
                <MarkerText>{car.price?.toLocaleString()} €</MarkerText>
              </CustomMarker>

              <Callout tooltip>
                <CalloutContainer theme={theme}>
                  <CalloutTitle theme={theme}>{car.make} {car.model}</CalloutTitle>
                  <CalloutPrice theme={theme}>{car.price?.toLocaleString()} €</CalloutPrice>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Ionicons name="speedometer-outline" size={12} color="#666" />
                    <MarkerText style={{ color: '#666', fontWeight: '400', marginLeft: 4 }}>
                      {car.mileage?.toLocaleString()} km
                    </MarkerText>
                  </View>
                </CalloutContainer>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  map: {
    width: width,
    height: height - 150,
  },
});
