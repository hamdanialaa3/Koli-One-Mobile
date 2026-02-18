/**
 * Koli One — StatusBadge — Reusable status indicator
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Clock, XCircle, AlertTriangle, Eye, Shield } from 'lucide-react-native';

type Status = 'active' | 'pending' | 'rejected' | 'sold' | 'featured' | 'verified' | 'warning';

const STATUS_CONFIG: Record<Status, { label: string; bg: string; color: string; icon: any }> = {
  active: { label: 'Активна', bg: '#DCFCE7', color: '#16A34A', icon: CheckCircle },
  pending: { label: 'Изчакване', bg: '#FEF3C7', color: '#D97706', icon: Clock },
  rejected: { label: 'Отхвърлена', bg: '#FEE2E2', color: '#DC2626', icon: XCircle },
  sold: { label: 'Продадена', bg: '#DBEAFE', color: '#2563EB', icon: CheckCircle },
  featured: { label: 'Промотирана', bg: '#FFF7ED', color: '#EA580C', icon: Eye },
  verified: { label: 'Верифицирана', bg: '#DCFCE7', color: '#16A34A', icon: Shield },
  warning: { label: 'Внимание', bg: '#FEF3C7', color: '#D97706', icon: AlertTriangle },
};

interface Props {
  status: Status;
  label?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, label, size = 'sm' }: Props) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 12 : 14;
  const fontSize = size === 'sm' ? 11 : 13;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === 'md' && styles.badgeMd]}>
      <Icon size={iconSize} color={config.color} />
      <Text style={[styles.text, { color: config.color, fontSize }]}>{label || config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeMd: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  text: { fontWeight: '700' },
});
