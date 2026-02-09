import { useState } from 'react';
import { useRequest, useInterval, useEventListener, useUnmount } from 'ahooks';

/**
 * ahooks 内存管理测试
 */
function AhooksMemoryTest() {
  const [isIntervalActive, setIsIntervalActive] = useState(false);
  const [intervalCount, setIntervalCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  // ✅ useRequest 自动清理
  const { data: requestData, loading, run } = useRequest(
    async () => {
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

  // ✅ useInterval 自动清理
  useInterval(
    () => {
      setIntervalCount(c => c + 1);
    },
    isIntervalActive ? 1000 : null
  );

  // ✅ useEventListener 自动清理
  useEventListener('click', () => {
    setClickCount(c => c + 1);
  });

  // ✅ useUnmount 确保组件卸载时清理
  useUnmount(() => {
    console.log('组件卸载，清理资源');
  });

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #4caf50'
    }}>
      <h2 style={{ marginTop: 0, color: '#2e7d32' }}>ahooks 内存管理测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ useRequest（自动清理）</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          useRequest 会自动处理请求的取消和清理。
        </p>
        <button
          onClick={run}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: loading ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '请求中...' : '发起请求'}
        </button>
        {requestData && (
          <div style={{ marginTop: '10px', fontSize: '14px' }}>
            数据: {JSON.stringify(requestData)}
          </div>
        )}
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ useInterval（自动清理）</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          useInterval 会在组件卸载时自动清理定时器。
        </p>
        <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
          计数: {intervalCount}
        </p>
        <button
          onClick={() => setIsIntervalActive(!isIntervalActive)}
          style={{
            padding: '10px 20px',
            background: isIntervalActive ? '#f44336' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isIntervalActive ? '停止' : '开始'}
        </button>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ useEventListener（自动清理）</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          useEventListener 会在组件卸载时自动移除事件监听器。
        </p>
        <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
          点击计数: {clickCount}
        </p>
        <p style={{ fontSize: '12px', color: '#999' }}>
          点击页面任意位置会增加计数
        </p>
      </div>

      <div style={{
        padding: '15px',
        background: '#fff3cd',
        borderRadius: '6px',
        fontSize: '13px'
      }}>
        <strong>测试说明：</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>ahooks 提供的 Hooks 会自动处理清理工作</li>
          <li>组件卸载时，所有资源会自动清理</li>
          <li>无需手动管理定时器、事件监听器等资源</li>
          <li>这是推荐的最佳实践</li>
        </ul>
      </div>
    </div>
  );
}

export default AhooksMemoryTest;
