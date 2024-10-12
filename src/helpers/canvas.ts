// @ts-ignore
import convexHull from 'convex-hull';
import type { Coordinate, BoundingBox } from "../typing";

// 计算缩放比例
export const getScale = (img: fabric.Image, canvas: fabric.Canvas): number => {
  const canvasWidth = canvas.width!;
  const canvasHeight = canvas.height!;

  // 获取图片的原始宽高
  const imgWidth = img.width!;
  const imgHeight = img.height!;

  // 计算缩放比例
  const scaleX = canvasWidth / imgWidth;
  const scaleY = canvasHeight / imgHeight;

  // 选择较小的缩放比例，确保图片完整显示
  const scale = Math.min(scaleX, scaleY);

  return scale;
}

// 使用算法从很多坐标点提取出外边多边形顶点坐标
export const extractPolygonPoints = (points: Coordinate[]): Coordinate[] => {
  console.log('coordinates: ', points);
  // 使用 convex-hull 凸包算法简化成多边形
  const edges: Array<[number, number]> = convexHull(points);
  let vertexIndexSet = new Set<number>(); // 顶点的索引集合
  edges.forEach(edge => {
    vertexIndexSet.add(edge[0]);
    vertexIndexSet.add(edge[1]);
  });
  const canvasCoordinates: Coordinate[] = Array.from(vertexIndexSet).map((index: number) => points[index]);
  console.log('canvasCoordinates: ', canvasCoordinates);
  return canvasCoordinates;
};

export const calculateBoundingBox = (points: Coordinate[]): BoundingBox => {
  // 计算边界框
  const minX = Math.min(...points.map(p => p[0]));
  const maxX = Math.max(...points.map(p => p[0]));
  const minY = Math.min(...points.map(p => p[1]));
  const maxY = Math.max(...points.map(p => p[1]));
  const boundingBox: BoundingBox = {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY
  };
  return boundingBox;
};

// 方法：将 fabric canvas 坐标转换为图片的原始坐标
export const convertCanvasToImageCoordinates = (
  canvasCoordinates: Coordinate[],
  img: fabric.Image,
  canvas: fabric.Canvas,
): Coordinate[] => {
  return canvasCoordinates.map((c) => {
    const [ canvasX, canvasY ] = c;
    // 获取 canvas 大小
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;

    // 获取图片的原始宽高
    const imgWidth = img.width!;
    const imgHeight = img.height!;
    const scale = getScale(img, canvas);

    // // 计算缩放比例
    // const scaleX = canvasWidth / imgWidth;
    // const scaleY = canvasHeight / imgHeight;

    // // 选择较小的缩放比例，确保图片完整显示
    // const scale = Math.min(scaleX, scaleY);

    // // 获取图片在 canvas 上的偏移
    // const leftOffset = (canvasWidth - img.getScaledWidth()) / 2;
    // const topOffset = (canvasHeight - img.getScaledHeight()) / 2;
    const leftOffset = (canvasWidth - imgWidth * scale) / 2;
    const topOffset = (canvasHeight - imgHeight * scale) / 2;
    console.log('convert: ', leftOffset, ', ', topOffset, ', ', scale);

 //    // 转换 canvas 坐标到图片坐标
    const imgX = (canvasX - leftOffset) / scale; // 将 canvasX 减去图片的左边距并除以缩放比例
    const imgY = (canvasY - topOffset) / scale; // 将 canvasY 减去图片的上边距并除以缩放比例

    return [imgX, imgY];
  });
};

export const clearCanvasPath = (canvas: fabric.Canvas) => {
  canvas.getObjects('path').forEach((path) => {
    canvas.remove(path);  // 使用 fabric.js 的 remove() 方法移除涂鸦路径
  });
  canvas.renderAll();  // 渲染 canvas
};

export const convertCanvasImageToFile = (img: fabric.Image) => {
  // 将 fabric.Image 转换为 Data URL (base64)
    const dataURL = img.toDataURL({
      format: 'png',
      quality: 1
  });

  // Data URL 转换为 Blob 对象
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }
  const blob = new Blob([u8arr], { type: mime });

  // 创建 File 对象
  const file = new File([blob], 'image.png', { type: blob.type });
  return file;
};

