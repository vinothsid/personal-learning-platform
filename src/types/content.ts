export enum ContentType {
  DOCUMENT = 'document',
  VIDEO = 'video',
  NOTE = 'note',
}

export interface ContentMetadata {
  duration?: number; // Video duration in seconds
  thumbnail?: string; // Video thumbnail URL
  channel?: string; // YouTube channel name
  fileSize?: number; // Document file size in bytes
  pageCount?: number; // PDF page count
  [key: string]: unknown; // Allow additional metadata
}

export interface Content {
  id: string;
  title: string;
  type: ContentType;
  filePath: string | null; // For documents
  youtubeUrl: string | null; // For videos
  metadata: ContentMetadata;
  tags: string[];
  associatedCardIds: string[]; // IDs of flashcards linked to this content
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContentInput {
  title: string;
  type: ContentType;
  filePath?: string | null;
  youtubeUrl?: string | null;
  metadata?: ContentMetadata;
  tags?: string[];
}

/**
 * Creates a new content item
 */
export function createContent(input: CreateContentInput): Content {
  const now = new Date();
  const id = generateId();
  
  return {
    id,
    title: input.title,
    type: input.type,
    filePath: input.filePath || null,
    youtubeUrl: input.youtubeUrl || null,
    metadata: input.metadata || {},
    tags: input.tags || [],
    associatedCardIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Validates a content object
 */
export function validateContent(content: Content): boolean {
  // Check required fields
  if (!content.title.trim()) {
    return false;
  }
  
  // Type-specific validation
  switch (content.type) {
    case ContentType.DOCUMENT:
      if (!content.filePath) {
        return false;
      }
      break;
    case ContentType.VIDEO:
      if (!content.youtubeUrl) {
        return false;
      }
      // Basic YouTube URL validation
      if (!isValidYouTubeUrl(content.youtubeUrl)) {
        return false;
      }
      break;
    case ContentType.NOTE:
      // Notes don't require file path or URL
      break;
    default:
      return false;
  }
  
  return true;
}

/**
 * Validates YouTube URL format
 */
function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
  return youtubeRegex.test(url);
}

/**
 * Generates a unique ID for entities
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}