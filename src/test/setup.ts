import '@testing-library/jest-dom';

// jsdom polyfill for scrollIntoView
if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
