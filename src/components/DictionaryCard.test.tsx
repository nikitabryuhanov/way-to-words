import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DictionaryCard from './DictionaryCard';
import { useWordStore } from '@/store/wordStore';

// Mock the word store
vi.mock('@/store/wordStore', () => ({
  useWordStore: vi.fn(),
}));

describe('DictionaryCard', () => {
  const mockProps = {
    word: 'test',
    definition: 'A test definition',
    cefrLevel: 'A1' as const,
    audioUrl: 'https://example.com/audio.mp3',
    example: 'This is a test example.',
    partOfSpeech: 'noun',
    phonic: '/test/',
    paragraph: 'This is a test paragraph about the word.',
    examples: ['Example 1', 'Example 2'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useWordStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      getWord: vi.fn().mockReturnValue(null),
      addWord: vi.fn(),
      updateWordStatus: vi.fn(),
      removeWord: vi.fn(),
    });
  });

  it('renders word correctly', () => {
    render(<DictionaryCard {...mockProps} />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('renders definition correctly', () => {
    render(<DictionaryCard {...mockProps} />);
    expect(screen.getByText('A test definition')).toBeInTheDocument();
  });

  it('renders CEFR level correctly', () => {
    render(<DictionaryCard {...mockProps} />);
    expect(screen.getByText('A1')).toBeInTheDocument();
  });

  it('renders part of speech correctly', () => {
    render(<DictionaryCard {...mockProps} />);
    expect(screen.getByText('noun')).toBeInTheDocument();
  });

  it('renders phonic transcription when provided', () => {
    render(<DictionaryCard {...mockProps} />);
    expect(screen.getByText('/test/')).toBeInTheDocument();
  });

  it('renders example when provided', () => {
    render(<DictionaryCard {...mockProps} />);
    expect(screen.getByText(/This is a test example/)).toBeInTheDocument();
  });

  it('renders paragraph when provided', () => {
    render(<DictionaryCard {...mockProps} />);
    expect(screen.getByText(/This is a test paragraph/)).toBeInTheDocument();
  });

  it('renders audio button when audioUrl is provided', () => {
    render(<DictionaryCard {...mockProps} />);
    const audioButton = screen.getByLabelText('Play pronunciation');
    expect(audioButton).toBeInTheDocument();
  });

  it('does not render phonic when not provided', () => {
    const propsWithoutPhonic = { ...mockProps, phonic: '' };
    render(<DictionaryCard {...propsWithoutPhonic} />);
    expect(screen.queryByText('/test/')).not.toBeInTheDocument();
  });

  it('shows "Add to dictionary" button when word is not saved', () => {
    render(<DictionaryCard {...mockProps} />);
    expect(screen.getByText('Добавить в словарь')).toBeInTheDocument();
  });

  it('shows status when word is saved', () => {
    const mockGetWord = vi.fn().mockReturnValue({
      word: 'test',
      status: 'learned' as const,
    });
    (useWordStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      getWord: mockGetWord,
      addWord: vi.fn(),
      updateWordStatus: vi.fn(),
      removeWord: vi.fn(),
    });

    render(<DictionaryCard {...mockProps} />);
    expect(screen.getByText('Выучено')).toBeInTheDocument();
    expect(screen.getByText('Изменить статус')).toBeInTheDocument();
  });
});

