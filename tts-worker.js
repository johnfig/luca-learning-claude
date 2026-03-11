// Kokoro TTS runs here — off the main thread so the UI is never blocked
import { KokoroTTS } from 'https://esm.sh/kokoro-js';

let tts = null;

KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8' })
  .then(t => { tts = t; self.postMessage({ type: 'ready' }); })
  .catch(() => self.postMessage({ type: 'fail' }));

self.onmessage = async ({ data }) => {
  if (data.type !== 'generate' || !tts) return;
  try {
    const { audio, sampling_rate } = await tts.generate(data.text, { voice: 'af_heart' });
    // Transfer the buffer (zero-copy) to the main thread
    self.postMessage({ type: 'audio', id: data.id, samples: audio, sr: sampling_rate }, [audio.buffer]);
  } catch (_) {
    self.postMessage({ type: 'fail', id: data.id });
  }
};
