import { useState } from 'react';
import MemoryTest from './MemoryTest';

// 测试组件挂载和卸载时的内存清理
function ComponentMountTest() {
  const [showComponent, setShowComponent] = useState(false);
  const [mountCount, setMountCount] = useState(0);

  return (
    <div style={{ padding: '20px' }}>
      <h2>组件挂载/卸载测试</h2>
      <p>挂载次数: {mountCount}</p>
      <button 
        onClick={() => {
          setShowComponent(!showComponent);
          if (!showComponent) {
            setMountCount(c => c + 1);
          }
        }}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          marginBottom: '20px' 
        }}
      >
        {showComponent ? '卸载组件' : '挂载组件'}
      </button>
      
      {showComponent && (
        <div style={{ 
          border: '2px solid #4caf50', 
          padding: '15px', 
          borderRadius: '8px',
          background: '#f1f8e9'
        }}>
          <h3>已挂载的组件</h3>
          <MemoryTest />
        </div>
      )}
      
      {!showComponent && (
        <div style={{ 
          padding: '15px', 
          color: '#999',
          fontStyle: 'italic' 
        }}>
          组件已卸载，检查控制台查看清理日志
        </div>
      )}
    </div>
  );
}

export default ComponentMountTest;
