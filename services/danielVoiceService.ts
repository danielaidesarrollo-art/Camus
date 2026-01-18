/**
 * Daniel Voice Service
 * Text-to-speech synthesis using Daniel's cloned voice
 */

import type {
    VoiceGuidance,
    DanielVoiceConfig
} from '../types/copilot';

class DanielVoiceService {
    private config: DanielVoiceConfig;
    private audioContext: AudioContext | null;
    private voiceServerUrl: string;
    private useRemoteVoice: boolean;

    constructor() {
        this.audioContext = null;
        this.voiceServerUrl = import.meta.env.VITE_VOICE_SERVER_URL || '/sovits';
        this.useRemoteVoice = import.meta.env.VITE_USE_REMOTE_VOICE === 'true';

        this.config = {
            modelWeights: {
                gptSoVITS: 'Daniel_Felipe_e8_s720.pth',
                checkpoint: 'Daniel_Felipe-e15.ckpt'
            },
            audioSamples: ['daniel.wav'],
            voiceSettings: {
                speed: 1.0,
                pitch: 1.0,
                volume: 0.8
            }
        };
    }

    /**
     * Initialize audio context
     */
    private initAudioContext(): void {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    /**
     * Synthesize speech from text using Daniel's voice
     */
    async synthesize(guidance: VoiceGuidance): Promise<string> {
        console.log('[Daniel Voice] Synthesizing:', guidance.text);

        try {
            if (this.useRemoteVoice) {
                return await this.synthesizeRemote(guidance);
            } else {
                return await this.synthesizeLocal(guidance);
            }
        } catch (error) {
            console.error('[Daniel Voice] Synthesis error:', error);
            // Fallback to browser TTS
            return await this.synthesizeFallback(guidance);
        }
    }

    /**
     * Synthesize using remote GPT-SoVITS server
     */
    private async synthesizeRemote(guidance: VoiceGuidance): Promise<string> {
        const response = await fetch(`${this.voiceServerUrl}/synthesize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: guidance.text,
                speed: this.config.voiceSettings.speed,
                pitch: this.config.voiceSettings.pitch
            })
        });

        if (!response.ok) {
            throw new Error(`Voice server error: ${response.statusText}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        return audioUrl;
    }

    /**
     * Synthesize using local browser TTS (fallback)
     */
    private async synthesizeLocal(guidance: VoiceGuidance): Promise<string> {
        // TODO: Implement local synthesis with loaded model weights
        // For now, use fallback
        return await this.synthesizeFallback(guidance);
    }

    /**
     * Fallback to browser Web Speech API
     */
    private async synthesizeFallback(guidance: VoiceGuidance): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!('speechSynthesis' in window)) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }

            const utterance = new SpeechSynthesisUtterance(guidance.text);
            utterance.rate = this.config.voiceSettings.speed;
            utterance.pitch = this.config.voiceSettings.pitch;
            utterance.volume = this.config.voiceSettings.volume;

            // Try to use a Spanish voice
            const voices = speechSynthesis.getVoices();
            const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
            if (spanishVoice) {
                utterance.voice = spanishVoice;
            }

            utterance.onend = () => resolve('fallback');
            utterance.onerror = (error) => reject(error);

            speechSynthesis.speak(utterance);
        });
    }

    /**
     * Speak text immediately
     */
    async speak(text: string, priority: 'immediate' | 'normal' | 'low' = 'normal'): Promise<void> {
        const guidance: VoiceGuidance = {
            id: `voice_${Date.now()}`,
            text,
            priority,
            repeat: false,
            context: 'copilot'
        };

        const audioUrl = await this.synthesize(guidance);

        if (audioUrl !== 'fallback') {
            await this.playAudio(audioUrl);
        }
    }

    /**
     * Play audio file
     */
    private async playAudio(audioUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const audio = new Audio(audioUrl);
            audio.volume = this.config.voiceSettings.volume;

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
            };

            audio.onerror = (error) => {
                URL.revokeObjectURL(audioUrl);
                reject(error);
            };

            audio.play().catch(reject);
        });
    }

    /**
     * Stop current speech
     */
    stop(): void {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }

    /**
     * Update voice settings
     */
    updateSettings(settings: Partial<DanielVoiceConfig['voiceSettings']>): void {
        this.config.voiceSettings = {
            ...this.config.voiceSettings,
            ...settings
        };
    }

    /**
     * Get current settings
     */
    getSettings(): DanielVoiceConfig['voiceSettings'] {
        return { ...this.config.voiceSettings };
    }

    /**
     * Test voice synthesis
     */
    async test(): Promise<boolean> {
        try {
            await this.speak('Hola, soy Daniel, tu asistente médico de inteligencia artificial.');
            return true;
        } catch (error) {
            console.error('[Daniel Voice] Test failed:', error);
            return false;
        }
    }
}

export const danielVoiceService = new DanielVoiceService();
