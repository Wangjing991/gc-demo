import { useState } from 'react';
import MemoryMonitor from './MemoryMonitor';
import GlobalVariableLeakTest from './tests/GlobalVariableLeakTest';
import ClosureLeakTest from './tests/ClosureLeakTest';
import EventListenerLeakTest from './tests/EventListenerLeakTest';
import TimerLeakTest from './tests/TimerLeakTest';
import DomReferenceLeakTest from './tests/DomReferenceLeakTest';
import SubscriptionLeakTest from './tests/SubscriptionLeakTest';
import WebSocketLeakTest from './tests/WebSocketLeakTest';
import ObserverLeakTest from './tests/ObserverLeakTest';
import CacheLeakTest from './tests/CacheLeakTest';
import PromiseLeakTest from './tests/PromiseLeakTest';
import AnimationFrameLeakTest from './tests/AnimationFrameLeakTest';
import WorkerLeakTest from './tests/WorkerLeakTest';
import MediaResourceLeakTest from './tests/MediaResourceLeakTest';
import ReactHooksMemoryTest from './tests/ReactHooksMemoryTest';
import AhooksMemoryTest from './tests/AhooksMemoryTest';

/**
 * React 内存测试主组件
 * 展示各种内存泄露场景和正确的处理方式
 */
function ReactMemoryTest() {
  const [activeTest, setActiveTest] = useState('monitor');

  const testCategories = [
    { id: 'monitor', name: '内存监控', component: null },
    { id: 'global', name: '1. 全局变量泄露', component: GlobalVariableLeakTest },
    { id: 'closure', name: '2. 闭包引用泄露', component: ClosureLeakTest },
    { id: 'event', name: '3. 事件监听器泄露', component: EventListenerLeakTest },
    { id: 'timer', name: '4. 定时器泄露', component: TimerLeakTest },
    { id: 'dom', name: '5. DOM 引用泄露', component: DomReferenceLeakTest },
    { id: 'subscription', name: '7. 订阅/观察者泄露', component: SubscriptionLeakTest },
    { id: 'websocket', name: '8. WebSocket 泄露', component: WebSocketLeakTest },
    { id: 'observer', name: '9. Observer 泄露', component: ObserverLeakTest },
    { id: 'cache', name: '10. 缓存泄露', component: CacheLeakTest },
    { id: 'promise', name: '11. Promise 链泄露', component: PromiseLeakTest },
    { id: 'animation', name: '12. requestAnimationFrame 泄露', component: AnimationFrameLeakTest },
    { id: 'worker', name: '13. Worker 泄露', component: WorkerLeakTest },
    { id: 'media', name: '14. 媒体资源泄露', component: MediaResourceLeakTest },
    { id: 'react-hooks', name: 'React Hooks 内存管理', component: ReactHooksMemoryTest },
    { id: 'ahooks', name: 'ahooks 内存管理', component: AhooksMemoryTest },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginTop: 0, color: '#1976d2' }}>React 内存管理测试</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        基于文档《JavaScript 内存回收机制详解》的 React 内存测试示例
      </p>

      {/* 内存监控 */}
      <MemoryMonitor updateInterval={1000} />

      {/* 测试导航 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '30px',
        padding: '15px',
        background: '#f9f9f9',
        borderRadius: '8px'
      }}>
        {testCategories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveTest(category.id)}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: activeTest === category.id ? '#2196f3' : 'white',
              color: activeTest === category.id ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* 测试内容 */}
      <div style={{ minHeight: '400px' }}>
        {activeTest === 'monitor' ? (
          <div style={{
            padding: '30px',
            background: '#e3f2fd',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2>选择上方的测试场景开始测试</h2>
            <p style={{ color: '#666' }}>
              每个测试场景都包含错误示例和正确示例的对比，可以观察内存变化
            </p>
          </div>
        ) : (
          (() => {
            const category = testCategories.find(c => c.id === activeTest);
            const Component = category?.component;
            return Component ? <Component /> : <div>测试组件未找到</div>;
          })()
        )}
      </div>
    </div>
  );
}

export default ReactMemoryTest;
