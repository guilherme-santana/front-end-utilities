import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock canvas-confetti because it uses browser APIs that can fail in jsdom
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock qrcode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
  }
}));

describe('Encurtador de URL App UI & Flow', () => {
  it('renders the main URL Shortener view initially', () => {
    render(<App />);
    expect(screen.getByText('Encurtador de URL')).toBeInTheDocument();
    expect(screen.getByText('Cole sua URL longa aqui')).toBeInTheDocument();
  });

  it('allows entering a long URL and alias to shorten it', async () => {
    render(<App />);

    const urlInput = screen.getByPlaceholderText(/https:\/\/exemplo.com\/uma-url-muito-longa/i);
    const aliasInput = screen.getByPlaceholderText('meu-link');
    const submitBtn = screen.getByRole('button', { name: /Encurtar URL/i });

    fireEvent.change(urlInput, { target: { value: 'https://exemplo.com/teste-completo' } });
    fireEvent.change(aliasInput, { target: { value: 'meu-teste' } });
    fireEvent.click(submitBtn);

    const successText = await screen.findByText('Pronto! Aqui está seu link');
    expect(successText).toBeInTheDocument();
    expect(screen.getByText('https://hub.dev/meu-teste')).toBeInTheDocument();
  });

  it('filters history detailed table by search term', async () => {
    render(<App />);

    // Initially we have the api-docs-v2, portfolio-new, meeting-link mock items
    // Use getAllByText and verify they render
    expect(screen.getAllByText(/\/api-docs-v2/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\/portfolio-new/i).length).toBeGreaterThan(0);

    const searchInput = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'portfolio' } });

    // The queryByText('/api-docs-v2') won't work because '/api-docs-v2' is on the Recent Links panel which is never filtered by the detailed table search.
    // The detailed table search only filters the 'filteredLinks' in the table at the bottom.
    // So let's verify that the table row for /api-docs-v2 is removed, while /portfolio-new is retained in the table.
    // Let's inspect text contents or table elements instead.
    const tableElement = screen.getByRole('table');
    expect(tableElement).toBeInTheDocument();
    expect(tableElement).not.toHaveTextContent('/api-docs-v2');
    expect(tableElement).toHaveTextContent('/portfolio-new');
  });
});
