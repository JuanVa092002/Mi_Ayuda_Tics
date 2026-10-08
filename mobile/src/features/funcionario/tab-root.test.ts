import { describe, expect, it, vi } from 'vitest';
import {
  applyFuncionarioTabPress,
  nestedStackIndex,
  openFuncionarioTabRoot,
  planFuncionarioTabPress,
} from './tab-root';

describe('planFuncionarioTabPress', () => {
  it('al cambiar a Casos con un detalle abierto, vuelve a la lista y cambia de tab', () => {
    expect(
      planFuncionarioTabPress({
        focused: false,
        routeName: '(historial)',
        nestedIndex: 1,
        nestedStateKey: 'historial-stack',
      }),
    ).toEqual({
      popToTopTarget: 'historial-stack',
      navigateTo: '(historial)',
    });
  });

  it('si ya estás en Casos viendo un caso, el tab te saca al listado', () => {
    expect(
      planFuncionarioTabPress({
        focused: true,
        routeName: '(historial)',
        nestedIndex: 1,
        nestedStateKey: 'historial-stack',
      }),
    ).toEqual({
      popToTopTarget: 'historial-stack',
    });
  });

  it('si Casos ya muestra el listado, no resetea el stack', () => {
    expect(
      planFuncionarioTabPress({
        focused: true,
        routeName: '(historial)',
        nestedIndex: 0,
        nestedStateKey: 'historial-stack',
      }),
    ).toEqual({});
  });

  it('no reutiliza params del tab: eso restauraría el último caso', () => {
    const plan = planFuncionarioTabPress({
      focused: false,
      routeName: '(historial)',
      nestedIndex: 0,
    });
    expect(plan).toEqual({ navigateTo: '(historial)' });
    expect(plan).not.toHaveProperty('params');
  });
});

describe('nestedStackIndex', () => {
  it('trata un tab nunca visitado como raíz', () => {
    expect(nestedStackIndex({ name: '(historial)' })).toBe(0);
  });
});

describe('applyFuncionarioTabPress', () => {
  it('hace popToTop del stack anidado y luego navega al tab', () => {
    const navigation = {
      navigate: vi.fn(),
      dispatch: vi.fn(),
    };
    applyFuncionarioTabPress(navigation, {
      popToTopTarget: 'historial-stack',
      navigateTo: '(historial)',
    });
    expect(navigation.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'POP_TO_TOP', target: 'historial-stack' }),
    );
    expect(navigation.navigate).toHaveBeenCalledWith('(historial)');
  });
});

describe('openFuncionarioTabRoot', () => {
  it('abre Casos en el listado aunque el stack tenga un detalle', () => {
    const tabs = {
      navigate: vi.fn(),
      dispatch: vi.fn(),
      getState: () => ({
        routes: [
          { name: '(home)' },
          { name: '(historial)', state: { key: 'historial-stack', index: 1 } },
        ],
      }),
    };
    openFuncionarioTabRoot(tabs, '(historial)');
    expect(tabs.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'POP_TO_TOP', target: 'historial-stack' }),
    );
    expect(tabs.navigate).toHaveBeenCalledWith('(historial)');
  });
});
