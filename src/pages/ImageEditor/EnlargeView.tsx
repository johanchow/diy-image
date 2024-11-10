import React, { useEffect, useRef } from 'react';
import { getVwPx } from '../../helpers/util';
import useImageEditorStore, { ImageEditorState } from '../../store';
import { Coordinate } from '../../typing';

const ViewWindowSize = 30 * getVwPx();
const EnlargeView: React.FC = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originImage = useImageEditorStore((state: ImageEditorState) => state.touchImage);
  const { current: touchPoint, history: line } = useImageEditorStore((state: ImageEditorState) => state.touchPoints);
  const show: boolean = !!touchPoint && !!originImage;
  useEffect(() => {
    const canvasCtx = canvasRef.current!.getContext('2d')!;
    // 设置线条样式
    canvasCtx.lineWidth = 10;
    canvasCtx.strokeStyle = "#777";
    canvasCtx.lineCap = "round"; // 线条结束样式
  }, []);
  useEffect(() => {
    const canvasCtx = canvasRef.current!.getContext('2d')!;
    if (originImage && touchPoint) {
      const [originX, originY] = touchPoint;
      const startX = Math.max(originX - ViewWindowSize / 2, 0);
      const startY = Math.max(originY - ViewWindowSize / 2, 0);
      console.log(startX, ' ', startY)
      // 将原始图像的指定区域绘制到临时 canvas 上
      canvasCtx.drawImage(
        originImage.getElement(),         // 原始图像的 HTML 元素
        startX, startY, ViewWindowSize, ViewWindowSize,
        0, 0, ViewWindowSize, ViewWindowSize
      );
      const nowLine = transformPointCoordinate(line, startX, startY);
      // 开始一段新的路径
      canvasCtx.beginPath();
      nowLine.forEach((point, index) => {
        const [x, y] = point;
        if (index === 0) {
          canvasCtx.moveTo(x, y); // 从前一个点开始
          return;
        }
        canvasCtx.lineTo(x, y);   // 画到新点
        canvasCtx.stroke();
      });
    } else {
      canvasCtx.clearRect(0, 0, ViewWindowSize, ViewWindowSize);
    }
  }, [originImage, touchPoint]);
  return (
    <div className={`enlarge-view ${show ? '' : 'hidden'}`}>
      <canvas ref={canvasRef} id="enlarge-canvas" width={ViewWindowSize} height={ViewWindowSize}></canvas>
    </div>
  );
};

const transformPointCoordinate = (points: Coordinate[], startX: number, startY: number): Coordinate[] => {
  return points.map(item => {
    const [originX, orignY] = item;
    const nowX = originX - startX >= 0 ? originX - startX : 0;
    const nowY = orignY - startY >= 0 ? orignY - startY : 0;
    return [nowX, nowY];
  });
};

export default EnlargeView;
