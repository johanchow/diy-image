import { create } from 'zustand'
import { Coordinate } from './typing';

export interface ImageEditorState {
  touchPoint: Coordinate | undefined;
  touchImage: fabric.Image | undefined;
  updateTouchPoint: (point: Coordinate | undefined) => void;
  updateTouchImage: (image: fabric.Image | undefined) => void;
}

const useImageEditorStore = create<ImageEditorState>()((set) => ({
  touchPoint: undefined,
  touchImage: undefined,
  updateTouchImage: (image) => set({ touchImage: image }),
  updateTouchPoint: (point) => set({ touchPoint: point }),
}));

export default useImageEditorStore;

