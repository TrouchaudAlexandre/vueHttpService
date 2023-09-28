import type {SessionStorage} from '@/http/cache/data-storage.type';
import {subjectStorageService} from '@/http/cache/session/SubjectStorageService';

export function createSessionStorage(): SessionStorage {
  return subjectStorageService;
}

export const sessionStorageService = createSessionStorage();

