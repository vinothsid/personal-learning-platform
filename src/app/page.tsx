'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  FlashCardComponent,
  DocumentUpload,
  UploadedItemsList,
} from '@/components';
import { createFlashCard, createContent, ContentType } from '@/types';
import {
  StorageService,
  FileProcessingService,
  FlashcardGenerationService,
} from '@/services';

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);
  const [refreshList, setRefreshList] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const storageService = new StorageService();
  const fileProcessingService = new FileProcessingService();
  const flashcardGenerationService = new FlashcardGenerationService();

  const demoCard = createFlashCard({
    question: 'What is the SM-2 spaced repetition algorithm?',
    answer:
      'A method for calculating optimal review intervals based on recall difficulty, using ease factors and quality ratings to maximize long-term retention.',
    tags: ['spaced-repetition', 'learning', 'memory'],
  });

  const handleFileSelect = async (files: File[]) => {
    console.log('Selected files:', files);
    setProcessingStatus('Processing files...');

    try {
      // Process each file and create content records with flashcard generation
      for (const file of files) {
        setProcessingStatus(`Processing ${file.name}...`);

        // Create content record first
        const content = createContent({
          title: file.name,
          type: getContentType(file.name),
          filePath: file.name, // In a real app, this would be a proper file path
          youtubeUrl: null,
          metadata: {
            originalName: file.name,
            fileSize: file.size,
            fileType: file.type,
            lastModified: new Date(file.lastModified),
          },
          tags: ['uploaded', 'document'],
        });

        await storageService.saveContent(content);

        // Process file to extract text (only for supported types)
        if (fileProcessingService.isFileTypeSupported(file)) {
          setProcessingStatus(`Extracting text from ${file.name}...`);

          const processingResult =
            await fileProcessingService.processFile(file);

          if (processingResult.success && processingResult.extractedText) {
            setProcessingStatus(`Generating flashcards from ${file.name}...`);

            // Generate flashcards from extracted text
            const generationResult =
              await flashcardGenerationService.generateFlashcards(
                processingResult.extractedText,
                {
                  maxCards: 10,
                  customTags: [
                    file.name.replace(/\.[^/.]+$/, ''),
                    'auto-generated',
                  ],
                }
              );

            if (
              generationResult.success &&
              generationResult.flashcards.length > 0
            ) {
              // Save generated flashcards and link them to content
              const flashcardIds: string[] = [];

              for (const flashcard of generationResult.flashcards) {
                // Link flashcard to source content
                flashcard.contentSourceId = content.id;
                await storageService.saveFlashCard(flashcard);
                flashcardIds.push(flashcard.id);
              }

              // Update content with associated flashcard IDs
              const updatedContent = {
                ...content,
                associatedCardIds: flashcardIds,
                metadata: {
                  ...content.metadata,
                  generatedCardsCount: flashcardIds.length,
                  textExtracted: true,
                  ...processingResult.metadata,
                },
              };

              await storageService.saveContent(updatedContent);

              console.log(
                `Generated ${flashcardIds.length} flashcards from ${file.name}`
              );
            } else {
              console.warn(
                `Could not generate flashcards from ${file.name}:`,
                generationResult.error
              );

              // Update content to indicate processing attempted but failed
              const updatedContent = {
                ...content,
                metadata: {
                  ...content.metadata,
                  textExtracted: true,
                  generatedCardsCount: 0,
                  processingError: generationResult.error,
                },
              };

              await storageService.saveContent(updatedContent);
            }
          } else {
            console.warn(
              `Could not extract text from ${file.name}:`,
              processingResult.error
            );

            // Update content to indicate text extraction failed
            const updatedContent = {
              ...content,
              metadata: {
                ...content.metadata,
                textExtracted: false,
                processingError: processingResult.error,
              },
            };

            await storageService.saveContent(updatedContent);
          }
        } else {
          console.log(`File type not supported for processing: ${file.name}`);

          // Update content to indicate file type not supported
          const updatedContent = {
            ...content,
            metadata: {
              ...content.metadata,
              textExtracted: false,
              processingError: 'File type not supported for text extraction',
            },
          };

          await storageService.saveContent(updatedContent);
        }
      }

      setProcessingStatus('');
      // Trigger refresh of the uploaded items list
      setRefreshList(prev => prev + 1);
    } catch (error) {
      console.error('Error processing files:', error);
      setProcessingStatus('');
      throw error;
    }
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  const handleUploadComplete = (files: File[]) => {
    console.log(
      'Upload completed for files:',
      files.map(f => f.name)
    );
    // Trigger refresh of the uploaded items list
    setRefreshList(prev => prev + 1);
  };

  const getContentType = (filename: string): ContentType => {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return ContentType.DOCUMENT;
      default:
        return ContentType.DOCUMENT;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Personal Learning Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Master any subject with spaced repetition flashcards and intelligent
            review scheduling
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              variant="primary"
              size="large"
              onClick={() => setShowDemo(!showDemo)}
            >
              {showDemo ? 'Hide Demo' : 'Try Demo'}
            </Button>
            <Button variant="ghost" size="large">
              View Documentation
            </Button>
          </div>
        </div>

        {/* Demo Section */}
        {showDemo && (
          <div className="mb-12">
            <Card>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Interactive FlashCard Demo
              </h2>
              <div className="max-w-md mx-auto">
                <FlashCardComponent
                  card={demoCard}
                  studyMode
                  onReveal={cardId => console.log('Card revealed:', cardId)}
                  onRate={(cardId, quality) =>
                    console.log('Card rated:', cardId, quality)
                  }
                />
              </div>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card hover>
            <div className="text-center">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Spaced Repetition
              </h3>
              <p className="text-gray-600">
                Scientifically-proven SM-2 algorithm optimizes review timing for
                maximum retention
              </p>
            </div>
          </Card>

          <Card hover>
            <div className="text-center">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Content Integration
              </h3>
              <p className="text-gray-600">
                Link flashcards to documents, videos, and notes with timestamp
                precision
              </p>
            </div>
          </Card>

          <Card hover>
            <div className="text-center">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600">
                Detailed analytics and study session metrics to monitor your
                learning
              </p>
            </div>
          </Card>
        </div>

        {/* Document Upload Section */}
        <Card>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Upload Documents
          </h2>
          <DocumentUpload
            onFileSelect={handleFileSelect}
            onError={handleUploadError}
            onUploadComplete={handleUploadComplete}
            uploadStatus={
              processingStatus
                ? { status: 'uploading', message: processingStatus }
                : { status: 'idle' }
            }
          />

          {processingStatus && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <div className="text-2xl mr-3">⚙️</div>
                <div>
                  <h4 className="font-medium text-blue-900">
                    Processing Files
                  </h4>
                  <p className="text-blue-700 text-sm">{processingStatus}</p>
                  <p className="text-blue-600 text-xs mt-1">
                    Extracting text and generating flashcards automatically...
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Uploaded Items List */}
        <div className="mt-8">
          <UploadedItemsList
            key={refreshList}
            onRefresh={() => setRefreshList(prev => prev + 1)}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Inspired by iDoRecall • Built with Claude Code</p>
        </div>
      </div>
    </div>
  );
}
