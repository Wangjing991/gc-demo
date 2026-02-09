import { useState } from 'react';

/**
 * 缓存未清理（Map/Set 无限增长）内存泄露测试
 */
function CacheLeakTest() {
  const [leakCache, setLeakCache] = useState(new Map());
  const [correctCache, setCorrectCache] = useState(new Map());
  const [leakCount, setLeakCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const MAX_CACHE_SIZE = 100;

  // ❌ 错误示例：缓存无限增长
  const addToLeakCache = () => {
    const newCache = new Map(leakCache);
    const key = `item-${Date.now()}-${Math.random()}`;
    const data = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      value: Math.random(),
      timestamp: Date.now(),
    }));
    newCache.set(key, data);
    setLeakCache(newCache);
    setLeakCount(newCache.size);
    console.log('添加到泄露缓存，当前大小:', newCache.size);
  };

  // ✅ 正确示例：限制缓存大小
  const addToCorrectCache = () => {
    const newCache = new Map(correctCache);
    const key = `item-${Date.now()}-${Math.random()}`;
    const data = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      value: Math.random(),
      timestamp: Date.now(),
    }));
    
    // 限制缓存大小
    if (newCache.size >= MAX_CACHE_SIZE) {
      const firstKey = newCache.keys().next().value;
      newCache.delete(firstKey);
    }
    
    newCache.set(key, data);
    setCorrectCache(newCache);
    setCorrectCount(newCache.size);
    console.log('添加到正确缓存，当前大小:', newCache.size);
  };

  const clearLeakCache = () => {
    setLeakCache(new Map());
    setLeakCount(0);
  };

  const clearCorrectCache = () => {
    setCorrectCache(new Map());
    setCorrectCount(0);
  };

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #f44336'
    }}>
      <h2 style={{ marginTop: 0, color: '#c62828' }}>10. 缓存未清理（Map/Set 无限增长）内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：缓存无限增长</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          缓存不断增长，从不清理，导致内存持续增长。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            泄露缓存大小: {leakCount}
          </p>
          <button
            onClick={addToLeakCache}
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
            添加到泄露缓存
          </button>
          <button
            onClick={clearLeakCache}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清理泄露缓存
          </button>
        </div>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：限制缓存大小或定期清理</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          限制缓存大小，当超过限制时删除最旧的条目。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
            正确缓存大小: {correctCount} / {MAX_CACHE_SIZE}
          </p>
          <button
            onClick={addToCorrectCache}
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
            添加到正确缓存
          </button>
          <button
            onClick={clearCorrectCache}
            style={{
              padding: '10px 20px',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清理正确缓存
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
{`const cache = new Map();
const MAX_CACHE_SIZE = 100;

function getData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  // 限制缓存大小
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  
  const data = fetchData(key);
  cache.set(key, data);
  return data;
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
          <li>不断添加数据到缓存，观察内存增长</li>
          <li>泄露缓存会无限增长，正确缓存会限制大小</li>
          <li>清理缓存后，内存应该下降</li>
          <li>可以使用 LRU 缓存库（如 lru-cache）实现更复杂的缓存策略</li>
        </ul>
      </div>
    </div>
  );
}

export default CacheLeakTest;
