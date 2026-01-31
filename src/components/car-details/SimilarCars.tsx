import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, View } from 'react-native';
import { theme } from '../../styles/theme';
import { CarCard } from '../CarCard';
import { CarListing } from '../../types/CarListing';
import { ListingService } from '../../services/ListingService';

const Container = styled.View`
  margin-top: 20px;
  padding-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-left: 20px;
  margin-bottom: 12px;
`;

interface SimilarCarsProps {
    currentCarId?: string;
    make?: string;
    price?: number;
}

export const SimilarCars: React.FC<SimilarCarsProps> = ({ currentCarId, make, price }) => {
    const [similarCars, setSimilarCars] = useState<CarListing[]>([]);

    useEffect(() => {
        // Basic logic: Fetch cars of same make
        const fetchSimilar = async () => {
            // This is a mock implementation. Real logic would query Firestore.
            try {
                const all = await ListingService.getListings();
                // Filter manually for now (inefficient but works for prototype)
                const others = all.filter(c => c.id !== currentCarId && c.make === make).slice(0, 5);
                setSimilarCars(others as unknown as CarListing[]);
            } catch (e) {
                console.log("Error fetching similar cars", e);
            }
        };
        if (make) fetchSimilar();
    }, [make, currentCarId]);

    if (similarCars.length === 0) return null;

    return (
        <Container>
            <Title theme={theme}>Similar Vehicles</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
                {similarCars.map((car) => (
                    <View key={car.id} style={{ width: 280, marginRight: 16 }}>
                        <CarCard listing={car as any} />
                    </View>
                ))}
            </ScrollView>
        </Container>
    );
};
