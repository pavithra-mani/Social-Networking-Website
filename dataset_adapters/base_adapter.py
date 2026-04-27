from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class VideoRecord:
    """
    Universal data contract between dataset adapters and the pipeline.
    Every adapter — TVSum, ActivityNet, or any future dataset —
    must produce a list of these objects.

    Fields
    ------
    video_id            : unique string ID
    video_path          : absolute path to the video file
    duration_sec        : total duration in seconds
    ground_truth_scores : per-shot importance scores (optional)
    metadata            : dataset-specific info (category, title, etc.)
    """
    video_id:             str
    video_path:           str
    duration_sec:         float
    ground_truth_scores:  Optional[List[float]] = None
    metadata:             Optional[dict] = field(default_factory=dict)


class BaseDatasetAdapter(ABC):
    """
    Abstract base class for all dataset adapters.
    Subclass this to add a new dataset — only load() and __len__() required.
    """

    def __init__(self, config: dict):
        self.config = config

    @abstractmethod
    def load(self) -> List[VideoRecord]:
        raise NotImplementedError

    @abstractmethod
    def __len__(self) -> int:
        raise NotImplementedError