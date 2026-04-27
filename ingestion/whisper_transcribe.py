import os
import json
import torch


class WhisperTranscriber:

    def __init__(self, config):
        self.model_size = config['model_size']
        self.language = config['language']
        self.batch_size = config['batch_size']
        self.compute_type = config['compute_type']
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print('[WhisperTranscriber] Device: ' + self.device)
        print('[WhisperTranscriber] Model: ' + self.model_size)
        import whisperx
        self.whisperx = whisperx
        self.model = whisperx.load_model(
            self.model_size, self.device,
            compute_type=self.compute_type, language=self.language
        )
        print('[WhisperTranscriber] Model loaded.')

    def transcribe(self, video_path, output_dir, video_id):
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, video_id + '_transcript.json')
        if os.path.exists(output_path):
            print('[WhisperTranscriber] Already done, skipping: ' + video_id)
            return output_path
        print('[WhisperTranscriber] Transcribing: ' + video_id)
        audio = self.whisperx.load_audio(video_path)
        result = self.model.transcribe(audio, batch_size=self.batch_size)
        align_model, metadata = self.whisperx.load_align_model(
            language_code=result['language'], device=self.device
        )
        aligned = self.whisperx.align(
            result['segments'], align_model, metadata,
            audio, self.device, return_char_alignments=False
        )
        word_timestamps = []
        for segment in aligned['segments']:
            for w in segment.get('words', []):
                word_timestamps.append({
                    'word': w.get('word', '').strip(),
                    'start': round(w.get('start', 0.0), 4),
                    'end': round(w.get('end', 0.0), 4),
                    'score': round(w.get('score', 0.0), 4)
                })
        output_data = {
            'video_id': video_id,
            'language': result['language'],
            'word_timestamps': word_timestamps,
            'segments': aligned['segments']
        }
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        print('[WhisperTranscriber] ' + str(len(word_timestamps)) + ' words -> ' + output_path)
        return output_path