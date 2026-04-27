"""
run_pipeline.py

Main entry point for Member 1's Video Processing Pipeline.

Usage:
  python run_pipeline.py --dataset tvsum
  python run_pipeline.py --dataset tvsum --video_id AwmHb44_ouw
  python run_pipeline.py --dataset activitynet
  python run_pipeline.py --dataset activitynet --video_id v_abc123

Outputs produced per video:
  outputs/transcripts/{video_id}_transcript.json
  outputs/frames/{video_id}/                        ← all 1fps frames as .jpg
  outputs/keyframes/{video_id}/{video_id}_keyframes.json
  outputs/scenes/{video_id}_scene_segments.json
  outputs/frame_scores/{video_id}_frame_scores.json
  outputs/timestamps/{video_id}_timestamps.json
"""

import os
import sys
import json
import math
import argparse
import yaml
import numpy as np
import cv2
from typing import List, Tuple, Dict

# ── Imports from our modules ───────────────────────────────────────────────
from dataset_adapters.base_adapter      import VideoRecord
from dataset_adapters.tvsum_adapter     import TVSumAdapter
from dataset_adapters.activitynet_adapter import ActivityNetAdapter
from ingestion.whisper_transcribe       import WhisperTranscriber
from ingestion.frame_extract            import FrameExtractor
from visual_processing.informativeness_scoring import InformativenessScorer
from visual_processing.blur_filter      import BlurFilter
from visual_processing.frame_clustering import FrameClusterer
from visual_processing.scene_segmentation import SceneSegmenter


# ══════════════════════════════════════════════════════════════════════════════
# KEYFRAME SELECTOR
# ══════════════════════════════════════════════════════════════════════════════

def compute_phash(frame_rgb: np.ndarray, hash_size: int = 8) -> np.ndarray:
    gray    = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2GRAY)
    resized = cv2.resize(gray, (hash_size*4, hash_size*4),
                         interpolation=cv2.INTER_AREA)
    dct     = cv2.dct(np.float32(resized))
    dct_low = dct[:hash_size, :hash_size]
    return (dct_low > np.median(dct_low)).flatten()


def hamming(h1: np.ndarray, h2: np.ndarray) -> int:
    return int(np.sum(h1 != h2))


def select_and_deduplicate_keyframes(
    frames:       List[Tuple[float, np.ndarray]],
    scenes:       List[Dict],
    frame_scores: List[Dict],
    config:       dict,
    output_dir:   str,
    video_id:     str
) -> List[Dict]:
    """
    For each scene, selects multiple keyframes by informativeness score.
    Then deduplicates across all selected frames using perceptual hashing.
    """
    sel_cfg           = config["phase1"]["selection"]
    min_per_scene     = sel_cfg["min_frames_per_scene"]
    max_per_scene     = sel_cfg["max_frames_per_scene"]
    sec_per_extra     = sel_cfg["sec_per_extra_frame"]
    min_score         = sel_cfg["min_score_threshold"]
    hash_threshold    = sel_cfg["hash_threshold"]

    os.makedirs(output_dir, exist_ok=True)
    score_lookup = {s["frame_index"]: s for s in frame_scores}
    keyframes    = []
    kf_id        = 0

    # ── Per-scene selection ────────────────────────────────────────────
    for scene in scenes:
        duration  = scene["duration_sec"]
        indices   = scene["frame_indices"]

        n_to_pick = int(math.floor(duration / sec_per_extra))
        n_to_pick = max(min_per_scene, min(max_per_scene, n_to_pick))

        # Filter by minimum informativeness score
        candidates = [
            (idx, score_lookup[idx])
            for idx in indices
            if idx in score_lookup
            and score_lookup[idx]["informativeness_score"] >= min_score
        ]

        # Fallback if all below threshold
        if not candidates and indices:
            best = max(indices,
                       key=lambda i: score_lookup.get(i, {})
                       .get("informativeness_score", 0))
            candidates = [(best, score_lookup.get(best, {}))]

        # Sort by score descending
        candidates.sort(
            key=lambda x: x[1].get("informativeness_score", 0),
            reverse=True
        )

        # Pick top-N with minimum temporal spacing
        selected   = []
        used_times = []

        for idx, score_info in candidates:
            if len(selected) >= n_to_pick:
                break
            t = frames[idx][0]
            if any(abs(t - ut) < 3.0 for ut in used_times):
                continue
            selected.append((idx, score_info))
            used_times.append(t)

        if not selected and candidates:
            selected = [candidates[0]]

        # Save selected frames
        for idx, score_info in selected:
            timestamp, frame = frames[idx]
            img_filename = (
                f"{video_id}_scene{scene['scene_id']:03d}"
                f"_kf{kf_id:03d}_t{timestamp:.3f}.jpg"
            )
            img_path = os.path.join(output_dir, img_filename)
            cv2.imwrite(img_path, cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))

            keyframes.append({
                "keyframe_id":           kf_id,
                "video_id":              video_id,
                "scene_id":              scene["scene_id"],
                "cluster_id":            scene["cluster_id"],
                "frame_index":           int(idx),
                "timestamp_sec":         round(timestamp, 3),
                "informativeness_score": score_info.get("informativeness_score", 0),
                "sharpness_raw":         score_info.get("sharpness_raw", 0),
                "contrast_raw":          score_info.get("contrast_raw", 0),
                "edge_density_raw":      score_info.get("edge_density_raw", 0),
                "scene_start_sec":       scene["start_sec"],
                "scene_end_sec":         scene["end_sec"],
                "scene_duration_sec":    scene["duration_sec"],
                "image_path":            img_path,
                "prev_frame_idx": int(idx-1) if idx > 0 else None,
                "next_frame_idx": int(idx+1) if idx < len(frames)-1 else None,
            })
            kf_id += 1

    keyframes.sort(key=lambda x: x["timestamp_sec"])

    # ── Deduplication via perceptual hash ──────────────────────────────
    if len(keyframes) > 1:
        hashes   = [compute_phash(frames[kf["frame_index"]][1])
                    for kf in keyframes]
        rejected = set()

        for i in range(len(keyframes)):
            if i in rejected:
                continue
            for j in range(i+1, len(keyframes)):
                if j in rejected:
                    continue
                if hamming(hashes[i], hashes[j]) < hash_threshold:
                    si = keyframes[i]["informativeness_score"]
                    sj = keyframes[j]["informativeness_score"]
                    rejected.add(j if si >= sj else i)

        before   = len(keyframes)
        keyframes = [kf for i, kf in enumerate(keyframes)
                     if i not in rejected]
        removed  = before - len(keyframes)
        if removed > 0:
            print(f"[Dedup] Removed {removed} duplicates "
                  f"| {before} → {len(keyframes)}")

    print(f"[KeyframeSelector] {len(keyframes)} keyframes selected.")
    return keyframes


# ══════════════════════════════════════════════════════════════════════════════
# TIMESTAMPS GENERATOR
# ══════════════════════════════════════════════════════════════════════════════

def generate_timestamps(
    video_id:       str,
    word_timestamps: list,
    segments:        list,
    keyframes:       list,
    scenes:          list,
    duration_sec:    float,
    output_dir:      str
) -> str:
    """
    Produces timestamps.json — unified temporal index for Member 2.

    Links every keyframe to the words and sentence being spoken at that moment.
    This is the primary handoff file to the knowledge graph builder.
    """
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{video_id}_timestamps.json")

    # Sentence-level segments
    segment_timestamps = [
        {
            "segment_id": i,
            "start":      round(seg.get("start", 0.0), 3),
            "end":        round(seg.get("end",   0.0), 3),
            "text":       seg.get("text", "").strip()
        }
        for i, seg in enumerate(segments)
    ]

    # Keyframe timestamps
    keyframe_timestamps = [
        {
            "timestamp_sec":         kf["timestamp_sec"],
            "keyframe_id":           kf["keyframe_id"],
            "scene_id":              kf["scene_id"],
            "cluster_id":            kf["cluster_id"],
            "informativeness_score": kf["informativeness_score"],
            "image_path":            kf["image_path"]
        }
        for kf in keyframes
    ]

    # Aligned: each keyframe linked to what was being said
    def words_in_window(start, end):
        return [
            w["word"] for w in word_timestamps
            if w.get("start", 0) >= start
            and w.get("end",   0) <= end
            and w.get("word",  "").strip()
        ]

    def segment_at_time(t):
        for seg in segments:
            if seg.get("start", 0) <= t <= seg.get("end", 0):
                return seg
        if segments:
            return min(segments, key=lambda s: abs(s.get("start", 0) - t))
        return {}

    aligned = []
    for kf in keyframes:
        t       = kf["timestamp_sec"]
        seg     = segment_at_time(t)
        aligned.append({
            "timestamp_sec":         t,
            "keyframe_id":           kf["keyframe_id"],
            "scene_id":              kf["scene_id"],
            "image_path":            kf["image_path"],
            "informativeness_score": kf["informativeness_score"],
            "words_in_window":       words_in_window(t - 2.0, t + 2.0),
            "segment_text":          seg.get("text", "").strip(),
            "segment_start":         round(seg.get("start", 0.0), 3),
            "segment_end":           round(seg.get("end",   0.0), 3),
        })

    output_data = {
        "video_id":            video_id,
        "duration_sec":        duration_sec,
        "word_timestamps":     word_timestamps,
        "segment_timestamps":  segment_timestamps,
        "keyframe_timestamps": keyframe_timestamps,
        "scene_segments":      scenes,
        "aligned":             aligned
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"[Timestamps] Saved → {output_path}")
    return output_path


# ══════════════════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ══════════════════════════════════════════════════════════════════════════════

class VideoPipeline:

    def __init__(self, config_path: str = "config/config.yaml"):
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)

        paths = self.config["paths"]
        self.transcript_dir   = paths["output_transcripts"]
        self.keyframe_dir     = paths["output_keyframes"]
        self.scene_dir        = paths["output_scenes"]
        self.frame_scores_dir = paths["output_frame_scores"]
        self.frames_dir       = paths["output_frames"]
        self.timestamps_dir   = paths["output_timestamps"]

        p1       = self.config["phase1"]
        combined = {**p1["frame_extraction"], **p1["clustering"]}

        print("[Pipeline] Initializing modules...")
        self.transcriber = WhisperTranscriber(p1["audio"])
        self.extractor   = FrameExtractor(combined)
        self.scorer      = InformativenessScorer(p1)
        self.blur        = BlurFilter(
            p1.get("keyframe_scoring", {}).get("blur_threshold", 100.0)
        )
        self.clusterer   = FrameClusterer(p1)
        self.segmenter   = SceneSegmenter()
        print("[Pipeline] All modules ready.\n")

    def process_video(self, record: VideoRecord) -> dict:
        vid = record.video_id
        print(f"\n{'='*60}")
        print(f"[Pipeline] {vid}")
        print(f"           {record.duration_sec:.0f}s | "
              f"{record.metadata.get('dataset','?')} | "
              f"{record.metadata.get('title', record.metadata.get('labels', ['?'])[0] if record.metadata.get('labels') else '?')}")
        print(f"{'='*60}")

        # ── STEP 1: Transcription ──────────────────────────────────────
        print(f"\n[Step 1/5] Transcription")
        transcript_path = self.transcriber.transcribe(
            video_path = record.video_path,
            output_dir = self.transcript_dir,
            video_id   = vid
        )
        word_timestamps = []
        segments        = []
        if transcript_path and os.path.exists(transcript_path):
            with open(transcript_path, "r", encoding="utf-8") as f:
                t_data          = json.load(f)
                word_timestamps = t_data.get("word_timestamps", [])
                segments        = t_data.get("segments", [])

        # ── STEP 2: Frame extraction ───────────────────────────────────
        print(f"\n[Step 2/5] Frame extraction")
        frames_output_dir = os.path.join(self.frames_dir, vid)
        frames = self.extractor.extract(
            video_path = record.video_path,
            output_dir = frames_output_dir,
            video_id   = vid
        )

        # ── STEP 3: Informativeness scoring ───────────────────────────
        print(f"\n[Step 3/5] Informativeness scoring")
        frame_scores = self.scorer.score_all(frames)

        # Save frame_scores.json
        os.makedirs(self.frame_scores_dir, exist_ok=True)
        scores_path = os.path.join(
            self.frame_scores_dir, f"{vid}_frame_scores.json"
        )
        with open(scores_path, "w") as f:
            json.dump(frame_scores, f, indent=2)

        # ── STEP 4: Clustering + Scene segmentation ────────────────────
        print(f"\n[Step 4/5] Clustering + scene segmentation")
        labels, features, k = self.clusterer.cluster(frames, record.duration_sec)
        scenes = self.segmenter.segment(frames, labels, word_timestamps)

        # Save scene_segments.json
        os.makedirs(self.scene_dir, exist_ok=True)
        scene_path = os.path.join(self.scene_dir, f"{vid}_scene_segments.json")
        with open(scene_path, "w") as f:
            json.dump(scenes, f, indent=2)

        # ── STEP 5: Keyframe selection + timestamps ────────────────────
        print(f"\n[Step 5/5] Keyframe selection + timestamps")
        kf_dir    = os.path.join(self.keyframe_dir, vid)
        keyframes = select_and_deduplicate_keyframes(
            frames       = frames,
            scenes       = scenes,
            frame_scores = frame_scores,
            config       = self.config,
            output_dir   = kf_dir,
            video_id     = vid
        )

        # Save keyframes.json
        os.makedirs(kf_dir, exist_ok=True)
        kf_path = os.path.join(kf_dir, f"{vid}_keyframes.json")
        with open(kf_path, "w") as f:
            json.dump(keyframes, f, indent=2)

        # Generate timestamps.json
        generate_timestamps(
            video_id        = vid,
            word_timestamps = word_timestamps,
            segments        = segments,
            keyframes       = keyframes,
            scenes          = scenes,
            duration_sec    = record.duration_sec,
            output_dir      = self.timestamps_dir
        )

        print(f"\n[Pipeline] ✓ {vid} | "
              f"{len(keyframes)} keyframes | "
              f"{len(scenes)} scenes | "
              f"{len(frame_scores)} frames scored")

        return {
            "video_id":       vid,
            "keyframe_count": len(keyframes),
            "scene_count":    len(scenes),
            "frame_count":    len(frame_scores),
        }

    def process_all(self, records) -> list:
        results = []
        total   = len(records)
        for i, record in enumerate(records):
            print(f"\n[Pipeline] ── Video {i+1}/{total} ──")
            try:
                results.append(self.process_video(record))
            except Exception as e:
                print(f"[Pipeline] ERROR on {record.video_id}: {e}")
        return results


# ══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Member 1 — Video Processing Pipeline"
    )
    parser.add_argument(
        "--dataset",
        required=True,
        choices=["tvsum", "activitynet"],
        help="Which dataset to process"
    )
    parser.add_argument(
        "--config",
        default="config/config.yaml"
    )
    parser.add_argument(
        "--video_id",
        default=None,
        help="Optional: process one video only"
    )
    args = parser.parse_args()

    with open(args.config, "r") as f:
        config = yaml.safe_load(f)

    # Load dataset
    print(f"[run_pipeline] Loading {args.dataset}...")
    if args.dataset == "tvsum":
        adapter = TVSumAdapter(config=config)
    else:
        adapter = ActivityNetAdapter(config=config)

    records = adapter.load()
    print(f"[run_pipeline] {len(records)} videos loaded.")

    if args.video_id:
        records = [r for r in records if r.video_id == args.video_id]
        if not records:
            print(f"[run_pipeline] ERROR: '{args.video_id}' not found.")
            return

    pipeline = VideoPipeline(config_path=args.config)
    results  = pipeline.process_all(records)

    print(f"\n{'='*60}")
    print(f"PIPELINE COMPLETE — {len(results)} videos processed")
    print(f"{'='*60}")
    print(f"Outputs saved to: outputs/")
    print(f"\nFor Member 2:")
    print(f"  Transcripts : outputs/transcripts/")
    print(f"  Keyframes   : outputs/keyframes/")
    print(f"  Scenes      : outputs/scenes/")
    print(f"  Frame scores: outputs/frame_scores/")
    print(f"  All frames  : outputs/frames/")
    print(f"  Timestamps  : outputs/timestamps/  ← start here")


if __name__ == "__main__":
    main()