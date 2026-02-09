import { useState, useEffect } from 'react';

/**
 * Promise 链未清理内存泄露测试
 */
function PromiseLeakTest() {
  const [leakCount, setLeakCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isLeakActive, setIsLeakActive] = useState(false);
  const [isCorrectActive, setIsCorrectActive] = useState(false);

  // ❌ 错误示例：Promise 链持有组件引用
  useEffect(() => {
    if (isLeakActive) {
      // 模拟 API 请求
      fetch('https://jsonplaceholder.typicode.com/posts/1')
        .then(response => response.json())
        .then(data => {
          // 如果组件已卸载，这里会警告
          setLeakCount(prev => prev + 1);
          console.log('Promise 完成，数据:', data);
        })
        .catch(error => {
          console.error('Promise 错误:', error);
        });
    }
  }, [isLeakActive]);

  // ✅ 正确示例：使用标志位
  useEffect(() => {
    if (isCorrectActive) {
      let mounted = true;
      
      fetch('https://jsonplaceholder.typicode.com/posts/1')
        .then(response => response.json())
        .then(data => {
          if (mounted) {
            setCorrectCount(prev => prev + 1);
            console.log('Promise 完成，数据:', data);
          }
        })
        .catch(error => {
          if (mounted) {
            console.error('Promise 错误:', error);
          }
        });
      
      return () => {
        mounted = false; // 标记组件已卸载
      };
    }
  }, [isCorrectActive]);

  // ✅ 正确示例：使用 AbortController
  useEffect(() => {
    if (isCorrectActive) {
      const controller = new AbortController();
      
      fetch('https://jsonplaceholder.typicode.com/posts/1', {
        signal: controller.signal
      })
        .then(response => response.json())
        .then(data => {
          setCorrectCount(prev => prev + 1);
          console.log('Promise 完成（AbortController），数据:', data);
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            console.error('Promise 错误:', error);
          }
        });
      
      return () => {
        controller.abort(); // 取消请求
      };
    }
  }, [isCorrectActive]);

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #f44336'
    }}>
      <h2 style={{ marginTop: 0, color: '#c62828' }}>11. Promise 链未清理内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：Promise 链持有组件引用</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          Promise 链持有组件引用，如果组件在 Promise 完成前卸载，会导致内存泄露和警告。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            泄露 Promise 完成次数: {leakCount}
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
            {isLeakActive ? '停止泄露 Promise' : '启动泄露 Promise'}
          </button>
        </div>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：使用标志位或 AbortController</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          使用标志位检查组件是否已卸载，或使用 AbortController 取消请求。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
            正确 Promise 完成次数: {correctCount}
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
            {isCorrectActive ? '停止正确 Promise' : '启动正确 Promise'}
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
{`// 方法1：使用标志位
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
    mounted = false;
  };
}, []);

// 方法2：使用 AbortController
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(response => response.json())
    .then(data => {
      setState(data);
    });
  
  return () => {
    controller.abort();
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
          <li>启动 Promise 后立即停止，观察是否还有回调执行</li>
          <li>泄露的 Promise 会在组件卸载后仍执行回调，导致警告</li>
          <li>正确的 Promise 会检查组件状态或取消请求</li>
          <li>在 Chrome DevTools Network 面板中查看请求是否被取消</li>
        </ul>
      </div>
    </div>
  );
}

export default PromiseLeakTest;
