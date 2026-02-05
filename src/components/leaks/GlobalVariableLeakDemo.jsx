import { useState } from 'react';

// 全局变量内存泄露示例
function GlobalVariableLeakDemo() {
  const [size, setSize] = useState(0);

  const createGlobalLeak = (count = 100000) => {
    // ❌ 错误示例：把大数组挂在 window 上，成为长期存活的全局引用
    const bigArray = Array.from({ length: count }, (_, i) => ({
      id: i,
      value: Math.random(),
      data: new Array(50).fill(0).map(() => Math.random()),
    }));
    window.__globalLeakData__ = bigArray;
    setSize(count);
    // eslint-disable-next-line no-console
    console.log('已创建全局变量大数组，元素数量：', count);
  };

  const clearGlobalLeak = () => {
    // ✅ 正确示例：主动释放全局引用
    window.__globalLeakData__ = null;
    // 可以进一步删除属性
    try {
      delete window.__globalLeakData__;
    } catch {
      // 部分环境下 delete 可能失败，忽略即可
    }
    setSize(0);
    // eslint-disable-next-line no-console
    console.log('已清理全局变量大数组');
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>1. 全局变量导致的内存泄露</h3>
      <p style={{ fontSize: 12, color: '#666' }}>
        错误地把大对象挂在 <code>window</code> 上，会让它在整个应用生命周期内都无法被 GC。
      </p>
      <p style={{ fontSize: 14, fontWeight: 'bold', color: '#d32f2f' }}>
        当前全局大数组大小：{size > 0 ? `${size.toLocaleString()} 个元素` : '未创建'}
      </p>
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => createGlobalLeak(100000)}
          style={{ marginRight: 8 }}
        >
          创建 10 万元素的全局大数组（泄露）
        </button>
        <button
          onClick={() => createGlobalLeak(300000)}
          style={{ marginRight: 8 }}
        >
          创建 30 万元素的全局大数组（更严重）
        </button>
        <button
          onClick={clearGlobalLeak}
          disabled={size === 0}
          style={{ background: '#f44336', color: '#fff' }}
        >
          清理全局变量
        </button>
      </div>
    </div>
  );
}

export default GlobalVariableLeakDemo;

