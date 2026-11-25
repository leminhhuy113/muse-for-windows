import type { MusePreloadApi } from './index';

declare global {
  interface Window {
    museApi: MusePreloadApi;
  }
}
