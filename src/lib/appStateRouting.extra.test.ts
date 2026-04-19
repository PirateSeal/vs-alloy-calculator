import { describe, expect, it } from 'vitest';
import {
  getMetallurgyViewFromPath,
  getPathnameForMetallurgyView,
} from '@/features/metallurgy/routing/appStateRouting';

describe('appStateRouting view detection', () => {
  it('falls back to calculator for shared or unknown routes', () => {
    expect(getMetallurgyViewFromPath('/')).toBe('calculator');
    expect(getMetallurgyViewFromPath('/fr/')).toBe('calculator');
    expect(getMetallurgyViewFromPath('/reference/')).toBe('calculator');
    expect(getMetallurgyViewFromPath('/fr/reference/')).toBe('calculator');
  });

  it('returns namespaced metallurgy tool paths', () => {
    expect(getPathnameForMetallurgyView('/', 'calculator')).toBe('/metallurgy/');
    expect(getPathnameForMetallurgyView('/', 'planner')).toBe('/metallurgy/planner/');
  });

  it('falls back to calculator view for unknown route', () => {
    expect(getMetallurgyViewFromPath('/unknown/')).toBe('calculator');
  });
});
