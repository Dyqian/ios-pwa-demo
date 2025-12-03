// 版本控制 - 更新此版本号以强制更新缓存
const CACHE_VERSION = 'v1.0.2';
const CACHE_NAME = `fortune-learning-cache-${CACHE_VERSION}`;

// 需要缓存的资源列表
const urlsToCache = [
    '/fortune-learning-pwa/',
    '/fortune-learning-pwa/index.html',
    '/fortune-learning-pwa/style.css',
    '/fortune-learning-pwa/app.js',
    '/fortune-learning-pwa/manifest.json',
    '/fortune-learning-pwa/icons/icon-192.png',
    '/fortune-learning-pwa/icons/icon-512.png',
    '/fortune-learning-pwa/icons/apple-touch-icon.png',
    '/fortune-learning-pwa/icons/favicon.ico'
];

// 安装事件 - 预缓存关键资源
self.addEventListener('install', event => {
    console.log('🛠️ Service Worker 安装中...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 正在缓存应用资源...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ 所有资源已缓存');
                return self.skipWaiting(); // 强制激活新Service Worker
            })
            .catch(error => {
                console.error('❌ 缓存失败:', error);
            })
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
    console.log('⚡ Service Worker 激活中...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // 删除所有不是当前版本的缓存
                    if (cacheName !== CACHE_NAME) {
                        console.log(`🗑️ 删除旧缓存: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ 旧缓存已清理');
            return self.clients.claim(); // 立即控制所有页面
        })
    );
});

// 获取事件 - 拦截网络请求
self.addEventListener('fetch', event => {
    // 跳过非GET请求和浏览器扩展
    if (event.request.method !== 'GET' || 
        event.request.url.includes('chrome-extension://')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 如果缓存中有，返回缓存
                if (response) {
                    console.log(`📂 从缓存返回: ${event.request.url}`);
                    return response;
                }
                
                // 否则从网络获取
                console.log(`🌐 从网络获取: ${event.request.url}`);
                return fetch(event.request)
                    .then(response => {
                        // 检查是否为有效响应
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // 克隆响应以进行缓存
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // 只缓存同源的资源
                                if (event.request.url.startsWith(self.location.origin)) {
                                    cache.put(event.request, responseToCache);
                                    console.log(`💾 已缓存新资源: ${event.request.url}`);
                                }
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.error('❌ 获取失败:', error);
                        
                        // 对于HTML请求，返回离线页面
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/fortune-learning-pwa/index.html');
                        }
                        
                        // 对于其他请求，可以返回自定义的离线响应
                        return new Response('网络连接失败，请检查网络设置。', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

// 后台同步（如果支持）
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        console.log('🔄 后台同步开始');
        // 这里可以执行后台数据同步
    }
});

// 推送通知（如果支持）
self.addEventListener('push', event => {
    console.log('📨 收到推送通知');
    
    const options = {
        body: event.data ? event.data.text() : '神秘学知识库有新内容更新！',
        icon: '/fortune-learning-pwa/icons/icon-192.png',
        badge: '/fortune-learning-pwa/icons/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('神秘学知识库', options)
    );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
    console.log('👆 通知被点击');
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                // 如果已经有打开的窗口，聚焦它
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // 否则打开新窗口
                if (clients.openWindow) {
                    return clients.openWindow('/fortune-learning-pwa/');
                }
            })
    );
});