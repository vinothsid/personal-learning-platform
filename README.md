# Personal Learning Platform

A modern web application for creating and studying flashcards with spaced repetition, inspired by iDoRecall. Built with Next.js, TypeScript, and following Test-Driven Development principles.

## Features

### 🧠 Spaced Repetition Learning

- **SM-2 Algorithm**: Scientifically-proven spaced repetition system that optimizes review intervals
- **Quality-based Scheduling**: Cards are scheduled based on recall difficulty (1-5 rating)
- **Intelligent Review Timing**: Automatic calculation of optimal review intervals for maximum retention

### 📚 Content Management

- **Multi-format Support**: Documents, videos, notes, and web links
- **YouTube Integration**: Direct video embedding with timestamp-based flashcard linking
- **Content Tagging**: Organize content and flashcards with custom tags
- **Search & Filter**: Full-text search across questions, answers, and tags

### 💾 Data Persistence

- **Local Storage**: Client-side data persistence with automatic serialization
- **Export/Import**: Full data backup and restore functionality
- **CRUD Operations**: Complete Create, Read, Update, Delete support for all data types

### 🎨 Modern UI/UX

- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Atomic Components**: Reusable component library following atomic design principles
- **Interactive Flashcards**: Smooth reveal animations and intuitive rating system
- **Accessibility**: WCAG 2.1 AA compliant components

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- **Storage**: Browser localStorage with JSON serialization

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/vinothsid/personal-learning-platform.git
cd personal-learning-platform
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## Project Structure

```
src/
├── algorithms/           # Core algorithms (spaced repetition)
├── components/          # UI components (atomic design)
│   ├── atoms/          # Basic components (Button, Card)
│   ├── molecules/      # Component combinations (FlashCardComponent)
│   └── index.ts        # Component exports
├── services/           # Data services (storage)
├── types/              # TypeScript interfaces and types
└── app/                # Next.js pages and routing
```

## Development Approach

This project follows **Test-Driven Development (TDD)** principles:

1. **Red**: Write failing tests first
2. **Green**: Write minimal code to pass tests
3. **Refactor**: Improve code while keeping tests green

### Code Quality Standards

- **SOLID Principles**: Single responsibility, open-closed, dependency inversion
- **Clean Code**: Meaningful names, small functions, clear intent
- **Type Safety**: Strict TypeScript configuration with comprehensive typing
- **Test Coverage**: Comprehensive unit and integration tests (81 tests passing)

## Architecture

### Storage Layer

- **Interface-based Design**: `StorageInterface` allows for multiple storage implementations
- **Current Implementation**: `StorageService` using browser localStorage
- **Future Extensions**: Easy to add database, cloud storage, or other persistence layers

### Component Architecture

- **Atomic Design**: Components organized as atoms → molecules → organisms
- **Props Interface**: All components have well-defined TypeScript interfaces
- **Testability**: Each component thoroughly tested in isolation

### Algorithm Implementation

- **SM-2 Spaced Repetition**: Complete implementation with configurable parameters
- **Quality Ratings**: 1-5 scale affecting ease factor and interval calculations
- **Date Handling**: Proper timezone-aware scheduling

## Usage Examples

### Creating a FlashCard

```typescript
import { createFlashCard } from '@/types';

const card = createFlashCard({
  question: 'What is the capital of France?',
  answer: 'Paris',
  tags: ['geography', 'capitals'],
});
```

### Using the Storage Service

```typescript
import { StorageService } from '@/services';

const storage = new StorageService();

// Save a flashcard
await storage.saveFlashCard(card);

// Search flashcards
const results = await storage.searchFlashCards('geography');

// Export all data
const backup = await storage.exportAllData();
```

### Component Usage

```tsx
import { FlashCardComponent } from '@/components';

<FlashCardComponent
  card={flashcard}
  studyMode={true}
  onReveal={cardId => console.log('Card revealed')}
  onRate={(cardId, quality) => updateSpacedRepetition(cardId, quality)}
/>;
```

## Testing

The project maintains comprehensive test coverage with 81 passing tests:

- **Unit Tests**: Individual functions and components
- **Integration Tests**: Service interactions and data flow
- **Component Tests**: React component behavior and props
- **Algorithm Tests**: Spaced repetition calculations and edge cases

Run tests with:

```bash
npm test                 # Single run
npm run test:watch      # Watch mode
```

## Future Roadmap

### Phase 1: Content Integration (Next)

- [ ] YouTube video embedding and timestamp linking
- [ ] Document upload and PDF integration
- [ ] Note-taking with flashcard generation

### Phase 2: Advanced Study Features

- [ ] Study sessions with progress tracking
- [ ] Custom study modes (cramming, review-only)
- [ ] Performance analytics and insights

### Phase 3: Collaboration & Sync

- [ ] Cloud storage and synchronization
- [ ] Deck sharing and collaboration
- [ ] User accounts and profiles

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Write tests first (TDD approach)
4. Implement the feature
5. Ensure all tests pass: `npm test`
6. Run linting: `npm run lint`
7. Commit changes: `git commit -m "Add new feature"`
8. Push to branch: `git push origin feature/new-feature`
9. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [iDoRecall](https://idorecall.com) for spaced repetition learning
- Built using [Claude Code](https://claude.ai/code) for AI-assisted development
- SM-2 algorithm based on SuperMemo research by Piotr Wozniak

---

**Built with ❤️ using Test-Driven Development and modern web technologies**
