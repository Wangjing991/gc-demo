import { useState, useEffect, useRef } from 'react';
import { useInterval } from 'ahooks';

/**
 * 定时器内存泄露测试
 */
function TimerLeakTest() {
  const [leakIntervalCount, setLeakIntervalCount] = useState(0);
  const [leakTimeoutCount, setLeakTimeoutCount] = useState(0);
  const [correctIntervalCount, setCorrectIntervalCount] = useState(0);
  const [correctTimeoutCount, setCorrectTimeoutCount] = useState(0);
  const [isLeakActive, setIsLeakActive] = useState(false);
  const [isCorrectActive, setIsCorrectActive] = useState(false);
  
  const leakIntervalRef = useRef(null);
  const leakTimeoutRef = useRef(null);

  // ❌ 错误示例：定时器未清理
  useEffect(() => {
    if (isLeakActive) {
      // setInterval 未保存 ID，无法清理
      leakIntervalRef.current = setInterval(() => {
        setLeakIntervalCount(prev => prev + 1);
      }, 1000);

      // setTimeout 未清理
      leakTimeoutRef.current = setTimeout(() => {
        setLeakTimeoutCount(prev => prev + 1);
      }, 2000);
    }

    // 没有清理函数！
  }, [isLeakActive]);

  // ✅ 正确示例：使用 useInterval（ahooks）
  useInterval(
    () => {
      setCorrectIntervalCount(prev => prev + 1);
    },
    isCorrectActive ? 1000 : null
  );

  // ✅ 正确示例：手动清理 setTimeout
  useEffect(() => {
    if (isCorrectActive) {
      const timerId = setTimeout(() => {
        setCorrectTimeoutCount(prev => prev + 1);
      }, 2000);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [isCorrectActive]);

  const clearLeakTimers = () => {
    if (leakIntervalRef.current) {
      clearInterval(leakIntervalRef.current);
      leakIntervalRef.current = null;
    }
    if (leakTimeoutRef.current) {
      clearTimeout(leakTimeoutRef.current);
      leakTimeoutRef.current = null;
    }
    setIsLeakActive(false);
    setLeakIntervalCount(0);
    setLeakTimeoutCount(0);
  };

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #f44336'
    }}>
      <h2 style={{ marginTop: 0, color: '#c62828' }}>4. 定时器内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：定时器未清理</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          setInterval 和 setTimeout 未保存 ID 或未清理，导致内存泄露。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            setInterval 计数: {leakIntervalCount} | setTimeout 计数: {leakTimeoutCount}
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
            {isLeakActive ? '停止泄露定时器' : '启动泄露定时器'}
          </button>
          <button
            onClick={clearLeakTimers}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            手动清理
          </button>
        </div>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：使用 ahooks 或手动清理</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          使用 useInterval（自动清理）或手动清理 setTimeout。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
            useInterval 计数: {correctIntervalCount} | setTimeout 计数: {correctTimeoutCount}
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
            {isCorrectActive ? '停止正确定时器' : '启动正确定时器'}
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
{`// 使用 useInterval（自动清理）
useInterval(() => {
  setCount(c => c + 1);
}, isActive ? 1000 : null);

// 手动清理 setTimeout
useEffect(() => {
  const timerId = setTimeout(() => {
    setState(newValue);
  }, 1000);
  
  return () => {
    clearTimeout(timerId);
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
          <li>启动泄露定时器后，即使停止，定时器可能仍在运行</li>
          <li>正确的定时器会在组件卸载时自动清理</li>
          <li>观察内存使用情况，泄露的定时器会导致内存持续增长</li>
          <li>在 Chrome DevTools Performance 面板中查看定时器数量</li>
        </ul>
      </div>
    </div>
  );
}

export default TimerLeakTest;
