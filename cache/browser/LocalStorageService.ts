import type {BrowserStorage} from '@/http/cache/data-storage.type';
import {compressData, decompressData} from '@/http/dataCompression';

function getByKey<T>(key: string): T | null {
  key = `ls:${key}`;
  const data = localStorage.getItem(key);
  if (data == null || data === '') {
    return null;
  }
  const decompressedData = decompressData(data);
  return JSON.parse(decompressedData);
}

function setByKey<T>(key: string, data: T): void {
  key = `ls:${key}`;
  localStorage.setItem(key, compressData(data));
}

function reinitialiseByKeyword(keywords: string[]): void {
  retrieveLocalStorageKeys().forEach((localStorageKey) => {
    keywords.forEach((keyword) => {
      if (localStorageKey.includes(keyword)) {
        localStorage.removeItem(localStorageKey);
      }
    });
  });
}

function retrieveLocalStorageKeys(): string[] {
  const localStorageKey: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) as string;
    if (key.includes('ls:')) {
      localStorageKey.push(key);
    }
  }
  return localStorageKey;
}

export const localStorageService: BrowserStorage = {
  getByKey,
  setByKey,
  reinitialiseByKeyword,
};
