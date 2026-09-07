export type FuncionarioTabRouteState = {
  name: string;
  state?: {
    key?: string;
    index?: number;
  };
};

export type FuncionarioTabPressPlan = {
  popToTopTarget?: string;
  navigateTo?: string;
};

export type FuncionarioTabNavigator = {
  navigate: (name: string) => void;
  dispatch: (action: { type: 'POP_TO_TOP'; target: string }) => void;
  getState?: () => { routes: FuncionarioTabRouteState[] };
};

/**
 * Casos / Inicio / Cuenta are destinations, not back-stacks.
 * Tapping a tab always reveals that section's root (the list or home),
 * never the last pushed detalle.
 */
export function nestedStackIndex(tabRoute: FuncionarioTabRouteState | undefined): number {
  return tabRoute?.state?.index ?? 0;
}

export function planFuncionarioTabPress(input: {
  focused: boolean;
  routeName: string;
  nestedIndex: number;
  nestedStateKey?: string;
}): FuncionarioTabPressPlan {
  const plan: FuncionarioTabPressPlan = {};
  if (input.nestedIndex > 0 && input.nestedStateKey) {
    plan.popToTopTarget = input.nestedStateKey;
  }
  if (!input.focused) {
    plan.navigateTo = input.routeName;
  }
  return plan;
}

export function applyFuncionarioTabPress(
  navigation: FuncionarioTabNavigator,
  plan: FuncionarioTabPressPlan,
): void {
  if (plan.popToTopTarget) {
    navigation.dispatch({ type: 'POP_TO_TOP', target: plan.popToTopTarget });
  }
  if (plan.navigateTo) {
    navigation.navigate(plan.navigateTo);
  }
}

export function openFuncionarioTabRoot(tabs: FuncionarioTabNavigator, tabName: string): void {
  const tabRoute = tabs.getState?.().routes.find((route) => route.name === tabName);
  applyFuncionarioTabPress(
    tabs,
    planFuncionarioTabPress({
      focused: false,
      routeName: tabName,
      nestedIndex: nestedStackIndex(tabRoute),
      nestedStateKey: tabRoute?.state?.key,
    }),
  );
}
