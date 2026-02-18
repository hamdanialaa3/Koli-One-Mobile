/**
 * MapComponents.tsx (native) – re-exports react-native-maps for iOS/Android.
 * On web, Metro resolves MapComponents.web.tsx instead.
 */
import MapView, { Marker } from 'react-native-maps';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export { MapView, Marker };
export default MapView;
