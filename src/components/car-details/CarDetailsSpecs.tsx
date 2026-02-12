import React from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { CarListing } from '../../types/CarListing';

const Section = styled.View`
  padding: 20px;
  background-color: ${props => props.theme.colors.background.paper};
  margin-top: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
`;

const SpecRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding-vertical: 12px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.default};
`;

const SpecLabel = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

const SpecValue = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

interface CarDetailsSpecsProps {
    car: CarListing;
}

export const CarDetailsSpecs: React.FC<CarDetailsSpecsProps> = ({ car }) => {
    const specs = [
        { label: 'Category', value: car.bodyType },
        { label: 'First Registration', value: car.year ? `${car.year}` : '-' },
        { label: 'Mileage', value: car.mileage ? `${car.mileage.toLocaleString()} km` : '-' },
        { label: 'Fuel Type', value: car.fuelType },
        { label: 'Transmission', value: car.transmission },
        { label: 'Power', value: car.power ? `${car.power} hp` : '-' },
        { label: 'Engine Size', value: car.engineSize ? `${car.engineSize} ccm` : '-' },
        { label: 'Doors', value: car.doors || car.numberOfDoors },
        { label: 'Seats', value: car.seats || car.numberOfSeats },
        { label: 'Color', value: car.color },
        { label: 'Interior', value: car.interiorColor ? `${car.interiorMaterial} (${car.interiorColor})` : '-' },
        { label: 'Condition', value: car.condition },
    ];

    return (
        <Section theme={theme}>
            <SectionTitle theme={theme}>Technical Data</SectionTitle>
            {specs.map((spec, index) => (
                <SpecRow key={index} theme={theme}>
                    <SpecLabel theme={theme}>{spec.label}</SpecLabel>
                    <SpecValue theme={theme}>{spec.value || '-'}</SpecValue>
                </SpecRow>
            ))}
        </Section>
    );
};
