"""
visual_processing/scene_segmentation.py

Converts cluster labels into contiguous scene segments.

A scene segment = a contiguous block of time where the cluster
label does not change. When the label changes, a new scene starts.

Example:
  Frame sequence: [3,3,3,3,7,7,7,3,3,5,5,5,5]
  Scenes:
    Scene 0: cluster=3, t=0s  → t=3s
    Scene 1: cluster=7, t=4s  → t=6s
    Scene 2: cluster=3, t=7s  → t=8s
    Scene 3: cluster=5, t=9s  → t=12s

OUTPUT — outputs/scenes/{video_id}_scene_segments.json:
[
  {
    "scene_id": 0,
    "cluster_id": 3,
    "start_sec": 0.0,
    "end_sec": 3.0,
    "duration_sec": 4.0,
    "n_frames": 4,
    "frame_indices": [0,1,2,3],
    "transcript_text": "words spoken during this scene"
  },
  ...
]
"""

import numpy as np
from typing import List, Tuple, Dict


class SceneSegmenter:

    def segment(
        self,
        frames:          List[Tuple[float, np.ndarray]],
        labels:          np.ndarray,
        word_timestamps: list = None
    ) -> List[Dict]:
        """
        Parameters
        ----------
        frames          : list of (timestamp, frame)
        labels          : cluster label per frame from FrameClusterer
        word_timestamps : optional word-level timestamps to enrich scenes

        Returns
        -------
        List of scene segment dicts sorted by start_sec
        """
        scenes          = []
        scene_id        = 0
        current_cluster = int(labels[0])
        current_start   = frames[0][0]
        current_indices = [0]

        for i in range(1, len(frames)):
            if int(labels[i]) == current_cluster:
                current_indices.append(i)
            else:
                end_sec = frames[i - 1][0]
                scenes.append(self._make_scene(
                    scene_id, current_cluster,
                    current_start, end_sec,
                    current_indices, word_timestamps
                ))
                scene_id        += 1
                current_cluster  = int(labels[i])
                current_start    = frames[i][0]
                current_indices  = [i]

        # Final scene
        end_sec = frames[-1][0]
        scenes.append(self._make_scene(
            scene_id, current_cluster,
            current_start, end_sec,
            current_indices, word_timestamps
        ))

        print(f"[SceneSegmenter] {len(scenes)} scenes detected.")
        return scenes

    def _make_scene(
        self,
        scene_id:        int,
        cluster_id:      int,
        start_sec:       float,
        end_sec:         float,
        frame_indices:   List[int],
        word_timestamps: list
    ) -> Dict:
        transcript = ""
        if word_timestamps:
            words = [
                w["word"] for w in word_timestamps
                if w.get("start", 0) >= start_sec
                and w.get("end",   0) <= end_sec
                and w.get("word",  "").strip()
            ]
            transcript = " ".join(words).strip()

        return {
            "scene_id":        scene_id,
            "cluster_id":      cluster_id,
            "start_sec":       round(start_sec, 3),
            "end_sec":         round(end_sec,   3),
            "duration_sec":    round(end_sec - start_sec + 1.0, 3),
            "n_frames":        len(frame_indices),
            "frame_indices":   frame_indices,
            "transcript_text": transcript
        }