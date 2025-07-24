import React, { createRoot } from 'react-dom/client'
import Editor, { startServer } from '../src/index.tsx';
import '../src/styles';

import('./router').then(({ httpInstance }) => {
  startServer(httpInstance);

  createRoot(document.getElementById('root')!).render(
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Editor onOpenHelpModal={() => {}} />
    </div>,
  );
});
