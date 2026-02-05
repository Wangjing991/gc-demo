import { useEffect, useRef, useState } from 'react';

// DOM 引用未清理导致的内存泄露示例
function DomReferenceLeakDemo() {
  const containerRef = useRef(null);
  const domRefsRef = useRef([]);
  const [domCount, setDomCount] = useState(0);

  const createDomLeak = (count = 500) => {
    if (!containerRef.current) return;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i += 1) {
      const el = document.createElement('div');
      el.textContent = `泄露 DOM 元素 ${domRefsRef.current.length + i + 1}`;
      el.style.padding = '2px 4px';
      el.style.fontSize = '11px';
      el.style.borderBottom = '1px solid #eee';
      fragment.appendChild(el);
      // ❌ 错误示例：把 DOM 元素引用存到数组里，长期不清理
      domRefsRef.current.push(el);
    }
    containerRef.current.appendChild(fragment);
    setDomCount(domRefsRef.current.length);
  };

  const clearDomLeak = () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    // ✅ 正确示例：清理数组中的 DOM 引用，让 GC 可以回收
    domRefsRef.current = [];
    setDomCount(0);
  };

  useEffect(
    () => () => {
      clearDomLeak();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>5. DOM 引用未清理导致的内存泄露</h3>
      <p style={{ fontSize: 12, color: '#666' }}>
        把大量 DOM 元素的引用保存在 JS 数组中，如果不及时清空，会阻止这些元素被回收。
      </p>
      <p style={{ fontSize: 14, fontWeight: 'bold', color: '#d32f2f' }}>
        当前保存的 DOM 引用数量：{domCount}
      </p>
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <button onClick={() => createDomLeak(200)} style={{ marginRight: 8 }}>
          创建 200 个 DOM 元素（泄露）
        </button>
        <button onClick={() => createDomLeak(1000)} style={{ marginRight: 8 }}>
          创建 1000 个 DOM 元素
        </button>
        <button
          onClick={clearDomLeak}
          disabled={domCount === 0}
          style={{ background: '#f44336', color: '#fff' }}
        >
          清理 DOM 引用
        </button>
      </div>
      <div
        ref={containerRef}
        style={{
          maxHeight: 200,
          overflow: 'auto',
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 4,
        }}
      />
    </div>
  );
}

export default DomReferenceLeakDemo;

