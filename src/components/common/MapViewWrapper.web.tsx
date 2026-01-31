import React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';

const WebMapPlaceholder = styled.View`
  flex: 1;
  background-color: #f1f5f9;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border-width: 2px;
  border-color: #e2e8f0;
  border-style: dashed;
  margin: 20px;
`;

const PlaceholderText = styled.Text`
  color: #64748b;
  font-size: 16px;
  text-align: center;
  padding: 20px;
`;

const MapView = (props: any) => (
    <WebMapPlaceholder {...props}>
        <PlaceholderText>
            Map is not supported in Web preview.
            Please use Expo Go on a mobile device to view the map.
        </PlaceholderText>
    </WebMapPlaceholder>
);

export const Marker = () => null;
export const Callout = () => null;

export default MapView;
