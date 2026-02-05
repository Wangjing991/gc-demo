import MemoizedFnLeakTest from '../MemoizedFnLeakTest';


// useMemoizedFn 误用导致的内存泄露示例（包装已有的深度测试组件）
function UseMemoizedFnLeakDemo() {

  return (
    <div style={{ marginBottom: 24 }} >
      <h3>6. useMemoizedFn 误用导致的内存泄露</h3>
      <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        下面的模块演示了多种 useMemoizedFn 相关的内存问题：大量 memoized 函数、闭包引用大数组、
        在循环 / effect 中创建函数等。
      </p>
      <MemoizedFnLeakTest />
    </div>
  );
}

export default UseMemoizedFnLeakDemo;

