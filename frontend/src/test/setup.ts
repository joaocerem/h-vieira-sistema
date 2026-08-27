import '@testing-library/jest-dom/vitest'

// jsdom não implementa matchMedia — next-themes (ThemeProvider) depende dele mesmo com
// enableSystem={false}. Mock mínimo, só para os testes rodarem.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
