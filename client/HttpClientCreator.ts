import { createAxiosClient } from '@/http/client/AxiosClient';
import type { HttpClient } from '@/http/http.type';

export function createHttpClient(url?: string): HttpClient {
  return createAxiosClient(url);
}

export const httpClient = createHttpClient();
