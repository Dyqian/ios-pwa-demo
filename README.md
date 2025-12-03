# 神秘学知识库 - PWA学习工具

这是一个渐进式网页应用（PWA）的演示项目，展示了如何创建一个可以添加到主屏幕的网页应用，绕过App Store审核。

## 功能特点

✅ **PWA核心功能**
- 可添加到手机主屏幕
- 离线可用
- 快速加载
- 独立应用体验（无浏览器UI）

✅ **教育内容定位**
- 塔罗牌历史与文化知识
- 占星学背景介绍
- 符号学解读
- 互动知识测验

✅ **技术特性**
- Service Worker 缓存策略
- 响应式设计
- iOS/Android兼容
- 安装提示引导

## 本地运行

1. 克隆仓库：
```
git clone https://github.com/你的用户名/fortune-learning-pwa.git
```

2. 进入项目目录：
```
cd fortune-learning-pwa
```

3. 使用本地服务器运行（推荐使用Live Server扩展）：
```
# 使用Python简单服务器
python -m http.server 8000

# 或使用Node.js的http-server
npx http-server
```

4. 在浏览器中访问：
```
http://localhost:8000
```