import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSystemNavInset } from '@/shared/layout/useSystemNavInset';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={onPress}
            style={styles.item}
          >
            {options.tabBarIcon?.({ focused, color, size: TAB_ICON_SIZE })}
            <Text style={[styles.label, { color }]}>{label}</Text>
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
        name="(crear)"
        options={{
          title: 'Crear',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="add-circle" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(historial)"
        options={{
          title: 'Solicitudes',
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
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
