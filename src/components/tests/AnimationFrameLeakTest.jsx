import { useState, useEffect, useRef } from 'react';

/**
 * requestAnimationFrame 未取消内存泄露测试
 */
function AnimationFrameLeakTest() {
  const [leakCount, setLeakCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isLeakActive, setIsLeakActive] = useState(false);
  const [isCorrectActive, setIsCorrectActive] = useState(false);
  const leakAnimationIdRef = useRef(null);
  const correctAnimationIdRef = useRef(null);

  // ❌ 错误示例：requestAnimationFrame 未取消
  useEffect(() => {
    if (isLeakActive) {
      const animate = () => {
        setLeakCount(prev => prev + 1);
        leakAnimationIdRef.current = requestAnimationFrame(animate); // 无限循环，未取消
      };
      leakAnimationIdRef.current = requestAnimationFrame(animate);
    }
    // 错误：没有清理函数
  }, [isLeakActive]);

  // ✅ 正确示例：保存 ID 并取消
  useEffect(() => {
    if (isCorrectActive) {
      const animate = () => {
        setCorrectCount(prev => prev + 1);
        correctAnimationIdRef.current = requestAnimationFrame(animate);
      };
      correctAnimationIdRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (correctAnimationIdRef.current) {
          cancelAnimationFrame(correctAnimationIdRef.current);
        }
      };
    }
  }, [isCorrectActive]);

  const clearLeakAnimation = () => {
    if (leakAnimationIdRef.current) {
      cancelAnimationFrame(leakAnimationIdRef.current);
      leakAnimationIdRef.current = null;
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
      <h2 style={{ marginTop: 0, color: '#c62828' }}>12. requestAnimationFrame 未取消内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：requestAnimationFrame 未取消</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          requestAnimationFrame 未取消，导致无限循环，持续占用 CPU 和内存。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            泄露动画帧数: {leakCount}
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
            {isLeakActive ? '停止泄露动画' : '启动泄露动画'}
          </button>
          <button
            onClick={clearLeakAnimation}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            手动取消
          </button>
        </div>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：保存 ID 并取消</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          保存 requestAnimationFrame 返回的 ID，在组件卸载时取消。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
            正确动画帧数: {correctCount}
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
            {isCorrectActive ? '停止正确动画' : '启动正确动画'}
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
  let animationId;
  const animate = () => {
    // 动画逻辑
    animationId = requestAnimationFrame(animate);
  };
  animationId = requestAnimationFrame(animate);
  
  return () => {
    cancelAnimationFrame(animationId); // 取消动画帧
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
          <li>启动动画后，观察帧数增长</li>
          <li>泄露的动画会一直运行，即使停止也会继续占用资源</li>
          <li>正确的动画会在组件卸载时自动取消</li>
          <li>在 Chrome DevTools Performance 面板中查看动画帧</li>
        </ul>
      </div>
    </div>
  );
}

export default AnimationFrameLeakTest;
