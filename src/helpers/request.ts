import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiHost } from "./config";
import { BoundingBox, Coordinate, Generation } from "../typing";
import { convertCanvasImageToFile } from "./canvas";

const request = async <R = any, D = any>(config: AxiosRequestConfig<D>): Promise<R> => {
  let resp: AxiosResponse<R>;
  try {
    resp = await axios.request<D, AxiosResponse<R>>(config);
  } catch(e) {
    throw new Error('网络服务异常，请重试');
  }
  // @ts-ignore
  if (resp.data.code) {
    // @ts-ignore
    throw new Error(`服务报错: ${resp.data.message}`);
  }
  return resp.data;
};

const requestGenerationDetail = async (generationId: string): Promise<Generation> => {
  const generation = await request<Generation>({
    url: `${ApiHost}/try-on/detail`,
    method: 'GET',
    params: {
      id: generationId
    }
  });
  return generation;
};

const requestEraseGenerationImage = async (
  generationImageUrl: string,
  generationImage: fabric.Image | null,
  coordinates: Coordinate[],
  boundingBox: BoundingBox,
): Promise<string> => {
  let blobImage: Blob;
  if (generationImage) {
    const file = convertCanvasImageToFile(generationImage);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('polygon_coordinates', JSON.stringify(coordinates));
    formData.append('bounding_box', JSON.stringify(boundingBox));
    blobImage = await request<Blob>({
      url: `${ApiHost}/try-on/erase-rectangle`,
      method: 'POST',
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData,
    });
  } else {
    blobImage = await request<Blob>({
      url: `${ApiHost}/generation/erase-polygon`,
      method: 'POST',
      responseType: 'blob',
      data: {
        generation_image_url: generationImageUrl,
        polygon_coordinates: coordinates,
        bounding_box: boundingBox,
      }
    })
  }
  // 将 Blob 数据转换为可用的 URL
  const blobUrl = URL.createObjectURL(blobImage);
  return blobUrl;
};

const requestCopyToGenerationImage = async (
  generationImageUrl: string,
  generationImage: fabric.Image | null,
  generationCoordinates: Coordinate[],
  generationBoundingBox: BoundingBox,
  sourceImageUrl: string,
  sourceCoordinates: Coordinate[],
  sourceBoundingBox: BoundingBox
): Promise<string> => {
  let blobImage: Blob;
  if (generationImage) {
    const file = convertCanvasImageToFile(generationImage);
    const formData = new FormData();
    formData.append('generation_image', file);
    formData.append('generation_coordinates', JSON.stringify(generationCoordinates));
    formData.append('generation_bounding_box', JSON.stringify(generationBoundingBox));
    formData.append('source_image_url', sourceImageUrl);
    formData.append('source_coordinates', JSON.stringify(sourceCoordinates));
    formData.append('source_bounding_box', JSON.stringify(sourceBoundingBox));
    blobImage = await request<Blob>({
      url: `${ApiHost}/try-on/copy-to-generation-from-source`,
      method: 'POST',
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData,
    });
  } else {
    blobImage = await request({
      url: `${ApiHost}/generation/copy-to-generation-from-source`,
      method: 'POST',
      responseType: 'blob',
      data: {
        generation_image_url: generationImageUrl,
        generation_coordinates: generationCoordinates,
        generation_bounding_box: generationBoundingBox,
        source_image_url: sourceImageUrl,
        source_coordinates: sourceCoordinates,
        source_bounding_box: sourceBoundingBox,
      }
    });
  }
  // 将 Blob 数据转换为可用的 URL
  const blobUrl = URL.createObjectURL(blobImage);
  return blobUrl;
};

const requestSaveGenerationImage = async (
  generationId: string, generationImage: fabric.Image
): Promise<boolean> => {
  const file = convertCanvasImageToFile(generationImage);
  const formData = new FormData();
  formData.append('updated_image', file);
  formData.append('user_id', window.__TRY_ON_CONTEXT__?.userId);
  formData.append('id', generationId);
  await request({
    url: `${ApiHost}/generation/update`,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  });
  return true;
};

export {
  requestGenerationDetail,
  requestEraseGenerationImage,
  requestCopyToGenerationImage,
  requestSaveGenerationImage,
};
