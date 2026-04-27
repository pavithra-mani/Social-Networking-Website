"""
visual_processing/informativeness_scoring.py

Scores every extracted frame on three visual axes:

  Metric 1 — Sharpness (Laplacian variance)
    Measures edge sharpness. Blurry frames score low.

  Metric 2 — Contrast (RMS contrast)
    Measures pixel intensity spread. Blank/flat frames score low.

  Metric 3 — Edge Density (Canny edge ratio)
    Measures structural content. Frames with objects/text score high.

Final score = weighted average of all three normalized to [0, 1].

OUTPUT — outputs/frame_scores/{video_id}_frame_scores.json:
[
  {
    "frame_index": 0,
    "timestamp_sec": 0.0,
    "sharpness_raw": 312.4,
    "contrast_raw": 48.2,
    "edge_density_raw": 0.12,
    "informativeness_score": 0.87
  },
  ...
]
"""

import numpy as np
import cv2
from typing import List, Tuple, Dict


class InformativenessScorer:

    def __init__(self, config: dict):
        scoring           = config.get("scoring", {})
        self.w_sharp      = scoring.get("weight_sharpness",    0.4)
        self.w_contrast   = scoring.get("weight_contrast",     0.3)
        self.w_edge       = scoring.get("weight_edge_density", 0.3)

    def _sharpness(self, gray: np.ndarray) -> float:
        return float(cv2.Laplacian(gray, cv2.CV_64F).var())

    def _contrast(self, gray: np.ndarray) -> float:
        return float(np.std(gray.astype(np.float32)))

    def _edge_density(self, gray: np.ndarray) -> float:
        edges = cv2.Canny(gray, threshold1=50, threshold2=150)
        return float(np.count_nonzero(edges)) / float(edges.size)

    def score_all(
        self,
        frames: List[Tuple[float, np.ndarray]]
    ) -> List[Dict]:
        """
        Scores all frames and returns normalized informativeness scores.

        Parameters
        ----------
        frames : list of (timestamp, frame_rgb_array)

        Returns
        -------
        List of score dicts, one per frame
        """
        raw = []
        print(f"[InformativenessScorer] Scoring {len(frames)} frames...")

        for idx, (timestamp, frame_rgb) in enumerate(frames):
            gray = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2GRAY)
            raw.append({
                "frame_index":      idx,
                "timestamp_sec":    round(timestamp, 3),
                "sharpness_raw":    self._sharpness(gray),
                "contrast_raw":     self._contrast(gray),
                "edge_density_raw": self._edge_density(gray)
            })

        # Normalize each metric to [0, 1] across all frames
        for metric in ["sharpness_raw", "contrast_raw", "edge_density_raw"]:
            values      = np.array([s[metric] for s in raw])
            min_v       = values.min()
            max_v       = values.max()
            spread      = max_v - min_v if max_v > min_v else 1.0
            for s in raw:
                s[metric + "_norm"] = round(
                    float((s[metric] - min_v) / spread), 4
                )

        # Combine into final score
        for s in raw:
            s["informativeness_score"] = round(
                self.w_sharp    * s["sharpness_raw_norm"]    +
                self.w_contrast * s["contrast_raw_norm"]     +
                self.w_edge     * s["edge_density_raw_norm"],
                4
            )

        scores = [s["informativeness_score"] for s in raw]
        print(f"[InformativenessScorer] Done. "
              f"Score range: {min(scores):.3f} – {max(scores):.3f}")

        return raw