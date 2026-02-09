import { useState } from 'react';

/**
 * 闭包引用内存泄露测试
 */
function ClosureLeakTest() {
  const [handlers, setHandlers] = useState([]);
  const [handlerCount, setHandlerCount] = useState(0);

  const createLeakyHandler = () => {
    // ❌ 错误：闭包持有大对象的引用
    const bigData = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      value: Math.random(),
      data: new Array(100).fill(0).map(() => Math.random()),
    }));

    const handler = () => {
      console.log('Handler called, data length:', bigData.length);
      // 闭包持有 bigData 引用，导致 bigData 无法被 GC
    };

    setHandlers(prev => [...prev, handler]);
    setHandlerCount(prev => prev + 1);
    console.log('创建泄露的闭包处理器，当前数量:', handlerCount + 1);
  };

  const createCorrectHandler = () => {
    // ✅ 正确：只引用需要的数据
    const bigData = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      value: Math.random(),
      data: new Array(100).fill(0).map(() => Math.random()),
    }));

    const length = bigData.length; // 只保存需要的数据

    const handler = () => {
      console.log('Handler called, length:', length);
      // 闭包只持有基本类型，不持有大对象
    };

    setHandlers(prev => [...prev, handler]);
    setHandlerCount(prev => prev + 1);
    console.log('创建正确的处理器，当前数量:', handlerCount + 1);
  };

  const clearHandlers = () => {
    setHandlers([]);
    setHandlerCount(0);
    console.log('已清理所有处理器');
  };

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #f44336'
    }}>
      <h2 style={{ marginTop: 0, color: '#c62828' }}>2. 闭包引用内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：闭包持有大对象引用</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          闭包持有大对象的引用，即使函数没有被调用，大对象也无法被 GC。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            当前处理器数量: {handlerCount}
          </p>
          <button
            onClick={createLeakyHandler}
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
            创建泄露的处理器
          </button>
          <button
            onClick={clearHandlers}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清理所有处理器
          </button>
        </div>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：只引用需要的数据</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          只让闭包引用需要的数据（基本类型），而不是整个大对象。
        </p>
        <button
          onClick={createCorrectHandler}
          style={{
            padding: '10px 20px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          创建正确的处理器
        </button>
        <pre style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '13px',
          marginTop: '15px'
        }}>
{`function createHandler() {
  const bigData = new Array(1000000).fill(0);
  const length = bigData.length; // 只保存需要的数据
  return function() {
    console.log(length); // 闭包只持有基本类型
  };
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
          <li>创建泄露的处理器会持有大对象引用，观察内存增长</li>
          <li>创建正确的处理器只持有基本类型，内存占用更小</li>
          <li>清理处理器后，观察内存是否下降</li>
          <li>注意：如果处理器被保存到 state，它们会一直存在直到组件卸载</li>
        </ul>
      </div>
    </div>
  );
}

export default ClosureLeakTest;
