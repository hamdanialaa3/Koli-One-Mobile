/**
 * Admin Sections Management Screen
 * 
 * Allows admin users to show/hide homepage sections on the mobile app.
 * Reads and writes to the SAME Firestore document as the web admin panel.
 * 
 * Route: /profile/admin-sections
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  useMobileSectionVisibility,
  updateMobileSectionVisibility,
  HomepageSection,
} from '../../src/hooks/useMobileSectionVisibility';

// ─── Design Tokens ──────────────────────────────
const C = {
  bg: '#121212',
  surface: '#1E1E1E',
  surfaceHigh: '#242424',
  accent: '#7B2FBE',
  accentLight: '#9C5FE0',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#6B7280',
  border: '#333333',
  success: '#4CAF50',
  error: '#D32F2F',
};

// ─── Section icons mapping ──────────────────────
const SECTION_ICONS: Record<string, string> = {
  hero: 'image',
  smart_recommendations: 'sparkles',
  ai_analysis_banner: 'analytics',
  hero_strips: 'layers',
  visual_search: 'camera',
  vehicle_classifications: 'car-sport',
  life_moments: 'heart',
  categories: 'grid',
  popular_brands: 'ribbon',
  most_demanded: 'trending-up',
  featured_showcase: 'diamond',
  smart_sell: 'megaphone',
  dealers: 'business',
  trust_stats: 'shield-checkmark',
  social: 'share-social',
  loyalty: 'gift',
  recent_browsing: 'time',
};

export default function AdminSectionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { sections: liveSections, isLoaded } = useMobileSectionVisibility();

  const [editSections, setEditSections] = useState<HomepageSection[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize edit state from live sections
  useEffect(() => {
    if (isLoaded && liveSections.length > 0) {
      setEditSections([...liveSections].sort((a, b) => a.order - b.order));
    }
  }, [isLoaded, liveSections]);

  // Toggle a section's visibility
  const toggleSection = useCallback((key: string) => {
    setEditSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s)),
    );
    setHasChanges(true);
  }, []);

  // Toggle all sections
  const toggleAll = useCallback((visible: boolean) => {
    setEditSections((prev) => prev.map((s) => ({ ...s, visible })));
    setHasChanges(true);
  }, []);

  // Save changes to Firestore
  const handleSave = useCallback(async () => {
    if (!user?.email) {
      Alert.alert('Error', 'You must be logged in as admin to save changes.');
      return;
    }

    setSaving(true);
    try {
      await updateMobileSectionVisibility(editSections, user.email);
      setHasChanges(false);
      Alert.alert('✅ Saved', 'Section visibility updated successfully.\nChanges are live immediately.');
    } catch (err) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [editSections, user]);

  // Count visible sections
  const visibleCount = editSections.filter((s) => s.visible).length;
  const totalCount = editSections.length;

  if (!isLoaded) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={styles.loadingText}>Loading sections...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Section Manager</Text>
          <Text style={styles.headerSubtitle}>
            {visibleCount}/{totalCount} sections visible
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges || saving}
          style={[styles.saveBtn, (!hasChanges || saving) && styles.saveBtnDisabled]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={C.text} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Quick Actions ─── */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => toggleAll(true)}
        >
          <Ionicons name="eye" size={16} color={C.success} />
          <Text style={[styles.quickBtnText, { color: C.success }]}>Show All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => toggleAll(false)}
        >
          <Ionicons name="eye-off" size={16} color={C.error} />
          <Text style={[styles.quickBtnText, { color: C.error }]}>Hide All</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Sections List ─── */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {editSections.map((section, index) => {
          const iconName = SECTION_ICONS[section.key] || 'apps';
          return (
            <View key={section.key} style={styles.sectionCard}>
              <View style={styles.sectionLeft}>
                <View
                  style={[
                    styles.sectionIcon,
                    { backgroundColor: section.visible ? `${C.accent}30` : `${C.textTertiary}20` },
                  ]}
                >
                  <Ionicons
                    name={iconName as any}
                    size={20}
                    color={section.visible ? C.accent : C.textTertiary}
                  />
                </View>
                <View style={styles.sectionInfo}>
                  <Text style={[styles.sectionLabel, !section.visible && styles.sectionLabelHidden]}>
                    {section.label}
                  </Text>
                  <Text style={styles.sectionDesc} numberOfLines={1}>
                    {section.description}
                  </Text>
                  <View style={styles.sectionMeta}>
                    <Text style={styles.sectionOrder}>#{index + 1}</Text>
                    <View
                      style={[
                        styles.categoryBadge,
                        section.category === 'conditional' && styles.categoryConditional,
                      ]}
                    >
                      <Text style={styles.categoryBadgeText}>
                        {section.category}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <Switch
                value={section.visible}
                onValueChange={() => toggleSection(section.key)}
                trackColor={{ false: C.border, true: `${C.accent}80` }}
                thumbColor={section.visible ? C.accent : C.textTertiary}
                ios_backgroundColor={C.border}
              />
            </View>
          );
        })}

        {/* Info card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={C.accent} />
          <Text style={styles.infoText}>
            Changes are synced in real-time with the web admin panel.{'\n'}
            Hidden sections are completely removed from the home page.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── Floating Save (when changes exist) ─── */}
      {hasChanges && (
        <View style={styles.floatingSave}>
          <TouchableOpacity
            style={styles.floatingSaveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={C.text} />
            ) : (
              <>
                <Ionicons name="save" size={20} color={C.text} />
                <Text style={styles.floatingSaveText}>
                  Save Changes ({visibleCount} visible)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: C.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.select({ ios: 56, android: 44, default: 16 }),
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: C.text,
    fontSize: 14,
    fontWeight: '700',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Sections List
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    marginBottom: 2,
  },
  sectionLabelHidden: {
    color: C.textTertiary,
    textDecorationLine: 'line-through',
  },
  sectionDesc: {
    fontSize: 12,
    color: C.textSecondary,
    marginBottom: 4,
  },
  sectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionOrder: {
    fontSize: 11,
    color: C.textTertiary,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: `${C.accent}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryConditional: {
    backgroundColor: '#FFD70020',
  },
  categoryBadgeText: {
    fontSize: 10,
    color: C.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${C.accent}10`,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: `${C.accent}30`,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
  },

  // Floating Save
  floatingSave: {
    position: 'absolute',
    bottom: Platform.select({ ios: 100, android: 90, default: 80 }),
    left: 16,
    right: 16,
  },
  floatingSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accent,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: C.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  floatingSaveText: {
    color: C.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
