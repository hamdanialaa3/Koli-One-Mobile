import React from 'react';
import styled from 'styled-components/native';
import { View, ScrollView } from 'react-native';
import { Calendar, Gauge, Battery, Zap, CheckCircle, MapPin, Fuel, CircleDashed } from 'lucide-react-native';
import { CarListing } from '../../types/CarListing';
import { theme } from '../../styles/theme';

interface Props {
    car: CarListing;
}

const Container = styled.View`
  padding: 16px;
  background-color: ${props => props.theme.colors.background.default};
`;

const Section = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
`;

const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`;

const GridItem = styled.View`
  width: 48%; /* 2 columns */
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Label = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const Value = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const PriceRow = styled.View`
  flex-direction: row;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
`;

const MainPrice = styled.Text`
  font-size: 28px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary.main};
`;

const SubPrice = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

const FeatureTag = styled.View`
  background-color: ${props => props.theme.colors.background.default};
  padding: 6px 12px;
  border-radius: 6px;
  margin-right: 8px;
  margin-bottom: 8px;
`;

const FeatureText = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.primary};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${props => props.theme.colors.border.muted};
  margin-vertical: 16px;
`;

export const CarDetailsGermanStyle: React.FC<Props> = ({ car }) => {
    const iconColor = theme.colors.primary.main;
    const iconSize = 20;

    return (
        <Container>
            {/* Price Section */}
            <Section>
                <PriceRow>
                    <MainPrice>{car.price?.toLocaleString()} {car.currency || 'EUR'}</MainPrice>
                    <SubPrice>Gross</SubPrice>
                </PriceRow>
                <Value>Net: {((car.price || 0) * 0.83).toLocaleString()} {car.currency}</Value>
                <Divider />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <CheckCircle size={16} color={theme.colors.status.success} />
                    <Label>Financing available from {(car.price || 0) / 60} EUR/mo</Label>
                </View>
            </Section>

            {/* Key Data Grid */}
            <Section>
                <SectionTitle>Key Data</SectionTitle>
                <Grid>
                    <GridItem>
                        <Calendar size={iconSize} color={iconColor} />
                        <View>
                            <Label>First Reg</Label>
                            <Value>{car.year}</Value>
                        </View>
                    </GridItem>
                    <GridItem>
                        <Gauge size={iconSize} color={iconColor} />
                        <View>
                            <Label>Mileage</Label>
                            <Value>{car.mileage?.toLocaleString()} km</Value>
                        </View>
                    </GridItem>
                    <GridItem>
                        <Zap size={iconSize} color={iconColor} />
                        <View>
                            <Label>Power</Label>
                            <Value>{car.power || 'N/A'} hp</Value>
                        </View>
                    </GridItem>
                    <GridItem>
                        <Fuel size={iconSize} color={iconColor} />
                        <View>
                            <Label>Fuel</Label>
                            <Value>{car.fuelType}</Value>
                        </View>
                    </GridItem>
                    <GridItem>
                        <CircleDashed size={iconSize} color={iconColor} />
                        <View>
                            <Label>Transmission</Label>
                            <Value>{car.transmission}</Value>
                        </View>
                    </GridItem>
                </Grid>
            </Section>

            {/* Technical Data */}
            <Section>
                <SectionTitle>Technical Data</SectionTitle>
                <Grid>
                    <GridItem><Label>Engine:</Label><Value>{car.engineSize || 'N/A'}</Value></GridItem>
                    <GridItem><Label>Doors:</Label><Value>{car.doors || car.numberOfDoors || 'N/A'}</Value></GridItem>
                    <GridItem><Label>Seats:</Label><Value>{car.seats || car.numberOfSeats || 'N/A'}</Value></GridItem>
                    <GridItem><Label>Color:</Label><Value>{car.color || 'N/A'}</Value></GridItem>
                    <GridItem><Label>Emission Cls:</Label><Value>{car.euroStandard || 'Euro 6'}</Value></GridItem>
                    <GridItem><Label>Owner:</Label><Value>1</Value></GridItem>
                </Grid>
            </Section>

            {/* Battery (If Electric) */}
            {(car.fuelType === 'Electric' || car.fuelType === 'Hybrid') && (
                <Section>
                    <SectionTitle>Battery & Charging</SectionTitle>
                    <Grid>
                        <GridItem>
                            <Battery size={iconSize} color={theme.colors.status.success} />
                            <View><Label>Capacity</Label><Value>{'N/A'} kWh</Value></View>
                        </GridItem>
                        <GridItem>
                            <Zap size={iconSize} color={theme.colors.status.warning} />
                            <View><Label>Range (WLTP)</Label><Value>{'N/A'} km</Value></View>
                        </GridItem>
                    </Grid>
                </Section>
            )}
            {/* Features */}
            <Section>
                <SectionTitle>Features</SectionTitle>
                <Grid>
                    {car.features?.slice(0, 10).map((feature, i) => (
                        <FeatureTag key={i}>
                            <FeatureText>{feature}</FeatureText>
                        </FeatureTag>
                    ))}
                </Grid>
            </Section>

            {/* Description */}
            <Section>
                <SectionTitle>Description</SectionTitle>
                <Value style={{ lineHeight: 22 }}>{car.description || 'No description provided.'}</Value>
            </Section>

            {/* Location */}
            <Section>
                <SectionTitle>Location</SectionTitle>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <MapPin size={24} color={theme.colors.secondary.main} />
                    <View>
                        <Value>{car.city}, {car.region}</Value>
                        <Label>View on map</Label>
                    </View>
                </View>
            </Section>

        </Container>
    );
};
