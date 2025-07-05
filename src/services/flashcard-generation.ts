import { createFlashCard, FlashCard } from '@/types';

export interface FlashcardGenerationOptions {
  maxCards?: number;
  minQuestionLength?: number;
  maxQuestionLength?: number;
  includeDefinitions?: boolean;
  includeConcepts?: boolean;
  customTags?: string[];
}

export interface GenerationResult {
  success: boolean;
  flashcards: FlashCard[];
  skippedSentences: number;
  error?: string;
}

export interface FlashcardGenerationInterface {
  /**
   * Generate flashcards from extracted text content
   */
  generateFlashcards(
    text: string,
    options?: FlashcardGenerationOptions
  ): Promise<GenerationResult>;

  /**
   * Extract key concepts from text
   */
  extractKeyConcepts(text: string): string[];

  /**
   * Extract definitions from text
   */
  extractDefinitions(text: string): Array<{ term: string; definition: string }>;

  /**
   * Generate question-answer pairs from sentences
   */
  generateQuestionsFromSentences(
    sentences: string[]
  ): Array<{ question: string; answer: string }>;
}

/**
 * Service for generating flashcards from text content using pattern matching and heuristics
 */
export class FlashcardGenerationService
  implements FlashcardGenerationInterface
{
  private readonly defaultOptions: Required<FlashcardGenerationOptions> = {
    maxCards: 20,
    minQuestionLength: 10,
    maxQuestionLength: 200,
    includeDefinitions: true,
    includeConcepts: true,
    customTags: [],
  };

  /**
   * Generate flashcards from text content
   */
  async generateFlashcards(
    text: string,
    options: FlashcardGenerationOptions = {}
  ): Promise<GenerationResult> {
    try {
      const opts = { ...this.defaultOptions, ...options };
      const flashcards: FlashCard[] = [];
      let skippedSentences = 0;

      // Clean and prepare text
      const cleanedText = this.preprocessText(text);

      if (!cleanedText.trim()) {
        return {
          success: false,
          flashcards: [],
          skippedSentences: 0,
          error: 'No content to process',
        };
      }

      // Extract definitions if enabled
      if (opts.includeDefinitions) {
        const definitions = this.extractDefinitions(cleanedText);
        for (const def of definitions.slice(0, Math.floor(opts.maxCards / 2))) {
          const flashcard = createFlashCard({
            question: `What is ${def.term}?`,
            answer: def.definition,
            tags: ['definition', 'generated', ...opts.customTags],
          });
          flashcards.push(flashcard);
        }
      }

      // Extract key concepts if enabled
      if (opts.includeConcepts) {
        const concepts = this.extractKeyConcepts(cleanedText);
        const remainingSlots = opts.maxCards - flashcards.length;

        for (const concept of concepts.slice(
          0,
          Math.floor(remainingSlots / 2)
        )) {
          const flashcard = createFlashCard({
            question: `Explain the concept of ${concept}`,
            answer: `${concept} is a key concept mentioned in the text. Please review the original content for detailed information.`,
            tags: ['concept', 'generated', ...opts.customTags],
          });
          flashcards.push(flashcard);
        }
      }

      // Generate Q&A from sentences
      const sentences = this.extractSentences(cleanedText);
      const questionPairs = this.generateQuestionsFromSentences(sentences);
      const remainingSlots = opts.maxCards - flashcards.length;

      for (const pair of questionPairs.slice(0, remainingSlots)) {
        if (
          pair.question.length >= opts.minQuestionLength &&
          pair.question.length <= opts.maxQuestionLength
        ) {
          const flashcard = createFlashCard({
            question: pair.question,
            answer: pair.answer,
            tags: ['generated', 'content-based', ...opts.customTags],
          });
          flashcards.push(flashcard);
        } else {
          skippedSentences++;
        }
      }

      // If no flashcards were generated, create some basic ones
      if (flashcards.length === 0) {
        const fallbackCards = this.generateFallbackFlashcards(
          cleanedText,
          opts
        );
        flashcards.push(...fallbackCards);
      }

      return {
        success: true,
        flashcards,
        skippedSentences,
      };
    } catch (error) {
      return {
        success: false,
        flashcards: [],
        skippedSentences: 0,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Extract key concepts from text using pattern matching
   */
  extractKeyConcepts(text: string): string[] {
    const concepts: Set<string> = new Set();

    // Pattern for "X is a/an Y" or "X are Y"
    const definitionPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|are)\s+(?:a|an|the)?\s*([^.!?]+)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*:\s*([^.!?\n]+)/gi,
    ];

    for (const pattern of definitionPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const concept = match[1].trim();
        if (concept.length > 2 && concept.length < 50) {
          concepts.add(concept);
        }
      }
    }

    // Extract capitalized terms (potential proper nouns/concepts)
    const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const capitalizedMatches = text.matchAll(capitalizedPattern);

    for (const match of capitalizedMatches) {
      const concept = match[0].trim();
      if (
        concept.length > 3 &&
        concept.length < 40 &&
        !this.isCommonWord(concept)
      ) {
        concepts.add(concept);
      }
    }

    return Array.from(concepts).slice(0, 10); // Limit to top 10 concepts
  }

  /**
   * Extract definitions from text using pattern matching
   */
  extractDefinitions(
    text: string
  ): Array<{ term: string; definition: string }> {
    const definitions: Array<{ term: string; definition: string }> = [];

    // Pattern for "X is/are Y" definitions
    const definitionPattern =
      /([A-Z][a-z]+(?:\s+[a-z]+)*)\s+(is|are)\s+([^.!?]+[.!?])/gi;
    const matches = text.matchAll(definitionPattern);

    for (const match of matches) {
      const term = match[1].trim();
      const definition = match[3].trim();

      if (
        term.length > 2 &&
        term.length < 50 &&
        definition.length > 10 &&
        definition.length < 300
      ) {
        definitions.push({ term, definition });
      }
    }

    // Pattern for "X: Y" definitions
    const colonPattern = /([A-Z][a-z]+(?:\s+[a-z]+)*)\s*:\s*([^.!?\n]+)/gi;
    const colonMatches = text.matchAll(colonPattern);

    for (const match of colonMatches) {
      const term = match[1].trim();
      const definition = match[2].trim();

      if (
        term.length > 2 &&
        term.length < 50 &&
        definition.length > 10 &&
        definition.length < 300
      ) {
        definitions.push({ term, definition });
      }
    }

    return definitions.slice(0, 10); // Limit to top 10 definitions
  }

  /**
   * Generate question-answer pairs from sentences
   */
  generateQuestionsFromSentences(
    sentences: string[]
  ): Array<{ question: string; answer: string }> {
    const pairs: Array<{ question: string; answer: string }> = [];

    for (const sentence of sentences) {
      const trimmed = sentence.trim();

      if (trimmed.length < 20 || trimmed.length > 200) {
        continue; // Skip sentences that are too short or too long
      }

      // Generate fill-in-the-blank questions
      const fillInQuestions = this.generateFillInTheBlank(trimmed);
      pairs.push(...fillInQuestions);

      // Generate what/why/how questions
      const contextQuestions = this.generateContextQuestions(trimmed);
      pairs.push(...contextQuestions);
    }

    return pairs.slice(0, 15); // Limit to prevent too many cards
  }

  /**
   * Generate fill-in-the-blank questions from a sentence
   */
  private generateFillInTheBlank(
    sentence: string
  ): Array<{ question: string; answer: string }> {
    const pairs: Array<{ question: string; answer: string }> = [];

    // Find important words to blank out (nouns, adjectives, numbers)
    const words = sentence.split(/\s+/);
    const importantWordPattern = /^[A-Z][a-z]+$|^\d+$|^[a-z]{4,}$/;

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^\w]/g, ''); // Remove punctuation

      if (importantWordPattern.test(word) && word.length > 3) {
        const question = words
          .map((w, index) => (index === i ? '______' : w))
          .join(' ');

        pairs.push({
          question: `Fill in the blank: ${question}`,
          answer: word,
        });

        if (pairs.length >= 2) break; // Limit to 2 fill-in-the-blank per sentence
      }
    }

    return pairs;
  }

  /**
   * Generate contextual questions from a sentence
   */
  private generateContextQuestions(
    sentence: string
  ): Array<{ question: string; answer: string }> {
    const pairs: Array<{ question: string; answer: string }> = [];

    // If sentence contains "because", create a "why" question
    if (sentence.toLowerCase().includes('because')) {
      const parts = sentence.split(/because/i);
      if (parts.length === 2) {
        pairs.push({
          question: `Why ${parts[0].trim().toLowerCase()}?`,
          answer: `Because ${parts[1].trim()}`,
        });
      }
    }

    // If sentence contains numbers or dates, create specific questions
    const numberMatch = sentence.match(
      /\b\d{4}\b|\b\d+%\b|\b\d+\s*(million|billion|thousand)\b/
    );
    if (numberMatch) {
      pairs.push({
        question: `What is the significance of ${numberMatch[0]} in this context?`,
        answer: sentence,
      });
    }

    return pairs;
  }

  /**
   * Generate fallback flashcards when no specific patterns are found
   */
  private generateFallbackFlashcards(
    text: string,
    options: Required<FlashcardGenerationOptions>
  ): FlashCard[] {
    const sentences = this.extractSentences(text);
    const flashcards: FlashCard[] = [];

    // Create basic comprehension questions
    if (sentences.length > 0) {
      const firstSentence = sentences[0];
      flashcards.push(
        createFlashCard({
          question: 'What is the main topic of this content?',
          answer: firstSentence,
          tags: ['comprehension', 'generated', ...options.customTags],
        })
      );
    }

    if (sentences.length > 2) {
      const middleSentence = sentences[Math.floor(sentences.length / 2)];
      flashcards.push(
        createFlashCard({
          question: 'What is a key point mentioned in this content?',
          answer: middleSentence,
          tags: ['key-point', 'generated', ...options.customTags],
        })
      );
    }

    return flashcards.slice(0, 3); // Maximum 3 fallback cards
  }

  /**
   * Preprocess text for better processing
   */
  private preprocessText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Ensure space after sentence endings
      .trim();
  }

  /**
   * Extract sentences from text
   */
  private extractSentences(text: string): string[] {
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && s.length < 300);

    return sentences.slice(0, 20); // Limit to 20 sentences for processing
  }

  /**
   * Check if a word is a common word that shouldn't be considered a concept
   */
  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'The',
      'This',
      'That',
      'These',
      'Those',
      'And',
      'But',
      'Or',
      'For',
      'With',
      'From',
      'Into',
      'During',
      'Before',
      'After',
      'Above',
      'Below',
      'Between',
      'Through',
      'During',
      'Upon',
      'Within',
      'Without',
      'About',
      'Many',
      'Some',
      'Most',
      'All',
      'Each',
      'Every',
      'Any',
      'Few',
      'More',
      'Less',
      'Other',
      'Another',
      'Such',
      'Only',
      'Own',
      'Same',
      'Different',
    ]);

    return commonWords.has(word);
  }
}
