// server/services/ttsService.js

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// Default voice: "Rachel", a standard pre-made ElevenLabs voice. 
// Override with ELEVENLABS_VOICE_ID in .env to use a different voice.
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

const textToAudioBuffer = async (text) => {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("Could not find ElevenLabs credentials. Please set the ELEVENLABS_API_KEY environment variable.");
  }

  console.log("TTS Service: Converting text to audio via ElevenLabs...");

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ElevenLabs TTS request failed (${response.status}): ${errorBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  console.log("TTS Service: Audio buffer received.");
  return Buffer.from(arrayBuffer);
};

export const ttsService = {
  textToAudioBuffer,
};