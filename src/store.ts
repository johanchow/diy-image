import { create } from 'zustand'
import { Coordinate } from './typing';

export interface ImageEditorState {
  touchPoints: {
    current: Coordinate | undefined;
    history: Coordinate[];
  };
  touchImage: fabric.Image | undefined;
  updateTouchPoints: (points: {current: Coordinate | undefined, history: Coordinate[]}) => void;
  updateTouchImage: (image: fabric.Image | undefined) => void;
}

const useImageEditorStore = create<ImageEditorState>()((set) => ({
  touchPoints: {
    current: undefined,
    history: [],
  },
  touchImage: undefined,
  updateTouchImage: (image) => set({ touchImage: image }),
  updateTouchPoints: (touchPoints) => set({ touchPoints }),
}));

export default useImageEditorStore;

