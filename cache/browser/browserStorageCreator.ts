import {localStorageService} from '@/http/cache/browser/LocalStorageService';
import type {BrowserStorage} from '@/http/cache/data-storage.type';

export function createBrowserStorage(): BrowserStorage {
  return localStorageService;
}

export const browserStorageService = createBrowserStorage();
