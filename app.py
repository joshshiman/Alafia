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
    file_name = audio_file.filename
    local_file_path = os.path.join(os.getcwd(), file_name)
    audio_file.save(local_file_path)
    
    # with tempfile.NamedTemporaryFile(delete=False) as temp_audio_file:
    #     temp_audio_file.write(audio_file.read())
    #     temp_audio_file.close()

    try:
        start = time.time()
        result = model.transcribe(local_file_path)
        print(result["text"])
        transcription = result['text']

        end = time.time()
        length = end - start
        print("It took", length, "seconds!")
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # os.remove(temp_audio_file.name)
        if os.path.exists(local_file_path):
            os.remove(local_file_path)

    return jsonify({'transcription': transcription})
