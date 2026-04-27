import numpy as np
from typing import List, Tuple, Dict


class SceneSegmenter:

    def segment(self, frames, labels, word_timestamps=None):
        scenes = []
        scene_id = 0
        current_cluster = int(labels[0])
        current_start = frames[0][0]
        current_indices = [0]
        for i in range(1, len(frames)):
            if int(labels[i]) == current_cluster:
                current_indices.append(i)
            else:
                end_sec = frames[i - 1][0]
                scenes.append(self._make_scene(scene_id, current_cluster, current_start, end_sec, current_indices, word_timestamps))
                scene_id += 1
                current_cluster = int(labels[i])
                current_start = frames[i][0]
                current_indices = [i]
        end_sec = frames[-1][0]
        scenes.append(self._make_scene(scene_id, current_cluster, current_start, end_sec, current_indices, word_timestamps))
        print('[SceneSegmenter] ' + str(len(scenes)) + ' scenes detected.')
        return scenes

    def _make_scene(self, scene_id, cluster_id, start_sec, end_sec, frame_indices, word_timestamps):
        transcript = ''
        if word_timestamps:
            words = [w['word'] for w in word_timestamps
                     if w.get('start', 0) >= start_sec
                     and w.get('end', 0) <= end_sec
                     and w.get('word', '').strip()]
            transcript = ' '.join(words).strip()
        return {
            'scene_id': scene_id,
            'cluster_id': cluster_id,
            'start_sec': round(start_sec, 3),
            'end_sec': round(end_sec, 3),
            'duration_sec': round(end_sec - start_sec + 1.0, 3),
            'n_frames': len(frame_indices),
            'frame_indices': frame_indices,
            'transcript_text': transcript
        }