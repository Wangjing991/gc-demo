import { useEffect, useRef, useState } from 'react';

// 定时器未清理导致的内存泄露示例
function TimerLeakDemo() {
  const leakyTimersRef = useRef([]);
  const safeTimerRef = useRef(null);
  const [leakTimerCount, setLeakTimerCount] = useState(0);
  const [safeTick, setSafeTick] = useState(0);

  const startLeakyInterval = () => {
    // ❌ 错误示例：启动 interval，但不保存 ID，也不清理
    const id = setInterval(() => {
      // eslint-disable-next-line no-console
      console.log('泄露 interval 触发');
    }, 1000);
    leakyTimersRef.current.push(id);
    setLeakTimerCount(leakyTimersRef.current.length);
  };

  const startSafeInterval = () => {
    if (safeTimerRef.current) return;
    // ✅ 正确示例：保存 ID，并在卸载 / 停止时清理
    const id = setInterval(() => {
      setSafeTick((t) => t + 1);
    }, 1000);
    safeTimerRef.current = id;
  };

  const stopSafeInterval = () => {
    if (!safeTimerRef.current) return;
    clearInterval(safeTimerRef.current);
    safeTimerRef.current = null;
  };

  const clearAllLeakyIntervals = () => {
    leakyTimersRef.current.forEach((id) => clearInterval(id));
    leakyTimersRef.current = [];
    setLeakTimerCount(0);
  };

  useEffect(
    () => () => {
      // 组件卸载时清理安全 interval
      if (safeTimerRef.current) {
        clearInterval(safeTimerRef.current);
      }
    },
    [],
  );

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>4. 定时器未清理导致的内存泄露</h3>
      <p style={{ fontSize: 12, color: '#666' }}>
        setInterval / setTimeout 如果不清理，会让回调和闭包中的数据一直常驻内存。
      </p>
      <p style={{ fontSize: 14, fontWeight: 'bold', color: '#d32f2f' }}>
        泄露中的 interval 数量：{leakTimerCount}
      </p>
      <p style={{ fontSize: 12, color: '#2e7d32' }}>
        安全 interval 计数：{safeTick}
      </p>
      <div style={{ marginTop: 8 }}>
        <button onClick={startLeakyInterval} style={{ marginRight: 8 }}>
          启动一个泄露的 interval
        </button>
        <button onClick={clearAllLeakyIntervals} disabled={leakTimerCount === 0} style={{ marginRight: 8 }}>
          清理所有泄露 interval
        </button>
        <button onClick={startSafeInterval} style={{ marginRight: 8 }}>
          启动安全 interval
        </button>
        <button
          onClick={stopSafeInterval}
          disabled={!safeTimerRef.current}
          style={{ background: '#f44336', color: '#fff' }}
        >
          停止安全 interval
        </button>
      </div>
    </div>
  );
}

export default TimerLeakDemo;

