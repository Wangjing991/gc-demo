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

---

## React 中的内存管理

### React 组件的内存管理

React 组件在卸载时会自动清理，但需要注意：

#### 1. useEffect 清理函数

```javascript
useEffect(() => {
  const timer = setInterval(() => {
    // 处理逻辑
  }, 1000);
  
  // ✅ 必须返回清理函数
  return () => {
    clearInterval(timer);
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
// ⚠️ 注意：ref.current 不会自动清理
const dataRef = useRef(null);
dataRef.current = new Array(1000000).fill(0);

// ✅ 在组件卸载时手动清理
useEffect(() => {
  return () => {
    dataRef.current = null;
  };
}, []);
```

#### useMemo / useCallback

```javascript
// ✅ 正确：依赖变化时会重新计算，旧值会被 GC
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

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


