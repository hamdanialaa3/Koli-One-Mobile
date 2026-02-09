import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { View, Dimensions, Text } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { theme } from '../../styles/theme';

interface AnalyticsData {
    value: number;
    label?: string;
    frontColor?: string;
    dataPointText?: string;
    // For Pie Chart
    color?: string;
    text?: string;
}

interface AnalyticsMetric {
    title: string;
    value: string | number;
    change: number;
    changeType: 'positive' | 'negative' | 'neutral';
    format?: 'number' | 'currency' | 'percentage';
}

interface AnalyticsSystemProps {
    data?: AnalyticsData[];
    metrics?: AnalyticsMetric[];
    type?: 'bar' | 'line' | 'pie' | 'area';
    title?: string;
    subtitle?: string;
    height?: number;
    showLegend?: boolean;
}

const Container = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
`;

const Header = styled.View`
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

const MetricsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
`;

const MetricCard = styled.View`
  background-color: ${props => props.theme.colors.background.default};
  padding: 12px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border.muted};
  flex: 1;
  min-width: 45%;
`;

const MetricTitle = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 4px;
  text-transform: uppercase;
`;

const MetricValue = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const ChangeContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ChangeText = styled.Text<{ changeType: 'positive' | 'negative' | 'neutral' }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => {
        switch (props.changeType) {
            case 'positive': return props.theme.colors.status.success;
            case 'negative': return props.theme.colors.status.error;
            case 'neutral': return props.theme.colors.text.secondary;
            default: return props.theme.colors.text.secondary;
        }
    }};
`;

const ChartContainer = styled.View<{ height: number }>`
  height: ${props => props.height}px;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.View<{ height: number }>`
    height: ${props => props.height}px;
    width: 100%;
    align-items: center;
    justify-content: center;
    background-color: ${props => props.theme.colors.background.default};
    border-radius: 8px;
    border-style: dashed;
    border-width: 1px;
    border-color: ${props => props.theme.colors.border.muted};
`;

const EmptyText = styled.Text`
    color: ${props => props.theme.colors.text.secondary};
    font-size: 14px;
`;

export const AnalyticsSystem: React.FC<AnalyticsSystemProps> = ({
    data = [],
    metrics = [],
    type = 'bar',
    title,
    subtitle,
    height = 300,
}) => {
    const formatValue = (value: string | number, format?: string) => {
        if (typeof value === 'string') return value;
        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR' }).format(value);
            case 'percentage':
                return `${value}%`;
            default:
                return new Intl.NumberFormat('bg-BG').format(value);
        }
    };

    const getChangeIcon = (type: 'positive' | 'negative' | 'neutral') => {
        switch (type) {
            case 'positive': return '↗';
            case 'negative': return '↘';
            default: return '→';
        }
    };

    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 64; // padding 16*2 parent + 16*2 container

    const renderChart = () => {
        if (!data || data.length === 0) {
            return <EmptyState height={height}><EmptyText>No data available</EmptyText></EmptyState>;
        }

        const commonProps = {
            width: chartWidth,
            height: height - 40,
            rulesColor: theme.colors.border.muted,
            xAxisColor: theme.colors.border.muted,
            yAxisColor: theme.colors.border.muted,
            yAxisTextStyle: { color: theme.colors.text.secondary, fontSize: 10 },
            xAxisLabelTextStyle: { color: theme.colors.text.secondary, fontSize: 10 },
            noOfSections: 4,
        };

        switch (type) {
            case 'bar':
                return (
                    <BarChart
                        data={data}
                        barWidth={32}
                        spacing={24}
                        roundedTop
                        roundedBottom
                        frontColor={theme.colors.primary.main}
                        {...commonProps}
                    />
                );
            case 'line':
            case 'area':
                return (
                    <LineChart
                        data={data}
                        color={theme.colors.primary.main}
                        thickness={3}
                        startFillColor={theme.colors.primary.main}
                        endFillColor={theme.colors.primary.main}
                        startOpacity={0.2}
                        endOpacity={0.0}
                        areaChart={type === 'area'}
                        {...commonProps}
                    />
                );
            case 'pie':
                return (
                    <PieChart
                        data={data}
                        donut
                        showText
                        textColor={theme.colors.text.inverse}
                        radius={height / 2.5}
                        innerRadius={height / 5}
                        textSize={12}
                        {...commonProps}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Container>
            <Header>
                {title && <Title>{title}</Title>}
                {subtitle && <Subtitle>{subtitle}</Subtitle>}
            </Header>

            {metrics.length > 0 && (
                <MetricsContainer>
                    {metrics.map((metric, index) => (
                        <MetricCard key={index}>
                            <MetricTitle>{metric.title}</MetricTitle>
                            <MetricValue>{formatValue(metric.value, metric.format)}</MetricValue>
                            <ChangeContainer>
                                <ChangeText changeType={metric.changeType}>{getChangeIcon(metric.changeType)}</ChangeText>
                                <ChangeText changeType={metric.changeType}>{Math.abs(metric.change)}%</ChangeText>
                            </ChangeContainer>
                        </MetricCard>
                    ))}
                </MetricsContainer>
            )}

            <ChartContainer height={height}>
                {renderChart()}
            </ChartContainer>
        </Container>
    );
};
