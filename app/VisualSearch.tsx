import React, { useState, useCallback } from 'react';
import styled from 'styled-components/native';
import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../src/services/firebase';

// ---------- types ----------
interface VehicleResult {
  id: string;
  collection: string;
  make: string;
  model: string;
  year?: number;
  price?: number;
  currency?: string;
  primaryImage?: string;
  city?: string;
}

type ScreenState = 'idle' | 'imageSelected' | 'searching' | 'results' | 'noResults' | 'error';

const VEHICLE_COLLECTIONS = [
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses',
] as const;

// ---------- styled components ----------
const Container = styled.View`
  flex: 1;
  background-color: ${(p: any) => p.theme.colors.background.default};
`;

const Content = styled.ScrollView.attrs({ contentContainerStyle: { alignItems: 'center', padding: 24, paddingBottom: 48 } })`
  flex: 1;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${(p: any) => p.theme.colors.text.primary};
  margin-top: 16px;
  text-align: center;
`;

const Subtitle = styled.Text`
  font-size: 15px;
  color: ${(p: any) => p.theme.colors.text.secondary};
  text-align: center;
  margin-top: 8px;
  line-height: 22px;
`;

const PreviewImage = styled.Image`
  width: 100%;
  aspect-ratio: 1.5;
  border-radius: 16px;
  margin-top: 20px;
`;

const PickerRow = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 24px;
  width: 100%;
`;

const PickerButton = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: ${(p: any) => p.theme.colors.primary || '#FF7900'};
  padding: 14px 0;
  border-radius: 12px;
`;

const PickerButtonText = styled.Text`
  color: #fff;
  font-weight: 700;
  font-size: 15px;
`;

const FormCard = styled.View`
  width: 100%;
  background-color: ${(p: any) => p.theme.colors.background.card || '#f5f5f5'};
  border-radius: 16px;
  padding: 20px;
  margin-top: 20px;
`;

const FormLabel = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${(p: any) => p.theme.colors.text.primary};
  margin-bottom: 6px;
  margin-top: 12px;
`;

const StyledInput = styled.TextInput`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 16px;
  color: ${(p: any) => p.theme.colors.text.primary};
`;

const SearchButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  width: 100%;
  background-color: ${(p: any) => (p.disabled ? '#aaa' : p.theme.colors.primary || '#FF7900')};
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  margin-top: 16px;
`;

const SearchButtonText = styled.Text`
  color: #fff;
  font-weight: 700;
  font-size: 16px;
`;

const ResultCard = styled.TouchableOpacity`
  flex-direction: row;
  background-color: ${(p: any) => p.theme.colors.background.card || '#fff'};
  border-radius: 12px;
  overflow: hidden;
  margin-top: 12px;
  width: 100%;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.08;
  shadow-radius: 6px;
`;

const ResultImage = styled.Image`
  width: 110px;
  height: 90px;
`;

const ResultInfo = styled.View`
  flex: 1;
  padding: 10px 12px;
  justify-content: center;
`;

const ResultTitle = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: ${(p: any) => p.theme.colors.text.primary};
`;

const ResultMeta = styled.Text`
  font-size: 13px;
  color: ${(p: any) => p.theme.colors.text.secondary};
  margin-top: 2px;
`;

const ResultPrice = styled.Text`
  font-size: 15px;
  font-weight: 800;
  color: ${(p: any) => p.theme.colors.primary || '#FF7900'};
  margin-top: 4px;
`;

const ErrorText = styled.Text`
  color: #dc2626;
  font-size: 14px;
  text-align: center;
  margin-top: 12px;
`;

const ResetButton = styled.TouchableOpacity`
  margin-top: 20px;
  padding: 12px 24px;
  border-radius: 10px;
  background-color: ${(p: any) => p.theme.colors.background.card || '#f0f0f0'};
`;

const ResetButtonText = styled.Text`
  color: ${(p: any) => p.theme.colors.text.primary};
  font-weight: 600;
  font-size: 15px;
`;

// ---------- component ----------
export default function VisualSearchScreen() {
  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [results, setResults] = useState<VehicleResult[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // ---- image picking ----
  const pickImage = useCallback(async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Разрешение', 'Нужен достъп до камерата.');
          return;
        }
      }

      const pickerFn = useCamera
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

      const result = await pickerFn({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
        setScreenState('imageSelected');
        setResults([]);
        setErrorMsg('');
      }
    } catch {
      Alert.alert('Грешка', 'Неуспешно избиране на снимка.');
    }
  }, []);

  // ---- firestore search ----
  const searchListings = useCallback(async () => {
    const trimmedMake = make.trim();
    const trimmedModel = model.trim();

    if (!trimmedMake) {
      Alert.alert('Въведете марка', 'Моля, напишете марката на автомобила.');
      return;
    }

    setScreenState('searching');
    setErrorMsg('');

    try {
      const allResults: VehicleResult[] = [];

      const promises = VEHICLE_COLLECTIONS.map(async (col) => {
        const constraints = [
          where('make', '==', trimmedMake),
          where('status', '==', 'active'),
        ];
        if (trimmedModel) {
          constraints.push(where('model', '==', trimmedModel));
        }

        const q = query(collection(db, col), ...constraints);
        const snap = await getDocs(q);

        snap.forEach((docSnap) => {
          const d = docSnap.data();
          allResults.push({
            id: docSnap.id,
            collection: col,
            make: d.make ?? '',
            model: d.model ?? '',
            year: d.year,
            price: d.price,
            currency: d.currency ?? 'лв.',
            primaryImage: d.primaryImage,
            city: d.location?.city,
          });
        });
      });

      await Promise.all(promises);

      // sort by price ascending
      allResults.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));

      setResults(allResults);
      setScreenState(allResults.length > 0 ? 'results' : 'noResults');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Грешка при търсене.');
      setScreenState('error');
    }
  }, [make, model]);

  // ---- reset ----
  const reset = useCallback(() => {
    setScreenState('idle');
    setImageUri(null);
    setMake('');
    setModel('');
    setResults([]);
    setErrorMsg('');
  }, []);

  // ---- render helpers ----
  const renderResult = ({ item }: { item: VehicleResult }) => (
    <ResultCard theme={theme} activeOpacity={0.7}>
      {item.primaryImage ? (
        <ResultImage source={{ uri: item.primaryImage }} resizeMode="cover" />
      ) : (
        <View style={{ width: 110, height: 90, backgroundColor: '#e5e5e5', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="car-outline" size={32} color="#aaa" />
        </View>
      )}
      <ResultInfo theme={theme}>
        <ResultTitle theme={theme}>{item.make} {item.model}</ResultTitle>
        <ResultMeta theme={theme}>
          {item.year ? `${item.year} · ` : ''}{item.city ?? ''}
        </ResultMeta>
        {item.price != null && (
          <ResultPrice theme={theme}>
            {item.price.toLocaleString('bg-BG')} {item.currency}
          </ResultPrice>
        )}
      </ResultInfo>
    </ResultCard>
  );

  return (
    <Container theme={theme}>
      <Stack.Screen options={{ title: 'Визуално търсене', headerBackTitle: 'Назад' }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <Content theme={theme}>
          {/* ---- IDLE: pick image ---- */}
          {screenState === 'idle' && (
            <>
              <Ionicons name="camera-outline" size={64} color={theme.colors.primary.main || '#FF7900'} />
              <Title theme={theme}>Визуално търсене</Title>
              <Subtitle theme={theme}>
                Снимайте или изберете снимка на автомобил, след което въведете марка и модел, за да намерите подобни обяви.
              </Subtitle>
              <PickerRow theme={theme}>
                <PickerButton theme={theme} onPress={() => pickImage(true)} activeOpacity={0.8}>
                  <Ionicons name="camera" size={20} color="#fff" />
                  <PickerButtonText>Камера</PickerButtonText>
                </PickerButton>
                <PickerButton theme={theme} onPress={() => pickImage(false)} activeOpacity={0.8}>
                  <Ionicons name="images" size={20} color="#fff" />
                  <PickerButtonText>Галерия</PickerButtonText>
                </PickerButton>
              </PickerRow>
            </>
          )}

          {/* ---- IMAGE SELECTED: show preview + form ---- */}
          {screenState === 'imageSelected' && imageUri && (
            <>
              <PreviewImage source={{ uri: imageUri }} resizeMode="cover" />
              <FormCard theme={theme}>
                <Title theme={theme} style={{ marginTop: 0, fontSize: 18 }}>
                  Какъв е автомобилът на снимката?
                </Title>
                <FormLabel theme={theme}>Марка</FormLabel>
                <StyledInput
                  theme={theme}
                  placeholder="напр. BMW"
                  placeholderTextColor="#999"
                  value={make}
                  onChangeText={setMake}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <FormLabel theme={theme}>Модел (по избор)</FormLabel>
                <StyledInput
                  theme={theme}
                  placeholder="напр. X5"
                  placeholderTextColor="#999"
                  value={model}
                  onChangeText={setModel}
                  autoCapitalize="words"
                  returnKeyType="search"
                  onSubmitEditing={searchListings}
                />
                <SearchButton theme={theme} onPress={searchListings} disabled={!make.trim()} activeOpacity={0.8}>
                  <SearchButtonText>Търсене</SearchButtonText>
                </SearchButton>
              </FormCard>
              <ResetButton theme={theme} onPress={reset} activeOpacity={0.7}>
                <ResetButtonText theme={theme}>← Нова снимка</ResetButtonText>
              </ResetButton>
            </>
          )}

          {/* ---- SEARCHING ---- */}
          {screenState === 'searching' && (
            <>
              <ActivityIndicator size="large" color={theme.colors.primary.main || '#FF7900'} style={{ marginTop: 24 }} />
              <Title theme={theme}>Търсене...</Title>
              <Subtitle theme={theme}>
                Търсим обяви за {make} {model} в {VEHICLE_COLLECTIONS.length} категории.
              </Subtitle>
              {imageUri && <PreviewImage source={{ uri: imageUri }} resizeMode="cover" />}
            </>
          )}

          {/* ---- RESULTS ---- */}
          {screenState === 'results' && (
            <>
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              <Title theme={theme}>Намерени: {results.length} обяви</Title>
              <Subtitle theme={theme}>
                {make} {model}
              </Subtitle>
              {imageUri && <PreviewImage source={{ uri: imageUri }} resizeMode="cover" />}
              {results.map((item) => (
                <React.Fragment key={`${item.collection}-${item.id}`}>
                  {renderResult({ item })}
                </React.Fragment>
              ))}
              <ResetButton theme={theme} onPress={reset} activeOpacity={0.7}>
                <ResetButtonText theme={theme}>← Ново търсене</ResetButtonText>
              </ResetButton>
            </>
          )}

          {/* ---- NO RESULTS ---- */}
          {screenState === 'noResults' && (
            <>
              <Ionicons name="search-outline" size={48} color="#aaa" />
              <Title theme={theme}>Няма резултати</Title>
              <Subtitle theme={theme}>
                Не намерихме обяви за {make} {model}. Опитайте с друга марка или модел.
              </Subtitle>
              {imageUri && <PreviewImage source={{ uri: imageUri }} resizeMode="cover" />}
              <ResetButton theme={theme} onPress={reset} activeOpacity={0.7}>
                <ResetButtonText theme={theme}>← Ново търсене</ResetButtonText>
              </ResetButton>
            </>
          )}

          {/* ---- ERROR ---- */}
          {screenState === 'error' && (
            <>
              <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
              <Title theme={theme}>Грешка</Title>
              <ErrorText theme={theme}>{errorMsg}</ErrorText>
              <ResetButton theme={theme} onPress={reset} activeOpacity={0.7}>
                <ResetButtonText theme={theme}>← Опитайте отново</ResetButtonText>
              </ResetButton>
            </>
          )}
        </Content>
      </KeyboardAvoidingView>
    </Container>
  );
}
