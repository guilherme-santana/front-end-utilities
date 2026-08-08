import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
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
    // Mock successful fetch response
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ shortUrl: 'https://hub.dev/meu-teste' }),
      } as Response)
    );
    global.fetch = mockFetch;

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

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/shorten?url=https%3A%2F%2Fexemplo.com%2Fteste-completo',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('exhibits error message when API fails', async () => {
    // Mock error fetch response
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal Server Error' }),
      } as Response)
    );
    global.fetch = mockFetch;

    render(<App />);

    const urlInput = screen.getByPlaceholderText(/https:\/\/exemplo.com\/uma-url-muito-longa/i);
    const submitBtn = screen.getByRole('button', { name: /Encurtar URL/i });

    fireEvent.change(urlInput, { target: { value: 'https://exemplo.com/erro-completo' } });
    fireEvent.click(submitBtn);

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('Erro na API (500): Não foi possível encurtar a URL no momento.');
  });

  it('filters history detailed table by search term', async () => {
    render(<App />);

    // Go to URL Shortener tab first to see the history
    const shortenerTab = screen.getByRole('button', { name: /URL Shortener/i });
    fireEvent.click(shortenerTab);

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

  it('allows generating documents (CPF and CNPJ)', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/generate/cpf')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ cpf: '111.222.333-44' })),
        } as Response);
      }
      if (url.includes('/generate/cnpj')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ cnpj: '11.222.333/0001-44' })),
        } as Response);
      }
      return Promise.reject(new Error('Unhandled URL mock'));
    });
    global.fetch = mockFetch;

    render(<App />);

    // Click the Document Generator tab first
    const docGenTab = screen.getByRole('button', { name: /Document Generator/i });
    await act(async () => {
      fireEvent.click(docGenTab);
    });

    // Verify "Document Generator" view is rendered
    expect(screen.getByText('Gerador de Documentos')).toBeInTheDocument();
    expect(screen.getByText('---.---.--- --')).toBeInTheDocument();

    // Click "Gerar Novo Número" to generate CPF
    const generateBtn = screen.getByRole('button', { name: /Gerar Novo Número/i });
    fireEvent.click(generateBtn);

    // Verify CPF is fetched and displayed
    await waitFor(() => {
      const elements = screen.getAllByText('111.222.333-44');
      expect(elements.length).toBeGreaterThan(0);
    });

    expect(mockFetch).toHaveBeenLastCalledWith(
      'http://localhost:8080/generate/cpf?formatted=true',
      expect.objectContaining({ method: 'GET' })
    );

    // Switch to CNPJ
    const cnpjTab = screen.getByRole('button', { name: 'CNPJ' });
    fireEvent.click(cnpjTab);

    fireEvent.click(generateBtn);

    // Verify CNPJ is fetched and displayed
    await waitFor(() => {
      const elements = screen.getAllByText('11.222.333/0001-44');
      expect(elements.length).toBeGreaterThan(0);
    });

    expect(mockFetch).toHaveBeenLastCalledWith(
      'http://localhost:8080/generate/cnpj?formatted=true',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('handles API errors when document generation fails', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      } as Response)
    );
    global.fetch = mockFetch;

    render(<App />);

    const docGenTab = screen.getByRole('button', { name: /Document Generator/i });
    fireEvent.click(docGenTab);

    const generateBtn = screen.getByRole('button', { name: /Gerar Novo Número/i });
    fireEvent.click(generateBtn);

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('Erro na API (500): Não foi possível gerar o CPF no momento.');
  });
});
