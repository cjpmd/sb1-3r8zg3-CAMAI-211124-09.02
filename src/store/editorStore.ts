import { create } from 'zustand';

interface Theme {
  id: string;
  name: string;
  background: string;
  textColor: string;
  fontFamily: string;
}

interface EditorState {
  selectedTheme: Theme;
  voiceId: string;
  subtitlesEnabled: boolean;
  exportFormat: string;
  storyTone: string;
  themes: Theme[];
  setTheme: (theme: Theme) => void;
  setVoiceId: (id: string) => void;
  setSubtitlesEnabled: (enabled: boolean) => void;
  setExportFormat: (format: string) => void;
  setStoryTone: (tone: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedTheme: {
    id: 'default',
    name: 'Default',
    background: 'bg-gradient-to-r from-purple-500 to-pink-500',
    textColor: 'text-white',
    fontFamily: 'font-sans'
  },
  voiceId: 'en-US-Standard-A',
  subtitlesEnabled: true,
  exportFormat: 'mp4',
  storyTone: 'casual',
  themes: [
    {
      id: 'default',
      name: 'Default',
      background: 'bg-gradient-to-r from-purple-500 to-pink-500',
      textColor: 'text-white',
      fontFamily: 'font-sans'
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      background: 'bg-gray-900',
      textColor: 'text-gray-100',
      fontFamily: 'font-mono'
    },
    {
      id: 'light',
      name: 'Light Mode',
      background: 'bg-gray-100',
      textColor: 'text-gray-900',
      fontFamily: 'font-serif'
    }
  ],
  setTheme: (theme) => set({ selectedTheme: theme }),
  setVoiceId: (id) => set({ voiceId: id }),
  setSubtitlesEnabled: (enabled) => set({ subtitlesEnabled: enabled }),
  setExportFormat: (format) => set({ exportFormat: format }),
  setStoryTone: (tone) => set({ storyTone: tone })
}));