import { useState, useEffect, useRef } from 'react';

/**
 * IntersectionObserver/ResizeObserver 内存泄露测试
 */
function ObserverLeakTest() {
  const leakObserverRef = useRef(null);
  const correctObserverRef = useRef(null);
  const elementRef = useRef(null);
  const [leakCount, setLeakCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isLeakActive, setIsLeakActive] = useState(false);
  const [isCorrectActive, setIsCorrectActive] = useState(false);

  // ❌ 错误示例：观察器未断开
  useEffect(() => {
    if (isLeakActive && elementRef.current) {
      leakObserverRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setLeakCount(prev => prev + 1);
          }
        });
      });
      
      leakObserverRef.current.observe(elementRef.current);
      // 错误：观察器未断开
    }
  }, [isLeakActive]);

  // ✅ 正确示例：断开观察器
  useEffect(() => {
    if (isCorrectActive && elementRef.current) {
      correctObserverRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setCorrectCount(prev => prev + 1);
          }
        });
      });
      
      correctObserverRef.current.observe(elementRef.current);
      
      // ✅ 正确：断开观察器
      return () => {
        if (correctObserverRef.current) {
          correctObserverRef.current.disconnect();
        }
      };
    }
  }, [isCorrectActive]);

  const clearLeakObserver = () => {
    if (leakObserverRef.current) {
      leakObserverRef.current.disconnect();
      leakObserverRef.current = null;
    }
    setIsLeakActive(false);
    setLeakCount(0);
  };

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #f44336'
    }}>
      <h2 style={{ marginTop: 0, color: '#c62828' }}>9. IntersectionObserver/ResizeObserver 内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：观察器未断开</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          IntersectionObserver 未调用 disconnect()，导致内存泄露。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            泄露观察器触发次数: {leakCount}
          </p>
          <button
            onClick={() => setIsLeakActive(!isLeakActive)}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: isLeakActive ? '#f44336' : '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isLeakActive ? '停止泄露观察器' : '启动泄露观察器'}
          </button>
          <button
            onClick={clearLeakObserver}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            手动断开
          </button>
        </div>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：断开观察器</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          在组件卸载时调用 disconnect() 断开观察器。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
            正确观察器触发次数: {correctCount}
          </p>
          <button
            onClick={() => setIsCorrectActive(!isCorrectActive)}
            style={{
              padding: '10px 20px',
              background: isCorrectActive ? '#4caf50' : '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isCorrectActive ? '停止正确观察器' : '启动正确观察器'}
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
}, []);`}
        </pre>
      </div>

      {/* 测试元素 */}
      <div
        ref={elementRef}
        style={{
          height: '200px',
          background: '#e3f2fd',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          border: '2px solid #2196f3'
        }}
      >
        <p style={{ color: '#1976d2', fontSize: '16px' }}>
          滚动页面，当此元素进入视口时会触发观察器
        </p>
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
          <li>启动观察器后，滚动页面观察触发次数</li>
          <li>观察器未断开会导致内存泄露</li>
          <li>正确的观察器会在组件卸载时自动断开</li>
          <li>ResizeObserver、MutationObserver 等同样需要断开</li>
        </ul>
      </div>
    </div>
  );
}

export default ObserverLeakTest;
