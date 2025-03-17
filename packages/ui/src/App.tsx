
import { ConfigProvider, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppLayout } from './layouts';
import { ComponentApiEditor } from './views';
import { theme } from './styles/theme';
import { useProjectContextProvider, ProjectContext } from './hooks/useProjectContext'
import { HelpModal } from './components/HelpModal';
import { initMessage } from './utils/message';
import json5 from 'json5';

window.json5 = json5;

function App() {
  const {
    helpModalVisible,
    helpSrc,
    closeHelpModal,
    ...projectContextValue
  } = useProjectContextProvider();
  const [messageApi, messageContextHolder] = message.useMessage();
  initMessage(messageApi);

  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <ProjectContext.Provider value={projectContextValue as any}>
        <AppLayout>
          <ComponentApiEditor />
          <HelpModal src={helpSrc} visible={helpModalVisible} onClose={closeHelpModal} />
        </AppLayout>
      </ProjectContext.Provider>
      {messageContextHolder}
    </ConfigProvider>
  )
}

export default App
