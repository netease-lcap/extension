import { useRef, useCallback } from 'react';
import { Allotment, AllotmentHandle } from 'allotment';
import { useToggle } from '../../hooks';
import { APIEditor } from './APIEditor';
import { IDEPreview } from '../../components';

export interface ComponentApiEditorProps {
  hiddenPreview?: boolean;
}

const defaultSidebarSize = 500;
const listPanelWidth = 180;
const viewPanelWidth = Math.max(window.innerWidth, 1200);
const defaultLayoutSizes = [defaultSidebarSize, viewPanelWidth - defaultSidebarSize];

export const ComponentApiEditor = ({ hiddenPreview = false }: ComponentApiEditorProps) => {
  const [collapsed, toggleCollapsed] = useToggle(false);
  const layoutRef = useRef<AllotmentHandle>(null);
  const sidebarSizeRef = useRef<number>(defaultSidebarSize);

  const handleLayoutChange = useCallback((sizes: number[]) => {
    if (sizes[0] < defaultSidebarSize && !collapsed) {
      toggleCollapsed();
    }

    sidebarSizeRef.current = sizes[0];
  }, [collapsed, toggleCollapsed]);

  const handleToggleCollapsed = useCallback(() => {
    toggleCollapsed();
    const sidebarSize = collapsed ? sidebarSizeRef.current + listPanelWidth : sidebarSizeRef.current - listPanelWidth;
    layoutRef.current?.resize([sidebarSize, viewPanelWidth - sidebarSize]);
  }, [collapsed]);

  if (hiddenPreview) {
    return <APIEditor collapseEnable={false} collapsed={collapsed} toggleCollapsed={handleToggleCollapsed} />;
  }

  return (
    <Allotment ref={layoutRef} defaultSizes={defaultLayoutSizes} separator={false} onChange={handleLayoutChange}>
      <Allotment.Pane minSize={320}>
        <APIEditor collapsed={collapsed} toggleCollapsed={handleToggleCollapsed} />
      </Allotment.Pane>
      <Allotment.Pane minSize={204}>
        <IDEPreview />
      </Allotment.Pane>
    </Allotment>
  );
};

export default ComponentApiEditor;
