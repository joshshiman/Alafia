import whisper
import time
import tempfile
import os
from flask import Flask, request, jsonify

app = Flask(__name__)
model = whisper.load_model("tiny")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    print(request.files)
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    
    audio_file = request.files['audio']
    
    with tempfile.NamedTemporaryFile(delete=False) as temp_audio_file:
        temp_audio_file.write(audio_file.read())
        temp_audio_file.close()

        try:
            with open(temp_audio_file.name, 'rb') as audio:
                start = time.time()
                result = model.transcribe(r"audio.mp3")
                print(result["text"])
                transcription = result['text']

                end = time.time()
                length = end - start
                print("It took", length, "seconds!")
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            os.remove(temp_audio_file.name)

        return jsonify({'transcription': transcription})
