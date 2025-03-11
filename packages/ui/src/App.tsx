
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppLayout } from './layouts';
import { ComponentApiEditor } from './views';
import { theme } from './styles/theme';
import { useProjectContextProvider, ProjectContext } from './hooks/useProjectContext'
import { HelpModal } from './components/HelpModal';
function App() {
  const {
    helpModalVisible,
    helpSrc,
    closeHelpModal,
    ...projectContextValue
  } = useProjectContextProvider();

  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <ProjectContext.Provider value={projectContextValue}>
        <AppLayout>
          <ComponentApiEditor />
          <HelpModal src={helpSrc} visible={helpModalVisible} onClose={closeHelpModal} />
        </AppLayout>
      </ProjectContext.Provider>
    </ConfigProvider>
  )
}

export default App
