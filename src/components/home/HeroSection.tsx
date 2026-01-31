import React from 'react';
import styled from 'styled-components/native';
import { Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import SearchWidget from './SearchWidget';

const { width } = Dimensions.get('window');

const HeroContainer = styled.View`
  min-height: 520px;
  width: 100%;
  position: relative;
  background-color: ${props => props.theme.colors.primary.dark};
`;

const BackgroundImage = styled(ImageBackground)`
  width: 100%;
  height: 100%;
  position: absolute;
`;

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.3); /* Dark overlay 30% */
`;

const ContentWrapper = styled.View`
  flex: 1;
  padding: 0 16px; /* Mobile responsive padding */
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

export default function HeroSection() {
  return (
    <HeroContainer>
      {/* Cinematic Background - Placeholder for "Gemini_Generated_Image..." */}
      <BackgroundImage
        source={{ uri: 'https://images.unsplash.com/photo-1493238792015-164369288140?auto=format&fit=crop&w=1000&q=80' }}
        resizeMode="cover"
      >
        <Overlay />
      </BackgroundImage>

      <ContentWrapper>
        {/* Search Widget - Centered & Prominent */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(200)}
          style={{ width: '100%', maxWidth: 600 }}
        >
          <SearchWidget />
        </Animated.View>
      </ContentWrapper>
    </HeroContainer>
  );
}
