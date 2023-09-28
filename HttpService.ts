import {Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {browserStorageService} from '@/http/cache/browser/browserStorageCreator';
import type {DataStorage} from '@/http/cache/data-storage.type';
import {sessionStorageService} from '@/http/cache/session/sessionStorageCreator';
import {httpClient} from '@/http/client/HttpClientCreator';
import type {HttpResponse, RequestParameters} from '@/http/http.type';
import {buildKeyFromArguments} from '@/http/KeyBuilder';

const httpService = {
    get<T>(path: string, parameters?: RequestParameters): Observable<T> {
        return httpClient.get<T>(`${path}`, parameters?.params).pipe(
            map(returnOnlyDataFromApiResponse),
        );
    },

    post<T>(
        path: string,
        {
            body,
            options,
            keyWordSubjectToRefresh,
        }: RequestParameters,
    ): Observable<T> {
        reinitialiseStorageByKeyword(keyWordSubjectToRefresh);
        return httpClient.post<T>(
            `${path}`,
            body,
            options,
        ).pipe(
            map(returnOnlyDataFromApiResponse),
        );
    },

    patch<T>(
        path: string,
        {
            body,
            options,
            keyWordSubjectToRefresh,
        }: RequestParameters,
    ): Observable<T> {
        reinitialiseStorageByKeyword(keyWordSubjectToRefresh);
        return httpClient.patch<T>(
            `${path}`,
            body,
            options,
        ).pipe(
            map(returnOnlyDataFromApiResponse),
        );
    },

    getAndSavedInSession<T>(path: string, args?: RequestParameters): Observable<T> {
        return saveInSession('get', path, args ?? {});
    },

    postAndSavedInSession<T>(path: string, args?: RequestParameters): Observable<T> {
        return saveInSession('post', path, args ?? {});
    },

    getAndSavedInBrowser<T>(path: string, args?: RequestParameters): Observable<T> {
        return saveInBrowser('get', path, args ?? {});
    },

    postAndSavedInBrowser<T>(path: string, args?: RequestParameters): Observable<T> {
        return saveInBrowser('post', path, args ?? {});
    },
};

function saveInSession<T>(method: string, path: string, args: RequestParameters): Observable<T> {
    const key = buildKeyFromArguments(path, args);

    return sessionStorageService.getByKey<T>(key)
        .pipe(
            switchMap((sessionData: DataStorage<T>) => {
                if (sessionData?.data != null) {
                    return of(sessionData.data);
                } else {
                    return performApiCall<T>(method, path, args, key);
                }
            }),
        );
}

function performApiCall<T>(method: string, path: string, args: RequestParameters, key: string): Observable<T> {
    return httpService[method](path, args ?? {}).pipe(
        tap((apiResult) => {
            sessionStorageService.setByKey(key, apiResult);
        }),
    );
}

function saveInBrowser<T>(method: string, path: string, args: RequestParameters): Observable<T> {
    const key = buildKeyFromArguments(path, args);

    return sessionStorageService.getByKey(key)
        .pipe(
            // @ts-ignore
            switchMap((dataFromSession: DataStorage<T>): Observable<T> => {
                if (isValidSessionData(dataFromSession)) {
                    return of(dataFromSession.data);
                } else {
                    return handleBrowserStorageData<T>(method, path, args, key);
                }
            }),
        );

}

function handleBrowserStorageData<T>(
    method: string,
    path: string,
    args: RequestParameters,
    key: string,
): Observable<T> {
    const dataFromBrowser = browserStorageService.getByKey(key);

    if (dataFromBrowser != null && dataFromBrowser !== '') {
        httpService[method](path, args).pipe(
            tap((resultFromAPI) => {
                if (JSON.stringify(resultFromAPI) !== JSON.stringify(dataFromBrowser)) {
                    browserStorageService.setByKey(key, resultFromAPI);
                }
                sessionStorageService.setCheckByKey(key, resultFromAPI);
            }),
        ).subscribe();
        return of(dataFromBrowser as T);
    } else {
        return httpService[method](path, args).pipe(
            tap((apiResult) => {
                sessionStorageService.setCheckByKey(key, apiResult);
                browserStorageService.setByKey(key, apiResult);
            }),
        );
    }
}

function isValidSessionData<T>(sessionData: DataStorage<T>): boolean {
    return sessionData?.data != null && sessionData.check;
}

function reinitialiseStorageByKeyword(keywords: string[] | undefined): void {
    if (keywords == null) {
        return;
    }
    sessionStorageService.reinitialiseByKeyword(keywords);
    browserStorageService.reinitialiseByKeyword(keywords);
}

function returnOnlyDataFromApiResponse<T>(response: HttpResponse<T>): T {
    return response.data;
}

export default httpService;
