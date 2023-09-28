import type {AxiosInstance,AxiosResponse} from 'axios';
import Axios from 'axios';
import { from , Observable } from 'rxjs';

import type {HttpClient, HttpResponse} from '@/http/http.type';

export function createAxiosClient(baseURL: string = import.meta.env.BASE_URL): HttpClient {
  const client: AxiosInstance = Axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    },
  });

  function get<T>(url: string, params?: any): Observable<HttpResponse<T>> {
    return from(client.get<T>(url, { params }).then(toHttpResponse));
  }

  function post<T>(url: string, body: any = {}, config?: any): Observable<HttpResponse<T>> {
    return from(client.post<T>(url, body, config).then(toHttpResponse));
  }

  function patch<T>(url: string, body: any = {}, config?: any): Observable<HttpResponse<T>> {
    return from(client.patch<T>(url, body, config).then(toHttpResponse));
  }

  return { get, post, patch };
}

function toHttpResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
  return {
    data: response.data,
    status: response.status,
  };
}
