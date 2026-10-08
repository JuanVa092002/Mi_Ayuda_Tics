import {
  applyFuncionarioTabPress,
  nestedStackIndex,
  planFuncionarioTabPress,
} from '@/features/funcionario/tab-root';
import { useSystemNavInset } from '@/shared/layout/useSystemNavInset';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { Text } from '@/shared/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';

const TAB_ICON_SIZE = 24;

function TabIcon({ name, color, focused }: { name: string; color: ColorValue; focused: boolean }) {
  const iconName = focused ? name : `${name}-outline`;
  return (
    <Ionicons
      name={iconName as React.ComponentProps<typeof Ionicons>['name']}
      size={TAB_ICON_SIZE}
      color={color}
    />
  );
}

type FuncionarioTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

function FuncionarioTabBar({ state, descriptors, navigation }: FuncionarioTabBarProps) {
  const { tabBarPadding } = useSystemNavInset();

  return (
    <View style={[styles.bar, { paddingBottom: tabBarPadding }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const color = focused
          ? semanticColors.brand.green
          : semanticColors.text.tertiary;
        const label =
          typeof options.title === 'string' ? options.title : route.name;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (event.defaultPrevented) {
            return;
          }

          const tabRoute = state.routes[index];
          applyFuncionarioTabPress(
            navigation,
            planFuncionarioTabPress({
              focused,
              routeName: route.name,
              nestedIndex: nestedStackIndex(tabRoute),
              nestedStateKey: tabRoute.state?.key,
            }),
          );
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            accessibilityHint={`Abre la sección ${label}`}
            onPress={onPress}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            {options.tabBarIcon?.({ focused, color, size: TAB_ICON_SIZE })}
            <Text variant="caption" style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Bottom tabs for the funcionario role.
 *
 * Custom tab bar owns WindowInsets padding so 3-button nav lifts the tabs
 * and gesture nav lets them sit lower — without a fixed `tabBarStyle.height`
 * that fights React Navigation and can loop layout.
 *
 * A tab is a destination (Inicio, el listado de Casos, Cuenta), not a
 * back-stack. Tapping Casos always shows every solicitud, never the last
 * opened detalle.
 */
export default function FuncionarioTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FuncionarioTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: semanticColors.brand.green,
        tabBarInactiveTintColor: semanticColors.text.tertiary,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(historial)"
        options={{
          title: 'Casos',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="time" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(cuenta)"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: semanticColors.surface.default,
    borderTopColor: semanticColors.border.default,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing[1],
    elevation: 12,
    shadowColor: semanticColors.brand.blue,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  item: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: spacing[1],
  },
  itemPressed: {
    opacity: 0.72,
  },
  label: {
    fontWeight: '600',
  },
});
