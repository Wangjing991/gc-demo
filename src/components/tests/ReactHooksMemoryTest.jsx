import { useState, useEffect, useRef } from 'react';

/**
 * React Hooks 内存管理测试
 */
function ReactHooksMemoryTest() {
  const [showComponent, setShowComponent] = useState(false);
  const [mountCount, setMountCount] = useState(0);

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #2196f3'
    }}>
      <h2 style={{ marginTop: 0, color: '#1976d2' }}>React Hooks 内存管理测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#e3f2fd',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>组件挂载/卸载测试</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          测试组件卸载时的内存清理情况。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
            挂载次数: {mountCount}
          </p>
          <button
            onClick={() => {
              setShowComponent(!showComponent);
              if (!showComponent) {
                setMountCount(prev => prev + 1);
              }
            }}
            style={{
              padding: '10px 20px',
              background: showComponent ? '#f44336' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showComponent ? '卸载组件' : '挂载组件'}
          </button>
        </div>
      </div>

      {showComponent && (
        <TestComponent />
      )}
      
      {!showComponent && (
        <div style={{
          padding: '20px',
          background: '#f5f5f5',
          borderRadius: '6px',
          color: '#999',
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          组件已卸载，检查控制台查看清理日志
        </div>
      )}
    </div>
  );
}

// 测试组件
function TestComponent() {
  const [count, setCount] = useState(0);
  const dataRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // 创建一些资源
    dataRef.current = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      value: Math.random(),
    }));

    timerRef.current = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);

    console.log('组件已挂载，创建了资源和定时器');

    // ✅ 正确：清理资源
    return () => {
      console.log('组件卸载，清理资源');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      dataRef.current = null;
    };
  }, []);

  return (
    <div style={{
      padding: '20px',
      background: '#e8f5e9',
      borderRadius: '6px',
      border: '2px solid #4caf50'
    }}>
      <h3 style={{ marginTop: 0 }}>测试组件（已挂载）</h3>
      <p>计数: {count}</p>
      <p style={{ fontSize: '12px', color: '#666' }}>
        这个组件创建了定时器和数据，卸载时会自动清理
      </p>
    </div>
  );
}

export default ReactHooksMemoryTest;
