import os
import json
from typing import List
from .base_adapter import BaseDatasetAdapter, VideoRecord


class ActivityNetAdapter(BaseDatasetAdapter):
    """
    Loads ActivityNet dataset from its JSON annotation file.

    Expected layout:
        activitynet/
        ├── videos/
        │   └── *.mp4
        └── activity_net.v1-3.min.json

    The annotation JSON has this structure:
    {
      "database": {
        "v_abc123": {
          "duration": 180.4,
          "subset": "training",
          "annotations": [
            {"label": "Washing dishes", "segment": [10.3, 45.2]},
            ...
          ]
        },
        ...
      }
    }
    """

    def __init__(self, config: dict):
        super().__init__(config)
        anet_cfg        = config["dataset"]["activitynet"]
        self.root       = anet_cfg["root"]
        self.video_dir  = os.path.join(self.root, anet_cfg["video_dir"])
        self.anno_path  = os.path.join(self.root, anet_cfg["anno_file"])
        self._records: List[VideoRecord] = []
        self._load_records()

    def _load_records(self):
        if not os.path.exists(self.anno_path):
            raise FileNotFoundError(
                f"[ActivityNetAdapter] Annotation file not found: {self.anno_path}"
            )

        with open(self.anno_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        database = data.get("database", {})
        found    = 0
        missing  = 0

        for video_id, info in database.items():
            # ActivityNet video files are named v_{id}.mp4
            video_filename = f"{video_id}.mp4"
            video_path     = os.path.join(self.video_dir, video_filename)

            if not os.path.exists(video_path):
                # Try without v_ prefix
                alt_path = os.path.join(self.video_dir, f"{video_id[2:]}.mp4")
                if os.path.exists(alt_path):
                    video_path = alt_path
                else:
                    missing += 1
                    continue

            duration_sec = float(info.get("duration", 0.0))
            subset       = info.get("subset", "unknown")
            annotations  = info.get("annotations", [])

            # Extract labels and segments
            labels   = [a.get("label", "") for a in annotations]
            segments = [a.get("segment", []) for a in annotations]

            self._records.append(VideoRecord(
                video_id            = video_id,
                video_path          = video_path,
                duration_sec        = duration_sec,
                ground_truth_scores = None,
                metadata = {
                    "dataset":     "activitynet",
                    "subset":      subset,
                    "labels":      labels,
                    "segments":    segments,
                    "n_activities": len(annotations)
                }
            ))
            found += 1

        print(f"[ActivityNetAdapter] Loaded {found} videos "
              f"({missing} skipped — .mp4 not found).")

    def load(self) -> List[VideoRecord]:
        return self._records

    def __len__(self) -> int:
        return len(self._records)