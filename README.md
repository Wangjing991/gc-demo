# JS 内存管理测试 Demo

这是一个基于 React + Vite 的 JavaScript 内存管理测试项目，使用 [ahooks](https://ahooks.js.org/) 库来演示正确的内存管理实践。

## 功能特性

- ✅ 使用 ahooks 的 `useRequest` 进行数据请求（自动清理）
- ✅ 使用 ahooks 的 `useInterval` 管理定时器（自动清理）
- ✅ 使用 ahooks 的 `useEventListener` 管理事件监听器（自动清理）
- ✅ 使用 ahooks 的 `useUnmount` 确保组件卸载时清理资源
- ✅ 演示手动管理定时器的正确方式
- ✅ 大数据内存测试
- ✅ 组件挂载/卸载测试
- ✅ 内存信息监控（如果浏览器支持）

## 技术栈

- **React 19** - UI 框架
- **Vite 7** - 构建工具
- **ahooks 3.9** - React Hooks 工具库

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

### 构建生产版本

```bash
npm run build
# 或
pnpm build
```

## 项目结构

```
src/
├── components/
│   ├── MemoryTest.jsx          # 主要的内存测试组件
│   └── ComponentMountTest.jsx  # 组件挂载/卸载测试
├── App.jsx                      # 主应用组件
├── App.css                      # 应用样式
├── main.jsx                     # 应用入口
└── index.css                    # 全局样式
```

## 内存管理最佳实践

### 1. 使用 ahooks 自动清理

ahooks 提供的 hooks 会自动处理清理工作，无需手动管理：

```jsx
import { useInterval, useEventListener } from 'ahooks';

// 自动清理的定时器
useInterval(() => {
  // 你的逻辑
}, 1000);

// 自动清理的事件监听器
useEventListener('click', () => {
  // 你的逻辑
});
```

### 2. 手动清理资源

当需要手动管理资源时，确保在 `useEffect` 的清理函数中释放：

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    // 你的逻辑
  }, 1000);
  
  // 清理函数
  return () => {
    clearInterval(timer);
  };
}, []);
```

### 3. 组件卸载时清理

使用 `useUnmount` 确保组件卸载时清理所有资源：

```jsx
import { useUnmount } from 'ahooks';

useUnmount(() => {
  // 清理所有资源
  console.log('组件卸载，清理资源');
});
```

## 测试场景

1. **定时器测试**: 对比使用 `useInterval` 和手动管理定时器的区别
2. **事件监听器测试**: 测试事件监听器的自动清理
3. **大数据测试**: 创建大量数据观察内存使用情况
4. **组件卸载测试**: 测试组件卸载时的资源清理

## 文档

详细的内存管理文档请查看：[JavaScript 内存回收机制详解](./docs/JS_MEMORY_MANAGEMENT.md)

文档内容包括：
- JavaScript 内存管理基础
- 垃圾回收机制详解
- 常见内存泄露场景
- React 和 ahooks 中的内存管理
- 内存调试与监控方法
- 最佳实践

## 注意事项

- 某些浏览器可能不支持 `performance.memory` API，内存信息可能无法显示
- 在 Chrome 浏览器中打开开发者工具的 Performance 面板可以更详细地监控内存使用
- 建议在测试时使用 Chrome DevTools 的 Memory 面板进行内存分析

## License

MIT
