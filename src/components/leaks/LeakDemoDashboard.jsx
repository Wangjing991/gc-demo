import GlobalVariableLeakDemo from './GlobalVariableLeakDemo';
import ClosureLeakDemo from './ClosureLeakDemo';
import EventListenerLeakDemo from './EventListenerLeakDemo';
import TimerLeakDemo from './TimerLeakDemo';
import DomReferenceLeakDemo from './DomReferenceLeakDemo';
import UseMemoizedFnLeakDemo from './UseMemoizedFnLeakDemo';

// 汇总所有内存泄露场景的 Demo，分模块展示
function LeakDemoDashboard() {
  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <h1>JS 内存泄露场景 Demo（分模块）</h1>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
        本页面按照文档中的分类，分别实现了常见的几种 JavaScript 内存泄露场景，每个模块都有
        「错误示例」和「正确做法」对比，方便在 Chrome DevTools 中配合调试、观察内存变化。
      </p>

      <GlobalVariableLeakDemo />
      <ClosureLeakDemo />
      <EventListenerLeakDemo />
      <TimerLeakDemo />
      <DomReferenceLeakDemo /> 
      {/* <UseMemoizedFnLeakDemo /> */}
    </div>
  );
}

export default LeakDemoDashboard;

