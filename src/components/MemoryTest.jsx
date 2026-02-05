import { useState, useEffect, useRef } from 'react';
import { useRequest, useInterval, useEventListener, useUnmount, useMemoizedFn } from 'ahooks';

// 测试组件：演示内存泄漏和正确的清理
function MemoryTest() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);
  const intervalRef = useRef(null);
  const [memoryInfo, setMemoryInfo] = useState(null);
  
  // useMemoizedFn 内存泄露测试相关状态
  const [memoizedComponents, setMemoizedComponents] = useState([]);
  const [memoizedCount, setMemoizedCount] = useState(0);
  const memoizedFunctionsRef = useRef(new Set());

  // 使用 useRequest 进行数据请求（自动处理清理）
  const { data: requestData, loading, run } = useRequest(
    async () => {
      // 模拟 API 请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { timestamp: Date.now(), value: Math.random() };
    },
    {
      manual: true,
      onSuccess: (result) => {
        console.log('Request success:', result);
      },
    }
  );

  // 使用 useInterval 自动清理定时器
  const [intervalCount, setIntervalCount] = useState(0);
  const [isIntervalActive, setIsIntervalActive] = useState(false);

  useInterval(
    () => {
      setIntervalCount(c => c + 1);
    },
    isIntervalActive ? 1000 : null
  );

  // 使用 useEventListener 自动清理事件监听器
  const [clickCount, setClickCount] = useState(0);
  useEventListener('click', () => {
    setClickCount(c => c + 1);
  });

  // 使用 useUnmount 确保组件卸载时清理
  useUnmount(() => {
    console.log('组件卸载，清理资源');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  });

  // 手动创建的定时器（需要手动清理）
  const [manualIntervalCount, setManualIntervalCount] = useState(0);
  const [isManualActive, setIsManualActive] = useState(false);

  useEffect(() => {
    if (isManualActive) {
      intervalRef.current = setInterval(() => {
        setManualIntervalCount(c => c + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    // 清理函数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isManualActive]);

  // 获取内存信息（如果浏览器支持）
  const updateMemoryInfo = () => {
    if (performance.memory) {
      setMemoryInfo({
        used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
        total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
        limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2),
      });
    }
  };

  // 创建大量数据来测试内存
  const createLargeData = () => {
    const newData = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      value: Math.random(),
      timestamp: Date.now(),
    }));
    setData(newData);
    updateMemoryInfo();
  };

  // 清理数据
  const clearData = () => {
    setData([]);
    updateMemoryInfo();
  };

  // useMemoizedFn 测试：创建大量使用 useMemoizedFn 的组件
  const createMemoizedComponents = (count) => {
    const newComponents = [];
    for (let i = 0; i < count; i++) {
      const id = Date.now() + i;
      newComponents.push({
        id,
        name: `Component-${id}`,
        timestamp: Date.now(),
      });
    }
    setMemoizedComponents(prev => [...prev, ...newComponents]);
    setMemoizedCount(prev => prev + count);
    updateMemoryInfo();
  };

  // 清理所有 useMemoizedFn 组件
  const clearMemoizedComponents = () => {
    setMemoizedComponents([]);
    memoizedFunctionsRef.current.clear();
    updateMemoryInfo();
    // 强制垃圾回收提示（实际需要浏览器支持）
    if (window.gc) {
      window.gc();
    }
  };

  // 使用 useMemoizedFn 的函数（正确用法）
  const handleMemoizedClick = useMemoizedFn((id) => {
    console.log('Memoized function called for:', id);
    setCount(c => c + 1);
  });

  // 错误用法：在循环中创建大量 useMemoizedFn（会导致内存泄露）
  const createLeakyFunctions = () => {
    const leakyFunctions = [];
    for (let i = 0; i < 1000; i++) {
      // 错误：每次渲染都创建新的 useMemoizedFn，但函数引用被保存
      const fn = () => {
        console.log('Leaky function:', i);
      };
      leakyFunctions.push(fn);
      memoizedFunctionsRef.current.add(fn);
    }
    console.log('创建了 1000 个函数，可能导致内存泄露');
    updateMemoryInfo();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>JS 内存管理测试 Demo</h1>
      
      {/* 内存信息显示 */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2>内存信息</h2>
        {memoryInfo ? (
          <div>
            <p>已使用: {memoryInfo.used} MB</p>
            <p>总计: {memoryInfo.total} MB</p>
            <p>限制: {memoryInfo.limit} MB</p>
          </div>
        ) : (
          <p>浏览器不支持 performance.memory API</p>
        )}
        <button onClick={updateMemoryInfo} style={{ marginTop: '10px' }}>
          更新内存信息
        </button>
      </div>

      {/* useRequest 示例 */}
      <div style={{ 
        background: '#e3f2fd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2>useRequest 示例（自动清理）</h2>
        <button onClick={run} disabled={loading} style={{ marginRight: '10px' }}>
          {loading ? '请求中...' : '发起请求'}
        </button>
        {requestData && (
          <div style={{ marginTop: '10px' }}>
            <p>数据: {JSON.stringify(requestData)}</p>
          </div>
        )}
      </div>

      {/* useInterval 示例 */}
      <div style={{ 
        background: '#f3e5f5', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2>useInterval 示例（自动清理）</h2>
        <p>计数: {intervalCount}</p>
        <button 
          onClick={() => setIsIntervalActive(!isIntervalActive)}
          style={{ marginRight: '10px' }}
        >
          {isIntervalActive ? '停止' : '开始'}
        </button>
        <button onClick={() => setIntervalCount(0)}>重置</button>
      </div>

      {/* 手动定时器示例 */}
      <div style={{ 
        background: '#fff3e0', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2>手动定时器示例（需要手动清理）</h2>
        <p>计数: {manualIntervalCount}</p>
        <button 
          onClick={() => setIsManualActive(!isManualActive)}
          style={{ marginRight: '10px' }}
        >
          {isManualActive ? '停止' : '开始'}
        </button>
        <button onClick={() => setManualIntervalCount(0)}>重置</button>
      </div>

      {/* useEventListener 示例 */}
      <div style={{ 
        background: '#e8f5e9', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2>useEventListener 示例（自动清理）</h2>
        <p>点击计数: {clickCount}</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          点击页面任意位置会增加计数
        </p>
      </div>

      {/* 大数据测试 */}
      <div style={{ 
        background: '#fce4ec', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2>大数据内存测试</h2>
        <p>数据项数量: {data.length}</p>
        <button onClick={createLargeData} style={{ marginRight: '10px' }}>
          创建 10000 条数据
        </button>
        <button onClick={clearData}>清理数据</button>
        {data.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <p style={{ fontSize: '12px', color: '#666' }}>
              提示: 创建大量数据后检查内存使用情况，然后清理数据观察内存变化
            </p>
          </div>
        )}
      </div>

      {/* useMemoizedFn 内存泄露测试 */}
      <div style={{ 
        background: '#ffebee', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '2px solid #f44336'
      }}>
        <h2>useMemoizedFn 内存泄露测试 ⚠️</h2>
        <p style={{ color: '#d32f2f', fontWeight: 'bold', marginBottom: '10px' }}>
          当前组件数量: {memoizedComponents.length} | 总创建数: {memoizedCount}
        </p>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
          useMemoizedFn 会缓存函数引用，大量使用且不清理会导致内存泄露
        </p>
        
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={() => createMemoizedComponents(100)} 
            style={{ marginRight: '10px', marginBottom: '5px' }}
          >
            创建 100 个组件
          </button>
          <button 
            onClick={() => createMemoizedComponents(500)} 
            style={{ marginRight: '10px', marginBottom: '5px' }}
          >
            创建 500 个组件
          </button>
          <button 
            onClick={() => createMemoizedComponents(1000)} 
            style={{ marginRight: '10px', marginBottom: '5px' }}
          >
            创建 1000 个组件
          </button>
          <button 
            onClick={clearMemoizedComponents}
            style={{ 
              background: '#f44336', 
              color: 'white',
              marginBottom: '5px'
            }}
          >
            清理所有组件
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={createLeakyFunctions}
            style={{ 
              background: '#ff9800', 
              color: 'white',
              marginRight: '10px'
            }}
          >
            创建泄露函数（错误示例）
          </button>
          <span style={{ fontSize: '12px', color: '#666' }}>
            每次点击会创建 1000 个函数并保存引用，观察内存增长
          </span>
        </div>

        {/* 显示组件列表（限制显示数量） */}
        {memoizedComponents.length > 0 && (
          <div style={{ 
            maxHeight: '200px', 
            overflow: 'auto', 
            background: 'white', 
            padding: '10px', 
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
              显示前 20 个组件（共 {memoizedComponents.length} 个）:
            </p>
            {memoizedComponents.slice(0, 20).map((comp) => (
              <div 
                key={comp.id}
                style={{ 
                  fontSize: '11px', 
                  padding: '2px 0',
                  borderBottom: '1px solid #eee'
                }}
              >
                {comp.name} - {new Date(comp.timestamp).toLocaleTimeString()}
              </div>
            ))}
            {memoizedComponents.length > 20 && (
              <p style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                ... 还有 {memoizedComponents.length - 20} 个组件未显示
              </p>
            )}
          </div>
        )}

        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: '#fff3cd', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>测试说明：</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>创建大量组件后，观察内存使用情况</li>
            <li>清理组件后，内存应该下降（可能需要手动触发 GC）</li>
            <li>在 Chrome DevTools 的 Memory 面板中查看堆快照</li>
            <li>useMemoizedFn 缓存函数引用，大量使用需注意清理</li>
          </ul>
        </div>
      </div>

      {/* useMemoizedFn 正确用法示例 */}
      <div style={{ 
        background: '#e8f5e9', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px'
      }}>
        <h2>useMemoizedFn 正确用法示例 ✅</h2>
        <p>使用 useMemoizedFn 缓存函数引用，避免不必要的重新创建</p>
        <button onClick={() => handleMemoizedClick('test')} style={{ marginRight: '10px' }}>
          调用 Memoized 函数
        </button>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          这个函数使用 useMemoizedFn 包装，函数引用在组件生命周期内保持稳定
        </p>
      </div>

      {/* 基础计数器 */}
      <div style={{ 
        background: '#f1f8e9', 
        padding: '15px', 
        borderRadius: '8px' 
      }}>
        <h2>基础状态管理</h2>
        <p>计数: {count}</p>
        <button onClick={() => setCount(c => c + 1)} style={{ marginRight: '10px' }}>
          增加
        </button>
        <button onClick={() => setCount(0)}>重置</button>
      </div>
    </div>
  );
}

export default MemoryTest;
