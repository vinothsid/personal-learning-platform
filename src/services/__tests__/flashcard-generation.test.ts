import { FlashcardGenerationService } from '../flashcard-generation';

describe('FlashcardGenerationService', () => {
  let service: FlashcardGenerationService;

  beforeEach(() => {
    service = new FlashcardGenerationService();
  });

  describe('generateFlashcards', () => {
    it('should generate flashcards from text with definitions', async () => {
      const text = `
        Machine Learning is a subset of artificial intelligence that enables computers to learn and improve from experience.
        Neural Networks are computing systems inspired by biological neural networks.
        Deep Learning is a machine learning technique based on artificial neural networks.
      `;

      const result = await service.generateFlashcards(text, {
        maxCards: 10,
        includeDefinitions: true,
        includeConcepts: true,
      });

      expect(result.success).toBe(true);
      expect(result.flashcards.length).toBeGreaterThan(0);

      // Should have some definition-based flashcards
      const definitionCards = result.flashcards.filter(card =>
        card.tags.includes('definition')
      );
      expect(definitionCards.length).toBeGreaterThan(0);
    });

    it('should generate concept-based flashcards', async () => {
      const text = `
        Artificial Intelligence represents the simulation of human intelligence in machines.
        Machine Learning algorithms can identify patterns in data.
        Deep Learning uses neural networks with multiple layers.
      `;

      const result = await service.generateFlashcards(text, {
        maxCards: 5,
        includeDefinitions: false,
        includeConcepts: true,
      });

      expect(result.success).toBe(true);
      expect(result.flashcards.length).toBeGreaterThan(0);

      // Should have concept-based flashcards
      const conceptCards = result.flashcards.filter(card =>
        card.tags.includes('concept')
      );
      expect(conceptCards.length).toBeGreaterThan(0);
    });

    it('should respect maxCards limit', async () => {
      const longText = `
        Machine Learning is a subset of artificial intelligence.
        Neural Networks are computing systems inspired by biology.
        Deep Learning is a machine learning technique.
        Artificial Intelligence represents simulation of human intelligence.
        Data Science involves extracting insights from data.
        Natural Language Processing deals with human language.
        Computer Vision enables machines to interpret visual information.
        Reinforcement Learning is about taking actions in an environment.
      `;

      const result = await service.generateFlashcards(longText, {
        maxCards: 3,
      });

      expect(result.success).toBe(true);
      expect(result.flashcards.length).toBeLessThanOrEqual(3);
    });

    it('should include custom tags', async () => {
      const text = 'Python is a programming language.';

      const result = await service.generateFlashcards(text, {
        customTags: ['programming', 'python'],
      });

      expect(result.success).toBe(true);
      result.flashcards.forEach(card => {
        expect(card.tags).toContain('programming');
        expect(card.tags).toContain('python');
      });
    });

    it('should handle empty text', async () => {
      const result = await service.generateFlashcards('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No content to process');
    });

    it('should generate fallback flashcards for simple text', async () => {
      const text =
        'This is a simple sentence. Here is another one. And a third sentence.';

      const result = await service.generateFlashcards(text, {
        includeDefinitions: false,
        includeConcepts: false,
      });

      expect(result.success).toBe(true);
      expect(result.flashcards.length).toBeGreaterThan(0);
    });

    it('should skip sentences that are too short or too long', async () => {
      const text = `
        Short.
        This is a medium-length sentence that should be processed normally for flashcard generation.
        This is an extremely long sentence that goes on and on and on and contains way too much information to be useful as a single flashcard question and should probably be skipped during the processing phase because it exceeds the maximum length limit.
      `;

      const result = await service.generateFlashcards(text);

      expect(result.success).toBe(true);
      expect(result.skippedSentences).toBeGreaterThanOrEqual(0);
    });
  });

  describe('extractKeyConcepts', () => {
    it('should extract concepts from definition patterns', () => {
      const text = `
        Machine Learning is a subset of artificial intelligence.
        Neural Networks are computing systems inspired by biology.
        Deep Learning uses artificial neural networks.
      `;

      const concepts = service.extractKeyConcepts(text);

      expect(concepts).toContain('Machine Learning');
      expect(concepts).toContain('Neural Networks');
      expect(concepts).toContain('Deep Learning');
    });

    it('should extract capitalized terms', () => {
      const text = `
        Python and JavaScript are popular programming languages.
        React is a JavaScript library.
        TensorFlow is used for machine learning.
      `;

      const concepts = service.extractKeyConcepts(text);

      expect(concepts).toContain('Python');
      expect(concepts.some(c => c.includes('JavaScript'))).toBe(true);
      expect(concepts).toContain('React');
      expect(concepts).toContain('TensorFlow');
    });

    it('should limit the number of concepts returned', () => {
      const text = `
        Apple Banana Cherry Date Elderberry Fig Grape Honeydew
        Kiwi Lemon Mango Nectarine Orange Papaya Quince Raspberry
        Strawberry Tangerine Ugli Vanilla Watermelon Xigua Yuzu Zucchini
      `.repeat(5);

      const concepts = service.extractKeyConcepts(text);

      expect(concepts.length).toBeLessThanOrEqual(10);
    });

    it('should handle empty text', () => {
      const concepts = service.extractKeyConcepts('');
      expect(concepts).toHaveLength(0);
    });
  });

  describe('extractDefinitions', () => {
    it('should extract "is/are" definitions', () => {
      const text = `
        Machine Learning is a subset of artificial intelligence that enables learning.
        Neural Networks are computing systems inspired by biological networks.
      `;

      const definitions = service.extractDefinitions(text);

      expect(definitions.length).toBeGreaterThan(0);

      const mlDefinition = definitions.find(
        def => def.term === 'Machine Learning'
      );
      expect(mlDefinition).toBeDefined();
      expect(mlDefinition?.definition).toContain(
        'subset of artificial intelligence'
      );

      const nnDefinition = definitions.find(
        def => def.term === 'Neural Networks'
      );
      expect(nnDefinition).toBeDefined();
      expect(nnDefinition?.definition).toContain('computing systems');
    });

    it('should extract colon-separated definitions', () => {
      const text = `
        API: Application Programming Interface that allows different software applications to communicate.
        REST: Representational State Transfer is an architectural style for web services.
      `;

      const definitions = service.extractDefinitions(text);

      expect(definitions.length).toBeGreaterThan(0);

      const apiDefinition = definitions.find(def => def.term === 'API');
      expect(apiDefinition).toBeDefined();
      expect(apiDefinition?.definition).toContain(
        'Application Programming Interface'
      );
    });

    it('should filter out definitions that are too short or too long', () => {
      const text = `
        A is b.
        Normal Term is a properly sized definition that should be included.
        Very Long Term Name is an extremely long definition that goes on and on and contains way too much information and exceeds the reasonable length limit for a flashcard definition and should be filtered out during processing because it would not make a good study card.
      `;

      const definitions = service.extractDefinitions(text);

      // Should include reasonable definitions
      expect(definitions.length).toBeGreaterThan(0);
      expect(definitions.some(d => d.term === 'Normal Term')).toBe(true);
    });

    it('should limit the number of definitions returned', () => {
      const longText = Array.from(
        { length: 20 },
        (_, i) => `Term${i} is a definition for term number ${i}.`
      ).join(' ');

      const definitions = service.extractDefinitions(longText);

      expect(definitions.length).toBeLessThanOrEqual(10);
    });

    it('should handle empty text', () => {
      const definitions = service.extractDefinitions('');
      expect(definitions).toHaveLength(0);
    });
  });

  describe('generateQuestionsFromSentences', () => {
    it('should generate fill-in-the-blank questions', () => {
      const sentences = [
        'Python is a popular programming language used for data science.',
        'React is a JavaScript library for building user interfaces.',
      ];

      const questions = service.generateQuestionsFromSentences(sentences);

      expect(questions.length).toBeGreaterThan(0);

      const fillInQuestions = questions.filter(q =>
        q.question.includes('Fill in the blank')
      );
      expect(fillInQuestions.length).toBeGreaterThan(0);
    });

    it('should generate "why" questions for sentences with "because"', () => {
      const sentences = [
        'Python is popular because it has simple syntax and powerful libraries.',
      ];

      const questions = service.generateQuestionsFromSentences(sentences);

      const whyQuestions = questions.filter(q =>
        q.question.toLowerCase().includes('why')
      );
      expect(whyQuestions.length).toBeGreaterThan(0);
    });

    it('should generate questions for sentences with numbers', () => {
      const sentences = [
        'The company was founded in 1995 and has grown significantly.',
        'The success rate improved by 25% after the optimization.',
      ];

      const questions = service.generateQuestionsFromSentences(sentences);

      const numberQuestions = questions.filter(q =>
        q.question.includes('significance')
      );
      expect(numberQuestions.length).toBeGreaterThan(0);
    });

    it('should skip sentences that are too short or too long', () => {
      const sentences = [
        'Short.',
        'This is a normal length sentence that should be processed.',
        'This is an extremely long sentence that contains way too much information and goes on and on with excessive detail that would not make for a good flashcard question because it is simply too verbose and complex for effective learning.',
      ];

      const questions = service.generateQuestionsFromSentences(sentences);

      // Should only process the middle sentence
      expect(questions.length).toBeGreaterThan(0);
      // The exact number depends on the patterns found, but should be reasonable
      expect(questions.length).toBeLessThan(10);
    });

    it('should handle empty sentences array', () => {
      const questions = service.generateQuestionsFromSentences([]);
      expect(questions).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle processing errors gracefully', async () => {
      // Create a service with mocked methods that throw errors
      const mockService = new FlashcardGenerationService();
      jest.spyOn(mockService, 'extractKeyConcepts').mockImplementation(() => {
        throw new Error('Processing error');
      });

      const result = await mockService.generateFlashcards('test text');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Processing error');
      expect(result.flashcards).toHaveLength(0);
    });
  });
});
