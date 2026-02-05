import { useEffect, useRef, useState } from 'react';

// 事件监听器未清理导致的内存泄露示例
function EventListenerLeakDemo() {
  const safeHandlerRef = useRef(null);
  const [leakListenerCount, setLeakListenerCount] = useState(0);
  const [safeActive, setSafeActive] = useState(false);

  const addLeakyListener = () => {
    // ❌ 错误示例：使用匿名函数添加监听器，无法在后续移除
    const handler = () => {
      // eslint-disable-next-line no-console
      console.log('匿名 scroll 监听器触发');
    };
    window.addEventListener('scroll', handler);
    setLeakListenerCount((c) => c + 1);
  };

  const addSafeListener = () => {
    if (safeHandlerRef.current) return;
    // ✅ 正确示例：保存引用，并在卸载 / 手动时清理
    const handler = () => {
      // eslint-disable-next-line no-console
      console.log('安全的 resize 监听器触发');
    };
    safeHandlerRef.current = handler;
    window.addEventListener('resize', handler);
    setSafeActive(true);
  };

  const removeSafeListener = () => {
    if (!safeHandlerRef.current) return;
    window.removeEventListener('resize', safeHandlerRef.current);
    safeHandlerRef.current = null;
    setSafeActive(false);
  };

  useEffect(
    () => () => {
      // 组件卸载时，尽量移除安全监听器
      if (safeHandlerRef.current) {
        window.removeEventListener('resize', safeHandlerRef.current);
      }
    },
    [],
  );

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>3. 事件监听器未清理导致的内存泄露</h3>
      <p style={{ fontSize: 12, color: '#666' }}>
        频繁添加事件监听而不移除，会让回调函数和其闭包占用的内存一直存在。
      </p>
      <p style={{ fontSize: 14, fontWeight: 'bold', color: '#d32f2f' }}>
        已添加的匿名 scroll 监听器数量（泄露）：{leakListenerCount}
      </p>
      <p style={{ fontSize: 12, color: safeActive ? '#2e7d32' : '#999' }}>
        安全的 resize 监听器：{safeActive ? '已添加' : '未添加 / 已移除'}
      </p>
      <div style={{ marginTop: 8 }}>
        <button onClick={addLeakyListener} style={{ marginRight: 8 }}>
          添加匿名 scroll 监听器（泄露）
        </button>
        <button onClick={addSafeListener} style={{ marginRight: 8 }}>
          添加安全 resize 监听器
        </button>
        <button
          onClick={removeSafeListener}
          disabled={!safeActive}
          style={{ background: '#f44336', color: '#fff' }}
        >
          移除安全监听器
        </button>
      </div>
    </div>
  );
}

export default EventListenerLeakDemo;

