import { useState, useEffect } from 'react';

/**
 * 订阅/观察者模式内存泄露测试
 */
function SubscriptionLeakTest() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [eventCount, setEventCount] = useState(0);

  // 简单的 EventEmitter 实现
  class EventEmitter {
    constructor() {
      this.listeners = [];
    }
    
    subscribe(callback) {
      this.listeners.push(callback);
      return () => {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      };
    }
    
    emit(data) {
      this.listeners.forEach(callback => callback(data));
    }
  }

  const emitterRef = useState(() => new EventEmitter())[0];

  // ❌ 错误示例：订阅未取消
  const createLeakySubscription = () => {
    const callback = (data) => {
      setEventCount(prev => prev + 1);
      console.log('Event received:', data);
    };
    
    // 错误：订阅未保存取消函数
    emitterRef.subscribe(callback);
    setSubscriptions(prev => [...prev, callback]);
    console.log('创建泄露的订阅，当前数量:', subscriptions.length + 1);
  };

  // ✅ 正确示例：保存取消订阅函数
  const createCorrectSubscription = () => {
    const callback = (data) => {
      setEventCount(prev => prev + 1);
      console.log('Event received:', data);
    };
    
    const unsubscribe = emitterRef.subscribe(callback);
    setSubscriptions(prev => [...prev, { callback, unsubscribe }]);
    console.log('创建正确的订阅，当前数量:', subscriptions.length + 1);
  };

  const clearSubscriptions = () => {
    subscriptions.forEach(sub => {
      if (sub.unsubscribe) {
        sub.unsubscribe();
      }
    });
    setSubscriptions([]);
    setEventCount(0);
    console.log('已清理所有订阅');
  };

  const emitEvent = () => {
    emitterRef.emit({ timestamp: Date.now(), data: 'test' });
  };

  useEffect(() => {
    return () => {
      clearSubscriptions();
    };
  }, []);

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #f44336'
    }}>
      <h2 style={{ marginTop: 0, color: '#c62828' }}>7. 订阅/观察者模式内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：订阅未取消</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          订阅事件但未保存取消函数，导致订阅无法被清理。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            当前订阅数量: {subscriptions.length} | 事件触发次数: {eventCount}
          </p>
          <button
            onClick={createLeakySubscription}
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
            创建泄露的订阅
          </button>
          <button
            onClick={createCorrectSubscription}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            创建正确的订阅
          </button>
          <button
            onClick={emitEvent}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            触发事件
          </button>
          <button
            onClick={clearSubscriptions}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清理所有订阅
          </button>
        </div>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：保存取消订阅函数并清理</h3>
        <pre style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
{`useEffect(() => {
  const unsubscribe = emitter.subscribe((data) => {
    console.log(data);
  });
  
  return () => {
    unsubscribe(); // 组件卸载时取消订阅
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
          <li>创建多个订阅，观察内存增长</li>
          <li>触发事件会调用所有订阅的回调函数</li>
          <li>清理订阅后，内存应该下降</li>
          <li>在 React 组件中，应该在 useEffect 的清理函数中取消订阅</li>
        </ul>
      </div>
    </div>
  );
}

export default SubscriptionLeakTest;
