import 'react-resizable/css/styles.css';
import { useRef, useState, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import { ResizableBox } from 'react-resizable';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import { IconWindowed, IconCancelWindowed, IconClose } from '../icons';
import styles from './index.module.less';

export interface HelpModalProps {
  visible?: boolean;
  src?: string;
  onClose?: () => void;
};
// const defaultSrc = `https://community.codewave.163.com/CommunityParent/fileIndex?filePath=40.%E6%89%A9%E5%B1%95%E4%B8%8E%E9%9B%86%E6%88%90%2F10.%E6%89%A9%E5%B1%95%E5%BC%80%E5%8F%91%E6%96%B9%E5%BC%8F%2F20.%E5%89%8D%E7%AB%AF%E6%89%A9%E5%B1%95%E5%BC%80%E5%8F%91%2F10.%E5%89%8D%E7%AB%AF%E6%89%A9%E5%B1%95%E5%BC%80%E5%8F%91%E6%A6%82%E8%BF%B0.md&version=3.13`;
const defaultSrc = 'https://netease-lcap.github.io/extension/frontend/introduction.html';
export const HelpModal = ({ visible, src = defaultSrc, onClose }: HelpModalProps) => {
  const [isWindowed, setIsWindowed] = useState(false);
  const [disabled, setDisabled] = useState(true);
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

  const handleResize = useCallback((event: any, data: any) => {
    setSize({
      width: data.size.width,
      height: data.size.height,
    });
  }, []);

  const content = (
    <div className={styles.content}>
      <iframe style={{ width: '100%', height: '100%', border: 'none' }} src={src} />
    </div>
  );

  const Modal = (
    <div
      className={rootClassName}
      ref={draggleRef}
    >
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
          <div className={styles.action} onClick={toggleWindowed}>
            { isWindowed ? <IconCancelWindowed /> : <IconWindowed /> }
          </div>
          <div className={styles.action} onClick={onClose}>
            <IconClose />
          </div>
        </div>
      </div>
      {isWindowed ? (
        <ResizableBox
          width={size.width}
          height={size.height}
          minConstraints={[360, 180]}
          maxConstraints={[window.innerWidth - 64, window.innerHeight - 64]}
          onResize={handleResize}
          resizeHandles={['sw']}
        >
          {content}
        </ResizableBox>
      ) : (
        content
      )}
    </div>
  );

  if (!isWindowed) {
    return Modal;
  }

  return (
    <Draggable
      disabled={disableDrag}
      bounds={bounds}
      nodeRef={draggleRef as any}
      onStart={handleDragStart}
    >
      {Modal}
    </Draggable>
  );
}
