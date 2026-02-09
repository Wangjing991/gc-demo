import { useState, useEffect } from 'react';

/**
 * Worker 未终止内存泄露测试
 */
function WorkerLeakTest() {
  const [workers, setWorkers] = useState([]);
  const [messageCount, setMessageCount] = useState(0);

  // 创建 Worker 代码（内联）
  const createWorkerCode = () => {
    return `
      self.onmessage = function(e) {
        const result = e.data * 2;
        self.postMessage(result);
      };
    `;
  };

  // ❌ 错误示例：Worker 未终止
  const createLeakyWorker = () => {
    try {
      const blob = new Blob([createWorkerCode()], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      
      worker.onmessage = (event) => {
        setMessageCount(prev => prev + 1);
        console.log('Worker 消息:', event.data);
      };
      
      worker.postMessage(42);
      // 错误：Worker 未终止
      setWorkers(prev => [...prev, worker]);
      console.log('创建泄露的 Worker，当前数量:', workers.length + 1);
    } catch (error) {
      console.error('无法创建 Worker:', error);
      alert('Worker 创建失败，某些浏览器可能不支持');
    }
  };

  // ✅ 正确示例：终止 Worker
  useEffect(() => {
    const blob = new Blob([createWorkerCode()], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    worker.onmessage = (event) => {
      setMessageCount(prev => prev + 1);
      console.log('正确的 Worker 消息:', event.data);
    };
    
    worker.postMessage(42);
    
    // ✅ 正确：在组件卸载时终止 Worker
    return () => {
      worker.terminate();
      URL.revokeObjectURL(blob);
    };
  }, []);

  const clearLeakyWorkers = () => {
    workers.forEach(worker => {
      worker.terminate();
    });
    setWorkers([]);
    setMessageCount(0);
    console.log('已清理泄露的 Worker');
  };

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #f44336'
    }}>
      <h2 style={{ marginTop: 0, color: '#c62828' }}>13. Worker 未终止内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：Worker 未终止</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          Worker 未调用 terminate()，导致 Worker 线程一直运行，占用内存。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            当前 Worker 数量: {workers.length} | 消息接收次数: {messageCount}
          </p>
          <button
            onClick={createLeakyWorker}
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
            创建泄露的 Worker
          </button>
          <button
            onClick={clearLeakyWorkers}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清理泄露的 Worker
          </button>
        </div>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：终止 Worker</h3>
        <pre style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
{`useEffect(() => {
  const worker = new Worker('worker.js');
  worker.postMessage({ type: 'start' });
  worker.onmessage = (event) => {
    console.log(event.data);
  };
  
  return () => {
    worker.terminate(); // 终止 Worker
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
          <li>创建多个 Worker，观察内存和线程数量</li>
          <li>Worker 未终止会导致内存泄露和线程泄露</li>
          <li>在 Chrome DevTools Performance 面板中查看线程数量</li>
          <li>正确的 Worker 会在组件卸载时自动终止</li>
        </ul>
      </div>
    </div>
  );
}

export default WorkerLeakTest;
