/**
 * MapComponents.web.tsx – web stub for react-native-maps.
 * Renders plain Views so map-search.tsx compiles on web without
 * pulling in the native-only react-native-maps package.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

/** Placeholder map that renders a styled container on web */
const MapView = React.forwardRef<View, any>(({ style, children, ...rest }, ref) => (
  <View ref={ref} style={[styles.map, style]} {...rest}>
    <View style={styles.placeholder}>
      <Text style={styles.text}>🗺️ Map view is available in the mobile app</Text>
    </View>
    {children}
  </View>
));
MapView.displayName = 'MapView';

/** No-op Marker on web */
const Marker = (_props: any) => null;

const styles = StyleSheet.create({
  map: {
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    padding: 24,
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
});

export { MapView, Marker };
export default MapView;
