import { useState, useEffect, useRef } from 'react';

/**
 * WebSocket/EventSource 内存泄露测试
 */
function WebSocketLeakTest() {
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  // ❌ 错误示例：WebSocket 连接未关闭
  const createLeakyWebSocket = () => {
    try {
      // 注意：这里使用 wss://echo.websocket.org 作为测试端点
      // 实际项目中应该使用自己的 WebSocket 服务器
      const ws = new WebSocket('wss://echo.websocket.org');
      
      ws.onopen = () => {
        console.log('WebSocket 连接已打开');
        ws.send('Hello from leak test');
      };
      
      ws.onmessage = (event) => {
        setMessages(prev => [...prev, { type: 'websocket', data: event.data }]);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
      };
      
      // 错误：连接未关闭
      setConnections(prev => [...prev, ws]);
      console.log('创建泄露的 WebSocket 连接，当前数量:', connections.length + 1);
    } catch (error) {
      console.error('无法创建 WebSocket:', error);
      alert('WebSocket 连接失败，请检查网络或使用其他测试场景');
    }
  };

  // ✅ 正确示例：关闭连接
  useEffect(() => {
    try {
      const ws = new WebSocket('wss://echo.websocket.org');
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('正确的 WebSocket 连接已打开');
      };
      
      ws.onmessage = (event) => {
        setMessages(prev => [...prev, { type: 'correct', data: event.data }]);
      };
      
      // ✅ 正确：在组件卸载时关闭连接
      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    } catch (error) {
      console.error('无法创建 WebSocket:', error);
    }
  }, []);

  const clearLeakyConnections = () => {
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    setConnections([]);
    console.log('已清理泄露的 WebSocket 连接');
  };

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #f44336'
    }}>
      <h2 style={{ marginTop: 0, color: '#c62828' }}>8. WebSocket/EventSource 内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：WebSocket 连接未关闭</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          WebSocket 连接未关闭，导致内存泄露和资源浪费。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            当前连接数量: {connections.length}
          </p>
          <button
            onClick={createLeakyWebSocket}
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
            创建泄露的连接
          </button>
          <button
            onClick={clearLeakyConnections}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清理泄露的连接
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          注意：WebSocket 连接需要网络，如果连接失败是正常的
        </p>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：关闭连接</h3>
        <pre style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
{`useEffect(() => {
  const ws = new WebSocket('ws://example.com');
  ws.onmessage = (event) => {
    console.log(event.data);
  };
  
  return () => {
    ws.close(); // 组件卸载时关闭连接
  };
}, []);`}
        </pre>
      </div>

      {messages.length > 0 && (
        <div style={{
          maxHeight: '200px',
          overflow: 'auto',
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h4>消息记录（最近 10 条）:</h4>
          {messages.slice(-10).map((msg, index) => (
            <div key={index} style={{ fontSize: '12px', padding: '2px 0' }}>
              [{msg.type}] {msg.data}
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#fff3cd',
        borderRadius: '6px',
        fontSize: '13px'
      }}>
        <strong>测试说明：</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>创建多个 WebSocket 连接，观察内存和网络资源占用</li>
          <li>连接未关闭会导致内存泄露和资源浪费</li>
          <li>在 Chrome DevTools Network 面板中查看 WebSocket 连接</li>
          <li>EventSource 同样需要调用 close() 方法</li>
        </ul>
      </div>
    </div>
  );
}

export default WebSocketLeakTest;
