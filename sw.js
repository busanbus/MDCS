// ======== Service Worker for 운행전 자가점검시스템 ========

const CACHE_NAME = 'mdcs-v1.0.0';
const STATIC_CACHE = 'mdcs-static-v1.0.0';
const DYNAMIC_CACHE = 'mdcs-dynamic-v1.0.0';

// 캐시할 정적 파일들
const STATIC_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  '/logo.png'
];

// ======== 설치 이벤트 ========
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('정적 파일 캐싱 중...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker 설치 완료');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('캐시 설치 실패:', error);
      })
  );
});

// ======== 활성화 이벤트 ========
self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화 중...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 이전 캐시 삭제
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('이전 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker 활성화 완료');
        return self.clients.claim();
      })
  );
});

// ======== 요청 가로채기 ========
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API 요청은 네트워크 우선, 실패 시 캐시
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // 정적 파일은 캐시 우선, 실패 시 네트워크
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// ======== API 요청 처리 ========
async function handleApiRequest(request) {
  try {
    // 네트워크 요청 시도
    const response = await fetch(request);
    
    // 성공 시 동적 캐시에 저장
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('API 요청 실패, 캐시에서 검색:', error);
    
    // 캐시에서 검색
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 오프라인 응답
    return new Response(
      JSON.stringify({ 
        error: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// ======== 정적 파일 요청 처리 ========
async function handleStaticRequest(request) {
  try {
    // 캐시에서 먼저 검색
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 캐시에 없으면 네트워크 요청
    const response = await fetch(request);
    
    // 성공 시 동적 캐시에 저장
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('정적 파일 요청 실패:', error);
    
    // 오프라인 페이지 반환
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('오프라인 상태입니다.', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// ======== 백그라운드 동기화 ========
self.addEventListener('sync', (event) => {
  console.log('백그라운드 동기화:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // IndexedDB에서 저장된 데이터 가져오기
    const pendingData = await getPendingData();
    
    if (pendingData.length > 0) {
      console.log('백그라운드에서 데이터 전송 중...');
      
      for (const data of pendingData) {
        await sendDataToServer(data);
        await removePendingData(data.id);
      }
      
      console.log('백그라운드 동기화 완료');
    }
  } catch (error) {
    console.error('백그라운드 동기화 실패:', error);
  }
}

// ======== 푸시 알림 ========
self.addEventListener('push', (event) => {
  console.log('푸시 알림 수신:', event);
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('운행전 자가점검시스템', options)
  );
});

// ======== 알림 클릭 ========
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// ======== IndexedDB 헬퍼 함수들 ========
async function getPendingData() {
  // TODO: IndexedDB 구현
  return [];
}

async function sendDataToServer(data) {
  // TODO: 서버 전송 구현
  return fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

async function removePendingData(id) {
  // TODO: IndexedDB에서 데이터 삭제
  return Promise.resolve();
} 