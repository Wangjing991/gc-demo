# JavaScript 内存回收机制详解

## 目录

1. [内存管理基础](#内存管理基础)
2. [垃圾回收机制](#垃圾回收机制)
3. [内存泄露](#内存泄露)
4. [React 中的内存管理](#react-中的内存管理)
5. [ahooks 与内存管理](#ahooks-与内存管理)
6. [内存调试与监控](#内存调试与监控)
7. [最佳实践](#最佳实践)

---

## 内存管理基础

### 内存生命周期

JavaScript 内存管理遵循以下生命周期：

1. **分配（Allocation）**：当创建变量、对象、函数时，JavaScript 引擎会分配内存
2. **使用（Use）**：程序读写已分配的内存
3. **释放（Release）**：当内存不再需要时，由垃圾回收器自动释放

### 内存类型

JavaScript 中的内存主要分为两类：

- **栈内存（Stack）**：存储基本类型（Number, String, Boolean, null, undefined, Symbol, BigInt）和对象引用
- **堆内存（Heap）**：存储对象、数组、函数等复杂数据结构

```javascript
// 栈内存：基本类型
let num = 42;
let str = "hello";

// 堆内存：对象
let obj = { name: "test", data: [1, 2, 3] };
```

---

## 垃圾回收机制

JavaScript 使用**自动垃圾回收（Garbage Collection, GC）**机制，开发者不需要手动管理内存。

### 主要算法

#### 1. 标记清除（Mark and Sweep）- 主流算法

**工作原理：**

1. **标记阶段**：从根对象（全局对象、当前执行上下文）开始，标记所有可达对象
2. **清除阶段**：遍历堆内存，清除所有未被标记的对象

```
根对象 → 对象A → 对象B
       ↘ 对象C（不可达）→ 清除
```

**优点：**
- 可以处理循环引用
- 算法成熟稳定

**缺点：**
- 需要暂停程序执行（Stop-the-World）
- 可能造成页面卡顿

#### 2. 引用计数（Reference Counting）- 已淘汰

**工作原理：**
- 每个对象维护一个引用计数器
- 当引用计数为 0 时，对象被回收

**缺点：**
- 无法处理循环引用
- 性能开销大

```javascript
// 循环引用示例（引用计数无法处理）
let obj1 = {};
let obj2 = {};
obj1.ref = obj2;
obj2.ref = obj1;
// 引用计数无法回收，但标记清除可以
```

### 现代 GC 优化策略

#### 1. 分代回收（Generational Collection）

将堆内存分为：
- **新生代（Young Generation）**：新创建的对象，回收频繁
- **老生代（Old Generation）**：存活时间长的对象，回收较少

#### 2. 增量标记（Incremental Marking）

将标记过程分成多个小步骤，避免长时间阻塞

#### 3. 并发标记（Concurrent Marking）

在后台线程进行标记，减少主线程阻塞

---

## 内存泄露

### 什么是内存泄露？

内存泄露是指**已分配的内存无法被垃圾回收器回收**，导致内存持续增长，最终可能导致程序崩溃。

### 常见的内存泄露场景

#### 1. 全局变量

```javascript
// ❌ 错误：全局变量不会被 GC
window.data = new Array(1000000).fill(0);

// ✅ 正确：使用局部变量
function processData() {
  const data = new Array(1000000).fill(0);
  // 函数执行完后，data 可以被 GC
}
```

#### 2. 闭包引用

```javascript
// ❌ 错误：闭包持有大对象的引用
function createHandler() {
  const bigData = new Array(1000000).fill(0);
  return function() {
    console.log(bigData.length); // 闭包持有 bigData 引用
  };
}

// ✅ 正确：只引用需要的数据
function createHandler() {
  const bigData = new Array(1000000).fill(0);
  const length = bigData.length; // 只保存需要的数据
  return function() {
    console.log(length);
  };
}
```

#### 3. 事件监听器未清理

```javascript
// ❌ 错误：事件监听器未移除
window.addEventListener('scroll', () => {
  // 处理逻辑
});

// ✅ 正确：保存引用并在适当时机移除
const handleScroll = () => {
  // 处理逻辑
};
window.addEventListener('scroll', handleScroll);
// 组件卸载时
window.removeEventListener('scroll', handleScroll);
```

#### 4. 定时器未清理

**setInterval（重复执行）**：

```javascript
// ❌ 错误：定时器未清理
setInterval(() => {
  // 处理逻辑
}, 1000);

// ✅ 正确：保存 ID 并清理
const timerId = setInterval(() => {
  // 处理逻辑
}, 1000);
clearInterval(timerId);
```

**setTimeout（延迟执行）**：

```javascript
// ⚠️ 在 React 组件中，setTimeout 也应该清理
// 如果组件在 setTimeout 执行前卸载，回调仍会执行，可能导致：
// 1. 访问已卸载组件的状态
// 2. 尝试更新已卸载组件的状态（React 会警告）
// 3. 内存泄露（如果回调中持有组件引用）

// ❌ 错误：setTimeout 未清理
useEffect(() => {
  setTimeout(() => {
    setState(newValue); // 如果组件已卸载，会警告
  }, 1000);
}, []);

// ✅ 正确：保存 ID 并在组件卸载时清理
useEffect(() => {
  const timerId = setTimeout(() => {
    setState(newValue);
  }, 1000);
  
  return () => {
    clearTimeout(timerId); // 组件卸载时清理
  };
}, []);

// ✅ 在普通函数中，如果不需要清理，可以不清理
// setTimeout 执行完就结束了，但如果回调中访问外部变量，需要注意
function someFunction() {
  setTimeout(() => {
    console.log('执行一次');
  }, 1000);
  // 函数执行完，如果没有其他引用，setTimeout 的回调仍会执行
  // 但回调执行完后，如果没有引用，会被 GC
}
```

#### 5. DOM 引用未清理

```javascript
// ❌ 错误：DOM 引用未清理
const elements = [];
for (let i = 0; i < 1000; i++) {
  const el = document.createElement('div');
  elements.push(el); // 保存 DOM 引用
}

// ✅ 正确：清理 DOM 引用
elements.length = 0;
```

#### 6. 函数引用保存导致的内存泄露

**注意**：这是函数引用保存的通用问题，不是 `useMemoizedFn` 特有的。任何函数（包括普通函数、箭头函数、`useMemoizedFn` 返回的函数）如果被保存到外部引用，都会导致内存泄露。

```javascript
// ❌ 错误：将普通函数保存到外部引用
const globalFunctions = []; // 全局数组保存函数引用

function Component() {
  const handleClick = () => {
    console.log('clicked');
  };
  
  // 错误：将函数保存到外部引用，导致无法被 GC
  globalFunctions.push(handleClick);
  
  return <button onClick={handleClick}>Click</button>;
}

// ❌ 错误：将 useMemoizedFn 返回的函数保存到外部引用（同样的问题）
const globalFunctions2 = [];
function Component() {
  const handleClick = useMemoizedFn(() => {
    console.log('clicked');
  });
  
  // 错误：同样会导致内存泄露
  globalFunctions2.push(handleClick);
  
  return <button onClick={handleClick}>Click</button>;
}

// ❌ 错误：将函数保存到 ref 中，且不清理
const functionsRef = useRef([]);
function Component() {
  const handleClick = () => {
    console.log('clicked');
  };
  
  // 错误：不断累积函数引用，导致内存泄露
  functionsRef.current.push(handleClick);
  
  return <button onClick={handleClick}>Click</button>;
}

// ✅ 正确：正常使用函数，函数会在组件卸载时自动清理
function Component() {
  const handleClick = () => {
    console.log('clicked');
  };
  
  // 函数只在组件内部使用，组件卸载时会被清理
  return <button onClick={handleClick}>Click</button>;
}

// ✅ 正确：正常使用 useMemoizedFn，同样会在组件卸载时自动清理
function Component() {
  const handleClick = useMemoizedFn(() => {
    console.log('clicked');
  });
  
  return <button onClick={handleClick}>Click</button>;
}
```

**总结**：无论是普通函数还是 `useMemoizedFn` 返回的函数，只要被保存到外部引用（全局变量、模块级变量、ref 等），都会导致内存泄露。问题的根源是函数引用被外部持有，而不是函数本身。

#### 7. 订阅/观察者模式未取消

```javascript
// ❌ 错误：订阅未取消
class EventEmitter {
  constructor() {
    this.listeners = [];
  }
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      // 应该返回取消订阅的函数
    };
  }
}

const emitter = new EventEmitter();
emitter.subscribe(() => {
  console.log('event');
}); // 订阅未取消，导致内存泄露

// ✅ 正确：保存取消订阅函数并清理
useEffect(() => {
  const unsubscribe = emitter.subscribe(() => {
    console.log('event');
  });
  
  return () => {
    unsubscribe(); // 组件卸载时取消订阅
  };
}, []);
```

#### 8. WebSocket/EventSource 连接未关闭

```javascript
// ❌ 错误：WebSocket 连接未关闭
useEffect(() => {
  const ws = new WebSocket('ws://example.com');
  ws.onmessage = (event) => {
    console.log(event.data);
  };
  // 连接未关闭，导致内存泄露
}, []);

// ✅ 正确：关闭连接
useEffect(() => {
  const ws = new WebSocket('ws://example.com');
  ws.onmessage = (event) => {
    console.log(event.data);
  };
  
  return () => {
    ws.close(); // 组件卸载时关闭连接
  };
}, []);

// EventSource 同样需要关闭
useEffect(() => {
  const eventSource = new EventSource('/events');
  eventSource.onmessage = (event) => {
    console.log(event.data);
  };
  
  return () => {
    eventSource.close(); // 关闭 EventSource
  };
}, []);
```

#### 9. IntersectionObserver/ResizeObserver 等观察器未断开

```javascript
// ❌ 错误：观察器未断开
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      console.log(entry.isIntersecting);
    });
  });
  
  observer.observe(elementRef.current);
  // 观察器未断开，导致内存泄露
}, []);

// ✅ 正确：断开观察器
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      console.log(entry.isIntersecting);
    });
  });
  
  if (elementRef.current) {
    observer.observe(elementRef.current);
  }
  
  return () => {
    observer.disconnect(); // 断开观察器
  };
}, []);
```

#### 10. 缓存未清理（Map/Set 无限增长）

```javascript
// ❌ 错误：缓存无限增长
const cache = new Map();

function getData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = fetchData(key);
  cache.set(key, data); // 缓存不断增长，从不清理
  return data;
}

// ✅ 正确：限制缓存大小或定期清理
const cache = new Map();
const MAX_CACHE_SIZE = 100;

function getData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  // 限制缓存大小
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  
  const data = fetchData(key);
  cache.set(key, data);
  return data;
}

// 或者使用 LRU 缓存
import { LRUCache } from 'lru-cache';
const cache = new LRUCache({ max: 100 });
```

#### 11. Promise 链未清理

```javascript
// ❌ 错误：Promise 链持有组件引用
useEffect(() => {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      setState(data); // 如果组件已卸载，会警告
    });
}, []);

// ✅ 正确：使用标志位或 AbortController
useEffect(() => {
  let mounted = true;
  
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      if (mounted) {
        setState(data);
      }
    });
  
  return () => {
    mounted = false; // 标记组件已卸载
  };
}, []);

// 或者使用 AbortController
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(response => response.json())
    .then(data => {
      setState(data);
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    });
  
  return () => {
    controller.abort(); // 取消请求
  };
}, []);
```

#### 12. requestAnimationFrame 未取消

```javascript
// ❌ 错误：requestAnimationFrame 未取消
useEffect(() => {
  const animate = () => {
    // 动画逻辑
    requestAnimationFrame(animate); // 无限循环，未取消
  };
  requestAnimationFrame(animate);
}, []);

// ✅ 正确：保存 ID 并取消
useEffect(() => {
  let animationId;
  const animate = () => {
    // 动画逻辑
    animationId = requestAnimationFrame(animate);
  };
  animationId = requestAnimationFrame(animate);
  
  return () => {
    cancelAnimationFrame(animationId); // 取消动画帧
  };
}, []);
```

#### 13. Worker 未终止

```javascript
// ❌ 错误：Worker 未终止
useEffect(() => {
  const worker = new Worker('worker.js');
  worker.postMessage({ type: 'start' });
  worker.onmessage = (event) => {
    console.log(event.data);
  };
  // Worker 未终止，导致内存泄露
}, []);

// ✅ 正确：终止 Worker
useEffect(() => {
  const worker = new Worker('worker.js');
  worker.postMessage({ type: 'start' });
  worker.onmessage = (event) => {
    console.log(event.data);
  };
  
  return () => {
    worker.terminate(); // 终止 Worker
  };
}, []);
```

#### 14. 图片/媒体资源未释放

```javascript
// ❌ 错误：图片资源未释放
useEffect(() => {
  const img = new Image();
  img.src = 'large-image.jpg';
  img.onload = () => {
    // 使用图片
  };
  // 图片对象未释放
}, []);

// ✅ 正确：清理图片引用
useEffect(() => {
  const img = new Image();
  img.src = 'large-image.jpg';
  img.onload = () => {
    // 使用图片
  };
  
  return () => {
    img.src = ''; // 清空 src，释放资源
    img.onload = null;
    img.onerror = null;
  };
}, []);

// 视频元素同样需要清理
useEffect(() => {
  const video = document.createElement('video');
  video.src = 'video.mp4';
  
  return () => {
    video.pause();
    video.src = '';
    video.load(); // 释放资源
  };
}, []);
```

#### 15. 第三方库的订阅未取消

```javascript
// ❌ 错误：第三方库订阅未取消
useEffect(() => {
  // 某些第三方库可能提供订阅功能
  const subscription = thirdPartyLib.subscribe((data) => {
    console.log(data);
  });
  // 未取消订阅
}, []);

// ✅ 正确：查看文档，使用正确的取消方法
useEffect(() => {
  const subscription = thirdPartyLib.subscribe((data) => {
    console.log(data);
  });
  
  return () => {
    // 根据库的文档使用正确的取消方法
    subscription.unsubscribe();
    // 或 subscription.cancel();
    // 或 subscription.destroy();
  };
}, []);
```

#### 16. 循环引用（在某些特殊情况下）

虽然现代垃圾回收器（标记清除）可以处理循环引用，但在某些特殊情况下仍可能有问题：

```javascript
// ⚠️ 注意：虽然标记清除可以处理，但最好避免
function createCircularReference() {
  const obj1 = {};
  const obj2 = {};
  
  obj1.ref = obj2;
  obj2.ref = obj1; // 循环引用
  
  // 如果这些对象被保存到全局变量，会导致内存泄露
  window.circularRefs = { obj1, obj2 };
  
  return obj1;
}

// ✅ 正确：避免循环引用，或及时清理
function createCircularReference() {
  const obj1 = {};
  const obj2 = {};
  
  obj1.ref = obj2;
  obj2.ref = obj1;
  
  // 使用完后清理
  return {
    obj1,
    cleanup: () => {
      obj1.ref = null;
      obj2.ref = null;
    }
  };
}
```

---

## React 中的内存管理

### React 组件的内存管理

React 组件在卸载时会自动清理，但需要注意：

#### 1. useEffect 清理函数

```javascript
// setInterval 示例
useEffect(() => {
  const timer = setInterval(() => {
    // 处理逻辑
  }, 1000);
  
  // ✅ 必须返回清理函数
  return () => {
    clearInterval(timer);
  };
}, []);

// setTimeout 示例
useEffect(() => {
  const timer = setTimeout(() => {
    // 处理逻辑
    setState(newValue);
  }, 1000);
  
  // ✅ 也应该返回清理函数，避免组件卸载后回调执行
  return () => {
    clearTimeout(timer);
  };
}, []);
```

#### 2. 事件监听器清理

```javascript
useEffect(() => {
  const handleResize = () => {
    // 处理逻辑
  };
  
  window.addEventListener('resize', handleResize);
  
  // ✅ 清理事件监听器
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

#### 3. 订阅清理

```javascript
useEffect(() => {
  const subscription = someService.subscribe((data) => {
    // 处理数据
  });
  
  // ✅ 取消订阅
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### React Hooks 内存管理

#### useState

```javascript
// ✅ 正确：状态会在组件卸载时自动清理
const [data, setData] = useState([]);
```

#### useRef

```javascript
// ⚠️ 注意：ref.current 指向的值不会自动被设置为 null
// 但组件卸载时，ref 对象本身会被清理，如果没有其他引用，ref.current 指向的对象也会被 GC
const dataRef = useRef(null);
dataRef.current = new Array(1000000).fill(0);

// ✅ 通常不需要手动清理：组件卸载时，ref 对象被清理，如果没有其他引用，对象会被 GC
// 手动设置为 null 通常不是必须的

// ⚠️ 但在以下情况下，手动清理可能有用：
// 1. 对象很大，想更快触发 GC（虽然通常不是必须的）
// 2. 代码可读性：明确表示释放引用
// 3. 对象可能被其他引用持有（这种情况下必须清理）
useEffect(() => {
  return () => {
    dataRef.current = null; // 可选：明确释放引用
  };
}, []);

// ✅ 如果 ref.current 指向的对象没有其他引用，可以不手动清理
// 组件卸载时，ref 对象被清理，如果没有其他引用，对象会被 GC
const smallDataRef = useRef(null);
smallDataRef.current = { count: 0 };
```

**说明**：
- `useRef` 返回的对象在组件卸载时会被清理
- 如果 `ref.current` 指向的对象没有其他引用，会被 GC，**通常不需要手动设置为 null**
- 手动设置为 `null` 主要是为了：
  - 代码可读性（明确表示释放）
  - 对于非常大的对象，可能有助于更快触发 GC（但通常不是必须的）
- **必须手动清理的情况**：如果 `ref.current` 被其他引用持有（如保存在全局变量、模块级变量中），则需要手动清理

#### useMemo / useCallback

```javascript
// ✅ 正确：依赖变化时会重新计算
// 旧值是否会被 GC 取决于是否有其他引用
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
// 如果 memoizedValue 的旧值没有被其他引用，会被 GC

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
// 如果 memoizedCallback 的旧值没有被其他引用，会被 GC

// ⚠️ 注意：如果旧值被其他引用保存，不会被 GC
const savedValues = [];
const memoizedValue2 = useMemo(() => {
  const value = expensiveCalculation(data);
  savedValues.push(value); // ❌ 错误：保存引用，导致无法被 GC
  return value;
}, [data]);
```

**说明**：
- `useMemo` 和 `useCallback` 在依赖变化时会重新计算
- 旧值是否会被 GC 取决于是否有其他引用
- 如果旧值没有被其他引用，会被 GC
- 如果旧值被保存到外部引用（全局变量、ref 等），不会被 GC

---

## ahooks 与内存管理

### ahooks 自动清理的 Hooks

ahooks 提供了许多自动清理的 Hooks，大大简化了内存管理：

#### 1. useRequest

```javascript
// ✅ 自动处理请求的取消和清理
const { data, loading, run } = useRequest(
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
  {
    manual: true,
    onSuccess: (result) => {
      // 处理成功
    },
  }
);
```

#### 2. useInterval

```javascript
// ✅ 自动清理定时器
const [count, setCount] = useState(0);
useInterval(
  () => {
    setCount(c => c + 1);
  },
  isActive ? 1000 : null // null 时自动停止
);
```

#### 3. useEventListener

```javascript
// ✅ 自动清理事件监听器
useEventListener('click', (event) => {
  console.log('clicked', event);
});
```

#### 4. useUnmount

```javascript
// ✅ 组件卸载时执行清理
useUnmount(() => {
  console.log('组件卸载，清理资源');
  // 清理逻辑
});
```

### useMemoizedFn 的内存管理

#### 正确用法

```javascript
// ✅ 在组件顶层使用
function MyComponent() {
  const handleClick = useMemoizedFn((id) => {
    console.log('clicked', id);
  });
  
  return <button onClick={handleClick}>Click</button>;
}
```

#### 注意事项

**重要**：`useMemoizedFn` 本身不会导致内存泄露。它只是缓存函数引用，避免每次渲染都创建新函数。组件卸载时，`useMemoizedFn` 创建的函数会被正常清理。

真正可能导致内存泄露的场景是：

```javascript
// ❌ 错误：将 useMemoizedFn 返回的函数保存到外部引用
const globalFunctions = []; // 全局变量

function Component() {
  const handleClick = useMemoizedFn(() => {
    console.log('clicked');
  });
  
  // 错误：保存到全局变量，导致无法被 GC
  globalFunctions.push(handleClick);
  
  return <button onClick={handleClick}>Click</button>;
}

// ❌ 错误：将函数保存到 ref 中，且不断累积
const functionsRef = useRef([]);
function Component() {
  const handleClick = useMemoizedFn(() => {
    console.log('clicked');
  });
  
  // 错误：每次渲染都保存，导致不断累积
  functionsRef.current.push(handleClick);
  
  return <button onClick={handleClick}>Click</button>;
}

// ✅ 正确：正常使用，组件卸载时自动清理
function Component() {
  const handleClick = useMemoizedFn(() => {
    console.log('clicked');
  });
  
  return <button onClick={handleClick}>Click</button>;
}
```

**总结**：`useMemoizedFn` 是安全的，只要不将返回的函数保存到外部引用中，就不会导致内存泄露。

#### 关于闭包持有大对象引用

**注意**：这不是 `useMemoizedFn` 特有的问题，而是所有闭包函数都会有的行为。

```javascript
// ⚠️ 闭包会持有外部变量的引用
const bigData = useRef(new Array(1000000).fill(0));

const handleAction = useMemoizedFn((id) => {
  // 闭包持有 bigData.current 的引用
  console.log(bigData.current.length);
});

// 只要组件正常卸载，useMemoizedFn 创建的函数会被清理，
// 闭包也会被清理，大对象可以被 GC
```

**只有在以下情况下才会导致内存泄露：**

```javascript
// ❌ 错误：将函数保存到外部引用
const savedFunctions = [];

function Component() {
  const bigData = useRef(new Array(1000000).fill(0));
  const handleAction = useMemoizedFn((id) => {
    console.log(bigData.current.length);
  });
  
  // 错误：保存函数引用，导致闭包无法被清理
  savedFunctions.push(handleAction);
  
  return <button onClick={handleAction}>Click</button>;
}

// ✅ 正确：正常使用，组件卸载时闭包会被清理
function Component() {
  const bigData = useRef(new Array(1000000).fill(0));
  const handleAction = useMemoizedFn((id) => {
    console.log(bigData.current.length);
  });
  
  return <button onClick={handleAction}>Click</button>;
}
```

**如果担心闭包持有大对象，可以只引用需要的数据：**

```javascript
// ✅ 只引用需要的数据，避免闭包持有大对象
const bigData = useRef(new Array(1000000).fill(0));
const dataLength = useRef(bigData.current.length);

const handleAction = useMemoizedFn((id) => {
  // 只引用基本类型，不引用大对象
  console.log(dataLength.current);
});
```

---

## 内存调试与监控

### 1. Chrome DevTools Memory 面板

#### 堆快照（Heap Snapshot）

1. 打开 Chrome DevTools → Memory 标签
2. 选择 "Heap Snapshot"
3. 点击 "Take snapshot" 拍摄快照
4. 执行操作后再次拍摄快照
5. 对比两次快照，查看内存变化

#### 内存时间线（Allocation Timeline）

1. 选择 "Allocation Timeline"
2. 点击录制按钮
3. 执行操作
4. 停止录制，查看内存分配情况

### 2. Performance 面板

1. 打开 Chrome DevTools → Performance 标签
2. 勾选 "Memory"
3. 点击录制
4. 执行操作
5. 停止录制，查看内存趋势图

### 3. performance.memory API

```javascript
// 获取内存信息（仅 Chrome）
if (performance.memory) {
  const memory = {
    used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
    total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
    limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
  };
  console.log(memory);
}
```

### 4. 手动触发垃圾回收

```javascript
// 仅在 Chrome 中可用，需要启动时添加 --js-flags="--expose-gc"
if (window.gc) {
  window.gc();
}
```

### 5. 内存泄露检测清单

- [ ] 检查全局变量
- [ ] 检查未清理的事件监听器
- [ ] 检查未清理的定时器
- [ ] 检查未清理的订阅
- [ ] 检查闭包引用
- [ ] 检查 DOM 引用
- [ ] 检查 useMemoizedFn 的使用
- [ ] 使用 DevTools 对比内存快照

---

## 最佳实践

### 1. 及时清理资源

```javascript
useEffect(() => {
  // 创建资源
  const timer = setInterval(() => {}, 1000);
  const listener = () => {};
  window.addEventListener('event', listener);
  
  // ✅ 清理资源
  return () => {
    clearInterval(timer);
    window.removeEventListener('event', listener);
  };
}, []);
```

### 2. 使用 ahooks 自动清理的 Hooks

```javascript
// ✅ 优先使用 ahooks 的自动清理 Hooks
useInterval(() => {}, 1000);
useEventListener('click', handler);
useRequest(api);
```

### 3. 避免在闭包中持有大对象

**重要**：闭包持有大对象本身不会导致内存泄露，只有在函数被外部引用保存时才会导致问题。

```javascript
// ⚠️ 问题场景：函数被外部引用保存，且闭包持有大对象
const savedHandlers = []; // 外部引用

function Component() {
  const bigData = new Array(1000000).fill(0); // 函数内的局部变量
  
  const handler = () => {
    console.log(bigData.length); // 闭包持有大对象
  };
  
  // ❌ 错误：将函数保存到外部引用
  // 这会导致闭包无法被清理，bigData 也无法被 GC
  savedHandlers.push(handler);
  
  return <button onClick={handler}>Click</button>;
}

// ✅ 正确：函数没有被外部引用，组件卸载时闭包会被清理
function Component() {
  const bigData = new Array(1000000).fill(0);
  
  const handler = () => {
    console.log(bigData.length); // 闭包持有大对象
  };
  
  // 函数只在组件内部使用，组件卸载时会被清理
  return <button onClick={handler}>Click</button>;
}

// ✅ 更好的做法：如果必须保存函数引用，只引用需要的数据
const savedHandlers2 = [];

function Component() {
  const bigData = new Array(1000000).fill(0);
  const length = bigData.length; // 只保存需要的数据
  
  const handler = () => {
    console.log(length); // 闭包只持有基本类型
  };
  
  // 即使保存函数引用，闭包也只持有基本类型，不会持有大对象
  savedHandlers2.push(handler);
  
  return <button onClick={handler}>Click</button>;
}
```

**总结**：
- 闭包持有大对象本身不是问题，只要函数没有被外部引用保存
- 如果函数必须被外部引用保存，应该只让闭包引用需要的数据（基本类型），而不是整个大对象

### 4. 使用 WeakMap / WeakSet

```javascript
// ✅ WeakMap 的键是弱引用，不会阻止 GC
const weakMap = new WeakMap();
const obj = {};
weakMap.set(obj, 'value');
// obj 被 GC 后，weakMap 中的条目也会被自动清理
```




---

## 总结

### 关键要点

1. **JavaScript 使用自动垃圾回收**，但开发者仍需注意内存管理
2. **标记清除是主流算法**，可以处理循环引用
3. **内存泄露的主要原因是未清理的资源**（事件、定时器、订阅等）
4. **React 和 ahooks 提供了自动清理机制**，但需要正确使用
5. **useMemoizedFn 要注意闭包引用**，避免持有大对象
6. **使用 DevTools 定期检查内存**，及早发现问题

### 检查清单

- ✅ 所有 useEffect 都有清理函数
- ✅ 所有事件监听器都被移除
- ✅ 所有定时器都被清理
- ✅ 所有订阅都被取消
- ✅ 避免在闭包中持有大对象
- ✅ 使用 ahooks 的自动清理 Hooks
- ✅ 定期使用 DevTools 检查内存

---

## 参考资料

- [MDN: Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [V8 垃圾回收机制](https://v8.dev/blog/trash-talk)
- [React 官方文档：Effect 清理](https://react.dev/reference/react/useEffect#cleanup)
- [ahooks 官方文档](https://ahooks.js.org/)

---

## 附录：React 内存自动释放源码机制

### React 组件卸载时的内存清理机制

React 并不直接"释放内存"，而是通过清理引用，让 JavaScript 的垃圾回收器来回收内存。以下是 React 源码中相关的关键机制：

#### 1. useEffect 清理函数的执行

React 在组件卸载前会自动调用 `useEffect` 中返回的清理函数。相关源码位于 `packages/react-reconciler/src/ReactFiberCommitWork.js`：

```javascript
// React 源码简化版本（基于 React 18）
function commitPassiveEffectCleanups(finishedWork) {
  const {
    updateQueue,
    tag,
  } = finishedWork;

  if (
    (tag === FunctionComponent ||
      tag === ForwardRef ||
      tag === SimpleMemoComponent) &&
    updateQueue !== null &&
    updateQueue.lastEffect !== null
  ) {
    const lastEffect = updateQueue.lastEffect;
    let firstEffect = lastEffect.next;

    let effect = firstEffect;
    do {
      const {destroy, tag} = effect;
      
      // 如果 effect 有清理函数，执行清理
      if (
        (tag & HookPassive) !== NoFlags &&
        destroy !== undefined
      ) {
        try {
          destroy(); // 执行清理函数
        } catch (error) {
          // 错误处理
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

这确保了以下代码在组件卸载时自动执行：

```javascript
useEffect(() => {
  const timer = setInterval(() => {
    console.log('running');
  }, 1000);

  // 这个清理函数会在组件卸载时自动执行
  return () => {
    clearInterval(timer); // React 自动调用
  };
}, []);
```

#### 2. Fiber 节点的释放

React 使用 Fiber 架构管理组件树。当组件卸载时，对应的 Fiber 节点会被从树中移除。相关源码位于 `packages/react-reconciler/src/ReactFiberCommitWork.js`：

```javascript
// React 源码简化版本
function commitDeletion(
  finishedRoot,
  current,
  returnFiber
) {
  // 遍历要删除的 Fiber 子树
  let nodeToDispose = current;
  
  while (nodeToDispose) {
    // 1. 执行组件的卸载逻辑
    commitNestedUnmounts(finishedRoot, nodeToDispose);
    
    // 2. 卸载 Ref
    commitUnmountRef(nodeToDispose);
    
    // 3. 触发组件的 componentWillUnmount 生命周期（Class 组件）
    if (nodeToDispose.tag === ClassComponent) {
      const instance = nodeToDispose.stateNode;
      if (typeof instance.componentWillUnmount === 'function') {
        try {
          instance.componentWillUnmount();
        } catch (error) {
          // 错误处理
        }
      }
    }
    
    // 4. 递归处理子节点
    const child = nodeToDispose.child;
    if (child !== null) {
      child.return = null;
      nodeToDispose = child;
    } else {
      // 没有子节点，处理兄弟节点
      while (nodeToDispose.sibling === null) {
        if (nodeToDispose.return === null || nodeToDispose.return === returnFiber) {
          return;
        }
        nodeToDispose = nodeToDispose.return;
      }
      nodeToDispose.sibling.return = nodeToDispose.return;
      nodeToDispose = nodeToDispose.sibling;
    }
  }
}
```

#### 3. Hooks 状态的内存回收

React 的 Hooks 状态存储在链表结构中，当组件卸载时，整个链表会被释放。相关源码位于 `packages/react-reconciler/src/ReactFiberHooks.js`：

```javascript
// React 源码简化版本
type Hook = {
  memoizedState: any;      // 存储的状态值
  baseState: any;          // 基础状态
  baseUpdate: Update | null;
  queue: UpdateQueue | null;
  next: Hook | null;       // 指向下一个 Hook
};

// 组件卸载时，所有 Hook 链表的引用被清除
function unmountHooks(fiber) {
  let hook = fiber.memoizedState;
  while (hook) {
    const next = hook.next;
    
    // 清除状态引用
    hook.memoizedState = null;
    hook.baseState = null;
    hook.baseUpdate = null;
    hook.queue = null;
    
    hook = next;
  }
  
  // 清除整个 Hook 链表
  fiber.memoizedState = null;
}
```

#### 4. Ref 的自动清理

`useRef` 返回的对象会在组件卸载时被释放。相关源码位于 `packages/react-reconciler/src/ReactFiberCommitWork.js`：

```javascript
// React 源码简化版本
function commitUnmountRef(finishedWork) {
  const ref = finishedWork.ref;
  
  if (ref !== null) {
    if (typeof ref === 'function') {
      // 函数式 ref
      try {
        ref(null); // 自动清理
      } catch (error) {
        // 错误处理
      }
    } else if (typeof ref === 'object' && 'current' in ref) {
      // React.createRef() 创建的 ref
      ref.current = null; // 自动清理
    }
  }
}
```

#### 5. DOM 节点的移除

当组件对应的 DOM 节点从文档中移除时，浏览器会释放相关内存。相关源码位于 `packages/react-dom/src/client/ReactDOMComponent.js`：

```javascript
// React 源码简化版本
function commitDeletion(finishedRoot, node) {
  // 移除 DOM 节点
  const parent = node.return;
  let parentFiber = parent;
  
  while (parentFiber) {
    switch (parentFiber.tag) {
      case HostComponent:
      case HostText:
      case HostRoot:
        const parentInstance = parentFiber.stateNode;
        
        // 从 DOM 树中移除
        if (node.stateNode) {
          try {
            parentInstance.removeChild(node.stateNode);
          } catch (error) {
            // 错误处理
          }
        }
        
        break;
    }
    parentFiber = parentFiber.return;
  }
}
```

### 源码位置参考

React 源码中与内存管理相关的主要文件：

1. **`packages/react-reconciler/src/ReactFiberCommitWork.js`**
   - `commitPassiveEffectCleanups` - 执行 useEffect 清理函数
   - `commitDeletion` - 删除 Fiber 节点
   - `commitUnmountRef` - 清理 Ref

2. **`packages/react-reconciler/src/ReactFiberHooks.js`**
   - Hook 链表的管理
   - `unmountHooks` - 卸载 Hooks

3. **`packages/react-dom/src/client/ReactDOMComponent.js`**
   - DOM 节点的创建和删除

### 垃圾回收的触发条件

当以下条件满足时，JavaScript 引擎会进行垃圾回收：

```javascript
// 1. 对象无任何引用时
let obj = { data: 'large' };
obj = null; // 可被 GC

// 2. 函数作用域退出时
function example() {
  const largeArray = new Array(1000000);
  return; // largeArray 被自动释放
}

// 3. 事件监听器被移除时
element.removeEventListener('click', handler);

// 4. 定时器被清除时
clearTimeout(timerId);
clearInterval(intervalId);

// 5. Promise 链完成或被拒绝时
Promise.resolve()
  .then(() => { /* cleanup */ });
```

### 总结

React 的内存自动释放依赖于：

1. **主动清理机制**：useEffect 的清理函数在组件卸载时自动执行
2. **自动引用释放**：组件卸载时清除所有引用（Fiber、Hooks、Refs）
3. **Fiber 树重建**：旧 Fiber 节点被丢弃，失去引用
4. **JavaScript GC**：当对象无引用时由引擎自动回收

只要遵循 React 的最佳实践（正确使用 useEffect、清理副作用、避免外部引用保存回调函数），React 会自动管理大部分内存问题，开发者无需手动干预。

**源码仓库**：[React GitHub](https://github.com/facebook/react)
https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitEffects.js#L248

