import React, { useState } from 'react';
import {
  LayoutDashboard,
  Code2,
  ShieldCheck,
  Link2,
  FileText,
  DollarSign,
  FolderOpen,
  Smartphone,
  Settings,
  Search,
  Bell,
  Copy,
  Share2,
  BarChart3,
  QrCode,
  Filter,
  Download,
  Plus,
  HelpCircle,
  Sparkles,
  Info,
  Trash2,
  ExternalLink,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';

// Interface for Shortened Links
interface ShortenedLink {
  id: string;
  alias: string;
  originalUrl: string;
  shortenedUrl: string;
  createdAt: string; // date string or relative time
  clicks: number;
  uniqueClicks: number;
}

// Initial mock data to represent "LINKS RECENTES" and "Histórico Detalhado" as shown in the image.png
const INITIAL_LINKS: ShortenedLink[] = [
  {
    id: '1',
    alias: 'api-docs-v2',
    originalUrl: 'https://docs.github.com/en/rest/quickstart',
    shortenedUrl: 'https://hub.dev/api-docs-v2',
    createdAt: 'Há 2h',
    clicks: 1240,
    uniqueClicks: 892,
  },
  {
    id: '2',
    alias: 'portfolio-new',
    originalUrl: 'https://linkedin.com/in/usuario-exemplo-perfil-completo',
    shortenedUrl: 'https://hub.dev/portfolio-new',
    createdAt: 'Há 1 dia',
    clicks: 458,
    uniqueClicks: 310,
  },
  {
    id: '3',
    alias: 'meeting-link',
    originalUrl: 'https://zoom.us/j/98237492348?pwd=T1Z...',
    shortenedUrl: 'https://hub.dev/meeting-link',
    createdAt: 'Há 3 dias',
    clicks: 12,
    uniqueClicks: 12,
  }
];

export default function App() {
  // Navigation active state
  const [activeTab, setActiveTab] = useState('URL Shortener');

  // URL Shortener Form inputs
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');

  // URL Shortener Success state
  const [shortenedResult, setShortenedResult] = useState<ShortenedLink | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // All URL shortener records (recent state / history list)
  const [linksList, setLinksList] = useState<ShortenedLink[]>(INITIAL_LINKS);

  // Search filter and filters inside Histórico Detalhado
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'mais_clicados' | 'recentes'>('todos');

  // Notification simulator
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sidebar Menu List Items
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Code Tools', icon: Code2 },
    { name: 'Security', icon: ShieldCheck },
    { name: 'URL Shortener', icon: Link2 },
    { name: 'Text Utilities', icon: FileText },
    { name: 'Financial', icon: DollarSign },
    { name: 'Files', icon: FolderOpen },
    { name: 'Mobile Tools', icon: Smartphone },
    { name: 'Settings', icon: Settings }
  ];

  // Helper to validate valid url prefix
  const isValidUrl = (urlStr: string) => {
    try {
      new URL(urlStr);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Submit and Shorten the URL
  const handleShortenUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!longUrl.trim()) {
      alert('Por favor, insira uma URL válida.');
      return;
    }

    let urlToProcess = longUrl.trim();
    if (!/^https?:\/\//i.test(urlToProcess)) {
      urlToProcess = 'https://' + urlToProcess;
    }

    if (!isValidUrl(urlToProcess)) {
      alert('Por favor, digite uma URL válida (ex: https://exemplo.com).');
      return;
    }

    // Determine final custom alias
    const aliasValue = customAlias.trim()
      ? customAlias.trim().replace(/\s+/g, '-').toLowerCase()
      : Math.random().toString(36).substring(2, 8);

    // Check if alias is already used in our records
    const isDuplicate = linksList.some(link => link.alias === aliasValue);
    if (isDuplicate) {
      alert(`O alias "${aliasValue}" já está sendo usado. Por favor use outro.`);
      return;
    }

    const shortUrl = `https://hub.dev/${aliasValue}`;

    // Create the new shortened object
    const newLink: ShortenedLink = {
      id: Date.now().toString(),
      alias: aliasValue,
      originalUrl: urlToProcess,
      shortenedUrl: shortUrl,
      createdAt: 'Agora mesmo',
      clicks: 0,
      uniqueClicks: 0
    };

    // Generate QR Code as DataURL
    try {
      const qrDataUrl = await QRCode.toDataURL(shortUrl, {
        width: 150,
        margin: 1,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (err) {
      console.error(err);
    }

    setLinksList([newLink, ...linksList]);
    setShortenedResult(newLink);
    setCopied(false);

    // Celebration effect!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Copy shortened link to clipboard
  const handleCopyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Export history to CSV file
  const exportToCSV = () => {
    const headers = ['Alias', 'Shortened URL', 'Original URL', 'Clicks', 'Unique Clicks', 'Created At'];
    const rows = linksList.map(link => [
      link.alias,
      link.shortenedUrl,
      link.originalUrl,
      link.clicks,
      link.uniqueClicks,
      link.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `encurtador_url_historico_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete a shortened link from history
  const handleDeleteLink = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este link encurtado?')) {
      setLinksList(linksList.filter(link => link.id !== id));
      if (shortenedResult && shortenedResult.id === id) {
        setShortenedResult(null);
      }
    }
  };

  // Filter and search logic for detailed table
  const filteredLinks = linksList.filter(link => {
    const matchesSearch =
      link.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.shortenedUrl.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'mais_clicados') {
      return link.clicks > 100;
    }
    if (filterType === 'recentes') {
      return link.createdAt.includes('h') || link.createdAt.includes('Agora') || link.createdAt.includes('1 dia');
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#f4f6fa] text-slate-800">

      {/* 1. Sidebar (Menu Lateral Esquerdo) */}
      <aside className="w-64 bg-[#f8fafd] border-r border-slate-200/80 flex flex-col shrink-0">

        {/* Brand / Logo Header */}
        <div className="p-6 pb-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg">
            H
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">HubTools</span>
        </div>

        {/* Sidebar Navigation */}
        <div className="px-4 py-6 flex-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            MENU PRINCIPAL
          </p>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-slate-200/60 text-center text-xs text-slate-400">
          <p>&copy; 2026 HubTools. Inc.</p>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* 2. Header (Topo) */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-8 shrink-0">

          {/* Header Search bar */}
          <div className="w-96 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar ferramentas..."
              className="w-full bg-slate-100 border-0 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4 relative">
            {/* Notification Bell */}
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (notifications > 0) setNotifications(0);
              }}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-12 top-12 w-64 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 text-xs">
                <p className="font-semibold text-slate-700 border-b pb-2 mb-2">Notificações</p>
                <ul className="space-y-2">
                  <li className="text-slate-600">Seu link <span className="font-mono bg-slate-100 px-1 rounded">/portfolio-new</span> alcançou 450 cliques!</li>
                  <li className="text-slate-600">Dica Pro: Links curtos de SEO aumentam cliques em até 34%.</li>
                </ul>
              </div>
            )}

            {/* Separator */}
            <div className="w-px h-5 bg-slate-200"></div>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">Juliano S.</span>
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase cursor-pointer">
                JS
              </div>
            </div>
          </div>
        </header>

        {/* 3. Área de Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto space-y-8">

          {/* Main View Condition: Show URL Shortener tools or fallback */}
          {activeTab === 'URL Shortener' ? (
            <>
              {/* Header Title Section */}
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Encurtador de URL
                </h1>
                <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                  Transforme links longos em URLs curtas, elegantes e rastreáveis para facilitar o compartilhamento.
                </p>
              </div>

              {/* Grid 2-Columns layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column (Forms & Success card) */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Form Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <form onSubmit={handleShortenUrl} className="space-y-5">

                      {/* URL input field */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Cole sua URL longa aqui
                        </label>
                        <div className="relative">
                          <Link2 className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
                          <input
                            type="text"
                            required
                            placeholder="https://exemplo.com/uma-url-muito-longa-e-complexa-que-ninguem-consegue-lembrar"
                            value={longUrl}
                            onChange={(e) => setLongUrl(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 transition-all placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Alias and Shorten Button side-by-side */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                        {/* Custom Alias Input */}
                        <div className="md:col-span-8">
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Alias personalizado (Opcional)
                          </label>
                          <div className="flex rounded-lg overflow-hidden border border-slate-200">
                            <span className="bg-slate-100 text-slate-500 px-3.5 py-3 text-sm select-none border-r border-slate-200/80 font-medium font-sans">
                              hub.dev/
                            </span>
                            <input
                              type="text"
                              placeholder="meu-link"
                              value={customAlias}
                              onChange={(e) => setCustomAlias(e.target.value)}
                              className="flex-1 bg-slate-50/50 px-3.5 py-3 text-sm focus:outline-none text-slate-700 placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Shorten Action Button */}
                        <div className="md:col-span-4">
                          <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] border border-indigo-600 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Encurtar URL</span>
                          </button>
                        </div>

                      </div>

                    </form>
                  </div>

                  {/* Success Result Container (Only shows when result is available) */}
                  {shortenedResult && (
                    <div className="bg-indigo-50/40 rounded-xl border-2 border-indigo-200/50 border-dashed p-6 relative transition-all animate-fadeIn">

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

                        {/* Text and Short URL field */}
                        <div className="md:col-span-2 space-y-4">
                          <h3 className="text-lg font-bold text-indigo-700">
                            Pronto! Aqui está seu link
                          </h3>

                          {/* Shortened URL display box */}
                          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 pl-3 overflow-hidden shadow-sm">
                            <span className="text-sm font-mono text-slate-700 flex-1 truncate select-all pr-2">
                              {shortenedResult.shortenedUrl}
                            </span>
                            <button
                              onClick={() => handleCopyToClipboard(shortenedResult.shortenedUrl)}
                              className={`px-4 py-2 rounded-md font-semibold text-xs text-white transition-all flex items-center gap-1.5 ${
                                copied ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
                              }`}
                            >
                              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                            </button>
                          </div>

                          {/* Helper actions */}
                          <div className="flex items-center gap-6 pt-1 text-xs text-slate-500 font-medium">
                            <button
                              onClick={() => {
                                handleCopyToClipboard(shortenedResult.shortenedUrl);
                                alert('Link pronto para compartilhar!');
                              }}
                              className="flex items-center gap-1.5 hover:text-slate-950 transition-colors cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Compartilhar</span>
                            </button>
                            <button
                              onClick={() => {
                                alert(`Estatísticas do link /${shortenedResult.alias}:\n\nCLIQUES: 0\nCLIQUES ÚNICOS: 0`);
                              }}
                              className="flex items-center gap-1.5 hover:text-slate-950 transition-colors cursor-pointer"
                            >
                              <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Ver Estatísticas</span>
                            </button>
                          </div>
                        </div>

                        {/* QR Code Container Card */}
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col items-center">
                            {qrCodeDataUrl ? (
                              <img src={qrCodeDataUrl} alt="QR Code" className="w-28 h-28 object-contain" />
                            ) : (
                              <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-slate-400">
                                <QrCode className="w-8 h-8" />
                              </div>
                            )}
                            <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-2">
                              Código QR
                            </span>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>

                {/* Right Column (Recents & Tips Sidebar) */}
                <div className="space-y-6">

                  {/* LINKS RECENTES CARD */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                        LINKS RECENTES
                      </span>
                      <button
                        onClick={() => alert('Mostrando todo o histórico no painel inferior.')}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                      >
                        Ver todos
                      </button>
                    </div>

                    {/* Recent links item list */}
                    <div className="space-y-3.5">
                      {linksList.slice(0, 3).map((link) => (
                        <div key={link.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors group relative">

                          {/* Title / Alias & Time */}
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-sm text-indigo-600 truncate max-w-[130px]">
                              /{link.alias}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium shrink-0">
                              {link.createdAt}
                            </span>
                          </div>

                          {/* Original URL description truncated */}
                          <p className="text-[11px] text-slate-500 truncate mt-1">
                            {link.originalUrl}
                          </p>

                          {/* Clicks and Unique clicks indicators */}
                          <div className="flex items-center gap-4 mt-2.5 text-[10px] font-semibold text-slate-500">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-3 h-3 text-slate-400" />
                              {link.clicks.toLocaleString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <QrCode className="w-3 h-3 text-slate-400" />
                              {link.uniqueClicks.toLocaleString('pt-BR')} únicas
                            </span>
                          </div>

                          {/* Small absolute delete button for easy control */}
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="absolute right-2 bottom-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Deletar link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      ))}

                      {linksList.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">Nenhum link recente criado ainda.</p>
                      )}
                    </div>
                  </div>

                  {/* Dica Pro CARD */}
                  <div className="bg-[#005e7a] text-white rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-teal-200" />
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
                        Dica Pro
                      </span>
                    </div>
                    <p className="text-xs text-teal-50 leading-relaxed font-normal">
                      Links curtos ajudam no SEO e aumentam a taxa de cliques em postagens de redes sociais em até 34%.
                    </p>
                  </div>

                </div>

              </div>

              {/* Bottom detailed section (Histórico Detalhado) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Section title & Header Actions */}
                <div className="p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Histórico Detalhado
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Monitore o desempenho de todos os seus links curtos
                    </p>
                  </div>

                  {/* Header tools inside table */}
                  <div className="flex items-center gap-2.5">

                    {/* Live search input in history */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={filterType}
                        onChange={(e: any) => setFilterType(e.target.value)}
                        className="bg-transparent border-none p-0 text-xs font-medium focus:outline-none focus:ring-0 cursor-pointer"
                      >
                        <option value="todos">Todos</option>
                        <option value="mais_clicados">Mais Clicados (+100)</option>
                        <option value="recentes">Criados Recentemente</option>
                      </select>
                    </div>

                    {/* Export to CSV Action */}
                    <button
                      onClick={exportToCSV}
                      className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-950 transition-colors flex items-center justify-center cursor-pointer"
                      title="Exportar para CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Quick Add trigger */}
                    <button
                      onClick={() => {
                        const url = prompt('Digite o link que deseja encurtar rapidamente:');
                        if (url) {
                          setLongUrl(url);
                          document.documentElement.scrollTop = 0;
                        }
                      }}
                      className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                      title="Adicionar Novo Link"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                  </div>
                </div>

                {/* Responsive Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="py-3.5 px-6">Alias / Curto</th>
                        <th className="py-3.5 px-6">URL Original</th>
                        <th className="py-3.5 px-6">Data de Criação</th>
                        <th className="py-3.5 px-6 text-center">Cliques</th>
                        <th className="py-3.5 px-6 text-center">Cliques Únicos</th>
                        <th className="py-3.5 px-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredLinks.map((link) => (
                        <tr key={link.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-semibold text-indigo-600 font-mono">
                            <span className="flex items-center gap-1.5">
                              <span>/{link.alias}</span>
                              <button
                                onClick={() => handleCopyToClipboard(link.shortenedUrl)}
                                className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                                title="Copiar link curto"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </span>
                          </td>
                          <td className="py-4 px-6 max-w-xs truncate text-slate-500 font-sans" title={link.originalUrl}>
                            {link.originalUrl}
                          </td>
                          <td className="py-4 px-6 text-slate-400">{link.createdAt}</td>
                          <td className="py-4 px-6 text-center font-semibold text-slate-800">
                            {link.clicks.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-4 px-6 text-center font-medium text-slate-600">
                            {link.uniqueClicks.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={link.originalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100"
                                title="Abrir URL original"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => {
                                  // simulate increasing click statistics
                                  setLinksList(linksList.map(item => {
                                    if (item.id === link.id) {
                                      return {
                                        ...item,
                                        clicks: item.clicks + 1,
                                        uniqueClicks: item.uniqueClicks + (Math.random() > 0.6 ? 1 : 0)
                                      };
                                    }
                                    return item;
                                  }));
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 cursor-pointer"
                                title="Simular clique"
                              >
                                <BarChart3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 cursor-pointer"
                                title="Excluir link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredLinks.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            Nenhum link encontrado para os critérios selecionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                Página em Construção
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Você selecionou a seção <strong className="text-indigo-600">{activeTab}</strong>. Atualmente apenas o <strong className="text-indigo-600">URL Shortener</strong> está totalmente implementado para uso imediato neste Dashboard.
              </p>
              <button
                onClick={() => setActiveTab('URL Shortener')}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium text-xs px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                <span>Voltar ao URL Shortener</span>
              </button>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
