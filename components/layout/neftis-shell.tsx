"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ToolsLibrary from "@/components/tools/tools-library";

type PageKey = "home" | "ai" | "tools" | "community" | "learn" | "games" | "achievements" | "services";

const navPrimary: { id: PageKey; label: string; icon: string; isNew?: boolean }[] = [
  { id: "home", label: "Overview", icon: "◫" },
  { id: "ai", label: "Neftis AI", icon: "✳", isNew: true },
  { id: "tools", label: "Tools library", icon: "⌘" },
  { id: "community", label: "Community", icon: "◎" },
  { id: "learn", label: "Knowledge", icon: "▤" },
  { id: "games", label: "Arcade", icon: "◇" },
];
const navPersonal: { id: PageKey; label: string; icon: string }[] = [
  { id: "achievements", label: "Achievements", icon: "✧" },
  { id: "services", label: "Services", icon: "↗" },
];
const spaces = [
  { id: "ai" as const, no: "01", tag: "THINK", title: "Neftis AI", desc: "A focused space for questions, drafts, and ideas.", icon: "✳", tone: "feature-ai" },
  { id: "tools" as const, no: "02", tag: "MAKE", title: "Tools library", desc: "Small utilities for everyday digital work.", icon: "⌘", tone: "feature-tools" },
  { id: "community" as const, no: "03", tag: "SHARE", title: "Community", desc: "Exchange notes, questions, and discoveries.", icon: "◎", tone: "feature-community" },
  { id: "learn" as const, no: "04", tag: "GROW", title: "Knowledge room", desc: "Guides and references worth keeping.", icon: "▤", tone: "feature-learn" },
];
const pageTitles: Record<PageKey, string> = {
  home: "Overview", ai: "Neftis AI", tools: "Tools library", community: "Community",
  learn: "Knowledge room", games: "Arcade", achievements: "Achievements", services: "Services",
};


type LocaleCode = "id"|"en"|"ar"|"zh"|"ja"|"ko"|"es"|"pt"|"fr"|"de"|"hi"|"ru"|"tr"|"th"|"vi";
const languages: {code: LocaleCode; name: string; native: string}[] = [
  {code:"id",name:"Indonesian",native:"Bahasa Indonesia"},{code:"en",name:"English",native:"English"},
  {code:"ar",name:"Arabic",native:"العربية"},{code:"zh",name:"Chinese",native:"中文"},
  {code:"ja",name:"Japanese",native:"日本語"},{code:"ko",name:"Korean",native:"한국어"},
  {code:"es",name:"Spanish",native:"Español"},{code:"pt",name:"Portuguese",native:"Português"},
  {code:"fr",name:"French",native:"Français"},{code:"de",name:"German",native:"Deutsch"},
  {code:"hi",name:"Hindi",native:"हिन्दी"},{code:"ru",name:"Russian",native:"Русский"},
  {code:"tr",name:"Turkish",native:"Türkçe"},{code:"th",name:"Thai",native:"ไทย"},
  {code:"vi",name:"Vietnamese",native:"Tiếng Việt"}
];
const translations: Record<LocaleCode, Record<string,string>> = {
 id:{overview:"Ringkasan",ai:"Neftis AI",tools:"Pustaka alat",community:"Komunitas",learn:"Pengetahuan",games:"Arkade",achievements:"Pencapaian",services:"Layanan",workspace:"RUANG KERJA",yourSpace:"RUANG KAMU",search:"Cari apa saja",signIn:"Masuk",openAI:"Buka Neftis AI",explore:"Jelajahi alat",commons:"RUANG BERSAMA",begin:"Tempat untuk memulai"},
 en:{overview:"Overview",ai:"Neftis AI",tools:"Tools library",community:"Community",learn:"Knowledge",games:"Arcade",achievements:"Achievements",services:"Services",workspace:"WORKSPACE",yourSpace:"YOUR SPACE",search:"Search anything",signIn:"Sign in",openAI:"Open Neftis AI",explore:"Explore tools",commons:"THE COMMONS",begin:"A place to begin"},
 ar:{overview:"نظرة عامة",ai:"ذكاء نيفتيس",tools:"مكتبة الأدوات",community:"المجتمع",learn:"المعرفة",games:"الألعاب",achievements:"الإنجازات",services:"الخدمات",workspace:"مساحة العمل",yourSpace:"مساحتك",search:"ابحث عن أي شيء",signIn:"تسجيل الدخول",openAI:"افتح Neftis AI",explore:"استكشف الأدوات",commons:"المساحة المشتركة",begin:"مكان للبدء"},
 zh:{overview:"概览",ai:"Neftis 人工智能",tools:"工具库",community:"社区",learn:"知识",games:"游戏",achievements:"成就",services:"服务",workspace:"工作区",yourSpace:"你的空间",search:"搜索任何内容",signIn:"登录",openAI:"打开 Neftis AI",explore:"探索工具",commons:"共享空间",begin:"从这里开始"},
 ja:{overview:"概要",ai:"Neftis AI",tools:"ツールライブラリ",community:"コミュニティ",learn:"ナレッジ",games:"アーケード",achievements:"実績",services:"サービス",workspace:"ワークスペース",yourSpace:"あなたのスペース",search:"何でも検索",signIn:"ログイン",openAI:"Neftis AIを開く",explore:"ツールを見る",commons:"共有スペース",begin:"ここから始める"},
 ko:{overview:"개요",ai:"Neftis AI",tools:"도구 라이브러리",community:"커뮤니티",learn:"지식",games:"아케이드",achievements:"업적",services:"서비스",workspace:"워크스페이스",yourSpace:"내 공간",search:"무엇이든 검색",signIn:"로그인",openAI:"Neftis AI 열기",explore:"도구 둘러보기",commons:"공유 공간",begin:"시작하기"},
 es:{overview:"Resumen",ai:"Neftis AI",tools:"Biblioteca de herramientas",community:"Comunidad",learn:"Conocimiento",games:"Arcade",achievements:"Logros",services:"Servicios",workspace:"ESPACIO DE TRABAJO",yourSpace:"TU ESPACIO",search:"Buscar",signIn:"Iniciar sesión",openAI:"Abrir Neftis AI",explore:"Explorar herramientas",commons:"ESPACIO COMÚN",begin:"Un lugar para empezar"},
 pt:{overview:"Visão geral",ai:"Neftis AI",tools:"Biblioteca de ferramentas",community:"Comunidade",learn:"Conhecimento",games:"Arcade",achievements:"Conquistas",services:"Serviços",workspace:"ESPAÇO DE TRABALHO",yourSpace:"SEU ESPAÇO",search:"Pesquisar",signIn:"Entrar",openAI:"Abrir Neftis AI",explore:"Explorar ferramentas",commons:"ESPAÇO COMUM",begin:"Um lugar para começar"},
 fr:{overview:"Aperçu",ai:"Neftis AI",tools:"Bibliothèque d’outils",community:"Communauté",learn:"Connaissances",games:"Arcade",achievements:"Réussites",services:"Services",workspace:"ESPACE DE TRAVAIL",yourSpace:"VOTRE ESPACE",search:"Tout rechercher",signIn:"Connexion",openAI:"Ouvrir Neftis AI",explore:"Explorer les outils",commons:"ESPACE COMMUN",begin:"Un lieu pour commencer"},
 de:{overview:"Übersicht",ai:"Neftis AI",tools:"Werkzeugbibliothek",community:"Community",learn:"Wissen",games:"Arcade",achievements:"Erfolge",services:"Dienste",workspace:"ARBEITSBEREICH",yourSpace:"DEIN BEREICH",search:"Alles durchsuchen",signIn:"Anmelden",openAI:"Neftis AI öffnen",explore:"Tools entdecken",commons:"GEMEINSCHAFT",begin:"Ein Ort zum Starten"},
 hi:{overview:"अवलोकन",ai:"Neftis AI",tools:"टूल लाइब्रेरी",community:"समुदाय",learn:"ज्ञान",games:"आर्केड",achievements:"उपलब्धियाँ",services:"सेवाएँ",workspace:"कार्यस्थान",yourSpace:"आपकी जगह",search:"कुछ भी खोजें",signIn:"साइन इन",openAI:"Neftis AI खोलें",explore:"टूल देखें",commons:"साझा स्थान",begin:"शुरू करने की जगह"},
 ru:{overview:"Обзор",ai:"Neftis AI",tools:"Библиотека инструментов",community:"Сообщество",learn:"Знания",games:"Аркада",achievements:"Достижения",services:"Сервисы",workspace:"РАБОЧЕЕ ПРОСТРАНСТВО",yourSpace:"ВАШЕ ПРОСТРАНСТВО",search:"Поиск",signIn:"Войти",openAI:"Открыть Neftis AI",explore:"Изучить инструменты",commons:"ОБЩЕЕ ПРОСТРАНСТВО",begin:"Место для начала"},
 tr:{overview:"Genel bakış",ai:"Neftis AI",tools:"Araç kütüphanesi",community:"Topluluk",learn:"Bilgi",games:"Oyunlar",achievements:"Başarılar",services:"Hizmetler",workspace:"ÇALIŞMA ALANI",yourSpace:"ALANINIZ",search:"Her şeyi ara",signIn:"Giriş yap",openAI:"Neftis AI'ı aç",explore:"Araçları keşfet",commons:"ORTAK ALAN",begin:"Başlamak için bir yer"},
 th:{overview:"ภาพรวม",ai:"Neftis AI",tools:"คลังเครื่องมือ",community:"ชุมชน",learn:"ความรู้",games:"เกม",achievements:"ความสำเร็จ",services:"บริการ",workspace:"พื้นที่ทำงาน",yourSpace:"พื้นที่ของคุณ",search:"ค้นหาทุกอย่าง",signIn:"เข้าสู่ระบบ",openAI:"เปิด Neftis AI",explore:"สำรวจเครื่องมือ",commons:"พื้นที่ส่วนรวม",begin:"เริ่มต้นที่นี่"},
 vi:{overview:"Tổng quan",ai:"Neftis AI",tools:"Thư viện công cụ",community:"Cộng đồng",learn:"Kiến thức",games:"Trò chơi",achievements:"Thành tựu",services:"Dịch vụ",workspace:"KHÔNG GIAN LÀM VIỆC",yourSpace:"KHÔNG GIAN CỦA BẠN",search:"Tìm kiếm",signIn:"Đăng nhập",openAI:"Mở Neftis AI",explore:"Khám phá công cụ",commons:"KHÔNG GIAN CHUNG",begin:"Nơi để bắt đầu"}
};
const themes = [
 ["night","Night","#101116","#d4f36a"],["paper","Paper","#f1eee5","#829b42"],["forest","Forest","#10231d","#a9d889"],
 ["ocean","Ocean","#0c202b","#65d9d2"],["sunset","Sunset","#281b20","#ffad78"],["lavender","Lavender","#201c32","#b9a2ff"],
 ["terminal","Terminal","#09170e","#7dff9b"],["rose","Rose","#2b1b28","#ffabc5"],["amber","Amber","#211d12","#f3d36b"],
 ["ice","Ice","#10232d","#9be4ef"],["mono","Mono","#111111","#f0f0f0"],["cosmos","Cosmos","#14152b","#a8a5ff"],
 ["matcha","Matcha","#20251a","#c8df91"],["graphite","Graphite","#171b20","#b8c5d2"],["cobalt","Cobalt","#101b32","#78a9ff"],
 ["plum","Plum","#25172b","#e0a8ed"],["mint","Mint","#10251f","#8de5c1"],["clay","Clay","#2a211b","#dca77e"],
 ["aurora","Aurora","#101e27","#8ce6d1"],["parchment","Parchment","#eee5cf","#8d9c57"],["obsidian","Obsidian","#08090d","#a9c4ff"],
 ["sakura","Sakura","#2b1b28","#ffb5d2"],["ember","Ember","#281912","#ff9a62"],["glacier","Glacier","#10232d","#9be4ef"],
 ["solar","Solar","#251d10","#f0bd55"]
] as const;

const routeByPage: Record<PageKey, string> = {
  home: "/", ai: "/ai", tools: "/tools", community: "/community",
  learn: "/learn", games: "/games", achievements: "/achievements", services: "/services",
};
const pageByRoute: Record<string, PageKey> = Object.fromEntries(
  Object.entries(routeByPage).map(([page, route]) => [route, page as PageKey]),
) as Record<string, PageKey>;

export default function NeftisShell() {
  const pathname = usePathname();
  const router = useRouter();
  const page = pageByRoute[pathname] ?? "home";
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("night");
  const [customAccent, setCustomAccent] = useState("#d4f36a");
  const [customBackground, setCustomBackground] = useState("");
  const [customPanel, setCustomPanel] = useState("");
  const [customText, setCustomText] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [colorTarget, setColorTarget] = useState<"accent" | "background" | "panel" | "text" | null>(null);
  const [draftColor, setDraftColor] = useState("#d4f36a");
  const [language, setLanguage] = useState<LocaleCode>("id");
  const t = translations[language];
  const colorPalette = ["#d4f36a", "#a99aff", "#83d9d2", "#ffabc5", "#ffad78", "#f3d36b", "#9be4ef", "#8de5c1", "#f0f0ec", "#b8c5d2", "#17191f", "#101116", "#201c32", "#10231d", "#f1eee5", "#ffffff"];
  const colorLabels = { accent: "Accent", background: "Background", panel: "Panel", text: "Text" } as const;
  const colorValues = { accent: customAccent, background: customBackground || (themes.find(([id]) => id === theme)?.[2] ?? "#101116"), panel: customPanel || "#20232b", text: customText || "#f0f0ec" };
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("neftis-language") as LocaleCode | null;
      const savedTheme = localStorage.getItem("neftis-theme");
      const savedAccent = localStorage.getItem("neftis-custom-accent");
      const savedBackground = localStorage.getItem("neftis-custom-background");
      const savedPanel = localStorage.getItem("neftis-custom-panel");
      const savedText = localStorage.getItem("neftis-custom-text");
      if (savedLanguage && savedLanguage in translations) setLanguage(savedLanguage);
      if (savedTheme && themes.some(([id]) => id === savedTheme)) setTheme(savedTheme);
      if (savedAccent && /^#[0-9a-f]{6}$/i.test(savedAccent)) setCustomAccent(savedAccent);
      if (savedBackground && /^#[0-9a-f]{6}$/i.test(savedBackground)) setCustomBackground(savedBackground);
      if (savedPanel && /^#[0-9a-f]{6}$/i.test(savedPanel)) setCustomPanel(savedPanel);
      if (savedText && /^#[0-9a-f]{6}$/i.test(savedText)) setCustomText(savedText);
    } catch (error) {
      console.warn("Neftis preferences could not be restored.", error);
    }
  }, []);
  useEffect(() => {
    const selected = themes.find(([id]) => id === theme) ?? themes[0];
    const root = document.documentElement;
    const background = customBackground || selected[2];
    const hex = background.replace("#", "");
    const brightness = hex.length === 6 ? (parseInt(hex.slice(0,2),16)*299 + parseInt(hex.slice(2,4),16)*587 + parseInt(hex.slice(4,6),16)*114)/1000 : 24;
    const isLight = brightness > 155;
    root.style.setProperty("--bg", background);
    root.style.setProperty("--surface", customPanel || `color-mix(in srgb, ${background} 88%, ${isLight ? "#000" : "#fff"})`);
    root.style.setProperty("--surface-2", `color-mix(in srgb, var(--surface) 78%, ${isLight ? "#000" : "#fff"})`);
    root.style.setProperty("--line", `color-mix(in srgb, ${isLight ? "#000" : "#fff"} 15%, ${background})`);
    root.style.setProperty("--text", customText || (isLight ? "#20231f" : "#f0f0ec"));
    root.style.setProperty("--muted", isLight ? "#60665e" : "#a1a5ae");
    root.style.setProperty("--dim", isLight ? "#858b81" : "#737986");
    const accentHex = customAccent.replace("#", "");
    const accentBrightness = (parseInt(accentHex.slice(0,2),16)*299 + parseInt(accentHex.slice(2,4),16)*587 + parseInt(accentHex.slice(4,6),16)*114)/1000;
    root.style.setProperty("--accent", customAccent);
    root.style.setProperty("--accent-ink", accentBrightness > 155 ? "#171a10" : "#ffffff");
    root.style.setProperty("--shadow", isLight ? "0 18px 50px #25301a18" : "0 18px 50px #0005");
    root.dataset.theme = theme;
    root.dataset.scheme = isLight ? "light" : "dark";
    root.lang = language;
    root.dir = language === "ar" ? "rtl" : "ltr";
    root.style.colorScheme = isLight ? "light" : "dark";
    try {
      localStorage.setItem("neftis-theme", theme);
      localStorage.setItem("neftis-custom-accent", customAccent);
      localStorage.setItem("neftis-language", language);
      localStorage.setItem("neftis-custom-background", customBackground);
      localStorage.setItem("neftis-custom-panel", customPanel);
      localStorage.setItem("neftis-custom-text", customText);
    } catch (error) {
      console.warn("Neftis preferences could not be saved.", error);
    }
  }, [theme, customAccent, customBackground, customPanel, customText, language]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleGlobalKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        setLanguageOpen(false);
        setThemeOpen(false);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setLanguageOpen(false);
        setThemeOpen(false);
        setColorTarget(null);
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedModel, setSelectedModel] = useState("auto");
  const [responseStyle, setResponseStyle] = useState("balanced");
  const [responseLanguage, setResponseLanguage] = useState("id");
  function addAttachments(files: FileList | null) {
    if (!files?.length) return;
    const accepted = Array.from(files).filter((file) => {
      const valid = /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm)|application\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel|vnd.ms-powerpoint|vnd.openxmlformats-officedocument.presentationml.presentation)|text\/(plain|markdown|csv)|application\/(json|zip))$/i.test(file.type)
        || /\.(pdf|docx?|xlsx?|pptx?|txt|md|csv|json|zip|jpe?g|png|webp|gif|mp4|webm)$/i.test(file.name);
      if (!valid) notify("Format file ini belum didukung.");
      return valid;
    }).slice(0, 8 - attachments.length);
    setAttachments((current) => [...current, ...accepted]);
  }
  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  const [toast, setToast] = useState("");
  const localizedTitles: Record<PageKey,string> = {home:t.overview,ai:t.ai,tools:t.tools,community:t.community,learn:t.learn,games:t.games,achievements:t.achievements,services:t.services};

  const searchable = useMemo(() => [...navPrimary, ...navPersonal].map((item) => ({
    ...item,
    label: localizedTitles[item.id],
  })).filter((item) => item.label.toLowerCase().includes(query.toLowerCase())), [query, language]);

  function openColorEditor(target: "accent" | "background" | "panel" | "text") {
    setColorTarget(target);
    setDraftColor(colorValues[target]);
  }
  function applyCustomColor() {
    if (!/^#[0-9a-f]{6}$/i.test(draftColor)) return;
    if (colorTarget === "accent") setCustomAccent(draftColor);
    if (colorTarget === "background") setCustomBackground(draftColor);
    if (colorTarget === "panel") setCustomPanel(draftColor);
    if (colorTarget === "text") setCustomText(draftColor);
    setColorTarget(null);
  }
  function navigate(next: PageKey) {
    setMenuOpen(false);
    setSearchOpen(false);
    if (routeByPage[next] !== pathname) router.push(routeByPage[next]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2200);
  }
  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    setSentMessages((current) => [...current, message.trim()]);
    setMessage("");
    notify("Pesan disimpan di sesi pratinjau.");
  }

  return (
    <div className={`app-shell ${language === "ar" ? "locale-ar" : ""}`} lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <aside id="neftis-sidebar" className={`sidebar ${menuOpen ? "open" : ""}`}>
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); navigate("home"); }} aria-label="Neftis home">
          <span className="brand-mark">N<span>/</span></span>
          <span className="brand-name">neftis<span>.</span><small>DIGITAL COMMONS</small></span>
        </a>
        <div className="workspace-label">{t.workspace} <span>PUBLIC</span></div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navPrimary.map((item) => <button key={item.id} className={`nav-link ${page === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}>
            <span className="nav-icon">{item.icon}</span><span>{(item.id === "home" ? t.overview : item.id === "ai" ? t.ai : item.id === "tools" ? t.tools : item.id === "community" ? t.community : item.id === "learn" ? t.learn : item.id === "games" ? t.games : item.id === "achievements" ? t.achievements : t.services)}</span>{item.isNew && <b className="nav-new">NEW</b>}
          </button>)}
        </nav>
        <div className="sidebar-divider" />
        <div className="workspace-label">{t.yourSpace}</div>
        <nav className="primary-nav" aria-label="Personal navigation">
          {navPersonal.map((item) => <button key={item.id} className={`nav-link ${page === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.id === "achievements" ? t.achievements : t.services}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="status-card"><span className="status-dot" /><div><strong>Open for everyone</strong><small>A shared digital space</small></div></div>
          <button className="profile-button" onClick={() => notify("Autentikasi akan tersedia pada tahap berikutnya.")}><span className="avatar">G</span><span><strong>Guest session</strong><small>Preview mode</small></span><span className="more">···</span></button>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="neftis-sidebar">☰</button>
          <div className="breadcrumbs"><span>NEFTIS</span><i>/</i><strong>{localizedTitles[page]}</strong></div>
          <div className="topbar-actions">
            <button className="search-trigger" onClick={() => setSearchOpen(true)} aria-haspopup="dialog" aria-label={t.search}><span>⌕</span><span>{t.search}</span><kbd>⌘ K</kbd></button>
            <div className="preference-wrap">
              <button className="icon-button preference-trigger" onClick={() => {setLanguageOpen(!languageOpen);setThemeOpen(false);}} aria-expanded={languageOpen} aria-label="Choose language">{language.toUpperCase()}⌄</button>
              {languageOpen && <div className="preference-menu language-menu" role="listbox" aria-label="Languages">{languages.map((item) => <button key={item.code} role="option" aria-selected={language === item.code} className={language === item.code ? "selected" : ""} onClick={() => {setLanguage(item.code);setLanguageOpen(false);}}><span>{item.native}</span><small>{item.name}</small></button>)}</div>}
            </div>
            <div className="preference-wrap">
              <button className="icon-button preference-trigger" onClick={() => {setThemeOpen(!themeOpen);setLanguageOpen(false);}} aria-expanded={themeOpen} aria-label="Choose theme">◐⌄</button>
              {themeOpen && <div className="preference-menu theme-menu" aria-label="Themes">
                <div className="preference-menu-head"><div><span className="section-kicker">APPEARANCE</span><strong>Color themes</strong></div><button className="menu-close" onClick={() => setThemeOpen(false)} aria-label="Close themes">×</button></div>
                <div className="theme-options">{themes.map(([id,name,bg,accent]) => <button key={id} className={theme === id ? "selected theme-choice" : "theme-choice"} onClick={() => {setTheme(id);setCustomAccent(accent);setCustomBackground("");setCustomPanel("");setCustomText("");}} title={name} aria-pressed={theme === id}><i style={{background:bg,borderColor:accent}}/><span>{name}</span></button>)}</div>
                <div className="customizer-head"><span>Custom colors</span><small>PERSONALIZE</small></div>
                <div className="custom-colors">{(["accent","background","panel","text"] as const).map((target) => <button key={target} className="color-setting" onClick={() => openColorEditor(target)}><span>{colorLabels[target]}</span><i style={{background:colorValues[target]}}/><code>{colorValues[target].toUpperCase()}</code></button>)}</div>
                {colorTarget && <div className="color-editor"><div className="color-editor-head"><strong>{colorLabels[colorTarget]} color</strong><button className="menu-close" onClick={() => setColorTarget(null)} aria-label="Close color editor">×</button></div><div className="color-swatches">{colorPalette.map((color) => <button key={color} aria-label={color} title={color} className={draftColor.toLowerCase() === color ? "active" : ""} style={{background:color}} onClick={() => setDraftColor(color)} />)}</div><label className="hex-field"><span>HEX</span><input value={draftColor} maxLength={7} spellCheck={false} onChange={(e) => setDraftColor(e.target.value)} aria-label="Hex color value"/><span className="hex-preview" style={{background:/^#[0-9a-f]{6}$/i.test(draftColor) ? draftColor : "transparent"}} /></label><div className="color-editor-actions"><button onClick={() => setColorTarget(null)}>Cancel</button><button className="apply-color" disabled={!/^#[0-9a-f]{6}$/i.test(draftColor)} onClick={applyCustomColor}>Apply color</button></div></div>}
                <button className="reset-preferences" onClick={() => {setTheme("night");setCustomAccent("#d4f36a");setCustomBackground("");setCustomPanel("");setCustomText("");setLanguage("id");setColorTarget(null);}}>Reset preferences</button>
              </div>}
            </div>
            <button className="sign-in-button" onClick={() => router.push("/login")}>{t.signIn}</button>
          </div>
        </header>

        <div className="content-wrap">
          {page === "home" && <>
            <section className="page-view active">
              <div className="hero-grid">
                <div className="hero-copy">
                  <div className="eyebrow"><span className="eyebrow-line" /><span>{language === "ar" ? "مساحة رقمية عامة" : "A PUBLIC DIGITAL SPACE"}</span><span className="eyebrow-index">NEF—001</span></div>
                  <h1>{language === "ar" ? <>اترك مساحة<br />لـ <em>ما هو قادم.</em></> : <>Make room<br />for <em>what&apos;s next.</em></>}</h1>
                  <p>{language === "ar" ? "مساحة مشتركة لاكتشاف الأدوات المفيدة والتفكير مع الذكاء الاصطناعي وتبادل الأفكار وتعلّم أشياء جديدة." : "A shared place to explore useful tools, think with AI, exchange ideas, and learn something new."}</p>
                  <div className="hero-actions"><button className="button button-primary" onClick={() => navigate("ai")}>{t.openAI} <span>↗</span></button><button className="button button-quiet" onClick={() => navigate("tools")}>{t.explore} <span>→</span></button></div>
                  <div className="hero-footnote"><span className="pulse-dot" /> OPEN ACCESS · BUILT FOR SHARING</div>
                </div>
                <div className="hero-art" aria-label="Abstract orbital graphic">
                  <div className="art-topline"><span>FIG. 01 / DIGITAL ECOSYSTEM</span><span>∞</span></div>
                  <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
                  <div className="orbit-core">N<i /></div>
                  <span className="orbit-label label-a">IDEAS / 01</span><span className="orbit-label label-b">TOOLS / 02</span><span className="orbit-label label-c">PEOPLE / 03</span>
                  <div className="art-coordinates">NEFTIS<br />DIGITAL / 001</div>
                  <div className="art-bottomline"><span>CONNECTED BY CURIOSITY</span><span>NEF—01</span></div>
                </div>
              </div>
              <div className="section-heading"><div><span className="section-kicker">{t.commons}</span><h2>{language === "ar" ? "اكتشف مساحتك" : t.begin}</h2></div><span className="section-count">01 / 04</span></div>
              <div className="feature-grid">{spaces.map((space) => <button key={space.id} className={`feature-card ${space.tone}`} onClick={() => navigate(space.id)}><div className="card-meta"><span>{space.no} — {space.tag}</span><span>{space.icon}</span></div><div className="feature-symbol">{space.icon}</div><h3>{space.title}</h3><p>{space.desc}</p><span className="card-arrow">↗</span></button>)}</div>
              <div className="lower-grid">
                <section className="panel activity-panel"><div className="panel-heading"><div><span className="section-kicker">YOUR ACTIVITY</span><h3>Recent activity</h3></div><button className="text-link" onClick={() => navigate("achievements")}>View all ↗</button></div><div className="activity-list"><div className="empty-state"><span>◌</span><p>Your activity will appear here as you explore.</p></div></div></section>
                <section className="panel signal-panel"><div className="panel-heading"><div><span className="section-kicker">COMMUNITY SIGNAL</span><h3>From the community</h3></div><button className="text-link" onClick={() => navigate("community")}>Visit ↗</button></div><div className="signal-post"><span className="signal-tag">DISCUSSION / 001</span><h4>What small tool saves you the most time?</h4><p>A thread for sharing the little utilities that make a difference.</p><div className="signal-foot"><span>COMMUNITY BOARD</span><span>↗</span></div></div></section>
              </div>
              <footer className="page-footer"><span>© NEFTIS / DIGITAL COMMONS</span><span>OPEN BY DESIGN · MADE TO EXPLORE</span></footer>
            </section>
          </>}

          {page === "ai" && <section className="page-view active ai-workspace">
            <div className="page-intro"><div><span className="section-kicker">01 / INTELLIGENCE</span><h1>Neftis <em>AI</em></h1><p>A calm workspace for thinking, exploring, and making progress.</p></div><div className="intro-side-label">WORKSPACE STATUS<br />LOCAL PREVIEW · PROVIDER NOT CONNECTED</div></div>
            <div className="chat-layout">
              <aside className="chat-history panel">
                <div className="history-head"><strong>Conversations</strong><button className="small-plus" aria-label="New conversation" onClick={() => {setSentMessages([]);setMessage("");setAttachments([]);}}>+</button></div>
                <button className="history-item selected" type="button"><span aria-hidden="true">◌</span><span>New conversation</span></button>
                <div className="history-note">Your saved conversations will appear here after account and database setup.</div>
                <div className="history-foot"><span className="history-foot-dot" /> Private workspace planned</div>
              </aside>
              <div className="chat-main panel">
                <div className="chat-toolbar"><div><span className="online-indicator" /><strong>Neftis Assistant</strong><small>Local preview</small></div><button className="text-button" type="button" onClick={() => {setSentMessages([]);setMessage("");setAttachments([]);}}>Clear chat</button></div>
                <div className="chat-messages">
                  {sentMessages.length === 0 ? <div className="assistant-welcome"><div className="assistant-orb">✳</div><span className="section-kicker">NEFTIS / ASSISTANT</span><h2>What are we<br /><em>working on?</em></h2><p>Start with a question or choose a prompt. Your workspace is being prepared for connected AI providers.</p><div className="prompt-chips">{["Help me plan a project", "Explain a difficult topic", "Review this document"].map((prompt) => <button type="button" key={prompt} onClick={() => setMessage(prompt)}>{prompt} ↗</button>)}</div></div> : sentMessages.map((text, index) => <div className="chat-bubble user" key={`${text}-${index}`}><span className="bubble-label">YOU · LOCAL PREVIEW</span>{text}</div>)}
                </div>
                <form className="chat-composer ai-composer" onSubmit={sendMessage}>
                  {attachments.length > 0 && <div className="attachment-queue"><div className="attachment-queue-head"><strong>{attachments.length} attachment{attachments.length > 1 ? "s" : ""}</strong><button type="button" onClick={() => setAttachments([])}>Remove all</button></div><div className="attachment-list">{attachments.map((file, index) => <div className="attachment-chip" key={`${file.name}-${file.lastModified}-${index}`}><span className="attachment-type">{file.type.startsWith("image/") ? "▧" : file.type.startsWith("video/") ? "▶" : "▤"}</span><span className="attachment-name"><strong>{file.name}</strong><small>{formatFileSize(file.size)}</small></span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setAttachments((current) => current.filter((_, i) => i !== index))}>×</button></div>)}</div></div>}
                  <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message Neftis AI…" aria-label="Message Neftis AI" />
                  <div className="composer-bottom">
                    <div className="composer-tools">
                      <label className="composer-tool" title="Attach documents, images or videos"><span>＋</span><span>Attach</span><input type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx,.ppt,.pptx,.json,.zip,image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={(e) => {addAttachments(e.target.files);e.currentTarget.value="";}} /></label>
                      <label className="composer-tool" title="Take a photo using your device camera"><span>◎</span><span>Camera</span><input type="file" accept="image/*" capture="environment" onChange={(e) => {addAttachments(e.target.files);e.currentTarget.value="";}} /></label>
                      <span className="composer-hint">Up to 8 files · Local preview only</span>
                    </div>
                    <button className="send-button" type="submit" aria-label="Send message">↑</button>
                  </div>
                  <p className="composer-disclaimer">Preview only. Messages and attachments are not uploaded or sent to an AI provider yet.</p>
                </form>
              </div>
              <aside className="chat-context panel"><span className="section-kicker">SESSION CONTEXT</span><h3>Conversation setup</h3>
                <label htmlFor="ai-model">Model</label><select id="ai-model" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}><option value="auto">Automatic (planned)</option><option value="gemini">Google Gemini (planned)</option><option value="custom">Connected model (planned)</option></select>
                <label htmlFor="ai-style">Response style</label><select id="ai-style" value={responseStyle} onChange={(e) => setResponseStyle(e.target.value)}><option value="balanced">Balanced</option><option value="concise">Concise</option><option value="detailed">Detailed</option><option value="creative">Creative</option></select>
                <label htmlFor="ai-language">Response language</label><select id="ai-language" value={responseLanguage} onChange={(e) => setResponseLanguage(e.target.value)}><option value="id">Bahasa Indonesia</option><option value="en">English</option><option value="auto">Follow conversation</option></select>
                <div className="context-status"><span className="status-dot" /><div><strong>Provider not connected</strong><small>Connect an API key in AI Connections to enable responses.</small></div></div>
                <p className="context-footnote">Model and response preferences are interface previews until account settings are connected.</p>
              </aside>
            </div>
          </section>}

          {page === "tools" && <ToolsLibrary language={language} />}

          {page === "community" && <section className="page-view active"><PageIntro number="03" title={<>The <em>commons</em></>} desc="A public board for questions, experiments, and shared discoveries." side={<>COMMUNITY BOARD<br />OPEN ACCESS</>} /><div className="community-compose panel"><div className="compose-mark">＋</div><div className="compose-body"><strong>Start a discussion</strong><p>Share a question or something useful you found.</p></div><button className="button button-outline" onClick={() => notify("Posting akan tersedia setelah autentikasi aktif.")}>Write a post</button></div><article className="community-post"><div className="post-meta"><span>COMMUNITY / INTRODUCTION</span><strong>OPEN DISCUSSION</strong></div><h3>Welcome to Neftis</h3><p>This is a preview of the community space. Sign-in and posting features will be connected in a later phase.</p></article></section>}

          {page === "learn" && <section className="page-view active"><PageIntro number="04" title={<>Knowledge <em>room</em></>} desc="Notes and guides for curious minds." side={<>FIELD NOTES<br />LEARN / SHARE</>} /><div className="learn-grid"><article className="learn-card learn-featured"><div className="learn-art"><span>FIELD NOTE / 001</span><div className="learn-art-shape">⌘</div><small>TOOLS · WORKFLOW</small></div><div className="learn-card-body"><span className="section-kicker">PRACTICAL GUIDE · 5 MIN</span><h3>Build a better digital workflow</h3><p>A simple framework for choosing tools, reducing friction, and keeping your work organized.</p><button className="text-link" onClick={() => notify("Artikel akan tersedia pada modul Knowledge.")}>Read field note ↗</button></div></article><article className="learn-card"><div className="learn-card-body"><span className="section-kicker">AI LITERACY · 4 MIN</span><h3>How to write a useful AI prompt</h3><p>Give an AI system the context it needs without overcomplicating the request.</p><button className="text-link" onClick={() => notify("Artikel akan tersedia pada modul Knowledge.")}>Read field note ↗</button></div><div className="learn-number">02</div></article><article className="learn-card"><div className="learn-card-body"><span className="section-kicker">WEB BASICS · 6 MIN</span><h3>What happens when a website loads?</h3><p>A plain-language tour of browsers, servers, assets, and the request cycle.</p><button className="text-link" onClick={() => notify("Artikel akan tersedia pada modul Knowledge.")}>Read field note ↗</button></div><div className="learn-number">03</div></article></div></section>}

          {page === "games" && <section className="page-view active"><PageIntro number="05" title={<>The <em>arcade</em></>} desc="Small experiments for a short mental reset." side={<>PLAY MODE<br />NO SCORE PRESSURE</>} /><div className="game-panel panel"><div className="game-heading"><div><span className="section-kicker">GAME 001 / COMING SOON</span><h2>Signal Sequence</h2><p>A small collection of playful experiments is taking shape.</p></div><div className="game-score"><small>STATUS</small><strong>01</strong></div></div><div className="game-status">The arcade is being prepared.</div><div className="signal-grid"><button aria-label="Signal 1" /><button aria-label="Signal 2" /><button aria-label="Signal 3" /><button aria-label="Signal 4" /></div><div className="game-actions"><button className="button button-primary" onClick={() => notify("Game akan diaktifkan pada tahap Arcade.")}>Explore soon ↗</button></div></div></section>}

          {page === "achievements" && <section className="page-view active"><PageIntro number="06" title={<>Small <em>milestones</em></>} desc="Discoveries and contributions, collected as you explore." side={<>PERSONAL PROGRESS<br />PROFILE / PLANNED</>} /><div className="achievement-summary panel"><div><span className="section-kicker">COLLECTED</span><strong>0 / 6</strong></div><div className="achievement-progress"><div /></div><span className="achievement-percent">0%</span></div><div className="achievement-grid">{["First visit", "Curious mind", "Tool explorer", "Conversation starter", "Knowledge seeker", "Community member"].map((name, index) => <article className="achievement-card" key={name}><span className="achievement-icon">{["✧","✳","⌘","◎","▤","◇"][index]}</span><h3>{name}</h3><p>Keep exploring Neftis to unlock this milestone.</p><span className="achievement-state">NOT UNLOCKED</span></article>)}</div></section>}

          {page === "services" && <section className="page-view active"><PageIntro number="07" title={<>Digital <em>services</em></>} desc="Useful support for ideas that need to move forward." side={<>SERVICE DIRECTORY<br />BY REQUEST</>} /><div className="service-grid">{[{no:"01 / WEB",name:"Web development",desc:"Responsive websites, landing pages, and small digital products."},{no:"02 / DIGITAL",name:"Digital utilities",desc:"Focused tools and workflow improvements for everyday tasks."},{no:"03 / KNOWLEDGE",name:"Learning resources",desc:"Clear technical explanations and practical learning material."}].map((item) => <article className="service-card" key={item.no}><span>{item.no}</span><h3>{item.name}</h3><p>{item.desc}</p><button className="text-link" onClick={() => notify("Detail layanan akan segera tersedia.")}>Explore service ↗</button></article>)}</div></section>}
        </div>
      </main>

      {searchOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}><section className="modal panel" role="dialog" aria-modal="true" aria-label="Search Neftis"><div className="modal-head"><span className="section-kicker">NEFTIS / SEARCH</span><button className="icon-button" onClick={() => setSearchOpen(false)}>×</button></div><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search spaces..." aria-label="Search Neftis spaces" />{searchable.length ? searchable.map((item) => <button className="search-result" key={item.id} onClick={() => navigate(item.id)}>{item.label}<span>OPEN ↗</span></button>) : <p className="empty-state">No matching spaces.</p> }</section></div>}
      {toast && <div className="toast show" role="status">{toast}</div>}
    </div>
  );
}

function PageIntro({ number, title, desc, side }: { number: string; title: React.ReactNode; desc: string; side: React.ReactNode }) {
  return <div className="page-intro"><div><span className="section-kicker">{number} / NEFTIS SPACE</span><h1>{title}</h1><p>{desc}</p></div><div className="intro-side-label">{side}</div></div>;
}
