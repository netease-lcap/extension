// import 'react-resizable/css/styles.css';
import classNames from 'classnames';
import { Resizable as ResizableBox } from 're-resizable';
import { useRef, useState, useMemo, useCallback } from 'react';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import { IconWindowed, IconCancelWindowed, IconClose } from '@/components/icons';
import Draggable from 'react-draggable';
import styles from './index.module.less';
import { Tooltip } from 'antd';

export interface HelpModalProps {
  visible?: boolean;
  src?: string;
  onClose?: () => void;
}

const defaultSrc = 'https://netease-lcap.github.io/extension/frontend/introduction.html';

export const HelpModal = ({ visible, src = defaultSrc, onClose }: HelpModalProps) => {
  const [isWindowed, setIsWindowed] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [resizing, setResizing] = useState(false);
  const [size, setSize] = useState({ width: 500, height: 510 });
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const draggleRef = useRef<HTMLDivElement>(null);

  const rootClassName = classNames(styles.helpModal, {
    [styles.hidden]: !visible,
    [styles.windowed]: isWindowed,
  });

  const toggleWindowed = () => {
    setIsWindowed(!isWindowed);

    if (!isWindowed) {
      setSize({ width: 500, height: 510 });
    }
  };

  const handleDragStart = useCallback((_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();

    if (!targetRect) {
      return;
    }

    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  }, []);

  const disableDrag = useMemo(() => {
    return disabled || !isWindowed;
  }, [disabled, isWindowed]);

  const handleResize = useCallback(
    (e: any, direction: any, p: any, d: any) => {
      setResizing(false);

      setSize({
        width: size.width + d.width,
        height: size.height + d.height,
      });
    },
    [size],
  );

  const content = (
    <div className={styles.content}>
      <iframe style={{ width: '100%', height: '100%', border: 'none' }} src={src} />
      {resizing && <div className={styles.contentOverlay} />}
    </div>
  );

  const Modal = (
    <div className={rootClassName} ref={draggleRef}>
      <div
        className={styles.header}
        onMouseOver={() => {
          if (disabled) {
            setDisabled(false);
          }
        }}
        onMouseOut={() => {
          setDisabled(true);
        }}
      >
        <div className={styles.title}>
          <span>帮助文档</span>
        </div>
        <div className={styles.actions}>
          <Tooltip title={isWindowed ? '取消窗口化' : '窗口化'}>
            <div className={styles.action} onClick={toggleWindowed}>
              {isWindowed ? <IconCancelWindowed /> : <IconWindowed />}
            </div>
          </Tooltip>
          <Tooltip title="关闭">
            <div className={styles.action} onClick={onClose}>
              <IconClose />
            </div>
          </Tooltip>
        </div>
      </div>
      {isWindowed ? (
        <ResizableBox
          size={{ width: size.width, height: size.height }}
          minWidth={360}
          minHeight={180}
          enable={{
            top: false,
            right: false,
            bottom: true,
            left: true,
            topRight: false,
            bottomRight: false,
            bottomLeft: true,
          }}
          maxHeight={window.innerHeight - 64}
          maxWidth={window.innerWidth - 64}
          onResizeStart={() => setResizing(true)}
          onResizeStop={handleResize}
        >
          {content}
        </ResizableBox>
      ) : (
        content
      )}
    </div>
  );

  if (!visible) {
    return null;
  }

  if (!isWindowed) {
    return Modal;
  }

  return (
    <>
      {resizing && <div className={styles.resizingOverlay} />}
      <Draggable disabled={disableDrag} bounds={bounds} nodeRef={draggleRef as any} onStart={handleDragStart}>
        {Modal}
      </Draggable>
    </>
  );
};
