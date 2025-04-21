import http from './services/http';
import { executeHandler } from './utils/socket';
import { APIEditor } from './views/ComponentApiEditor/APIEditor';
import { initMessage } from './utils/message';
import { useProjectContextProvider, ProjectContext } from './hooks/useProjectContext'
import { message, Modal } from 'antd';
import 'allotment/dist/style.css';

const Editor = ({ onOpenHelpModal }: { onOpenHelpModal: (url: string, key?: string) => void }) => {
  const {
    helpModalVisible,
    helpSrc,
    closeHelpModal,
    ...projectContextValue
  } = useProjectContextProvider(onOpenHelpModal);
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, contextHolder] = Modal.useModal();
  initMessage(messageApi, modal);

  return (
    <>
      <ProjectContext.Provider value={projectContextValue as any}>
        <APIEditor collapseEnable={false} />
      </ProjectContext.Provider>
      {messageContextHolder}
      {contextHolder}
    </>
  );
}

export function startServer(instance: any) {
  http.setInstance(instance);
  instance.executeHandler = executeHandler;
}

export default Editor;
