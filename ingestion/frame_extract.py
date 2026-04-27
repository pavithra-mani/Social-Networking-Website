"""
ingestion/frame_extract.py

Extracts frames from video at a fixed FPS using OpenCV.
Default: 1fps — one frame per second.

OUTPUT:
  List of (timestamp_sec, frame_rgb_ndarray) tuples held in memory.
  Frames are resized to feature_resize for clustering efficiency.
  Full-resolution frames are saved to outputs/frames/ as .jpg files.

The in-memory list is passed directly to visual_processing modules.
The saved .jpg files in outputs/frames/ fulfil the frames/ output requirement
so Member 2 can access raw frames without reprocessing video.
"""

import os
import cv2
import numpy as np
from typing import List, Tuple


class FrameExtractor:

    def __init__(self, config: dict):
        self.target_fps = config["fps"]
        self.resize     = tuple(config["feature_resize"])

    def extract(
        self,
        video_path: str,
        output_dir: str = None,
        video_id:   str = None
    ) -> List[Tuple[float, np.ndarray]]:
        """
        Extracts frames at target_fps from a video.

        Parameters
        ----------
        video_path : full path to .mp4 file
        output_dir : if provided, saves full-resolution frames as .jpg here
        video_id   : used for saved frame filenames

        Returns
        -------
        List of (timestamp_sec, resized_rgb_frame) tuples
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError(f"[FrameExtractor] Cannot open: {video_path}")

        native_fps     = cap.get(cv2.CAP_PROP_FPS)
        total_frames   = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_interval = max(1, int(round(native_fps / self.target_fps)))

        if output_dir and video_id:
            os.makedirs(output_dir, exist_ok=True)

        frames    = []
        frame_idx = 0

        while True:
            ret, frame_bgr = cap.read()
            if not ret:
                break

            if frame_idx % frame_interval == 0:
                timestamp = round(frame_idx / native_fps, 3)
                frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

                # Save full-resolution frame to outputs/frames/
                if output_dir and video_id:
                    fname    = f"{video_id}_t{timestamp:.3f}.jpg"
                    fpath    = os.path.join(output_dir, fname)
                    cv2.imwrite(fpath, frame_bgr)  # save BGR directly

                # Store resized version in memory for clustering
                frame_small = cv2.resize(frame_rgb, self.resize)
                frames.append((timestamp, frame_small))

            frame_idx += 1

        cap.release()
        print(f"[FrameExtractor] {len(frames)} frames extracted "
              f"from {total_frames} total "
              f"(native {native_fps:.1f}fps, interval={frame_interval})")
        return frames