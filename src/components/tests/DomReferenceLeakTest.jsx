import { useState, useRef, useEffect } from 'react';

/**
 * DOM 引用内存泄露测试
 */
function DomReferenceLeakTest() {
  const containerRef = useRef(null);
  const leakElementsRef = useRef([]);
  const [leakCount, setLeakCount] = useState(0);

  const createLeak = (count = 100) => {
    if (!containerRef.current) return;
    
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.textContent = `泄露 DOM 元素 ${leakElementsRef.current.length + i + 1}`;
      el.style.padding = '4px 8px';
      el.style.fontSize = '12px';
      el.style.borderBottom = '1px solid #eee';
      fragment.appendChild(el);
      
      // ❌ 错误：保存 DOM 引用
      leakElementsRef.current.push(el);
    }
    containerRef.current.appendChild(fragment);
    setLeakCount(leakElementsRef.current.length);
    console.log('创建 DOM 泄露，当前数量:', leakElementsRef.current.length);
  };

  const clearLeak = () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    // ✅ 正确：清理 DOM 引用
    leakElementsRef.current = [];
    setLeakCount(0);
    console.log('已清理 DOM 引用');
  };

  useEffect(() => {
    return () => {
      clearLeak();
    };
  }, []);

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #f44336'
    }}>
      <h2 style={{ marginTop: 0, color: '#c62828' }}>5. DOM 引用内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：DOM 引用未清理</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          将 DOM 元素保存到数组中，即使从文档中移除，引用仍然存在，导致内存泄露。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            当前 DOM 元素数量: {leakCount}
          </p>
          <button
            onClick={() => createLeak(100)}
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
            创建 100 个 DOM 元素
          </button>
          <button
            onClick={() => createLeak(500)}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            创建 500 个 DOM 元素
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
            清理 DOM 引用
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          maxHeight: '300px',
          overflow: 'auto',
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #ddd'
        }}
      />

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：清理 DOM 引用</h3>
        <pre style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
{`// 清理 DOM 引用
elements.length = 0;

// 或使用 React，让 React 管理 DOM
function Component() {
  return <div>React 会自动管理 DOM</div>;
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
          <li>创建大量 DOM 元素并保存引用，观察内存增长</li>
          <li>清理 DOM 引用后，内存应该下降</li>
          <li>在 Chrome DevTools Memory 面板中查看 DOM 节点数量</li>
          <li>React 会自动管理 DOM，通常不需要手动操作 DOM</li>
        </ul>
      </div>
    </div>
  );
}

export default DomReferenceLeakTest;
