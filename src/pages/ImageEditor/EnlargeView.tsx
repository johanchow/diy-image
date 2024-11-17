import React, { useEffect, useRef } from 'react';
import { getVwPx } from '../../helpers/util';
import useImageEditorStore, { ImageEditorState } from '../../store';
import { Coordinate } from '../../typing';
import { getScale } from '../../helpers/canvas';

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
      const projection = getScale(originImage);
      const [[originImageX, originImageY]] = transformPointCoordinate([touchPoint], projection);
      const startImageX = Math.max(originImageX - ViewWindowSize / 2, 0);
      const startImageY = Math.max(originImageY - ViewWindowSize / 2, 0);
      // 将原始图像的指定区域绘制到临时 canvas 上
      canvasCtx.drawImage(
        originImage.getElement(),         // 原始图像的 HTML 元素
        startImageX, startImageY, ViewWindowSize, ViewWindowSize,
        0, 0, ViewWindowSize, ViewWindowSize
      );
      const nowLine = transformPointCoordinate(line, projection, startImageX, startImageY);
      // 开始一段新的路径
      canvasCtx.beginPath();
      canvasCtx.lineWidth = 10;       // 设置线条宽度
      canvasCtx.strokeStyle = "#777"; // 设置线条颜色
      nowLine.forEach((point, index) => {
        const [x, y] = point;
        if (index === 0) {
          canvasCtx.moveTo(x, y); // 从前一个点开始
          console.log('2: ', x, ' ', y)
          return;
        }
        canvasCtx.lineTo(x, y);   // 画到新点
      });
      canvasCtx.stroke();
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

/*
 * 把canvas坐标点转换到原图(缩放前)坐标点
 * params:
 *   projection: 映射规则
 *    scale: 图片缩放比例
 *    offsetX: 图片缩放后居中放置在canvas中，水平两边距离canvas边线距离;
 *    offsetY: 竖直方向距离两边距离，和offsetX总会有个是0
 *   startX|startY: 原图边界。 放大图(Enlarge图)里面，只放大展示部分原图，所以二者会不等于0
 */
const transformPointCoordinate = (canvasPoints: Coordinate[], projection: {
  scale: number;
  offsetX: number;
  offsetY: number;
}, startX: number = 0, startY: number = 0): Coordinate[] => {
  const { scale, offsetX, offsetY } = projection;
  return canvasPoints.map(item => {
    const [canvasX, canvasY] = item;
    const [originImageX, originImageY]  = [(canvasX - offsetX) / scale, (canvasY - offsetY) / scale];
    const nowX = originImageX - startX >= 0 ? originImageX - startX : 0;
    const nowY = originImageY - startY >= 0 ? originImageY - startY : 0;
    return [nowX, nowY];
  });
};

export default EnlargeView;
