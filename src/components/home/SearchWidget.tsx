import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View, Platform, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker'; // Ensure this is installed
import { theme } from '../../styles/theme';
import { AnimatedButton } from '../ui/AnimatedButton';

const WidgetContainer = styled(BlurView)`
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.2);
  margin-top: 20px;
`;

const ContentContainer = styled.View`
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.1); 
`;

const TabsContainer = styled.View`
  flex-direction: row;
  background-color: rgba(241, 245, 249, 0.8); /* Light mode bg approximation */
  padding: 4px;
  border-bottom-width: 1px;
  border-bottom-color: rgba(0,0,0,0.05);
`;

const TabButton = styled(TouchableOpacity) <{ active: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background-color: ${props => props.active ? '#FFF4EB' : 'transparent'};
  border-width: 1px;
  border-color: ${props => props.active ? '#FF7900' : 'transparent'};
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 6px;
`;

const TabText = styled.Text<{ active: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.active ? '#FF7900' : '#64748b'};
`;

const FormContainer = styled.View`
  gap: 16px;
  margin-top: 16px;
`;

const Field = styled.View`
  gap: 6px;
`;

const Label = styled.Text`
  font-size: 13px;
  font-weight: 500;
  color: #ffffff; /* Contrast against dark hero image */
  text-shadow: 0px 1px 2px rgba(0,0,0,0.5);
`;

const PickerWrapper = styled.View`
  background-color: #ffffff;
  border-radius: 10px;
  border-width: 1px;
  border-color: #e2e8f0;
  height: 52px;
  justify-content: center;
  overflow: hidden;
`;

const GradientButton = styled(LinearGradient)`
  height: 56px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  margin-top: 8px;
  elevation: 4;
  ${Platform.OS !== 'web' ? `
    shadow-color: #FF7900;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.3;
    shadow-radius: 8px;
  ` : `
    box-shadow: 0px 4px 8px rgba(255, 121, 0, 0.3);
  `}
`;

const ButtonText = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin-left: 8px;
`;

const AdvancedLink = styled(TouchableOpacity)`
  padding: 12px;
  align-items: center;
`;

const AdvancedLinkText = styled.Text`
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
  text-decoration-line: underline;
`;

export default function SearchWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'used'>('all');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');

  // Static Data mimicking Web
  const makes = ['Audi', 'BMW', 'Mercedes-Benz', 'Toyota', 'Volkswagen'];
  const prices = ['5000', '10000', '20000', '50000', '100000'];

  const handleSearch = () => {
    // Navigate with params
    router.push({
      pathname: '/(tabs)/search',
      params: { make, model, condition: activeTab === 'all' ? undefined : activeTab }
    });
  };

  return (
    <WidgetContainer intensity={20} tint="dark">
      <TabsContainer>
        <TabButton active={activeTab === 'all'} onPress={() => setActiveTab('all')}>
          <Ionicons name="car-outline" size={16} color={activeTab === 'all' ? '#FF7900' : '#64748b'} />
          <TabText active={activeTab === 'all'}>All Cars</TabText>
        </TabButton>
        <TabButton active={activeTab === 'used'} onPress={() => setActiveTab('used')}>
          <Ionicons name="checkmark-circle-outline" size={16} color={activeTab === 'used' ? '#FF7900' : '#64748b'} />
          <TabText active={activeTab === 'used'}>Used</TabText>
        </TabButton>
        <TabButton active={activeTab === 'new'} onPress={() => setActiveTab('new')}>
          {/* No icon for New in Web design reference, but let's keep it consistent or minimalist */}
          <TabText active={activeTab === 'new'}>New</TabText>
        </TabButton>
      </TabsContainer>

      <ContentContainer>
        <FormContainer>
          {/* Make */}
          <Field>
            <Label>Make</Label>
            <PickerWrapper>
              <Picker
                selectedValue={make}
                onValueChange={(v) => setMake(v)}
                style={{ width: '100%', height: 52, color: '#0f172a' }}
              >
                <Picker.Item label="Any Make" value="" />
                {makes.map(m => <Picker.Item key={m} label={m} value={m} />)}
              </Picker>
            </PickerWrapper>
          </Field>

          {/* Model */}
          <Field>
            <Label>Model</Label>
            <PickerWrapper>
              <Picker
                selectedValue={model}
                onValueChange={(v) => setModel(v)}
                enabled={!!make}
                style={{ width: '100%', height: 52, color: !make ? '#94a3b8' : '#0f172a' }}
              >
                <Picker.Item label="Any Model" value="" />
                {/* Mock models if make selected */}
                {make && <Picker.Item label="Model X" value="Model X" />}
              </Picker>
            </PickerWrapper>
          </Field>

          {/* Search Button */}
          <AnimatedButton onPress={handleSearch}>
            <GradientButton
              colors={['#FF7900', '#FF9433']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="search" size={20} color="#fff" />
              <ButtonText>Search 15,420 cars</ButtonText>
            </GradientButton>
          </AnimatedButton>

          <AdvancedLink onPress={() => router.push('/(tabs)/search')}>
            <AdvancedLinkText>Detailed Search</AdvancedLinkText>
          </AdvancedLink>

        </FormContainer>
      </ContentContainer>
    </WidgetContainer>
  );
}
