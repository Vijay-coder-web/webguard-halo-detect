
import React, { useState, useRef } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpiderIcon from './SpiderIcon';

interface UploadFormProps {
  onSubmit: (file: File) => void;
  isLoading?: boolean;
}

const UploadForm: React.FC<UploadFormProps> = ({ onSubmit, isLoading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowWebcam(true);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
            setSelectedFile(file);
            stopWebcam();
          }
        });
      }
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowWebcam(false);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit(selectedFile);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <div className="spider-spinner"></div>
        <p className="text-lg text-muted-foreground">Analyzing for deepfake patterns...</p>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* File Upload Area */}
      <div
        className={`relative bg-card web-border rounded-lg p-8 transition-all duration-300 ${
          dragActive ? 'border-white bg-accent' : 'hover:bg-accent'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Upload Media for Analysis</h3>
            <p className="text-muted-foreground">
              Drag and drop your image or video, or click to browse
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="web-ripple"
          >
            Choose File
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Webcam Option */}
      <div className="text-center">
        <Button
          variant="secondary"
          onClick={showWebcam ? stopWebcam : startWebcam}
          className="web-ripple"
        >
          <Camera className="w-4 h-4 mr-2" />
          {showWebcam ? 'Stop Webcam' : 'Use Webcam'}
        </Button>
      </div>

      {/* Webcam Feed */}
      {showWebcam && (
        <div className="bg-card web-border rounded-lg p-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <div className="flex justify-center mt-4">
            <Button onClick={capturePhoto} className="web-ripple">
              <SpiderIcon size={16} className="mr-2" />
              Capture Photo
            </Button>
          </div>
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="bg-card web-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SpiderIcon size={20} />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleSubmit}
            className="w-full mt-4 web-ripple"
            size="lg"
          >
            <SpiderIcon size={16} className="mr-2" />
            Analyze for Deepfakes
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
