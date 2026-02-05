import { useState, useEffect, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';

// 使用 useMemoizedFn 的子组件（可能导致内存泄露）
function MemoizedComponent({ id, onAction }) {
  // 每个组件都创建一个 memoized 函数
  const handleClick = useMemoizedFn(() => {
    console.log(`Component ${id} clicked`);
    if (onAction) {
      onAction(id);
    }
  });

  // 创建多个 memoized 函数（模拟复杂场景）
  const handleAction1 = useMemoizedFn(() => {
    console.log(`Action 1 for ${id}`);
  });

  // 这些函数用于演示：每个组件创建多个 useMemoizedFn 可能导致内存泄露
  const _handleAction2 = useMemoizedFn(() => {
    console.log(`Action 2 for ${id}`);
  });

  const _handleAction3 = useMemoizedFn(() => {
    console.log(`Action 3 for ${id}`);
  });

  // 在 effect 中使用 memoized 函数
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAction1();
    }, 1000);
    return () => clearTimeout(timer);
  }, [handleAction1]);

  return (
    <div style={{
      padding: '8px',
      margin: '4px',
      background: '#fff',
      border: '1px solid #ddd',
      borderRadius: '4px',
      display: 'inline-block',
      fontSize: '12px'
    }}>
      <span>组件 {id}</span>
      <button 
        onClick={handleClick}
        style={{ 
          marginLeft: '8px', 
          padding: '2px 8px',
          fontSize: '11px'
        }}
      >
        点击
      </button>
    </div>
  );
}

// 主测试组件
function MemoizedFnLeakTest() {
  const [components, setComponents] = useState([]);
  const [componentCount, setComponentCount] = useState(0);
  const [memoryInfo, setMemoryInfo] = useState(null);
  const leakyFunctionsRef = useRef([]);
  const [renderCount, setRenderCount] = useState(0);

  // 更新内存信息
  const updateMemoryInfo = () => {
    if (performance.memory) {
      setMemoryInfo({
        used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
        total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
        limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2),
      });
    }
  };

  // 创建组件
  const createComponents = (count) => {
    const newComponents = [];
    for (let i = 0; i < count; i++) {
      const id = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      newComponents.push({ id, timestamp: Date.now() });
    }
    setComponents(prev => [...prev, ...newComponents]);
    setComponentCount(prev => prev + count);
    updateMemoryInfo();
  };

  // 清理所有组件
  const clearComponents = () => {
    setComponents([]);
    leakyFunctionsRef.current = [];
    updateMemoryInfo();
    // 提示垃圾回收
    if (window.gc) {
      window.gc();
    }
  };

  // 错误示例：在循环中创建大量函数并保存引用（模拟 useMemoizedFn 的泄露场景）
  const createLeakyMemoizedFunctions = () => {
    const functions = [];
    for (let i = 0; i < 500; i++) {
      // 错误：创建函数并保存引用，导致无法被 GC
      // 注意：这里不能直接调用 useMemoizedFn（Hook 规则），但可以模拟类似的行为
      const fn = (() => {
        const cached = () => {
          console.log('Leaky memoized function:', i);
        };
        return cached;
      })();
      functions.push(fn);
    }
    leakyFunctionsRef.current.push(...functions);
    console.log(`创建了 ${functions.length} 个函数并保存引用，可能导致内存泄露`);
    updateMemoryInfo();
  };

  // 错误示例：在每次渲染时创建新的函数（模拟 useMemoizedFn 的错误用法）
  const [trigger, setTrigger] = useState(0);
  useEffect(() => {
    // 错误：每次渲染都创建新的函数并保存引用
    const _leakyFn = () => {
      console.log('Leaky function in effect, render:', renderCount);
    };
    // leakyFunctionsRef.current.push(_leakyFn);
    setRenderCount(prev => prev + 1);
    updateMemoryInfo();
  }, [trigger, renderCount]);

  // 创建一个大数组用于内存测试（模拟大量数据）
  // 这个数组会被 useMemoizedFn 引用，可能导致内存泄露
  const bigData = useRef(null);
  
  const [bigDataSize, setBigDataSize] = useState(0);

  // 创建大数组
  const createBigData = (size = 100000) => {
    if (bigData.current) {
      console.log('大数组已存在，先清理旧数据');
      bigData.current = null;
      setBigDataSize(0);
    }
    
    // 创建一个包含大量数据的大数组
    bigData.current = Array.from({ length: size }, (_, i) => ({
      id: i,
      value: Math.random(),
      data: new Array(100).fill(0).map(() => Math.random()),
      timestamp: Date.now(),
      description: `Data item ${i} with some additional information to increase memory usage`
    }));
    setBigDataSize(size);
    console.log('大数组已创建，包含', bigData.current.length, '个元素');
    updateMemoryInfo();
  };

  // 清理大数组
  const clearBigData = () => {
    bigData.current = null;
    setBigDataSize(0);
    updateMemoryInfo();
    if (window.gc) {
      window.gc();
    }
    console.log('大数组已清理');
  };
  let a = null;
  // 正确的用法：在组件顶层使用 useMemoizedFn
  // 注意：如果 useMemoizedFn 引用了大数组，即使组件卸载，数组也可能无法被 GC
  const handleComponentAction = useMemoizedFn((id) => {
    console.log('Component action:', id);
     const b =  bigData.current;
    // 访问大数组（这会导致 useMemoizedFn 的闭包持有大数组的引用）
    if (bigData.current) {
      const sample = bigData.current.slice(0, 10);
      console.log('Big data sample:', sample);
    }
    return () => {
      console.log('clear',b.length);
    };
  });
  useEffect(() => {
    console.log('a:', a);
  }, [a]);

  return (
    <div style={{ 
      padding: '20px', 
      background: '#fff3e0', 
      borderRadius: '8px',
      border: '2px solid #ff9800'
    }}>
      <h2 style={{ color: '#e65100', marginTop: 0 }}>
        useMemoizedFn 内存泄露深度测试 🔥
      </h2>

      {/* 内存信息 */}
      <div style={{ 
        background: '#fff', 
        padding: '10px', 
        borderRadius: '4px', 
        marginBottom: '15px' 
      }}>
        <h3 style={{ marginTop: 0, fontSize: '16px' }}>内存信息</h3>
        {memoryInfo ? (
          <div>
            <p>已使用: <strong>{memoryInfo.used} MB</strong></p>
            <p>总计: {memoryInfo.total} MB | 限制: {memoryInfo.limit} MB</p>
          </div>
        ) : (
          <p>浏览器不支持 performance.memory API</p>
        )}
        <button onClick={updateMemoryInfo} style={{ marginTop: '5px' }}>
          更新内存信息
        </button>
      </div>

      {/* 大数组内存测试 */}
      <div style={{ 
        background: '#ffebee', 
        padding: '15px', 
        borderRadius: '4px',
        marginBottom: '15px',
        border: '2px solid #f44336'
      }}>
        <h3 style={{ fontSize: '16px', color: '#c62828', marginTop: 0 }}>
          ⚠️ 大数组内存测试（useMemoizedFn 引用大数组）
        </h3>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
          大数组被 useMemoizedFn 的闭包引用，可能导致内存无法释放
        </p>
        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#d32f2f' }}>
          当前大数组大小: {bigDataSize > 0 ? `${bigDataSize.toLocaleString()} 个元素` : '未创建'}
        </p>
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={() => createBigData(50000)} 
            style={{ marginRight: '5px', marginBottom: '5px' }}
          >
            创建 5万 元素
          </button>
          <button 
            onClick={() => createBigData(100000)} 
            style={{ marginRight: '5px', marginBottom: '5px' }}
          >
            创建 10万 元素
          </button>
          <button 
            onClick={() => createBigData(200000)} 
            style={{ marginRight: '5px', marginBottom: '5px' }}
          >
            创建 20万 元素
          </button>
          <button 
            onClick={clearBigData}
            style={{ 
              background: '#f44336', 
              color: 'white',
              marginBottom: '5px'
            }}
            disabled={bigDataSize === 0}
          >
            清理大数组
          </button>
        </div>
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: '#fff3cd', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>测试说明：</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>创建大数组后，观察内存使用情况</li>
            <li>handleComponentAction 函数使用 useMemoizedFn，并引用了大数组</li>
            <li>即使清理大数组，如果 useMemoizedFn 的闭包仍持有引用，内存可能无法释放</li>
            <li>点击"调用 Memoized 函数"按钮会访问大数组，观察内存变化</li>
          </ul>
        </div>
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={() => handleComponentAction('test')}
            disabled={bigDataSize === 0}
            style={{ 
              background: '#4caf50', 
              color: 'white'
            }}
          >
            调用 Memoized 函数（访问大数组）
          </button>
        </div>
      </div>

      {/* 组件创建测试 */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ fontSize: '16px' }}>动态创建组件测试</h3>
        <p style={{ fontSize: '12px', color: '#666' }}>
          每个组件内部使用多个 useMemoizedFn，大量创建会导致内存泄露
        </p>
        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#d32f2f' }}>
          当前组件数: {components.length} | 总创建数: {componentCount}
        </p>
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={() => createComponents(50)} 
            style={{ marginRight: '5px', marginBottom: '5px' }}
          >
            创建 50 个
          </button>
          <button 
            onClick={() => createComponents(100)} 
            style={{ marginRight: '5px', marginBottom: '5px' }}
          >
            创建 100 个
          </button>
          <button 
            onClick={() => createComponents(200)} 
            style={{ marginRight: '5px', marginBottom: '5px' }}
          >
            创建 200 个
          </button>
          <button 
            onClick={clearComponents}
            style={{ 
              background: '#f44336', 
              color: 'white',
              marginBottom: '5px'
            }}
          >
            清理所有组件
          </button>
        </div>
      </div>

      {/* 显示组件 */}
      {components.length > 0 && (
        <div style={{ 
          maxHeight: '300px', 
          overflow: 'auto', 
          background: '#fff', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #ddd'
        }}>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            显示组件（每个组件内部有 4 个 useMemoizedFn）:
          </p>
          {components.map((comp) => (
            <MemoizedComponent 
              key={comp.id} 
              id={comp.id}
              onAction={handleComponentAction}
            />
          ))}
        </div>
      )}

      {/* 泄露函数测试 */}
      <div style={{ 
        background: '#ffebee', 
        padding: '15px', 
        borderRadius: '4px',
        marginBottom: '15px'
      }}>
        <h3 style={{ fontSize: '16px', color: '#c62828' }}>⚠️ 内存泄露场景测试</h3>
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={createLeakyMemoizedFunctions}
            style={{ 
              background: '#f44336', 
              color: 'white',
              marginRight: '10px'
            }}
          >
            创建泄露函数（错误示例）
          </button>
          <span style={{ fontSize: '12px', color: '#666' }}>
            每次点击创建 500 个 memoized 函数并保存引用
          </span>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={() => setTrigger(prev => prev + 1)}
            style={{ 
              background: '#ff9800', 
              color: 'white',
              marginRight: '10px'
            }}
          >
            触发重新渲染（{renderCount} 次）
          </button>
          <span style={{ fontSize: '12px', color: '#666' }}>
            每次渲染都会创建新的 memoized 函数（错误用法）
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#d32f2f', marginTop: '10px' }}>
          泄露函数数量: {leakyFunctionsRef.current.length}
        </p>
      </div>

      {/* 测试说明 */}
      <div style={{ 
        background: '#e3f2fd', 
        padding: '15px', 
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <h3 style={{ marginTop: 0, fontSize: '14px' }}>测试说明：</h3>
        <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li><strong>正确用法</strong>：在组件顶层使用 useMemoizedFn，函数引用在组件生命周期内保持稳定</li>
          <li><strong>错误用法</strong>：在循环、effect 或每次渲染时创建 useMemoizedFn 并保存引用</li>
          <li><strong>内存泄露</strong>：大量使用 useMemoizedFn 且不清理会导致内存持续增长</li>
          <li><strong>测试方法</strong>：
            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
              <li>创建大量组件，观察内存增长</li>
              <li>清理组件后，检查内存是否下降</li>
              <li>在 Chrome DevTools Memory 面板查看堆快照</li>
              <li>使用 Performance 面板监控内存趋势</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default MemoizedFnLeakTest;
