const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const recordedChunks = [];

    // Function to start recording
    startButton.addEventListener('click', () => {
      startRecording();
      startButton.disabled = true;
      stopButton.disabled = false;
    });

    // Function to stop recording
    stopButton.addEventListener('click', () => {
      stopRecording();
      stopButton.disabled = true;
    });

    let mediaRecorder;

    // Start recording audio
    function startRecording() {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) recordedChunks.push(event.data);
        };

        mediaRecorder.start();
      }).catch(err => console.error('Error accessing microphone:', err));
    }

    // Stop recording and process the audio
    function stopRecording() {
      mediaRecorder.stop();

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Convert WebM to WAV using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = await audioContext.decodeAudioData(uint8Array.buffer);

        // Convert AudioBuffer to WAV
        const wavData = audioBufferToWav(buffer);

        // Create a WAV Blob
        const wavBlob = new Blob([new DataView(wavData)], { type: 'audio/wav' });
        // const url = URL.createObjectURL(wavBlob);
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = 'recording.wav';
        // a.click();
        // URL.revokeObjectURL(url);
      };
    }

    // Function to convert AudioBuffer to WAV format
    function audioBufferToWav(buffer) {
      const numOfChannels = buffer.numberOfChannels;
      const length = buffer.length * numOfChannels * 2 + 44;
      const wavArray = new ArrayBuffer(length);
      const view = new DataView(wavArray);
      const channels = [];

      let offset = 0;

      // Write WAV header
      function writeString(str) {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset++, str.charCodeAt(i));
        }
      }

      writeString('RIFF');
      view.setUint32(offset, length - 8, true);
      offset += 4;
      writeString('WAVE');
      writeString('fmt ');
      view.setUint32(offset, 16, true); // Subchunk1Size
      offset += 4;
      view.setUint16(offset, 1, true); // AudioFormat (1 = PCM)
      offset += 2;
      view.setUint16(offset, numOfChannels, true);
      offset += 2;
      view.setUint32(offset, buffer.sampleRate, true);
      offset += 4;
      view.setUint32(offset, buffer.sampleRate * numOfChannels * 2, true); // ByteRate
      offset += 4;
      view.setUint16(offset, numOfChannels * 2, true); // BlockAlign
      offset += 2;
      view.setUint16(offset, 16, true); // BitsPerSample
      offset += 2;

      writeString('data');
      view.setUint32(offset, buffer.length * numOfChannels * 2, true); // Subchunk2Size
      offset += 4;

      // Write audio samples
      for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numOfChannels; channel++) {
          const sample = buffer.getChannelData(channel)[i] * 32767;
          view.setInt16(offset, sample < -32768 ? -32768 : (sample > 32767 ? 32767 : sample), true);
          offset += 2;
        }
      }

      return wavArray;
    };