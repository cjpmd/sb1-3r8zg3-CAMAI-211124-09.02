export interface VoiceOption {
  id: string;
  name: string;
  style: string;
  previewUrl: string;
}

export const voiceOptions: VoiceOption[] = [
  {
    id: 'adam',
    name: 'Adam',
    style: 'Professional',
    previewUrl: 'https://api.elevenlabs.io/v1/voices/adam/preview'
  },
  {
    id: 'bella',
    name: 'Bella',
    style: 'Friendly',
    previewUrl: 'https://api.elevenlabs.io/v1/voices/bella/preview'
  },
  {
    id: 'charlie',
    name: 'Charlie',
    style: 'Energetic',
    previewUrl: 'https://api.elevenlabs.io/v1/voices/charlie/preview'
  },
  {
    id: 'diana',
    name: 'Diana',
    style: 'Professional',
    previewUrl: 'https://api.elevenlabs.io/v1/voices/diana/preview'
  }
];

export const generateVoiceover = async (text: string, voiceId: string): Promise<Blob> => {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate voice-over');
  }

  return response.blob();
};