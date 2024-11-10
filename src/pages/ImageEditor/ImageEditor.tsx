import React, { useCallback, useEffect, useRef, useState } from 'react';
import useUndo from 'use-undo';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { calculateBoundingBox, extractPolygonPoints, convertCanvasToImageCoordinates, clearCanvasPath, putImageAspectRatioToCanvas, getScale } from '../../helpers/canvas';
import useImageEditorStore, { ImageEditorState } from '../../store';
import { getVwPx, loadJsScript } from '../../helpers/util';
import { requestEraseGenerationImage, requestCopyToGenerationImage, requestSaveGenerationImage } from '../../helpers/request';
import { WebHost } from '../../helpers/config';
import EnlargeView from './EnlargeView';
import Loading from '../../components/Loading/Loading';
import type { BoundingBox, Coordinate } from '../../typing';
import EraserIcon from '../../assets/eraser-solid.svg';
import CopyIcon from '../../assets/copy-solid.svg';
import SureIcon from '../../assets/check-solid.svg';
import CancelIcon from '../../assets/xmark-solid.svg';
import UndoIcon from '../../assets/rotate-left-solid.svg';
import RedoIcon from '../../assets/rotate-right-solid.svg';
import DeleteLeftIcon from '../../assets/delete-left-solid.svg';
import './ImageEditor.scss';
import 'swiper/scss';
import 'swiper/scss/navigation';

type ImageEditorProps = {
  /* 编辑图片id */
  generationImageId: string;
  /* 编辑图片url */
  generationImageUrl: string;
  /* 原图id */
  sourceImageId: string;
  /* 原图url */
  sourceImageUrl: string;
};

enum EditorStatus {
  None = 'none',
  Eraser = 'eraser',
  Copy = 'copy',
};
enum CanvasPlace {
  Source = 'source',
  Generation = 'generation',
};

const line: Coordinate[] = [];
const fabricPromise = loadJsScript(`//${WebHost}/libs/fabric.js`);
function ImageEditor(props: ImageEditorProps) {
  const { generationImageId, sourceImageId, generationImageUrl, sourceImageUrl } = props;
  const [editorStatus, setEditorStatus] = useState<EditorStatus>(EditorStatus.None);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sourceCanvasRef = useRef<fabric.Canvas>();
  const generationCanvasRef = useRef<fabric.Canvas>();
  const sourceImageRef = useRef<fabric.Image>();
  const generationImageRef = useRef<fabric.Image>();
  const selectedSourceImagePolygon = useRef<{
    coordinates: Coordinate[];
    boundingBox: BoundingBox;
  }>();
  const swiperInstance = useRef<SwiperClass>();
  const [
    generationBlobUrlState,
    {
      set: setGenerationBlobUrl,
      reset: resetGenerationBlobUrl,
      undo: undoGenerationBlobUrl,
      redo: redoGenerationBlobUrl,
    },
  ] = useUndo<string>('');
  const updateTouchImage = useImageEditorStore((state: ImageEditorState) => state.updateTouchImage);
  const updateTouchPoints = useImageEditorStore((state: ImageEditorState) => state.updateTouchPoints);
  const { present: generationBlobUrl, past, future } = generationBlobUrlState;
  useEffect(() => {
    console.log('generationImageUrl: ', generationImageUrl);
    console.log('sourceImageUrl: ', sourceImageUrl);
    if (generationImageUrl) {
      init().then(() => {
        window.fabric.Image.fromURL(sourceImageUrl, (image) => {
          sourceImageRef.current = image;
          image.clone((imageCloned: fabric.Image) => {
            putImageAspectRatioToCanvas(imageCloned, sourceCanvasRef.current!)
          });
        });
      });
    }
  }, [generationImageUrl, sourceImageUrl]);
  useEffect(() => {
    // 如果是空，说明是初始化/重置，展示props.generationImageUrl
    const showUrl = generationBlobUrl || generationImageUrl;
    init().then(() => {
      window.fabric.Image.fromURL(showUrl, (image) => {
        generationImageRef.current = image;
        image.clone((imageCloned: fabric.Image) => {
          putImageAspectRatioToCanvas(imageCloned, generationCanvasRef.current!)
        });
      });
    });
  }, [generationBlobUrl]);
  useEffect(() => {
    if (editorStatus !== EditorStatus.Eraser) {
      swiperInstance.current?.slideTo(1);
    }
    if (editorStatus === EditorStatus.Eraser) {
      openDrawingMode(generationCanvasRef.current!, generationImageRef.current!,
        viewEraseEffect, (event, line: Coordinate[]) => onDrawing(CanvasPlace.Generation, event, line), onDrawEnd);
    } else if (editorStatus === EditorStatus.Copy) {
      openDrawingMode(sourceCanvasRef.current!, sourceImageRef.current!,
        markSourceImage, (event, line: Coordinate[]) => onDrawing(CanvasPlace.Source, event, line), onDrawEnd);
      openDrawingMode(generationCanvasRef.current!, generationImageRef.current!,
        viewCopyEffect, (event, line: Coordinate[]) => onDrawing(CanvasPlace.Generation, event, line), onDrawEnd);
    } else {
      closeDrawingMode(generationCanvasRef.current!);
    }
  }, [editorStatus, generationBlobUrl]);
  const init = async () => {
    await fabricPromise;
    console.log('.....init......: ', window.fabric.Canvas);
    if (!sourceCanvasRef.current) {
      sourceCanvasRef.current = new window.fabric.Canvas('source-canvas', {
        width: getVwPx() * 85,
        height: getVwPx() * 85 * 1.3333333,
        // isDrawingMode: true
      });
      sourceCanvasRef.current.freeDrawingBrush = new window.fabric.PencilBrush(sourceCanvasRef.current);
    }
    if (!generationCanvasRef.current) {
      generationCanvasRef.current = new window.fabric.Canvas('generation-canvas', {
        width: getVwPx() * 85,
        height: getVwPx() * 85 * 1.3333333,
      });
      generationCanvasRef.current.freeDrawingBrush = new window.fabric.PencilBrush(generationCanvasRef.current);
    }
  };
  const saveNewImage = async () => {
    if (!generationImageRef.current) {
      return;
    }
    setIsLoading(true);
    await requestSaveGenerationImage(generationImageId, generationImageRef.current);
    setIsLoading(false);
    setEditorStatus(EditorStatus.None);
  };
  const cancelEditing = () => {
    setEditorStatus(EditorStatus.None);
    resetGenerationBlobUrl('');
  };
  const undoEditing = () => {
    undoGenerationBlobUrl();
  };
  const redoEditing = () => {
    redoGenerationBlobUrl();
  };
  const goPageBack = () => {
    console.log('click goPageBack');
    // 关闭webview
    window.uni.reLaunch({
      url: '/pages/history/history'
    });
  };
  const viewEraseEffect = useCallback(async (points: Coordinate[], boundingBox: BoundingBox): Promise<boolean> => {
    console.log('generation state: ', generationBlobUrlState);
    setIsLoading(true);
    const blobUrl = await requestEraseGenerationImage(
      generationImageUrl,
      past.length > 0 ? generationImageRef.current! : null,
      points, boundingBox,
    );
    setIsLoading(false);
    setGenerationBlobUrl(blobUrl);
    return true;
  }, [past]);
  const viewCopyEffect = useCallback(async (points: Coordinate[], boundingBox: BoundingBox): Promise<boolean> => {
    if (!selectedSourceImagePolygon.current) {
      alert('请先在原图中选中复制区域');
      return false;
    }
    const { coordinates: sourceCoordinates, boundingBox: sourceBoundingBox } = selectedSourceImagePolygon.current!;
    setIsLoading(true);
    const blobUrl = await requestCopyToGenerationImage(
      generationImageUrl,
      past.length > 0 ? generationImageRef.current! : null,
      points, boundingBox,
      sourceImageUrl,
      sourceCoordinates, sourceBoundingBox
    );
    setIsLoading(false);
    setGenerationBlobUrl(blobUrl);
    // 清空原图圈选，准备后面继续圈
    clearSourceImage();
    return true;
  }, [past]);
  const markSourceImage = async (points: Coordinate[], boundingBox: BoundingBox) => {
    selectedSourceImagePolygon.current = {
      coordinates: points,
      boundingBox,
    };
    return true;
  };
  const onDrawing = async (place: CanvasPlace, event: any, line: Coordinate[]) => {
    const canvasRef = place === CanvasPlace.Generation
      ? generationCanvasRef.current!
      : sourceCanvasRef.current!
    const originalImage = place === CanvasPlace.Generation
      ? generationImageRef.current
      : sourceImageRef.current
    const scale = canvasRef.getZoom();
    const { x: touchX, y: touchY } = event.pointer!;
    updateTouchImage(originalImage);
    updateTouchPoints({
      current: [touchX / scale, touchY / scale],
      history: line.map(point => [point[0] / scale, point[1] / scale]),
    });
  };
  const onDrawEnd = async () => {
    updateTouchImage(undefined);
    updateTouchPoints({
      current: undefined,
      history: [],
    });
  };
  const clearSourceImage = () => {
    selectedSourceImagePolygon.current = undefined;
    clearCanvasPath(sourceCanvasRef.current!);
  }
  return (
    <div className='page-wrapper'>
      <div className='page-back'>
        <img src={DeleteLeftIcon} alt='' onClick={goPageBack} />
      </div>
      <section className='image-list'>
        <div className='image-preview'>
          {
            editorStatus === EditorStatus.Eraser ? (
              <div className='editor-title-wrapper'>
                <span className='editor-title'>擦除</span>
                <span className='editor-desc'>涂画圈选希望清除的区域</span>
              </div>
            ) : (editorStatus === EditorStatus.Copy ? (
              <div className='editor-title-wrapper'>
                <span className='editor-title'>拷贝</span>
                <span className='editor-desc'>先从原服装图圈选希望保留区域，再到下面试穿图涂画圈选目标区域</span>
              </div>
            ) : <></>)
          }
          <Swiper
            // install Swiper modules
            modules={[Navigation]}
            spaceBetween={10}
            slidesPerView={1}
            navigation={editorStatus === EditorStatus.Copy}
            onSwiper={(swiper: SwiperClass) => swiperInstance.current = swiper}
            allowTouchMove={false}
          >
            <SwiperSlide>
              <div className={`image-wrapper source-image`}>
                <span className='image-title'>原服装图</span>
                <div className='canvas-wrapper'>
                  <canvas id="source-canvas"></canvas>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className='image-wrapper now-image'>
                <span className='image-title'>试穿图</span>
                <div className='canvas-wrapper'>
                  <canvas id="generation-canvas"></canvas>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
          <EnlargeView />
        </div>
      </section>
      {
        editorStatus === EditorStatus.None ?
          <section className='editor-tool'>
            <div className='editor-tool-item' onClick={() => setEditorStatus(EditorStatus.Eraser)}>
              <img src={EraserIcon} alt="" />
              <span>擦除</span>
            </div>
            <div className='editor-tool-item' onClick={() => setEditorStatus(EditorStatus.Copy)}>
              <img src={CopyIcon} alt="" />
              <span>从原图拷贝</span>
            </div>
          </section>
          :
          <section className='editor-decision'>
            <div className='editor-cancel-btn' onClick={cancelEditing}>
              <img src={CancelIcon} alt='' />
            </div>
            <div className='editor-undo-redo-btn'>
              <img src={UndoIcon} alt='' onClick={undoEditing}
                style={{visibility: past.length > 0 ? 'inherit' : 'hidden'}} />
              <img src={RedoIcon} alt='' onClick={redoEditing}
                style={{visibility: future.length > 0 ? 'inherit' : 'hidden'}} />
            </div>
            <div className='editor-save-btn' onClick={saveNewImage}>
              <img src={SureIcon} alt='' />
            </div>
          </section>
      }
      <Loading isLoading={isLoading} />
      </div>
  );
}

const openDrawingMode = (
  canvas: fabric.Canvas,
  image: fabric.Image,
  viewEffect: (polygonPoints: Coordinate[], boundingBox: BoundingBox) => Promise<boolean>,
  onPlaceDrawing: (event: any, line: Coordinate[]) => void,
  onPlaceDrawEnd: () => void
) => {
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush!.width = 10;  // 设置画笔的宽度
  canvas.freeDrawingBrush!.color = '#777';  // 设置画笔颜色
  canvas.off('path:created');
  canvas.on('path:created', async (event: any) => {
    // 获取绘制的路径对象
    const path = event.path;
    // 获取路径的坐标点
    const pathData = path.path;
    console.log('pathData: ', pathData);
    const coordinates: Array<[number, number]> = pathData.map((coord: any) => [coord[1], coord[2]]); // 提取 [x, y] 坐标
    const imagePoints = convertCanvasToImageCoordinates(extractPolygonPoints(coordinates), image, canvas);
    const boundingBox = calculateBoundingBox(imagePoints);
    return await viewEffect(imagePoints, boundingBox);
  });
  let line: Coordinate[] = [];
  canvas.on('mouse:down', (event) => {
  });
  canvas.on('mouse:move', async (event) => {
    const { x: touchX, y: touchY } = event.pointer!;
    // 更新路径数据，将新点追加到路径中
    line.push([touchX, touchY])
    onPlaceDrawing(event, line);
  });
  canvas.on('mouse:up', () => {
    line = [];
    onPlaceDrawEnd();
  });
};

const closeDrawingMode = (canvas: fabric.Canvas) => {
  if (!canvas)  return;
  canvas.isDrawingMode = false;
};

export default ImageEditor;
