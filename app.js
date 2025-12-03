// 检测设备是否为iOS
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 检测是否在独立模式下运行（已添加到主屏幕）
function isInStandaloneMode() {
    return (window.matchMedia('(display-mode: standalone)').matches) || 
           (window.navigator.standalone) || 
           (document.referrer.includes('android-app://'));
}

// 显示/隐藏安装提示
function showInstallPromotion() {
    const installBanner = document.getElementById('installBanner');
    const iosTip = document.getElementById('iosInstallTip');
    
    // 如果已经在独立模式下运行，不显示提示
    if (isInStandaloneMode()) {
        installBanner.style.display = 'none';
        iosTip.style.display = 'none';
        return;
    }
    
    let deferredPrompt;
    
    // 检测 beforeinstallprompt 事件（Android/Chrome）
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // 显示安装横幅
        installBanner.style.display = 'flex';
        
        // 安装按钮点击事件
        document.getElementById('installBtn').addEventListener('click', () => {
            installBanner.style.display = 'none';
            deferredPrompt.prompt();
            
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('用户同意安装PWA');
                }
                deferredPrompt = null;
            });
        });
        
        // 关闭按钮
        document.getElementById('dismissBtn').addEventListener('click', () => {
            installBanner.style.display = 'none';
            // 保存用户选择到本地存储
            localStorage.setItem('pwaDismissed', 'true');
        });
    });
    
    // 对于iOS设备，显示特定提示
    if (isIOS()) {
        // 检查之前是否已经关闭过提示
        if (!localStorage.getItem('iosTipDismissed')) {
            iosTip.style.display = 'block';
            
            document.getElementById('closeIosTip').addEventListener('click', () => {
                iosTip.style.display = 'none';
                localStorage.setItem('iosTipDismissed', 'true');
            });
        }
    }
}

// 显示内容函数
function showContent(contentId) {
    // 隐藏所有内容
    document.querySelectorAll('[id$="Content"]').forEach(el => {
        el.classList.add('content-hidden');
    });
    
    // 隐藏内容区域占位符
    document.querySelector('.content-placeholder').style.display = 'none';
    
    // 显示选中的内容
    const contentElement = document.getElementById(contentId + 'Content');
    if (contentElement) {
        contentElement.classList.remove('content-hidden');
        contentElement.style.animation = 'fadeIn 0.5s ease';
        
        // 滚动到内容区域
        contentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// 关闭内容
function closeContent() {
    document.querySelectorAll('[id$="Content"]').forEach(el => {
        el.classList.add('content-hidden');
    });
    
    // 显示内容区域占位符
    const placeholder = document.querySelector('.content-placeholder');
    placeholder.style.display = 'block';
    placeholder.style.animation = 'fadeIn 0.5s ease';
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 清除缓存
function clearCache() {
    if ('serviceWorker' in navigator) {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                caches.delete(cacheName);
            });
            alert('缓存已清除！页面将重新加载。');
            window.location.reload();
        });
    } else {
        alert('您的浏览器不支持Service Worker。');
    }
}

// 注册Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = 'sw.js';
        
        navigator.serviceWorker.register(swPath)
            .then(registration => {
                console.log('✅ Service Worker 注册成功:', registration.scope);
                
                // 检查更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 Service Worker 更新找到:', newWorker.state);
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🆕 新内容可用，请刷新页面！');
                            // 可以在这里显示更新提示
                            if (confirm('新版本可用！是否立即刷新？')) {
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch(error => {
                console.log('❌ Service Worker 注册失败:', error);
            });
    });
}

// 检测网络状态
window.addEventListener('online', () => {
    console.log('🟢 网络已连接');
    // 可以在这里显示网络恢复通知
});

window.addEventListener('offline', () => {
    console.log('🔴 网络已断开');
    // 可以在这里显示离线提示
});

// 应用启动时初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 神秘学知识库 PWA 已启动');
    console.log('运行模式:', isInStandaloneMode() ? '独立应用' : '浏览器');
    console.log('设备:', isIOS() ? 'iOS' : '其他');
    
    // 显示安装提示
    showInstallPromotion();
    
    // 为功能卡片添加点击事件
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', function() {
            const contentId = this.getAttribute('onclick').match(/'(\w+)'/)[1];
            showContent(contentId);
        });
    });
});

// 添加到主屏幕的键盘快捷键（演示用）
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        alert('提示：在移动设备上，您可以通过浏览器的"添加到主屏幕"功能安装此应用。');
    }
});