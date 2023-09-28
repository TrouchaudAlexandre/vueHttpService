import type {Observable} from 'rxjs';

export interface HttpRequestConfig {
  headers?: any;
  timeout?: number;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
}

export interface HttpClient {
  get<T>(url: string, params?: any): Observable<HttpResponse<T>>;
  post<T>(url: string, body?: any, config?: HttpRequestConfig): Observable<HttpResponse<T>>;
  patch<T>(url: string, body?: any, config?: HttpRequestConfig): Observable<HttpResponse<T>>;
}

export interface RequestParameters {
  body?: Record<string, unknown> | FormData;
  options?: any;
  keyWordSubjectToRefresh?: string[];
  params?: Record<string, unknown>;
}
