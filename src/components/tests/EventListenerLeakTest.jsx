import { useState, useEffect } from 'react';

/**
 * 事件监听器内存泄露测试
 */
function EventListenerLeakTest() {
  const [leakCount, setLeakCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [leakHandlers, setLeakHandlers] = useState([]);
  const [correctHandlers, setCorrectHandlers] = useState([]);

  // ❌ 错误示例：事件监听器未移除
  const createLeakyListener = () => {
    const handler = () => {
      setLeakCount(prev => prev + 1);
    };
    
    // 错误：使用匿名函数，无法移除
    window.addEventListener('scroll', handler);
    setLeakHandlers(prev => [...prev, handler]);
    console.log('创建泄露的事件监听器，当前数量:', leakHandlers.length + 1);
  };

  const clearLeakyListeners = () => {
    leakHandlers.forEach(handler => {
      window.removeEventListener('scroll', handler);
    });
    setLeakHandlers([]);
    setLeakCount(0);
    console.log('已清理泄露的事件监听器');
  };

  // ✅ 正确示例：保存引用并清理
  useEffect(() => {
    const handlers = [];
    
    const createCorrectListener = () => {
      const handler = () => {
        setCorrectCount(prev => prev + 1);
      };
      window.addEventListener('scroll', handler);
      handlers.push(handler);
      setCorrectHandlers(prev => [...prev, handler]);
    };

    // 清理函数
    return () => {
      handlers.forEach(handler => {
        window.removeEventListener('scroll', handler);
      });
    };
  }, []);

  const createCorrectListener = () => {
    const handler = () => {
      setCorrectCount(prev => prev + 1);
    };
    window.addEventListener('scroll', handler);
    setCorrectHandlers(prev => [...prev, handler]);
  };

  const clearCorrectListeners = () => {
    correctHandlers.forEach(handler => {
      window.removeEventListener('scroll', handler);
    });
    setCorrectHandlers([]);
    setCorrectCount(0);
  };

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #f44336'
    }}>
      <h2 style={{ marginTop: 0, color: '#c62828' }}>3. 事件监听器内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：事件监听器未移除</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          使用匿名函数添加事件监听器，无法移除，导致内存泄露。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            泄露监听器数量: {leakHandlers.length} | 触发次数: {leakCount}
          </p>
          <button
            onClick={createLeakyListener}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            创建泄露的监听器
          </button>
          <button
            onClick={clearLeakyListeners}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清理泄露的监听器
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          提示：滚动页面会触发监听器
        </p>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：保存引用并清理</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          保存事件处理函数的引用，在组件卸载时移除监听器。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
            正确监听器数量: {correctHandlers.length} | 触发次数: {correctCount}
          </p>
          <button
            onClick={createCorrectListener}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            创建正确的监听器
          </button>
          <button
            onClick={clearCorrectListeners}
            style={{
              padding: '10px 20px',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清理正确的监听器
          </button>
        </div>
        <pre style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '13px',
          marginTop: '15px'
        }}>
{`useEffect(() => {
  const handleScroll = () => {
    // 处理逻辑
  };
  
  window.addEventListener('scroll', handleScroll);
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);`}
        </pre>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#fff3cd',
        borderRadius: '6px',
        fontSize: '13px'
      }}>
        <strong>测试说明：</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>创建多个事件监听器，观察内存增长</li>
          <li>滚动页面会触发监听器，观察计数变化</li>
          <li>清理监听器后，内存应该下降</li>
          <li>在 Chrome DevTools Performance 面板中查看事件监听器数量</li>
        </ul>
      </div>
    </div>
  );
}

export default EventListenerLeakTest;
