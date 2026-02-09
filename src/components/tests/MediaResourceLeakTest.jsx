import { useState, useEffect } from 'react';

/**
 * 图片/媒体资源未释放内存泄露测试
 */
function MediaResourceLeakTest() {
  const [images, setImages] = useState([]);
  const [imageCount, setImageCount] = useState(0);

  // ❌ 错误示例：图片资源未释放
  const createLeakyImage = () => {
    const img = new Image();
    img.src = `https://picsum.photos/200/200?random=${Date.now()}`;
    img.onload = () => {
      console.log('图片加载完成');
    };
    // 错误：图片对象未释放
    setImages(prev => [...prev, img]);
    setImageCount(prev => prev + 1);
    console.log('创建泄露的图片，当前数量:', imageCount + 1);
  };

  // ✅ 正确示例：清理图片引用
  useEffect(() => {
    const img = new Image();
    img.src = 'https://picsum.photos/200/200';
    img.onload = () => {
      console.log('正确的图片加载完成');
    };
    
    // ✅ 正确：清理图片引用
    return () => {
      img.src = ''; // 清空 src，释放资源
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  const clearLeakyImages = () => {
    images.forEach(img => {
      img.src = '';
      img.onload = null;
      img.onerror = null;
    });
    setImages([]);
    setImageCount(0);
    console.log('已清理泄露的图片');
  };

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      border: '2px solid #f44336'
    }}>
      <h2 style={{ marginTop: 0, color: '#c62828' }}>14. 图片/媒体资源未释放内存泄露测试</h2>
      
      <div style={{
        padding: '15px',
        background: '#ffebee',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>❌ 错误示例：图片资源未释放</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          图片对象未释放，导致图片资源无法被 GC。
        </p>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
            当前图片数量: {imageCount}
          </p>
          <button
            onClick={createLeakyImage}
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
            创建泄露的图片
          </button>
          <button
            onClick={clearLeakyImages}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清理泄露的图片
          </button>
        </div>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ 正确示例：清理图片引用</h3>
        <pre style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
{`useEffect(() => {
  const img = new Image();
  img.src = 'large-image.jpg';
  img.onload = () => {
    // 使用图片
  };
  
  return () => {
    img.src = ''; // 清空 src，释放资源
    img.onload = null;
    img.onerror = null;
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
          <li>创建多个图片对象，观察内存增长</li>
          <li>图片资源未释放会导致内存泄露</li>
          <li>清理图片引用后，内存应该下降</li>
          <li>视频元素同样需要清理（pause、src=''、load()）</li>
        </ul>
      </div>
    </div>
  );
}

export default MediaResourceLeakTest;
