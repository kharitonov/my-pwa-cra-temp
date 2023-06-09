/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { RouteHandler, clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, Router } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
precacheAndRoute(self.__WB_MANIFEST);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }: { request: Request; url: URL }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== 'navigate') {
      return false;
    }

    // If this is a URL that starts with /_, skip.
    if (url.pathname.startsWith('/_')) {
      return false;
    }

    // If this looks like a URL for a resource, because it contains
    // a file extension, skip.
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    // Return true to signal that we want to use the handler.
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// An example runtime caching route for requests that aren't handled by the
// precache, in this case same-origin .png requests like those from in public/
registerRoute(
  // Add in any other file extensions or routing criteria as needed.
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'),
  // Customize this strategy as needed, e.g., by changing to CacheFirst.
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      // Ensure that once this runtime cache reaches a maximum size the
      // least-recently used images are removed.
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

const requestHandler: RouteHandler = async ({url, request, event, params}) => {
  const response = await fetch(request);
  const responseBody = await response.json();
  console.log(response)
  console.log(responseBody)
  return new Response(JSON.stringify(responseBody), {
    headers: response.headers,
  });
}

// An example runtime caching route for requests that aren't handled by the
// precache, in this case same-origin .png requests like those from in public/
// self -> fetch
// registerRoute(
//  ({url, request, event}) => { // 
//   return url.href === 'https://jsonplaceholder.typicode.com/todos/1' 
//  }, 
//  requestHandler
// );

const router = new Router();
const CacheKey = 'my-cache'
const tryNetwork = (req: Request, timeout: number): Promise<Response> => {
  console.log('req: ', req)
  // console.log(req)
return new Promise((resolve, reject) => {
  const timeoutId = setTimeout(reject, timeout);
  fetch(req).then((res) => {
    // если запрос выполнился успешно, отменяем таймаут
    clearTimeout(timeoutId);
    // клонируем полученный ответ от сервера 
    // нужно сделать один раз, потому что поток ответа можно получить один раз
    // сам ответ возвращается ...
    const responseClone = res.clone();
    // ... клонированое знаечение кладем в кэш
    // открываем кэш хранилище по ключу
    caches.open(CacheKey).then((cache) => {
      // сохраняем в кэш хранилище клонированный ответ от сервера
      cache.put(req, responseClone)
    })
    // возвращаем ответ от сервера
    resolve(res);
    // Reject also if network fetch rejects.
  }).catch(e => e)
});
};

// получение ресурсов из кэша
const getFromCache = (req: Request) => {
console.log('network is off so getting from cache...')
// открываем хранилище по ключу
return caches.open(CacheKey).then((cache) => {
  // ищем в кэше результат по значению запроса
  return cache.match(req).then((result) => {
    // если результат удалось найти, возвращаем его в браузер
    // если нет - возвращаем зареджекченный промис
    // все обработчики сервис ворке ожидают промис
    return result || Promise.reject("no-match");
  });
});
};

self.addEventListener('fetch', event => {
  event.respondWith(tryNetwork(event.request, 400).catch(() => getFromCache(event.request)));
  // const {request} = event;
  // const responsePromise = router.handleRequest({
  //   event,
  //   request,
  // });
  // if (responsePromise) {
  //   // Router found a route to handle the request.
  //   event.respondWith(responsePromise);
  // } else {
  //   // No route was found to handle the request.
  // }
});


// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Any other custom service worker logic can go here.
