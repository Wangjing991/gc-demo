import { useRef, useState } from 'react';

// 闭包引用大对象导致的内存泄露示例
function ClosureLeakDemo() {
  const leakyHandlersRef = useRef([]);
  const [leakCount, setLeakCount] = useState(0);

  const createClosureLeak = (count = 50) => {
    const handlers = [];
    for (let i = 0; i < count; i += 1) {
      // ❌ 错误示例：在工厂函数中创建大数组，并被返回的函数闭包捕获
      const handler = (() => {
        const bigData = Array.from({ length: 50000 }, (_, idx) => ({
          id: idx,
          value: Math.random(),
        }));
        return () => {
          // eslint-disable-next-line no-console
          console.log('闭包中大数组长度：', bigData.length);
        };
      })();
      handlers.push(handler);
    }
    leakyHandlersRef.current.push(...handlers);
    setLeakCount(leakyHandlersRef.current.length);
    // eslint-disable-next-line no-console
    console.log(`创建了 ${handlers.length} 个闭包处理函数，它们都持有各自的大数组引用`);
  };

  const clearClosures = () => {
    // ✅ 正确示例：清空对闭包函数的引用，让 GC 可以回收它们以及闭包中的大数组
    leakyHandlersRef.current = [];
    setLeakCount(0);
    // eslint-disable-next-line no-console
    console.log('已清理所有闭包处理函数引用');
  };

  const triggerSomeHandlers = () => {
    // 触发前几个闭包，模拟使用
    leakyHandlersRef.current.slice(0, 3).forEach((fn) => fn && fn());
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>2. 闭包引用大对象导致的内存泄露</h3>
      <p style={{ fontSize: 12, color: '#666' }}>
        闭包会捕获外部变量，如果这些变量是大对象且长期保留引用，就会导致内存无法释放。
      </p>
      <p style={{ fontSize: 14, fontWeight: 'bold', color: '#d32f2f' }}>
        当前闭包处理函数数量：{leakCount}
      </p>
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => createClosureLeak(20)}
          style={{ marginRight: 8 }}
        >
          创建 20 个闭包（每个持有一个大数组）
        </button>
        <button
          onClick={() => createClosureLeak(100)}
          style={{ marginRight: 8 }}
        >
          创建 100 个闭包
        </button>
        <button
          onClick={triggerSomeHandlers}
          disabled={leakCount === 0}
          style={{ marginRight: 8 }}
        >
          触发部分闭包
        </button>
        <button
          onClick={clearClosures}
          disabled={leakCount === 0}
          style={{ background: '#f44336', color: '#fff' }}
        >
          清理所有闭包引用
        </button>
      </div>
    </div>
  );
}

export default ClosureLeakDemo;

