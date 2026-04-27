"""
visual_processing/blur_filter.py

Filters blurry frames using Laplacian variance.
Used during keyframe selection to avoid saving out-of-focus frames.

A frame is considered blurry if:
  var(Laplacian(grayscale_frame)) < blur_threshold

Typical values:
  < 50   = very blurry
  50-100 = somewhat blurry
  > 100  = acceptably sharp (default threshold)
  > 300  = very sharp
"""

import cv2
import numpy as np
from typing import List, Tuple


class BlurFilter:

    def __init__(self, blur_threshold: float = 100.0):
        self.blur_threshold = blur_threshold

    def score(self, frame_rgb: np.ndarray) -> float:
        """Returns Laplacian variance of a frame. Higher = sharper."""
        gray = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2GRAY)
        return float(cv2.Laplacian(gray, cv2.CV_64F).var())

    def is_sharp(self, frame_rgb: np.ndarray) -> bool:
        """Returns True if frame is sharp enough to keep."""
        return self.score(frame_rgb) >= self.blur_threshold

    def filter_frames(
        self,
        frames: List[Tuple[float, np.ndarray]]
    ) -> List[Tuple[float, np.ndarray]]:
        """
        Removes blurry frames from a list.
        Used as a pre-filter before clustering if needed.

        Parameters
        ----------
        frames : list of (timestamp, frame_rgb)

        Returns
        -------
        Filtered list with only sharp frames
        """
        before  = len(frames)
        sharp   = [(t, f) for t, f in frames if self.is_sharp(f)]
        removed = before - len(sharp)
        if removed > 0:
            print(f"[BlurFilter] Removed {removed} blurry frames "
                  f"({before} → {len(sharp)})")
        return sharp