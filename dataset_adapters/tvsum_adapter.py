import os
import csv
from typing import List, Dict
from .base_adapter import BaseDatasetAdapter, VideoRecord


class TVSumAdapter(BaseDatasetAdapter):
    """
    Loads TVSum50 dataset from its two .tsv files.

    Expected layout:
        ydata-tvsum50-v1_1/
        ├── ydata-tvsum50-video/
        │   └── video/
        │       └── *.mp4
        └── ydata-tvsum50-data/
            └── data/
                ├── ydata-tvsum50-anno.tsv
                └── ydata-tvsum50-info.tsv
    """

    def __init__(self, config: dict):
        super().__init__(config)
        tvsum_cfg       = config["dataset"]["tvsum"]
        self.root       = tvsum_cfg["root"]
        self.video_dir  = os.path.join(self.root, tvsum_cfg["video_dir"])
        self.anno_path  = os.path.join(self.root, tvsum_cfg["anno_file"])
        self.info_path  = os.path.join(self.root, tvsum_cfg["info_file"])
        self._records: List[VideoRecord] = []
        self._load_records()

    def _parse_duration(self, duration_str: str) -> float:
        parts   = duration_str.strip().split(":")
        minutes = int(parts[0])
        seconds = int(parts[1])
        return float(minutes * 60 + seconds)

    def _load_info(self) -> Dict[str, dict]:
        info = {}
        with open(self.info_path, "r", encoding="utf-8") as f:
            reader = csv.reader(f, delimiter="\t")
            next(reader)  # skip header
            for row in reader:
                if len(row) < 5:
                    continue
                info[row[1].strip()] = {
                    "category":     row[0].strip(),
                    "title":        row[2].strip(),
                    "url":          row[3].strip(),
                    "duration_sec": self._parse_duration(row[4].strip())
                }
        print(f"[TVSumAdapter] Loaded info for {len(info)} videos.")
        return info

    def _load_annotations(self) -> Dict[str, List[List[float]]]:
        annotations = {}
        with open(self.anno_path, "r", encoding="utf-8") as f:
            reader = csv.reader(f, delimiter="\t")
            next(reader)  # skip header
            for row in reader:
                if len(row) < 3:
                    continue
                video_id = row[0].strip()
                scores   = [float(s) for s in row[2].strip().split(",") if s.strip()]
                if video_id not in annotations:
                    annotations[video_id] = []
                annotations[video_id].append(scores)
        print(f"[TVSumAdapter] Loaded annotations for {len(annotations)} videos.")
        return annotations

    def _average_annotations(self, all_scores: List[List[float]]) -> List[float]:
        min_len = min(len(s) for s in all_scores)
        trimmed = [s[:min_len] for s in all_scores]
        return [
            round(sum(trimmed[a][i] for a in range(len(trimmed))) / len(trimmed), 4)
            for i in range(min_len)
        ]

    def _load_records(self):
        info        = self._load_info()
        annotations = self._load_annotations()

        for video_id, meta in info.items():
            video_path = os.path.join(self.video_dir, f"{video_id}.mp4")
            if not os.path.exists(video_path):
                print(f"[TVSumAdapter] WARNING: skipping {video_id} — .mp4 not found")
                continue
            if video_id not in annotations:
                print(f"[TVSumAdapter] WARNING: skipping {video_id} — no annotations")
                continue

            self._records.append(VideoRecord(
                video_id            = video_id,
                video_path          = video_path,
                duration_sec        = meta["duration_sec"],
                ground_truth_scores = self._average_annotations(annotations[video_id]),
                metadata = {
                    "dataset":          "tvsum50",
                    "category":         meta["category"],
                    "title":            meta["title"],
                    "url":              meta["url"],
                    "shot_duration_sec": 2.0
                }
            ))
        print(f"[TVSumAdapter] {len(self._records)} VideoRecords loaded.")

    def load(self) -> List[VideoRecord]:
        return self._records

    def __len__(self) -> int:
        return len(self._records)