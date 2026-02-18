/**
 * Koli One — Premium Custom Tab Bar
 * Flagship navigation with animated icons, unread badges, and floating sell button
 */
import React, { useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  Home,
  Search,
  Tag,
  User,
  MessageCircle,
} from 'lucide-react-native';
import { colors } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 72;
const SELL_BUTTON_SIZE = 56;

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabIcons: Record<string, any> = {
  index: Home,
  search: Search,
  sell: Tag,
  profile: User,
  messages: MessageCircle,
};

const tabLabels: Record<string, string> = {
  index: 'Home',
  search: 'Search',
  sell: 'Sell',
  profile: 'Profile',
  messages: 'Messages',
};

function TabItem({
  route,
  isFocused,
  onPress,
  onLongPress,
  badge,
}: {
  route: any;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  badge?: number;
}) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const iconOpacity = useSharedValue(isFocused ? 1 : 0.5);
  const badgeScale = useSharedValue(badge ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, {
      damping: 15,
      stiffness: 200,
    });
    translateY.value = withSpring(isFocused ? -2 : 0, {
      damping: 15,
      stiffness: 200,
    });
    iconOpacity.value = withTiming(isFocused ? 1 : 0.5, { duration: 200 });
  }, [isFocused]);

  useEffect(() => {
    badgeScale.value = withSpring(badge ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });
  }, [badge]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: iconOpacity.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeScale.value,
  }));

  const Icon = tabIcons[route.name] || Home;
  const isSell = route.name === 'sell';

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  if (isSell) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={onLongPress}
        style={styles.sellButtonContainer}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.sellButton, animatedStyle]}>
          <View style={styles.sellButtonInner}>
            <Tag size={26} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </Animated.View>
        <Animated.Text
          style={[
            styles.sellLabel,
            { opacity: iconOpacity },
          ]}
        >
          Sell
        </Animated.Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={0.7}
    >
      <Animated.View style={animatedStyle}>
        <Icon
          size={22}
          color={isFocused ? colors.primary.main : colors.text.secondary}
          strokeWidth={isFocused ? 2.5 : 1.8}
        />
      </Animated.View>
      {badge ? (
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Animated.Text style={styles.badgeText}>
            {badge > 99 ? '99+' : badge}
          </Animated.Text>
        </Animated.View>
      ) : null}
      <Animated.Text
        style={[
          styles.tabLabel,
          {
            color: isFocused ? colors.primary.main : colors.text.secondary,
            fontWeight: isFocused ? '700' : '500',
          },
        ]}
      >
        {tabLabels[route.name] || route.name}
      </Animated.Text>
      {isFocused && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={95} tint="light" style={StyleSheet.absoluteFill}>
          <View style={styles.blurOverlay} />
        </BlurView>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidBg]} />
      )}
      <View style={styles.tabsRow}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              badge={route.name === 'messages' ? options.tabBarBadge : undefined}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.paper, // Use theme paper color
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: colors.border.default, // Use theme border
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18,18,18,0.95)', // Dark blur
  },
  androidBg: {
    backgroundColor: colors.background.paper,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  tabsRow: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary.main, // Use theme primary
  },
  sellButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  sellButton: {
    width: SELL_BUTTON_SIZE,
    height: SELL_BUTTON_SIZE,
    borderRadius: SELL_BUTTON_SIZE / 2,
    marginTop: -20,
  },
  sellButtonInner: {
    width: SELL_BUTTON_SIZE,
    height: SELL_BUTTON_SIZE,
    borderRadius: SELL_BUTTON_SIZE / 2,
    backgroundColor: colors.primary.main, // Use theme primary
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background.default, // Ring effect
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sellLabel: {
    fontSize: 10,
    color: colors.primary.main,
    fontWeight: '700',
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: '25%',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background.paper,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
});
