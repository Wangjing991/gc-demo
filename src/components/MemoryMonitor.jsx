import { useState, useEffect } from 'react';

/**
 * 实时内存监控组件
 * 显示当前内存使用情况
 */
function MemoryMonitor({ updateInterval = 1000 }) {
  const [memoryInfo, setMemoryInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const MAX_HISTORY = 50; // 最多保存50个历史记录

  const updateMemoryInfo = () => {
    if (performance.memory) {
      const info = {
        used: performance.memory.usedJSHeapSize / 1048576, // MB
        total: performance.memory.totalJSHeapSize / 1048576, // MB
        limit: performance.memory.jsHeapSizeLimit / 1048576, // MB
        timestamp: Date.now(),
      };
      
      setMemoryInfo(info);
      
      // 保存历史记录
      setHistory(prev => {
        const newHistory = [...prev, info];
        return newHistory.slice(-MAX_HISTORY);
      });
    }
  };

  useEffect(() => {
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, updateInterval);
    
    return () => clearInterval(interval);
  }, [updateInterval]);

  if (!performance.memory) {
    return (
      <div style={{
        padding: '15px',
        background: '#fff3cd',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ffc107'
      }}>
        <p style={{ margin: 0, color: '#856404' }}>
          ⚠️ 浏览器不支持 performance.memory API（仅 Chrome 支持）
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#856404' }}>
          请使用 Chrome 浏览器查看内存信息，或使用 Chrome DevTools Memory 面板
        </p>
      </div>
    );
  }

  const percentage = memoryInfo ? ((memoryInfo.used / memoryInfo.limit) * 100).toFixed(2) : 0;
  const usedMB = memoryInfo ? memoryInfo.used.toFixed(2) : '0';
  const totalMB = memoryInfo ? memoryInfo.total.toFixed(2) : '0';
  const limitMB = memoryInfo ? memoryInfo.limit.toFixed(2) : '0';

  // 计算内存趋势
  const getTrend = () => {
    if (history.length < 2) return 'stable';
    const recent = history.slice(-5);
    const first = recent[0].used;
    const last = recent[recent.length - 1].used;
    const diff = last - first;
    
    if (diff > 5) return 'increasing';
    if (diff < -5) return 'decreasing';
    return 'stable';
  };

  const trend = getTrend();
  const trendColor = trend === 'increasing' ? '#f44336' : trend === 'decreasing' ? '#4caf50' : '#2196f3';

  return (
    <div style={{
      padding: '20px',
      background: '#f5f5f5',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '2px solid #2196f3'
    }}>
      <h2 style={{ marginTop: 0, color: '#1976d2' }}>📊 实时内存监控</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>已使用内存</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
            {usedMB} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>MB</span>
          </div>
        </div>

        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>总堆内存</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
            {totalMB} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>MB</span>
          </div>
        </div>

        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>内存限制</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
            {limitMB} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>MB</span>
          </div>
        </div>

        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>使用率</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: percentage > 80 ? '#f44336' : '#2196f3' }}>
            {percentage}%
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e0e0e0',
            borderRadius: '4px',
            marginTop: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${percentage}%`,
              height: '100%',
              background: percentage > 80 ? '#f44336' : percentage > 60 ? '#ff9800' : '#4caf50',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* 内存趋势 */}
      {history.length >= 2 && (
        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '6px',
          marginTop: '15px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
            内存趋势: <span style={{ color: trendColor }}>
              {trend === 'increasing' ? '📈 增长中' : trend === 'decreasing' ? '📉 下降中' : '➡️ 稳定'}
            </span>
          </div>
          <div style={{
            height: '60px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '2px'
          }}>
            {history.slice(-20).map((item, index) => {
              const height = (item.used / memoryInfo.limit) * 100;
              return (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: `${height}%`,
                    background: trendColor,
                    borderRadius: '2px 2px 0 0',
                    minHeight: '2px'
                  }}
                  title={`${item.used.toFixed(2)} MB`}
                />
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <button
          onClick={updateMemoryInfo}
          style={{
            padding: '6px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          手动刷新
        </button>
        {window.gc && (
          <button
            onClick={() => {
              window.gc();
              setTimeout(updateMemoryInfo, 100);
            }}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fff3cd',
              cursor: 'pointer'
            }}
          >
            触发 GC
          </button>
        )}
        <span style={{ marginLeft: '10px', color: '#999' }}>
          更新间隔: {updateInterval}ms
        </span>
      </div>
    </div>
  );
}

export default MemoryMonitor;
