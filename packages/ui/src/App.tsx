import { useEffect } from 'react';
import { ConfigProvider, Modal, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppLayout } from './layouts';
import { ComponentApiEditor } from './views';
import { theme } from './styles/theme';
import { useProjectContextProvider, ProjectContext } from './hooks/useProjectContext'
import { HelpModal } from './components/HelpModal';
import { initMessage } from './utils/message';
import { onlyEditor } from './utils/env';
import { healthCheck } from './services/project';

function App() {
  const {
    helpModalVisible,
    helpSrc,
    closeHelpModal,
    ...projectContextValue
  } = useProjectContextProvider();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, contextHolder] = Modal.useModal();
  initMessage(messageApi, modal);

  useEffect(() => {
    const timer = setInterval(() => {
      healthCheck().then((res) => {
        if (!res) {
          clearInterval(timer);
          modal.confirm({
            title: 'API 服务未启动',
            content: '请重新执行项目中 play 命令后刷新页面',
            centered: true,
            onOk: () => {
              window.location.reload();
            },
            onClose: () => {
              window.location.reload();
            },
            onCancel: () => {
              window.location.reload();
            }
          });

          window.top?.postMessage({ from: 'lcap-api-editor', type: 'health-check-failed', data: null }, '*');
        }
      });
    }, 5000);
    return () => {
      clearInterval(timer);
    }
  }, []);


  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <ProjectContext.Provider value={projectContextValue as any}>
        <AppLayout hiddenHeader={onlyEditor}>
          <ComponentApiEditor hiddenPreview={onlyEditor} />
          {!onlyEditor && <HelpModal src={helpSrc} visible={helpModalVisible} onClose={closeHelpModal} />}
        </AppLayout>
      </ProjectContext.Provider>
      {messageContextHolder}
      {contextHolder}
    </ConfigProvider>
  )
}

export default App
