import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { startWatcherSocket } from './utils/socket';
import { onlyEditor } from './utils/env';
import './styles';
import 'allotment/dist/style.css';

startWatcherSocket();

createRoot(document.getElementById('root')!).render(
  <App />,
);

if (!onlyEditor) {
  // 增加离开页面确认
  window.onbeforeunload = () => {
    return '确定要离开当前页面吗？';
  };
} else {
  window.top?.postMessage({ from: 'lcap-api-editor', type: 'init', data: null }, '*');
}
