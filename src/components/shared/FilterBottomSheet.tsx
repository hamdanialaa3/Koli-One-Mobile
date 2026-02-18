/**
 * Koli One — FilterBottomSheet — Reusable bottom sheet with search filters
 */
import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterGroup {
  key: string;
  title: string;
  options: FilterOption[];
  multiSelect?: boolean;
}

interface Props {
  sheetRef: React.RefObject<BottomSheet | null>;
  filters: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
  onApply: () => void;
  onReset: () => void;
  activeCount?: number;
}

export default function FilterBottomSheet({
  sheetRef, filters, selectedFilters, onFilterChange, onApply, onReset, activeCount = 0,
}: Props) {
  const snapPoints = useMemo(() => ['50%', '85%'], []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />,
    []
  );

  const toggleFilter = (groupKey: string, optionId: string, multiSelect: boolean) => {
    Haptics.selectionAsync();
    const current = selectedFilters[groupKey] || [];
    if (multiSelect) {
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      onFilterChange(groupKey, updated);
    } else {
      onFilterChange(groupKey, current.includes(optionId) ? [] : [optionId]);
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <SlidersHorizontal size={20} color="#003366" />
          <Text style={styles.title}>Филтри</Text>
          {activeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => { onReset(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
          <RotateCcw size={20} color="#CC0000" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        {filters.map((group) => (
          <View key={group.key} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.optionsWrap}>
              {group.options.map((opt) => {
                const isSelected = (selectedFilters[group.key] || []).includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.optionChip, isSelected && styles.optionChipActive]}
                    onPress={() => toggleFilter(group.key, opt.id, group.multiSelect ?? true)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </BottomSheetScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={() => { onApply(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}>
          <Text style={styles.applyBtnText}>Приложи филтри</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  indicator: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' },
  background: { borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  badge: { backgroundColor: '#7B2FBE', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  group: { marginBottom: 24 },
  groupTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F1F5F9', borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  optionChipActive: { backgroundColor: '#003366', borderColor: '#003366' },
  optionText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  optionTextActive: { color: '#FFF' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  applyBtn: {
    backgroundColor: '#7B2FBE', paddingVertical: 16, borderRadius: 12, alignItems: 'center',
    ...Platform.select({ ios: { shadowColor: '#7B2FBE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }, android: { elevation: 6 } }),
  },
  applyBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
