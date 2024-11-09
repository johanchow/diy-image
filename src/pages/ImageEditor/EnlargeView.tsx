import React, { useEffect, useRef } from 'react';
import { getVwPx } from '../../helpers/util';
import useImageEditorStore, { ImageEditorState } from '../../store';
import { Coordinate } from '../../typing';

const ViewWindowSize = 30 * getVwPx();
const EnlargeView: React.FC = (props) => {
  const canvasRef = useRef<any>();
  const originImage = useImageEditorStore((state: ImageEditorState) => state.touchImage);
  const touchPoint = useImageEditorStore((state: ImageEditorState) => state.touchPoint);
  const show: boolean = !!touchPoint && !!originImage;
  useEffect(() => {
    // canvasRef.current = new window.fabric.Canvas('enlarge-view', {
    //   width: getVwPx() * ViewWindowSize,
    //   height: getVwPx() * ViewWindowSize,
    // });
  }, []);
  useEffect(() => {
    if (originImage && touchPoint) {
      const [originX, originY] = touchPoint;
      const startX = Math.max(originX - ViewWindowSize / 2, 0);
      const startY = Math.max(originY - ViewWindowSize / 2, 0);
      console.log(startX, ' ', startY)
      const canvasCtx = canvasRef.current.getContext('2d');
      // 将原始图像的指定区域绘制到临时 canvas 上
      canvasCtx.drawImage(
        originImage.getElement(),         // 原始图像的 HTML 元素
        startX, startY, ViewWindowSize, ViewWindowSize,
        0, 0, ViewWindowSize, ViewWindowSize
      );
    }
  }, [originImage, touchPoint]);
  return (
    <div className={`enlarge-view ${show ? '' : 'hidden'}`}>
      <canvas ref={canvasRef} id="enlarge-canvas" width={ViewWindowSize} height={ViewWindowSize}></canvas>
    </div>
  );
};

export default EnlargeView;
