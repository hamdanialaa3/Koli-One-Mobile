import React from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import { Skeleton } from '../ui/Skeleton';
import { theme } from '../../styles/theme';

const CardContainer = styled.View`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.lg};
  overflow: hidden;
  border-width: 1px;
  border-color: ${theme.colors.border.muted};
`;

const ContentContainer = styled.View`
  padding: ${theme.spacing.md};
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const ChipsRow = styled.View`
  flex-direction: row;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.sm};
`;

export const SkeletonListingCard = () => {
  return (
    <CardContainer>
      {/* Image Placeholder */}
      <Skeleton height={200} borderRadius={0} />

      <ContentContainer>
        {/* Title & Price Row */}
        <Row>
          <Skeleton width="60%" height={24} />
          <Skeleton width="30%" height={24} />
        </Row>

        {/* Chips Row */}
        <ChipsRow>
          <Skeleton width={60} height={20} borderRadius={12} />
          <Skeleton width={80} height={20} borderRadius={12} />
          <Skeleton width={50} height={20} borderRadius={12} />
        </ChipsRow>

        {/* Location & Time */}
        <Row style={{ marginTop: 8 }}>
          <Skeleton width="40%" height={16} />
          <Skeleton width="20%" height={16} />
        </Row>
      </ContentContainer>
    </CardContainer>
  );
};
