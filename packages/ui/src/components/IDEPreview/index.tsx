import { useEffect, useState } from 'react';
import { getProjectPreviewUrl } from '../../services/project';
const stop = (e: React.WheelEvent<HTMLIFrameElement>) => e.stopPropagation();

export const IDEPreview = () => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    getProjectPreviewUrl().then(setUrl);
  }, []);

  if (!url) {
    return <div />;
  }

  return (
    <iframe
      width="100%"
      onWheel={stop}
      onWheelCapture={stop}
      height="100%"
      style={{ border: 'none' }}
      src={url}
    />
  );
};

export default IDEPreview;
