import React, { createRoot } from 'react-dom/client'
import Editor, { startServer } from '../src/index.tsx';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { theme } from '../src/styles/theme';
import '../src/styles';

import('./router').then(({ httpInstance }) => {
  startServer(httpInstance);

  createRoot(document.getElementById('root')!).render(
    <ConfigProvider locale={zhCN} theme={theme}>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <Editor onOpenHelpModal={() => {}} />
      </div>
    </ConfigProvider>,
  );
});
