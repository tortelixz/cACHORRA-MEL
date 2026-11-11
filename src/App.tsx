import React, { useState, useEffect } from 'react';
import {
  Heart,
  Clock,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  X
} from 'lucide-react';
import { trackFastEvent } from './utils/metaPixel';

interface Comment {
  id: number;
  initials: string;
  name: string;
  time: string;
  amount: string;
  message: string;
  likes: number;
  liked?: boolean;
  bgColor: string;
  textColor: string;
}

const META_TOTAL = 8532.00;
const INITIAL_RAISED = 4217.63;
const CHECKOUT_LINK = 'https://pay.sharkautomacoes.com/c2568e0d';

const formatMoneyBRL = (val: number) => {
  return val.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const calcPercentage = (raised: number, meta: number) => {
  return Math.min(100, (raised / meta) * 100);
};

const formatPercentBRL = (pct: number) => {
  return pct.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + '%';
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'sobre' | 'atualizacoes' | 'quemAjudou'>('sobre');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedAmount] = useState<number | null>(50);
  const [donorName] = useState<string>('');

  // Fundraising Progress State
  const [raisedAmount, setRaisedAmount] = useState<number>(() => {
    const saved = localStorage.getItem('mel_raised_amount');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= INITIAL_RAISED) {
        return parsed;
      }
    }
    return INITIAL_RAISED;
  });

  // Bar width state starting at 48.43% for smooth entrance animation
  const [barWidth, setBarWidth] = useState<number>(48.43);

  // Track initial PageView event
  useEffect(() => {
    trackFastEvent('PageView');
  }, []);

  // Entrance animation: starts at 48.43% and smoothly advances to 49.43% (or current total) over 2 seconds
  useEffect(() => {
    const currentPct = calcPercentage(raisedAmount, META_TOTAL);
    const startPoint = Math.max(0, currentPct - 1);
    setBarWidth(startPoint);

    const timer = setTimeout(() => {
      setBarWidth(currentPct);
    }, 150);

    return () => clearTimeout(timer);
  }, [raisedAmount]);

  // Check every 30 seconds for newly confirmed donations from persistent storage
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('mel_raised_amount');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed !== raisedAmount) {
          setRaisedAmount(parsed);
          setBarWidth(calcPercentage(parsed, META_TOTAL));
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [raisedAmount]);

  // Initial comments list adapted for abandoned Mel
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      initials: 'RM',
      name: 'Rosângela M.',
      time: 'há 3 min',
      amount: 'R$50',
      message: 'Doação enviada com amor! Que Deus abençoe essa cachorrinha resgatada e ajude na sua cirurgia. 🙏',
      likes: 341,
      bgColor: 'rgb(252, 231, 243)',
      textColor: 'rgb(190, 24, 93)'
    },
    {
      id: 2,
      initials: 'DA',
      name: 'Diego A.',
      time: 'há 12 min',
      amount: 'R$50',
      message: 'Ajudei com R$ 50 para a cirurgia da Mel. Ela foi abandonada, mas agora não está mais sozinha!',
      likes: 287,
      bgColor: 'rgb(219, 234, 254)',
      textColor: 'rgb(29, 78, 216)'
    },
    {
      id: 3,
      initials: 'LF',
      name: 'Luciana F.',
      time: 'há 18 min',
      amount: 'R$25',
      message: 'Nenhum animalzinho abandonado deveria passar por tanta dor. Força Mel, você vai conseguir!',
      likes: 312,
      bgColor: 'rgb(220, 252, 231)',
      textColor: 'rgb(22, 163, 74)'
    },
    {
      id: 4,
      initials: 'MV',
      name: 'Marcos V.',
      time: 'há 31 min',
      amount: 'R$100',
      message: 'Que a Mel se recupere logo da cirurgia e encontre um lar cheio de amor! Minha contribuição está feita. ❤️',
      likes: 198,
      bgColor: 'rgb(254, 249, 195)',
      textColor: 'rgb(146, 64, 14)'
    }
  ]);

  // Handle Exit Intent popup
  useEffect(() => {
    let hasTriggered = false;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !hasTriggered) {
        hasTriggered = true;
        setShowExitModal(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  const handleLike = (id: number) => {
    setComments(prev =>
      prev.map(c => {
        if (c.id === id) {
          const isLiked = c.liked;
          return {
            ...c,
            likes: isLiked ? c.likes - 1 : c.likes + 1,
            liked: !isLiked
          };
        }
        return c;
      })
    );
  };

  // Immediate 100% reliable navigation to checkout link with Meta tracking
  const navigateToCheckout = (val?: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    const amountVal = val || selectedAmount || 50;

    // Fast non-blocking Meta tracking
    trackFastEvent('InitiateCheckout', amountVal, donorName);
    trackFastEvent('Donate', amountVal, donorName);

    const targetUrl = val ? `${CHECKOUT_LINK}?valor=${val}` : CHECKOUT_LINK;

    // Reliable navigation
    try {
      window.location.href = targetUrl;
    } catch (err) {
      window.open(targetUrl, '_self');
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#282828] flex flex-col font-sans">
      {/* Header */}
      <header className="site-header">
        <div className="site-header__inner">
          <div className="site-header__left">
            <a href="#topo" className="site-header__brand" aria-label="Campanha Bem-Estar">
              <svg className="site-header__mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#24CA68"></rect>
                <path d="M16 23.5s-7-4.2-7-9.3c0-2.3 1.7-4 3.7-4 1.3 0 2.4.7 3.3 1.8.9-1.1 2-1.8 3.3-1.8 2 0 3.7 1.7 3.7 4 0 5.1-7 9.3-7 9.3z" fill="#FFFFFF"></path>
              </svg>
              <span className="wm-text">
                <span>Campanha</span>
                <span className="wm-mid">do</span>
                <span>Bem-Estar</span>
              </span>
            </a>
          </div>
          <div className="relative">
            <button
              type="button"
              className="site-header__menu-toggle"
              aria-expanded={isMenuOpen}
              aria-label="Abrir menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {isMenuOpen && (
              <div className="site-header__menu-panel">
                <a href="#topo" onClick={() => setIsMenuOpen(false)} className="site-header__menu-item">
                  Sobre nós
                </a>
                <a href="#topo" onClick={() => setIsMenuOpen(false)} className="site-header__menu-item">
                  Campanhas
                </a>
                <a href="#topo" onClick={() => setIsMenuOpen(false)} className="site-header__menu-item">
                  Criar campanha
                </a>
                <a href="#topo" onClick={() => setIsMenuOpen(false)} className="site-header__menu-item">
                  FAQ
                </a>
                <a
                  href={CHECKOUT_LINK}
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    navigateToCheckout(50, e);
                  }}
                  className="site-header__menu-item site-header__menu-cta mt-2"
                >
                  ❤️ AJUDAR A MEL AGORA
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="topo" className="flex-1 pb-24">
        <div className="max-w-[720px] mx-auto px-4 pt-6">
          {/* Top Title & Category */}
          <div className="topCampaign">
            <span className="category-badge">SAÚDE VETERINÁRIA</span>
            <h1>
              Mel quebrou os dois ossos da patinha e precisa de uma cirurgia urgente. Sem sua ajuda, ela pode não sobreviver. 💔
            </h1>
            <p className="campaign-subheadline">
              Mel é uma cachorrinha abandonada que sofreu uma grave fratura. Sem família para cuidar dela, sua doação é a única esperança para ela fazer a cirurgia e continuar vivendo.
            </p>
          </div>

          {/* Hero Image & Beneficiary */}
          <div className="detalhes-view mb-4">
            <div className="hero-image-container">
              <img
                alt="Mel precisa de uma cirurgia urgente para salvar sua pata"
                className="w-full h-auto object-cover"
                loading="eager"
                decoding="async"
                src="/assets/aistudio/mel_hero.png"
              />
            </div>
            <div className="beneficiary-info">
              <div className="beneficiary-row">
                <Heart className="w-3.5 h-3.5 text-[#24CA68] fill-[#24CA68] shrink-0" />
                <span>
                  Campanha em prol da <strong>Mel (Cachorrinha Resgatada)</strong>
                  <img
                    alt="Verificado"
                    className="w-3.5 h-3.5 inline-block ml-1 align-middle"
                    src="/assets/aistudio/perfil-verificado_39b21c08_39b21c08.png"
                  />
                </span>
              </div>
              <div className="beneficiary-row">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Criada em 30 de outubro de 2026</span>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="resumo-card">
            <div className="progress-eyebrow">
              <span className="progress-label">Progresso da Arrecadação</span>
              <span className="progress-percent">
                {formatPercentBRL(calcPercentage(raisedAmount, META_TOTAL))}
              </span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(100, barWidth)}%`,
                  transition: 'width 2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              ></div>
            </div>
            <div className="arrecadacao-text">
              <strong>{formatMoneyBRL(raisedAmount)}</strong>{' '}
              <span className="text-slate-500 font-normal">
                arrecadados da meta de {formatMoneyBRL(META_TOTAL)}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="menu-detalhes mt-6 mb-4 flex justify-center">
            <ul className="menu-detalhes-list">
              <li
                onClick={() => setActiveTab('sobre')}
                className={`menu-detalhes-item ${activeTab === 'sobre' ? 'active' : ''}`}
              >
                Sobre
              </li>
              <li
                onClick={() => setActiveTab('atualizacoes')}
                className={`menu-detalhes-item ${activeTab === 'atualizacoes' ? 'active' : ''}`}
              >
                Atualizações (3)
              </li>
              <li
                onClick={() => setActiveTab('quemAjudou')}
                className={`menu-detalhes-item ${activeTab === 'quemAjudou' ? 'active' : ''}`}
              >
                Quem ajudou (77)
              </li>
            </ul>
          </div>

          {/* Tab 1: SOBRE */}
          {activeTab === 'sobre' && (
            <div id="aboutSection" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mt-4">
              <div className="story-content">
                <section className="mb-6">
                  <div className="story-v2__rule">
                    <span className="story-v2__rule-line"></span>
                    <span className="story-v2__rule-icon">
                      <Heart className="w-3.5 h-3.5 text-[#24CA68]" />
                    </span>
                    <span className="story-v2__rule-line"></span>
                  </div>
                  <h3 className="story-v2__heading">
                    A dor de uma cachorrinha abandonada que sofre em silêncio
                  </h3>
                  <p className="story-v2__lead mb-4">
                    Mel é uma cachorrinha de rua que foi encontrada com os dois ossos de uma das patinhas quebrados. Sozinha e sem família, ela precisa de uma cirurgia urgente para não perder a pata e voltar a andar.
                  </p>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Para um minuto e conheça a história da Mel. Essa cachorrinha abandonada está enfrentando o momento mais difícil de sua vida.
                  </p>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Ela foi resgatada das ruas com os dois ossos de uma das patinhas fraturados. Mel não tem dono, não tem família e não tem ninguém por ela, a não ser os protetores e voluntários que a encontraram gemendo de dor.
                  </p>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Imagine a dor de estar sozinho no mundo, gravemente ferido e sem conseguir pedir socorro. Mel não consegue pedir ajuda com palavras. Ela depende 100% da compaixão de pessoas que se importam para conseguir realizar essa cirurgia.
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    Não estamos pedindo luxo. Estamos lutando para conseguir pagar a cirurgia e os cuidados veterinários que podem dar à Mel uma nova oportunidade de recuperação e um futuro seguro. Cada contribuição nos aproxima desse objetivo. Por favor, ajude a Mel a ter uma nova chance!
                  </p>
                </section>

                <section className="mb-6 pt-4 border-t border-slate-100">
                  <div className="story-v2__rule">
                    <span className="story-v2__rule-line"></span>
                    <span className="story-v2__rule-icon">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#24CA68]" />
                    </span>
                    <span className="story-v2__rule-line"></span>
                  </div>
                  <h3 className="story-v2__heading">Cirurgia veterinária, exames e recuperação</h3>
                  <p className="story-v2__lead mb-4">
                    Sua doação vai 100% para custear a cirurgia e o tratamento dessa cachorrinha resgatada.
                  </p>
                  <p className="font-semibold text-slate-800 mb-2">A ajuda será usada em:</p>
                  <ul className="story-v2__list">
                    <li>Procedimento cirúrgico de emergência para reconstrução dos dois ossos da pata</li>
                    <li>Medicamentos para controle da dor, anti-inflamatórios e antibióticos pós-operatórios</li>
                    <li>Exames de imagem, raio-X e consultas médicas veterinárias especializadas</li>
                    <li>Internação, curativos diários e hospedagem temporária pós-cirúrgica</li>
                    <li>Tratamento completo para dar à Mel a chance de se recuperar e ser adotada por um lar amoroso</li>
                  </ul>
                </section>

                <section className="text-center pt-4">
                  <div className="story-v2__rule">
                    <span className="story-v2__rule-line"></span>
                    <span className="story-v2__rule-icon">
                      <Sparkles className="w-3.5 h-3.5 text-[#24CA68]" />
                    </span>
                    <span className="story-v2__rule-line"></span>
                  </div>
                  <h3 className="story-v2__heading">Quanto vale uma chance de salvar a vida da Mel?</h3>
                  <p className="story-v2__lead mb-6">
                    Não importa se você pode ajudar com R$ 2, R$ 5, R$ 10 ou qualquer outro valor. Cada doação nos aproxima da cirurgia de que a Mel tanto precisa.
                  </p>
                  <a
                    href={CHECKOUT_LINK}
                    onClick={(e) => navigateToCheckout(50, e)}
                    className="inline-story-cta w-full text-center text-decoration-none border-0 cursor-pointer"
                  >
                    ❤️ AJUDAR A MEL AGORA
                  </a>
                </section>
              </div>
            </div>
          )}

          {/* Tab 2: ATUALIZAÇÕES */}
          {activeTab === 'atualizacoes' && (
            <div className="mt-4 space-y-4">
              <div className="campaign-update-card">
                <div className="campaign-update-meta">
                  <span className="campaign-update-date">05 DE NOVEMBRO DE 2026</span>
                  <span className="campaign-update-tag">URGENTE</span>
                </div>
                <h3 className="campaign-update-title">Consultas e remédios para aliviar a dor da Mel</h3>
                <p className="campaign-update-body">
                  Os voluntários conseguiram levar a Mel para a primeira consulta de emergência e aplicar analgésicos para aliviar a dor da patinha enquanto buscamos recursos para a cirurgia.
                </p>
              </div>

              <div className="campaign-update-card">
                <div className="campaign-update-meta">
                  <span className="campaign-update-date">02 DE NOVEMBRO DE 2026</span>
                  <span className="campaign-update-tag">EXAMES</span>
                </div>
                <h3 className="campaign-update-title">Raio-X confirma fratura grave nos dois ossos da pata</h3>
                <p className="campaign-update-body">
                  Os exames de imagem confirmaram que os dois ossos da patinha da Mel estão quebrados. O veterinário informou que o procedimento cirúrgico precisa ser realizado o quanto antes.
                </p>
              </div>

              <div className="campaign-update-card">
                <div className="campaign-update-meta">
                  <span className="campaign-update-date">30 DE OUTUBRO DE 2026</span>
                  <span className="campaign-update-tag">INÍCIO</span>
                </div>
                <h3 className="campaign-update-title">Resgate e início da campanha para a Mel</h3>
                <p className="campaign-update-body">
                  Mel foi resgatada das ruas em estado grave. Como ela não tem dono nem família, iniciamos esta campanha para arrecadar o valor da cirurgia e dar a ela o tratamento digno que merece.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3 or Supporter Box: QUEM AJUDOU / COMENTÁRIOS */}
          {(activeTab === 'sobre' || activeTab === 'quemAjudou') && (
            <div id="comentariosSection" className="mt-6">
              <div className="people-saying-box">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="flex -space-x-2 overflow-hidden mb-3">
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                      alt="Apoiador"
                      src="/assets/aistudio/avs_6ac13d13_6ac13d13.svg"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      alt="Apoiador"
                      src="/assets/aistudio/mel_hero.png"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                      alt="Apoiador"
                      src="/assets/aistudio/imm_71b7e7c6_71b7e7c6.svg"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      alt="Apoiador"
                      src="/assets/aistudio/kc_df5bf926_df5bf926.webp"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      alt="Apoiador"
                      src="/assets/aistudio/lo_07b9845d_07b9845d.webp"
                    />
                    <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 items-center justify-center text-xs font-bold text-slate-700">
                      +
                    </div>
                  </div>
                  <h4 className="people-saying-title border-none pb-0">
                    <span className="text-[#24CA68] font-bold">77</span> pessoas já se uniram para salvar a Mel
                  </h4>
                </div>

                <div className="divide-y divide-slate-100">
                  {comments.map(c => (
                    <div key={c.id} className="comentario py-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                          style={{ backgroundColor: c.bgColor, color: c.textColor }}
                        >
                          {c.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm text-slate-900">{c.name}</h3>
                            <span className="text-xs text-slate-400 font-medium">
                              <span className="inline-flex items-center gap-1 text-[#24CA68]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#24CA68] animate-pulse"></span>
                                {c.time}
                              </span>
                            </span>
                            <span className="donation-badge">{c.amount}</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{c.message}</p>
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleLike(c.id)}
                              className={`text-xs font-medium inline-flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-50 transition-colors ${
                                c.liked ? 'text-[#24CA68] font-bold' : 'text-slate-500'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${c.liked ? 'fill-[#24CA68]' : ''}`} />
                              <span>{c.likes}</span> Curtir
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                  <a
                    href={CHECKOUT_LINK}
                    onClick={(e) => navigateToCheckout(50, e)}
                    className="text-xs text-[#24CA68] hover:text-[#1fab58] italic font-semibold underline bg-transparent border-0 cursor-pointer"
                  >
                    Faça uma doação para deixar sua mensagem de carinho e apoio para a Mel!
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Mobile Bottom Bar */}
      <div id="fixed-mobile">
        <a
          href={CHECKOUT_LINK}
          onClick={(e) => navigateToCheckout(50, e)}
          className="btn-ajudar text-center flex items-center justify-center text-decoration-none border-0"
        >
          ❤️ AJUDAR A MEL AGORA
        </a>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="site-footer__container">
          <div className="site-footer__top">
            <div className="site-footer__col">
              <h4>PLATAFORMA</h4>
              <ul>
                <li><a href="#topo">Sobre nós</a></li>
                <li><a href="#topo">Campanhas</a></li>
                <li><a href="#topo">Criar campanha</a></li>
                <li><a href="#topo">Entrar</a></li>
              </ul>
            </div>
            <div className="site-footer__col">
              <h4>SUPORTE</h4>
              <ul>
                <li><a href="#topo">FAQ</a></li>
                <li><a href="#topo">Taxas e prazos</a></li>
                <li><a href="#topo">Segurança e transparência</a></li>
                <li><a href="#topo">Consultar recibo</a></li>
              </ul>
            </div>
            <div className="site-footer__col">
              <h4>LEGAL</h4>
              <ul>
                <li><a href="#topo">Política de privacidade</a></li>
                <li><a href="#topo">Termos de uso</a></li>
                <li><a href="#topo">Campanhas mais amadas</a></li>
                <li><a href="#topo">Loja de corações</a></li>
              </ul>
            </div>
          </div>
          <div className="site-footer__divider"></div>
          <div className="site-footer__social">
            <a href="#topo" aria-label="Instagram" className="site-footer__social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="#topo" aria-label="Facebook" className="site-footer__social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#topo" aria-label="YouTube" className="site-footer__social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#1b2432"></polygon>
              </svg>
            </a>
          </div>
          <div className="site-footer__bottom">
            <p>© 2026 · Todos os direitos reservados</p>
          </div>
        </div>
      </footer>

      {/* Exit Popup Modal */}
      {showExitModal && (
        <div className="modal-overlay">
          <div className="exit-popup-card">
            <button
              type="button"
              onClick={() => setShowExitModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors border-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="exit-urgency-tag">⏰ A MEL ESTÁ SOZINHA E PRECISA DE VOCÊ</span>
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mx-auto mb-3">
              <img
                alt="Mel precisa de uma cirurgia urgente"
                className="w-full h-full object-cover"
                loading="eager"
                src="/assets/aistudio/mel_hero.png"
              />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Não saia sem ajudar a Mel</h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Mel é uma cachorrinha abandonada e não tem família por ela. 💔 Ela não entende o porquê de tanta dor, mas depende da nossa união para receber a cirurgia necessária.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <a
                href={`${CHECKOUT_LINK}?valor=20`}
                onClick={(e) => navigateToCheckout(20, e)}
                className="py-2.5 bg-white border-2 border-[#24CA68] text-[#24CA68] font-bold text-base rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center cursor-pointer text-decoration-none"
              >
                R$20
              </a>
              <a
                href={`${CHECKOUT_LINK}?valor=50`}
                onClick={(e) => navigateToCheckout(50, e)}
                className="py-2.5 bg-white border-2 border-[#24CA68] text-[#24CA68] font-bold text-base rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center cursor-pointer text-decoration-none"
              >
                R$50
              </a>
              <a
                href={`${CHECKOUT_LINK}?valor=70`}
                onClick={(e) => navigateToCheckout(70, e)}
                className="py-2.5 bg-white border-2 border-[#24CA68] text-[#24CA68] font-bold text-base rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center cursor-pointer text-decoration-none"
              >
                R$70
              </a>
              <a
                href={`${CHECKOUT_LINK}?valor=100`}
                onClick={(e) => navigateToCheckout(100, e)}
                className="py-2.5 bg-white border-2 border-[#24CA68] text-[#24CA68] font-bold text-base rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center cursor-pointer text-decoration-none"
              >
                R$100
              </a>
            </div>
            <a
              href={CHECKOUT_LINK}
              onClick={(e) => navigateToCheckout(50, e)}
              className="text-xs text-slate-400 hover:text-slate-600 underline font-medium block text-center mt-2 bg-transparent border-0 cursor-pointer w-full text-decoration-none"
            >
              Quero escolher outro valor
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
