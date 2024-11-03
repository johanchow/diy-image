declare module 'convex-hull' {
  function convexHull(points: [number, number][]): [number, number][];
  export = convexHull;
}

declare global {
  interface Window {
    __TRY_ON_CONTEXT__: {
      userId: string;
    }
    uni: {
      postMessage: (params: Record<string, any>) => void,
      navigateBack: (params: Record<string, any>) => void,
      reLaunch: (params: {url: string}) => void;
    },
    wx: {
      miniProgram: {
        postMessage: (params: Record<string, any>) => void,
        navigateBack: () => void;
      }
    }
  }
}

export type Generation = {
  id: string;
  real_clothing_id: string;
  user_id: string;
  generation_image_url: string;
  real_clothing: RealClothing;
};

export type RealClothing = {
  id: string;
  user_id: string;
  image_url: string;
};

export type Coordinate = [number, number];
export type BoundingBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};
