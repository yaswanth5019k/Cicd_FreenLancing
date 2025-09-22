'use client';

import { useState, useEffect } from 'react';

// Modal component
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

let pdfjsLib;
if (typeof window !== 'undefined') {
  pdfjsLib = require('pdfjs-dist/build/pdf');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
}

export default function ScannerPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');

  const loadingMessages = [
    'Scanning resume structure...',
    'Analyzing keywords and phrases...',
    'Evaluating ATS compatibility...',
    'Calculating overall score...',
    'Generating detailed feedback...'
  ];

  useEffect(() => {
    let interval;
    let index = 0;

    if (loading) {
      interval = setInterval(() => {
        setLoadingStage(loadingMessages[index]);
        index = (index + 1) % loadingMessages.length;
      }, 2000);
    } else {
      setLoadingStage('');
    }

    return () => clearInterval(interval);
  }, [loading]);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    
    // Check file type
    if (uploadedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      setFile(null);
      return;
    }
    
    // Check file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (uploadedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds 5MB limit. Please upload a smaller file.');
      setFile(null);
      return;
    }
    
    setFile(uploadedFile);
    setError(null);
    setResult(null);
  };

  const extractTextFromPDF = async (file) => {
    if (!pdfjsLib) {
      throw new Error('PDF.js library not loaded');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
      const pdf = await loadingTask.promise;
      let fullText = '';

      // Get total number of pages
      const numPages = pdf.numPages;
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        fullText += pageText + '\\n';
      }

      return fullText;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF file. Please make sure it\'s a valid PDF document.');
    }
  };

  const analyzeResume = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Extract text from PDF
      const fileContent = await extractTextFromPDF(file);

      if (!fileContent || fileContent.trim().length === 0) {
        throw new Error('Could not extract text from the PDF. Please make sure it\'s a text-based PDF and not a scanned image.');
      }

      // Send to backend for analysis
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/scanner/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeText: fileContent
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      if (!data.analysis) {
        throw new Error('No analysis data received');
      }

      setResult(data.analysis);

    } catch (error) {
      console.error('Error analyzing resume:', error);
      if (error.message?.includes('scanned image')) {
        setError('Could not extract text from the PDF. Please make sure it\'s a text-based PDF and not a scanned image.');
      } else if (error.message?.includes('PDF')) {
        setError('Error reading PDF file. Please make sure it\'s a valid PDF document.');
      } else if (error.message?.includes('configuration error')) {
        setError('AI service is not properly configured. Please try again later.');
      } else if (error.message?.includes('temporarily unavailable')) {
        setError('AI service is temporarily unavailable. Please try again in a few minutes.');
      } else {
        setError('Error analyzing resume. Please try again or contact support if the issue persists.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="absolute top-0 -z-10 h-full w-full bg-white">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(173,109,244,0.5)] opacity-50 blur-[80px]"></div>
      </div>

      <h1 className="text-3xl font-bold mb-8">ATS Resume Scanner</h1>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 relative overflow-hidden border border-gray-100">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Upload Your Resume
          </h2>
          <p className="text-gray-600">
            Let's analyze your resume against ATS systems
          </p>
        </div>

        <div className="mb-6">
          <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 transition-all hover:border-blue-500 group">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col items-center text-center">
                <p className="text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>
                  {' '}or drag and drop
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PDF (up to 5MB)
                </p>
                {file && (
                  <div className="mt-4 text-sm text-gray-800 font-medium">
                    Selected: {file.name}
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Note: Text-based PDFs only. Scanned documents may not work properly.
          </p>
        </div>

        <button
          onClick={analyzeResume}
          disabled={!file || loading}
          className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium
            transition-all duration-200 transform hover:translate-y-[-2px] hover:shadow-lg
            ${(!file || loading) ? 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none' : ''}`}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center mb-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing...</span>
              </div>
              <div className="text-sm opacity-80 animate-pulse">
                {loadingStage}
              </div>
            </div>
          ) : 'Analyze Resume'}
        </button>

        {loading && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-blue-800 font-medium">{loadingStage}</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={result !== null} onClose={() => setResult(null)}>
        <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
        <div className="prose max-w-none whitespace-pre-wrap">
          {result}
        </div>
      </Modal>
    </div>
  );
}
