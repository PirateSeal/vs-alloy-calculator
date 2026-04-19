import { describe, expect, it } from 'vitest';
import {
  getMetallurgyViewFromPath,
  getPathnameForMetallurgyView,
} from './appStateRouting';

describe('appStateRouting view detection', () => {
  it('detects about view from root and localized paths', () => {
    expect(getMetallurgyViewFromPath('/about/')).toBe('about');
    expect(getMetallurgyViewFromPath('/fr/about/')).toBe('about');
  });

  it('returns reference path without locale prefix when none present', () => {
    expect(getPathnameForMetallurgyView('/', 'reference')).toBe('/reference/');
    expect(getPathnameForMetallurgyView('/', 'about')).toBe('/about/');
  });

  it('falls back to calculator view for unknown route', () => {
    expect(getMetallurgyViewFromPath('/unknown/')).toBe('calculator');
  });
});
