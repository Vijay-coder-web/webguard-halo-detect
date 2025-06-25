
import { supabase } from '@/integrations/supabase/client';

// Mock API service for HaloGuard
// In a real implementation, this would connect to actual deepfake detection APIs

export interface DetectionResult {
  isDeepfake: boolean;
  confidence: number;
  processing_time: number;
  hasHeatmap?: boolean;
}

export interface ScanHistory {
  id: string;
  filename: string;
  type: 'image' | 'video';
  verdict: 'authentic' | 'deepfake';
  confidence: number;
  timestamp: Date;
}

class HaloGuardAPI {
  private baseURL = '/api'; // This would be your actual API endpoint
  
  // Mock detection - simulates AI analysis
  async detectDeepfake(file: File): Promise<DetectionResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
    
    // Mock result based on filename patterns for demo
    const filename = file.name.toLowerCase();
    const isLikelyDeepfake = filename.includes('fake') || filename.includes('deepfake') || Math.random() < 0.3;
    
    return {
      isDeepfake: isLikelyDeepfake,
      confidence: 0.85 + Math.random() * 0.14, // 85-99% confidence
      processing_time: 2.5 + Math.random() * 2, // 2.5-4.5 seconds
      hasHeatmap: Math.random() > 0.3 // 70% chance of heatmap
    };
  }
  
  // Mock video stream detection
  async detectDeepfakeStream(stream: MediaStream): Promise<DetectionResult> {
    // Simulate real-time processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      isDeepfake: Math.random() < 0.2, // 20% chance for demo
      confidence: 0.75 + Math.random() * 0.2,
      processing_time: 1.2,
      hasHeatmap: false // Real-time doesn't generate heatmaps
    };
  }
  
  // Get scan history
  getScanHistory(): ScanHistory[] {
    // Mock data - in real app this would come from backend
    const mockHistory: ScanHistory[] = [
      {
        id: '1',
        filename: 'profile_photo.jpg',
        type: 'image',
        verdict: 'authentic',
        confidence: 0.94,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: '2',
        filename: 'suspicious_video.mp4',
        type: 'video',
        verdict: 'deepfake',
        confidence: 0.87,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        id: '3',
        filename: 'family_reunion.jpg',
        type: 'image',
        verdict: 'authentic',
        confidence: 0.98,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];
    
    return mockHistory;
  }
  
  // Authentication methods using Supabase
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Login failed');
    }

    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User'
      }
    };
  }
  
  async signup(name: string, email: string, password: string): Promise<{ token: string; user: any }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Signup failed');
    }

    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name
      }
    };
  }
}

export const api = new HaloGuardAPI();
