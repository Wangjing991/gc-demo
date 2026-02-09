import { useState } from 'react';

/**
 * 全局变量内存泄露测试
 */
function GlobalVariableLeakTest() {
  const [leakCount, setLeakCount] = useState(0);

  const createLeak = () => {
    // ❌ 错误：将大对象保存到全局变量
    window.__globalLeakData__ = window.__globalLeakData__ || [];
    const bigData = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      value: Math.random(),
      data: new Array(100).fill(0).map(() => Math.random()),
      timestamp: Date.now(),
    }));
    window.__globalLeakData__.push(bigData);
    setLeakCount(window.__globalLeakData__.length);
    console.log('创建全局变量泄露，当前数量:', window.__globalLeakData__.length);
  };

  const clearLeak = () => {
    // ✅ 正确：清理全局变量
    if (window.__globalLeakData__) {
      window.__globalLeakData__.length = 0;
      delete window.__globalLeakData__;
    }
    setLeakCount(0);
    console.log('已清理全局变量');
  };

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #f44336'
    }}>
      <h2 style={{ marginTop: 0, color: '#c62828' }}>1. 全局变量内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：全局变量不会被 GC</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          全局变量（window 对象上的属性）不会被垃圾回收器回收，会一直占用内存。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            当前泄露数量: {leakCount}
          </p>
          <button
            onClick={createLeak}
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
            创建泄露（每次 100k 元素）
          </button>
          <button
            onClick={clearLeak}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清理泄露
          </button>
        </div>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：使用局部变量</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          使用局部变量，函数执行完后变量超出作用域，可以被 GC。
        </p>
        <pre style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
{`function processData() {
  const data = new Array(1000000).fill(0);
  // 函数执行完后，data 可以被 GC
}`}
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
          <li>点击"创建泄露"按钮，观察内存增长</li>
          <li>全局变量会一直占用内存，直到手动清理</li>
          <li>清理后，内存应该下降（可能需要等待 GC 或手动触发）</li>
          <li>在 Chrome DevTools Memory 面板中查看堆快照对比</li>
        </ul>
      </div>
    </div>
  );
}

export default GlobalVariableLeakTest;
