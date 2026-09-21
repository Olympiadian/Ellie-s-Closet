"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import {
  removeBackgroundInBrowser,
  type BackgroundRemovalProgress,
} from "@/lib/images/remove-background-browser";

export type BackgroundRemovalEngineHandle = {
  remove: (
    source: File,
    onProgress?: (progress: BackgroundRemovalProgress) => void,
  ) => Promise<File>;
};

type BackgroundRemovalEngineProps = {
  onReady: () => void;
};

const BackgroundRemovalEngine = forwardRef<BackgroundRemovalEngineHandle, BackgroundRemovalEngineProps>(
  function BackgroundRemovalEngine({ onReady }, ref) {
    useImperativeHandle(ref, () => ({ remove: removeBackgroundInBrowser }), []);
    useEffect(onReady, [onReady]);
    return null;
  },
);

export default BackgroundRemovalEngine;
