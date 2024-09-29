declare module 'convex-hull' {
  function convexHull(points: [number, number][]): [number, number][];
  export = convexHull;
}

declare global {
  interface Window {
    __TRY_ON_CONTEXT__: {
      userId: string;
      generationId: string;
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
