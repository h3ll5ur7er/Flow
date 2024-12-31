import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

afterEach(() => {
  cleanup();
}); 