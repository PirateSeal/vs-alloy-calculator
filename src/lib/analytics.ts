declare global {
  interface Window {
    umami?: { track: (name: string, data?: Record<string, unknown>) => void };
  }
}

let _locale = "en";

export function setAnalyticsLocale(locale: string) {
  _locale = locale;
}

export function track(name: string, data?: Record<string, unknown>) {
  window.umami?.track(name, { locale: _locale, ...data });
}
