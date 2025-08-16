import { useState, useRef } from 'react';
import { FileUpload, CharacterData, ContextData, TextSegmentData } from '@/lib/prompt-types';
import { parseFileContent } from '@/lib/prompt-helpers';
import { segmentBulgarianText } from '@/lib/text-segmentation';

export function usePromptManager() {
  const [contextFile, setContextFile] = useState<FileUpload | null>(null);
  const [characterFile, setCharacterFile] = useState<FileUpload | null>(null);
  const [contextData, setContextData] = useState<ContextData | null>(null);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  
  // Bulgarian text segmentation state
  const [textFile, setTextFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [segmentData, setSegmentData] = useState<TextSegmentData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const contextFileRef = useRef<HTMLInputElement>(null);
  const characterFileRef = useRef<HTMLInputElement>(null);
  const textFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    file: File,
    fileType: 'character' | 'context'
  ) => {
    try {
      const { data, content } = await parseFileContent(file, fileType);
      
      if (fileType === 'character') {
        setCharacterData(data as CharacterData);
        setCharacterFile({
          content,
          filename: file.name,
        });
      } else {
        setContextData(data as ContextData);
        setContextFile({
          content,
          filename: file.name,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error reading file");
      }
      console.error("File reading error:", error);
    }
  };

  const handleContextFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'context');
    }
  };

  const handleCharacterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'character');
    }
  };

  const removeContextFile = () => {
    setContextFile(null);
    setContextData(null);
    if (contextFileRef.current) {
      contextFileRef.current.value = "";
    }
  };

  const removeCharacterFile = () => {
    setCharacterFile(null);
    setCharacterData(null);
    if (characterFileRef.current) {
      characterFileRef.current.value = "";
    }
  };

  // Bulgarian text file handlers
  const handleTextFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setError('Please select a .txt file');
      return;
    }

    setError(null);
    setTextFile(file);
    
    try {
      const content = await readFileContent(file);
      setTextContent(content);
    } catch (err) {
      setError('Failed to read file content');
      console.error('File reading error:', err);
    }
  };

  const removeTextFile = () => {
    setTextFile(null);
    setTextContent('');
    setSegmentData(null);
    setError(null);
    
    if (textFileRef.current) {
      textFileRef.current.value = '';
    }
  };

  const processTextSegmentation = async () => {
    if (!textContent.trim()) {
      setError('No text content to process');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Segment the Bulgarian text
      const segments = segmentBulgarianText(textContent, 25, 25);
      
      if (segments.length === 0) {
        setError('No segments could be extracted from the text');
        setIsProcessing(false);
        return;
      }

      const segmentData: TextSegmentData = {
        originalText: textContent,
        segments: segments.map(segment => ({
          selectedSentence: segment.selectedSentence,
          windowIndex: segment.windowIndex,
          wordCount: segment.windowWords.length,
        })),
        totalSegments: segments.length,
      };

      setSegmentData(segmentData);
    } catch (err) {
      setError('Failed to process text segmentation');
      console.error('Segmentation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content || '');
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file, 'utf-8');
    });
  };

  return {
    // State
    contextFile,
    characterFile,
    contextData,
    characterData,
    
    // Bulgarian text state
    textFile,
    textContent,
    segmentData,
    isProcessing,
    error,
    
    // Refs
    contextFileRef,
    characterFileRef,
    textFileRef,
    
    // Handlers
    handleContextFileChange,
    handleCharacterFileChange,
    removeContextFile,
    removeCharacterFile,
    handleTextFileChange,
    removeTextFile,
    processTextSegmentation,
    
    // Getters for accessing data
    getCharacterData: () => characterData,
    getContextData: () => contextData,
  };
}
