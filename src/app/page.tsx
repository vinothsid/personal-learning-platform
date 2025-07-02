'use client';

import { useState } from 'react';
import { Button, Card, FlashCardComponent } from '@/components';
import { createFlashCard } from '@/types';

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);

  const demoCard = createFlashCard({
    question: 'What is the SM-2 spaced repetition algorithm?',
    answer:
      'A method for calculating optimal review intervals based on recall difficulty, using ease factors and quality ratings to maximize long-term retention.',
    tags: ['spaced-repetition', 'learning', 'memory'],
  });

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

        {/* Technical Features */}
        <Card>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Built with Modern Technologies
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Frontend Excellence
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>✅ Next.js 15 with TypeScript</li>
                <li>✅ Tailwind CSS for styling</li>
                <li>✅ Comprehensive test coverage</li>
                <li>✅ Atomic design components</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Development Standards
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>✅ Test-Driven Development</li>
                <li>✅ Code quality with ESLint</li>
                <li>✅ Automated formatting</li>
                <li>✅ Pre-commit quality gates</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Inspired by iDoRecall • Built with Claude Code</p>
        </div>
      </div>
    </div>
  );
}
