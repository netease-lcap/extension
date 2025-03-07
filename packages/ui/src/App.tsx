
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppLayout } from './layouts';
import { ComponentApiEditor } from './views';
import { theme } from './styles/theme';

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <AppLayout>
        <ComponentApiEditor />
      </AppLayout>
    </ConfigProvider>
  )
}

export default App
