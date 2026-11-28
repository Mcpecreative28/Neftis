"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ToolsLibrary from "@/components/tools/tools-library";
import AIWorkspace from "@/components/ai/ai-workspace";
import { authClient } from "@/lib/auth/client";
import { motion } from "motion/react";

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


type LocaleCode = "id"|"en"|"zh"|"ja"|"ko"|"es"|"pt"|"fr"|"de"|"hi"|"ru"|"tr"|"th"|"vi";
const languages: {code: LocaleCode; name: string; native: string}[] = [
  {code:"id",name:"Indonesian",native:"Bahasa Indonesia"},{code:"en",name:"English",native:"English"},{code:"zh",name:"Chinese",native:"中文"},
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
 ["atelier","Atelier","#101116","#cf6848"],["paper","Paper","#f1eee5","#829b42"],["forest","Forest","#10231d","#a9d889"],
 ["ocean","Ocean","#0c202b","#65d9d2"],["sunset","Sunset","#281b20","#ffad78"],["lavender","Lavender","#201c32","#b9a2ff"],
 ["terminal","Terminal","#09170e","#7dff9b"],["rose","Rose","#2b1b28","#ffabc5"],["amber","Amber","#211d12","#f3d36b"],
 ["ice","Ice","#10232d","#9be4ef"],["mono","Mono","#111111","#f0f0f0"],["cosmos","Cosmos","#14152b","#a8a5ff"],
 ["matcha","Matcha","#20251a","#c8df91"],["graphite","Graphite","#171b20","#b8c5d2"],["cobalt","Cobalt","#101b32","#78a9ff"],
 ["plum","Plum","#25172b","#e0a8ed"],["mint","Mint","#10251f","#8de5c1"],["clay","Clay","#2a211b","#dca77e"],
 ["aurora","Aurora","#101e27","#8ce6d1"],["parchment","Parchment","#eee5cf","#8d9c57"],["obsidian","Obsidian","#08090d","#a9c4ff"],
 ["sakura","Sakura","#2b1b28","#ffb5d2"],["ember","Ember","#281912","#ff9a62"],["glacier","Glacier","#10232d","#9be4ef"],
 ["solar","Solar","#251d10","#f0bd55"]
] as const;


type HomeCopy = { eyebrow:string; headlineTop:string; headlineAccent:string; description:string; section:string; begin:string; activity:string; recent:string; activityEmpty:string; community:string; fromCommunity:string; question:string; questionDesc:string; footer:string; footerNote:string };
const homeCopy: Partial<Record<LocaleCode,HomeCopy>> = {
 id:{eyebrow:"RUANG DIGITAL TERBUKA",headlineTop:"Buka ruang untuk",headlineAccent:"hal berikutnya.",description:"Tempat bersama untuk menemukan alat berguna, berpikir bersama AI, bertukar gagasan, dan mempelajari hal baru.",section:"RUANG BERSAMA",begin:"Mulai jelajahi",activity:"AKTIVITASMU",recent:"Aktivitas terbaru",activityEmpty:"Aktivitasmu akan muncul di sini saat kamu menjelajahi Neftis.",community:"JEJAK KOMUNITAS",fromCommunity:"Dari komunitas",question:"Alat kecil apa yang paling menghemat waktumu?",questionDesc:"Bagikan utilitas sederhana yang membuat pekerjaan sehari-hari lebih mudah.",footer:"© NEFTIS / RUANG DIGITAL",footerNote:"TERBUKA UNTUK SEMUA · DIBUAT UNTUK DIJELAJAHI"},
 en:{eyebrow:"AN OPEN DIGITAL SPACE",headlineTop:"Make room for",headlineAccent:"what comes next.",description:"A shared place to discover useful tools, think with AI, exchange ideas, and learn something new.",section:"THE COMMONS",begin:"A place to begin",activity:"YOUR ACTIVITY",recent:"Recent activity",activityEmpty:"Your activity will appear here as you explore Neftis.",community:"COMMUNITY SIGNAL",fromCommunity:"From the community",question:"What small tool saves you the most time?",questionDesc:"Share the little utilities that make everyday work easier.",footer:"© NEFTIS / DIGITAL COMMONS",footerNote:"OPEN BY DESIGN · MADE TO EXPLORE"},
 zh:{eyebrow:"开放的数字空间",headlineTop:"为下一步",headlineAccent:"留出空间。",description:"在这里发现实用工具、借助 AI 思考、交流想法，并学习新知识。",section:"共享空间",begin:"从这里开始",activity:"你的动态",recent:"最近动态",activityEmpty:"探索 Neftis 时，你的动态会显示在这里。",community:"社区动态",fromCommunity:"来自社区",question:"哪款小工具最能帮你节省时间？",questionDesc:"分享让日常工作更轻松的小工具。",footer:"© NEFTIS / 数字共享空间",footerNote:"开放共享 · 探索更多"},
 ja:{eyebrow:"ひらかれたデジタル空間",headlineTop:"次の可能性に",headlineAccent:"余白をつくろう。",description:"便利なツールを見つけ、AIと考え、アイデアを交換し、新しいことを学べる共有スペース。",section:"共有スペース",begin:"ここから始める",activity:"あなたのアクティビティ",recent:"最近のアクティビティ",activityEmpty:"Neftisを探索すると、ここに履歴が表示されます。",community:"コミュニティ",fromCommunity:"コミュニティから",question:"一番時間を節約してくれる小さなツールは？",questionDesc:"日々の作業を楽にする便利なツールを共有しましょう。",footer:"© NEFTIS / デジタルコモンズ",footerNote:"誰にでも開かれた場所 · 探索しよう"},
 ko:{eyebrow:"열린 디지털 공간",headlineTop:"다음 가능성을 위한",headlineAccent:"여백을 만드세요.",description:"유용한 도구를 발견하고 AI와 함께 생각하며 아이디어를 나누고 새로운 것을 배우는 공간입니다.",section:"공유 공간",begin:"여기서 시작하기",activity:"내 활동",recent:"최근 활동",activityEmpty:"Neftis를 둘러보면 활동이 여기에 표시됩니다.",community:"커뮤니티 소식",fromCommunity:"커뮤니티에서",question:"시간을 가장 많이 아껴주는 작은 도구는 무엇인가요?",questionDesc:"일상을 더 편하게 만드는 유용한 도구를 공유해 보세요.",footer:"© NEFTIS / 디지털 커먼즈",footerNote:"모두에게 열린 공간 · 자유롭게 탐색"},
 es:{eyebrow:"UN ESPACIO DIGITAL ABIERTO",headlineTop:"Haz espacio para",headlineAccent:"lo que viene.",description:"Un lugar compartido para descubrir herramientas útiles, pensar con IA, intercambiar ideas y aprender.",section:"ESPACIO COMÚN",begin:"Un lugar para empezar",activity:"TU ACTIVIDAD",recent:"Actividad reciente",activityEmpty:"Tu actividad aparecerá aquí mientras exploras Neftis.",community:"SEÑAL DE LA COMUNIDAD",fromCommunity:"De la comunidad",question:"¿Qué pequeña herramienta te ahorra más tiempo?",questionDesc:"Comparte utilidades que facilitan el trabajo diario.",footer:"© NEFTIS / ESPACIO DIGITAL",footerNote:"ABIERTO PARA TODOS · HECHO PARA EXPLORAR"},
 pt:{eyebrow:"UM ESPAÇO DIGITAL ABERTO",headlineTop:"Abra espaço para",headlineAccent:"o que vem a seguir.",description:"Um lugar compartilhado para descobrir ferramentas úteis, pensar com IA, trocar ideias e aprender.",section:"ESPAÇO COMUM",begin:"Um lugar para começar",activity:"SUA ATIVIDADE",recent:"Atividade recente",activityEmpty:"Sua atividade aparecerá aqui enquanto você explora o Neftis.",community:"SINAL DA COMUNIDADE",fromCommunity:"Da comunidade",question:"Qual pequena ferramenta mais economiza seu tempo?",questionDesc:"Compartilhe utilitários que facilitam o trabalho diário.",footer:"© NEFTIS / ESPAÇO DIGITAL",footerNote:"ABERTO A TODOS · FEITO PARA EXPLORAR"},
 fr:{eyebrow:"UN ESPACE NUMÉRIQUE OUVERT",headlineTop:"Faites place à",headlineAccent:"la suite.",description:"Un espace partagé pour découvrir des outils utiles, réfléchir avec l’IA, échanger des idées et apprendre.",section:"ESPACE COMMUN",begin:"Un lieu pour commencer",activity:"VOTRE ACTIVITÉ",recent:"Activité récente",activityEmpty:"Votre activité apparaîtra ici à mesure que vous explorez Neftis.",community:"ÉCHO DE LA COMMUNAUTÉ",fromCommunity:"De la communauté",question:"Quel petit outil vous fait gagner le plus de temps ?",questionDesc:"Partagez les utilitaires qui simplifient le quotidien.",footer:"© NEFTIS / ESPACE NUMÉRIQUE",footerNote:"OUVERT À TOUS · FAIT POUR EXPLORER"},
 de:{eyebrow:"EIN OFFENER DIGITALER RAUM",headlineTop:"Schaffe Raum für",headlineAccent:"das, was kommt.",description:"Ein gemeinsamer Ort, um nützliche Tools zu entdecken, mit KI zu denken, Ideen auszutauschen und Neues zu lernen.",section:"GEMEINSCHAFT",begin:"Hier beginnt es",activity:"DEINE AKTIVITÄTEN",recent:"Letzte Aktivitäten",activityEmpty:"Deine Aktivitäten erscheinen hier, wenn du Neftis erkundest.",community:"STIMME DER COMMUNITY",fromCommunity:"Aus der Community",question:"Welches kleine Tool spart dir am meisten Zeit?",questionDesc:"Teile kleine Helfer, die den Alltag leichter machen.",footer:"© NEFTIS / DIGITALER GEMEINSCHAFTSRAUM",footerNote:"OFFEN FÜR ALLE · ZUM ENTDECKEN"},
 hi:{eyebrow:"एक खुली डिजिटल जगह",headlineTop:"आने वाले कल के लिए",headlineAccent:"जगह बनाएं।",description:"उपयोगी टूल खोजें, AI के साथ सोचें, विचार साझा करें और कुछ नया सीखें।",section:"साझा स्थान",begin:"यहाँ से शुरू करें",activity:"आपकी गतिविधि",recent:"हाल की गतिविधि",activityEmpty:"Neftis एक्सप्लोर करने पर आपकी गतिविधि यहाँ दिखेगी।",community:"समुदाय की झलक",fromCommunity:"समुदाय से",question:"कौन-सा छोटा टूल आपका सबसे अधिक समय बचाता है?",questionDesc:"रोज़मर्रा के काम आसान बनाने वाले टूल साझा करें।",footer:"© NEFTIS / डिजिटल कॉमन्स",footerNote:"सबके लिए खुला · खोजने के लिए बना"},
 ru:{eyebrow:"ОТКРЫТОЕ ЦИФРОВОЕ ПРОСТРАНСТВО",headlineTop:"Освободите место",headlineAccent:"для нового.",description:"Общее пространство для полезных инструментов, идей, общения с ИИ и новых знаний.",section:"ОБЩЕЕ ПРОСТРАНСТВО",begin:"Начать отсюда",activity:"ВАША АКТИВНОСТЬ",recent:"Недавняя активность",activityEmpty:"Здесь появится ваша активность по мере знакомства с Neftis.",community:"СИГНАЛ СООБЩЕСТВА",fromCommunity:"От сообщества",question:"Какой небольшой инструмент экономит вам больше всего времени?",questionDesc:"Делитесь утилитами, которые упрощают повседневные задачи.",footer:"© NEFTIS / ЦИФРОВОЕ ПРОСТРАНСТВО",footerNote:"ОТКРЫТО ДЛЯ ВСЕХ · СОЗДАНО ДЛЯ ИССЛЕДОВАНИЯ"},
 tr:{eyebrow:"AÇIK BİR DİJİTAL ALAN",headlineTop:"Yeniliklere",headlineAccent:"yer açın.",description:"Yararlı araçları keşfetmek, yapay zekâyla düşünmek, fikir alışverişi yapmak ve öğrenmek için ortak bir alan.",section:"ORTAK ALAN",begin:"Buradan başlayın",activity:"ETKİNLİĞİNİZ",recent:"Son etkinlikler",activityEmpty:"Neftis'i keşfettikçe etkinliğiniz burada görünecek.",community:"TOPLULUKTAN",fromCommunity:"Topluluktan",question:"En çok zaman kazandıran küçük aracınız hangisi?",questionDesc:"Günlük işleri kolaylaştıran araçları paylaşın.",footer:"© NEFTIS / DİJİTAL ALAN",footerNote:"HERKESE AÇIK · KEŞFETMEK İÇİN TASARLANDI"},
 th:{eyebrow:"พื้นที่ดิจิทัลแบบเปิด",headlineTop:"เปิดพื้นที่ให้กับ",headlineAccent:"สิ่งใหม่ที่กำลังมา",description:"พื้นที่ส่วนกลางสำหรับค้นหาเครื่องมือที่มีประโยชน์ คิดร่วมกับ AI แลกเปลี่ยนไอเดีย และเรียนรู้สิ่งใหม่",section:"พื้นที่ส่วนกลาง",begin:"เริ่มต้นที่นี่",activity:"กิจกรรมของคุณ",recent:"กิจกรรมล่าสุด",activityEmpty:"กิจกรรมของคุณจะแสดงที่นี่เมื่อคุณสำรวจ Neftis",community:"เสียงจากชุมชน",fromCommunity:"จากชุมชน",question:"เครื่องมือเล็ก ๆ อะไรช่วยประหยัดเวลาของคุณได้มากที่สุด?",questionDesc:"แบ่งปันเครื่องมือที่ช่วยให้งานประจำวันง่ายขึ้น",footer:"© NEFTIS / พื้นที่ดิจิทัล",footerNote:"เปิดสำหรับทุกคน · สร้างเพื่อการค้นพบ"},
 vi:{eyebrow:"KHÔNG GIAN SỐ MỞ",headlineTop:"Dành chỗ cho",headlineAccent:"những điều sắp tới.",description:"Không gian chung để khám phá công cụ hữu ích, tư duy cùng AI, trao đổi ý tưởng và học điều mới.",section:"KHÔNG GIAN CHUNG",begin:"Bắt đầu từ đây",activity:"HOẠT ĐỘNG CỦA BẠN",recent:"Hoạt động gần đây",activityEmpty:"Hoạt động sẽ xuất hiện tại đây khi bạn khám phá Neftis.",community:"TÍN HIỆU CỘNG ĐỒNG",fromCommunity:"Từ cộng đồng",question:"Công cụ nhỏ nào giúp bạn tiết kiệm thời gian nhất?",questionDesc:"Chia sẻ tiện ích giúp công việc hằng ngày dễ dàng hơn.",footer:"© NEFTIS / KHÔNG GIAN SỐ",footerNote:"MỞ CHO MỌI NGƯỜI · ĐƯỢC TẠO ĐỂ KHÁM PHÁ"}

};

const routeByPage: Record<PageKey, string> = {
  home: "/", ai: "/ai", tools: "/tools", community: "/community",
  learn: "/learn", games: "/games", achievements: "/achievements", services: "/services",
};
const pageByRoute: Record<string, PageKey> = Object.fromEntries(
  Object.entries(routeByPage).map(([page, route]) => [route, page as PageKey]),
) as Record<string, PageKey>;


function NeftisIcon({name}:{name:PageKey}) {
 const paths:Record<PageKey,React.ReactNode>={
  home:<><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></>,
  ai:<><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1"/><circle cx="12" cy="12" r="3"/></>,
  tools:<><path d="m14 7 3-3 4 4-3 3M13 8 5 16a2.8 2.8 0 1 0 4 4l8-8"/><path d="m5 5 4 4"/></>,
  community:<><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/></>,
  learn:<><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v17H5.5A2.5 2.5 0 0 0 3 22z"/><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H12v17h6.5A2.5 2.5 0 0 1 21 22z"/></>,
  games:<><path d="M6 8h12a4 4 0 0 1 3.8 5l-1.2 4a2 2 0 0 1-3.2 1l-2.4-2H9l-2.4 2a2 2 0 0 1-3.2-1l-1.2-4A4 4 0 0 1 6 8z"/><path d="M7 11v4M5 13h4M16 12h.01M18 14h.01"/></>,
  achievements:<><path d="m12 3 2.5 5.2 5.7.8-4.1 4 .9 5.7-5-2.7-5 2.7.9-5.7-4.1-4 5.7-.8z"/></>,
  services:<><path d="M7 17 17 7M8 7h9v9"/></>
 };
 return <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function NeftisShell() {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<{ name?: string | null; email?: string | null } | null>(null);
  useEffect(() => {
    let active = true;
    authClient.getSession().then(({ data }) => {
      if (active) setSessionUser(data?.user ?? null);
    }).catch(() => {
      if (active) setSessionUser(null);
    });
    return () => { active = false; };
  }, [pathname]);
  const page = pageByRoute[pathname] ?? "home";
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("atelier");
  const [customAccent, setCustomAccent] = useState("#cf6848");
  const [customBackground, setCustomBackground] = useState("");
  const [customPanel, setCustomPanel] = useState("");
  const [customText, setCustomText] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [colorTarget, setColorTarget] = useState<"accent" | "background" | "panel" | "text" | null>(null);
  const [draftColor, setDraftColor] = useState("#cf6848");
  const [language, setLanguage] = useState<LocaleCode>("id");
  const t = translations[language];
  const copy = homeCopy[language] ?? homeCopy.en!;
  const colorPalette = ["#cf6848", "#d6e5a0", "#72d7d0", "#7967a8", "#24272b", "#f3f0e8", "#ffffff", "#1b2530", "#d99a5b", "#8caa9a", "#d98da5", "#596c84"];
  const colorLabels = { accent: "Accent", background: "Background", panel: "Panel", text: "Text" } as const;
  const colorValues = { accent: customAccent, background: customBackground || (themes.find(([id]) => id === theme)?.[2] ?? "#101116"), panel: customPanel || "#20232b", text: customText || "#f0f0ec" };
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("neftis-language-v3") as LocaleCode | null;
      const savedTheme = localStorage.getItem("neftis-theme-v3");
      const savedAccent = localStorage.getItem("neftis-custom-accent-v3");
      const savedBackground = localStorage.getItem("neftis-custom-background-v3");
      const savedPanel = localStorage.getItem("neftis-custom-panel-v3");
      const savedText = localStorage.getItem("neftis-custom-text-v3");
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
    root.style.setProperty("--surface", customPanel || `color-mix(in srgb, ${background} 90%, #fff)`);
    root.style.setProperty("--surface-2", `color-mix(in srgb, var(--surface) 91%, ${isLight ? "#000" : "#fff"})`);
    root.style.setProperty("--line", `color-mix(in srgb, ${isLight ? "#20252d" : "#fff"} 14%, ${background})`);
    root.style.setProperty("--text", customText || (isLight ? "#20252d" : "#f0f0ec"));
    root.style.setProperty("--muted", isLight ? "#626873" : "#a1a5ae");
    root.style.setProperty("--dim", isLight ? "#8a8e95" : "#737986");
    const accentHex = customAccent.replace("#", "");
    const accentBrightness = (parseInt(accentHex.slice(0,2),16)*299 + parseInt(accentHex.slice(2,4),16)*587 + parseInt(accentHex.slice(4,6),16)*114)/1000;
    root.style.setProperty("--accent", customAccent);
    root.style.setProperty("--accent-ink", accentBrightness > 155 ? "#171a10" : "#ffffff");
    root.style.setProperty("--shadow", isLight ? "0 18px 50px #25301a18" : "0 18px 50px #0005");
    root.dataset.theme = theme;
    root.dataset.scheme = isLight ? "light" : "dark";
    root.lang = language;
    root.dir = "ltr";
    root.style.colorScheme = isLight ? "light" : "dark";
    try {
      localStorage.setItem("neftis-theme-v3", theme);
      localStorage.setItem("neftis-custom-accent-v3", customAccent);
      localStorage.setItem("neftis-language-v3", language);
      localStorage.setItem("neftis-custom-background-v3", customBackground);
      localStorage.setItem("neftis-custom-panel-v3", customPanel);
      localStorage.setItem("neftis-custom-text-v3", customText);
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
  return (
    <div className="app-shell" lang={language} dir="ltr" data-page={page}>
      <aside id="neftis-sidebar" className={`sidebar ${menuOpen ? "open" : ""}`}>
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); navigate("home"); }} aria-label="Neftis home">
          <span className="brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M9 31V9l22 22V9" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="31" cy="9" r="3" fill="var(--accent)"/></svg></span>
          <span className="brand-name">neftis<span>.</span><small>DIGITAL COMMONS</small></span>
        </a>
        <div className="workspace-label">{t.workspace} <span>PUBLIC</span></div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navPrimary.map((item) => <button key={item.id} className={`nav-link ${page === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}>
            <span className="nav-icon"><NeftisIcon name={item.id} /></span><span>{(item.id === "home" ? t.overview : item.id === "ai" ? t.ai : item.id === "tools" ? t.tools : item.id === "community" ? t.community : item.id === "learn" ? t.learn : item.id === "games" ? t.games : item.id === "achievements" ? t.achievements : t.services)}</span>{item.isNew && <b className="nav-new">NEW</b>}
          </button>)}
        </nav>
        <div className="sidebar-divider" />
        <div className="workspace-label">{t.yourSpace}</div>
        <nav className="primary-nav" aria-label="Personal navigation">
          {navPersonal.map((item) => <button key={item.id} className={`nav-link ${page === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}><span className="nav-icon"><NeftisIcon name={item.id} /></span><span>{item.id === "achievements" ? t.achievements : t.services}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="status-card"><span className="status-dot" /><div><strong>Open for everyone</strong><small>A shared digital space</small></div></div>
          <button className="profile-button" onClick={() => router.push(sessionUser ? "/dashboard" : "/login")}><span className="avatar">{sessionUser?.name?.slice(0, 1).toUpperCase() ?? "G"}</span><span><strong>{sessionUser?.name ?? "Guest session"}</strong><small>{sessionUser?.email ?? "Preview mode"}</small></span><span className="more">↗</span></button>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <a className="global-brand" href="/" onClick={(e) => { e.preventDefault(); navigate("home"); }} aria-label="Neftis home">
            <span className="global-brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M9 31V9l22 22V9" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="31" cy="9" r="3" fill="var(--accent)"/></svg></span>
            <span>neftis<span>.</span><small>COMMONS / 001</small></span>
          </a>
          <nav className="global-nav" aria-label="Main navigation">
            {navPrimary.map((item) => <button key={item.id} className={page === item.id ? "global-nav-link active" : "global-nav-link"} onClick={() => navigate(item.id)} aria-current={page === item.id ? "page" : undefined}>
              <span>{item.label === "Overview" ? "01" : item.id === "ai" ? "02" : item.id === "tools" ? "03" : item.id === "community" ? "04" : item.id === "learn" ? "05" : "06"}</span>{localizedTitles[item.id]}
            </button>)}
          </nav>
          <div className="topbar-actions">
            <button className="search-trigger" onClick={() => setSearchOpen(true)} aria-haspopup="dialog" aria-label={t.search}><span>⌕</span><span>{t.search}</span><kbd>⌘ K</kbd></button>
            <div className="preference-wrap">
              <button className="icon-button preference-trigger language-trigger" onClick={() => {setLanguageOpen(!languageOpen);setThemeOpen(false);}} aria-expanded={languageOpen} aria-label="Choose language"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg><span>{language.toUpperCase()}</span><span className="preference-chevron">⌄</span></button>
              {languageOpen && <div className="preference-menu language-menu" role="listbox" aria-label="Languages">{languages.map((item) => <button key={item.code} role="option" aria-selected={language === item.code} className={language === item.code ? "selected" : ""} onClick={() => {setLanguage(item.code);setLanguageOpen(false);}}><span>{item.native}</span><small>{item.name}</small></button>)}</div>}
            </div>
            <div className="preference-wrap">
              <button className="icon-button preference-trigger" onClick={() => {setThemeOpen(!themeOpen);setLanguageOpen(false);}} aria-expanded={themeOpen} aria-label="Choose theme">◐⌄</button>
              {themeOpen && <div className="preference-menu theme-menu" aria-label="Themes">
                <div className="preference-menu-head"><div><span className="section-kicker">APPEARANCE</span><strong>Color themes</strong></div><button className="menu-close" onClick={() => setThemeOpen(false)} aria-label="Close themes">×</button></div>
                <div className="theme-options">{themes.map(([id,name,bg,accent]) => <button key={id} className={theme === id ? "selected theme-choice" : "theme-choice"} onClick={() => {setTheme(id);setCustomAccent(accent);setCustomBackground("");setCustomPanel("");setCustomText("");}} title={name} aria-label={`${name} theme`} aria-pressed={theme === id}><span className="theme-swatch" style={{background:`linear-gradient(135deg, ${bg} 0 52%, ${accent} 52% 100%)`,borderColor:accent}}>{theme === id && <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</span><span>{name}</span></button>)}</div>
                <div className="customizer-head"><span>Custom colors</span><small>PERSONALIZE</small></div>
                <div className="custom-colors">{(["accent","background","panel","text"] as const).map((target) => <button key={target} className="color-setting" onClick={() => openColorEditor(target)}><span>{colorLabels[target]}</span><i style={{background:colorValues[target]}}/><code>{colorValues[target].toUpperCase()}</code></button>)}</div>
                {colorTarget && <div className="color-editor"><div className="color-editor-head"><strong>{colorLabels[colorTarget]} color</strong><button className="menu-close" onClick={() => setColorTarget(null)} aria-label="Close color editor">×</button></div><div className="color-swatches">{colorPalette.map((color) => <button key={color} aria-label={color} title={color} className={draftColor.toLowerCase() === color ? "active" : ""} style={{background:color}} onClick={() => setDraftColor(color)} />)}</div><label className="hex-field"><span>HEX</span><input value={draftColor} maxLength={7} spellCheck={false} onChange={(e) => setDraftColor(e.target.value)} aria-label="Hex color value"/><span className="hex-preview" style={{background:/^#[0-9a-f]{6}$/i.test(draftColor) ? draftColor : "transparent"}} /></label><div className="color-editor-actions"><button onClick={() => setColorTarget(null)}>Cancel</button><button className="apply-color" disabled={!/^#[0-9a-f]{6}$/i.test(draftColor)} onClick={applyCustomColor}>Apply color</button></div></div>}
                <button className="reset-preferences" onClick={() => {setTheme("atelier");setCustomAccent("#cf6848");setCustomBackground("");setCustomPanel("");setCustomText("");setLanguage("id");setColorTarget(null);}}>Reset preferences</button>
              </div>}
            </div>
            <button className="sign-in-button" onClick={() => router.push(sessionUser ? "/dashboard" : "/login")}>{sessionUser ? "Dashboard" : t.signIn}</button>
          </div>
        </header>

        <div className="content-wrap">
          {page === "home" && <>
            <section className="page-view active">
              <div className="atlas-stage">
                <div className="atlas-meta"><span>NEFTIS / DIGITAL COMMONS</span><span>FIELD EDITION — 001</span></div>
                <motion.section className="atlas-hero" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                  <div className="atlas-copy">
                    <div className="atlas-overline"><span className="atlas-overline-mark">N°</span><span>{copy.eyebrow}</span><i /></div>
                    <h1><span>{copy.headlineTop}</span><em>{copy.headlineAccent}</em></h1>
                    <p className="atlas-description">{copy.description}</p>
                    <div className="atlas-actions">
                      <button className="atlas-primary" onClick={() => navigate("ai")}>{t.openAI}<span>↗</span></button>
                      <button className="atlas-secondary" onClick={() => navigate("tools")}>{t.explore}<span>→</span></button>
                    </div>
                    <div className="atlas-footnote"><span>01—08</span><i /> A SHARED SPACE FOR THE CURIOUS</div>
                  </div>
                  <div className="atlas-visual" aria-label="Abstract topographic map artwork">
                    <div className="atlas-visual-caption"><span>FIG. 01</span><span>THE OPEN FIELD</span></div>
                    <svg className="atlas-map" viewBox="0 0 680 700" role="img" aria-label="Topographic contours surrounding the Neftis mark">
                      <defs>
                        <linearGradient id="atlas-wash" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e8b98d"/><stop offset=".48" stopColor="#b65c49"/><stop offset="1" stopColor="#4c6870"/></linearGradient>
                        <radialGradient id="atlas-core"><stop offset="0" stopColor="#f2d9b4"/><stop offset=".58" stopColor="#bd745e"/><stop offset="1" stopColor="#263b45"/></radialGradient>
                        <clipPath id="atlas-clip"><path d="M342 30C505 29 646 165 649 337c3 180-129 322-309 332C158 677 22 540 26 352 30 168 163 32 342 30Z"/></clipPath>
                      </defs>
                      <g clipPath="url(#atlas-clip)">
                        <rect width="680" height="700" fill="#182b34"/>
                        <circle cx="346" cy="345" r="286" fill="url(#atlas-wash)" opacity=".9"/>
                        <circle cx="346" cy="345" r="214" fill="url(#atlas-core)"/>
                        {Array.from({length:12},(_,i)=><ellipse key={i} cx="345" cy="345" rx={105+i*18} ry={88+i*19} transform={`rotate(${i*11-28} 345 345)`} fill="none" stroke="#f2e1c8" strokeOpacity={.22+i*.018} strokeWidth="1.3"/>)}
                        <path d="M-20 500C110 420 80 275 202 230S380 300 480 200 630 110 720 160M-30 550C120 450 100 330 220 280S390 340 500 250 640 190 720 230M-20 610C110 500 130 390 250 345S420 400 530 310 650 260 730 300" fill="none" stroke="#f6e8d2" strokeOpacity=".36" strokeWidth="2"/>
                        <path d="M90 0C145 120 230 135 270 210S290 365 410 420 545 550 580 730M0 110C100 185 180 205 230 290S260 450 370 500 470 610 490 720" fill="none" stroke="#101e27" strokeOpacity=".36" strokeWidth="3"/>
                        <circle cx="346" cy="345" r="64" fill="#142630" stroke="#f1dfc4" strokeOpacity=".65"/>
                        <path d="M320 385V305l52 80v-80" fill="none" stroke="#f4e6d0" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="372" cy="305" r="7" fill="#e2a46f"/>
                      </g>
                      <path d="M342 30C505 29 646 165 649 337c3 180-129 322-309 332C158 677 22 540 26 352 30 168 163 32 342 30Z" fill="none" stroke="#f1d6b4" strokeOpacity=".6" strokeWidth="1.5"/>
                      <path d="M346 4V31M346 670V697M4 350H27M649 350H676" stroke="#f1d6b4" strokeOpacity=".7"/>
                    </svg>
                    <div className="atlas-coordinate atlas-coordinate-a">06°12′ S<br/>106°49′ E</div>
                    <div className="atlas-coordinate atlas-coordinate-b">THINK / MAKE / SHARE</div>
                    <div className="atlas-visual-index">N</div>
                  </div>
                </motion.section>
                <div className="atlas-bottomline"><span>01 <b>THINK</b></span><span>02 <b>MAKE</b></span><span>03 <b>DISCOVER</b></span><span className="atlas-bottom-note">A PLACE TO FIND YOUR NEXT IDEA</span></div>
              </div>
              <div className="section-heading"><div><span className="section-kicker">{copy.section}</span><h2>{copy.begin}</h2></div><span className="section-count">01 / 04</span></div>
              <div className="atlas-space-list">{spaces.map((space) => <button key={space.id} className={`atlas-space-row ${space.tone}`} onClick={() => navigate(space.id)}><span className="atlas-space-no">{space.no}</span><span className="atlas-space-symbol"><NeftisIcon name={space.id} /></span><span className="atlas-space-copy"><small>{space.tag}</small><strong>{space.title}</strong><em>{space.desc}</em></span><span className="atlas-space-arrow">↗</span></button>)}</div>
              <section className="home-principles">
                <div className="home-principles-heading"><span className="section-kicker">A SIMPLE WAY TO BEGIN</span><h2>Explore first.<br/><em>Make something useful.</em></h2><p>Neftis menghubungkan alat, pengetahuan, dan ruang berbagi dalam satu tempat yang bisa kamu jelajahi sesuai kebutuhan.</p></div>
                <div className="home-principles-grid">
                  <article><span>01 / THINK</span><div className="principle-symbol">✳</div><h3>Think with AI</h3><p>Hubungkan layanan AI yang kamu pilih dan gunakan model sesuai kebutuhan.</p></article>
                  <article><span>02 / MAKE</span><div className="principle-symbol">⌘</div><h3>Make with tools</h3><p>Temukan utilitas praktis untuk pekerjaan, eksperimen, dan ide kecil.</p></article>
                  <article><span>03 / SHARE</span><div className="principle-symbol">◎</div><h3>Learn together</h3><p>Bangun pemahaman dan bagikan temuan yang bisa membantu orang lain.</p></article>
                </div>
              </section>
              <div className="lower-grid">
                <section className="panel activity-panel"><div className="panel-heading"><div><span className="section-kicker">{copy.activity}</span><h3>{copy.recent}</h3></div><button className="text-link" onClick={() => navigate("achievements")}>View all ↗</button></div><div className="activity-list"><div className="empty-state"><span>◌</span><p>{copy.activityEmpty}</p></div></div></section>
                <section className="panel signal-panel"><div className="panel-heading"><div><span className="section-kicker">{copy.community}</span><h3>{copy.fromCommunity}</h3></div><button className="text-link" onClick={() => navigate("community")}>Visit ↗</button></div><div className="signal-post"><span className="signal-tag">DISCUSSION / 001</span><h4>{copy.question}</h4><p>{copy.questionDesc}</p><div className="signal-foot"><span>COMMUNITY BOARD</span><span>↗</span></div></div></section>
              </div>
              <footer className="page-footer"><span>{copy.footer}</span><span>{copy.footerNote}</span></footer>
            </section>
          </>}

          {page === "ai" && <section className="page-view active ai-workspace">
            <div className="page-intro"><div><span className="section-kicker">01 / INTELLIGENCE</span><h1>Neftis <em>AI</em></h1><p>One connection. Your models. Your way of thinking.</p></div><div className="intro-side-label">MODEL GATEWAY<br />TOKEN-FIRST WORKSPACE</div></div>
            <AIWorkspace />
          </section>}

                    {page === "tools" && <ToolsLibrary language={language} />}

          {page === "community" && <section className="page-view active community-space">
            <PageIntro number="03" title={<>The <em>commons</em></>} desc="Tempat bertukar pertanyaan, pengalaman, dan temuan bersama." side={<>COMMUNITY BOARD<br />OPEN ACCESS</>} />
            <div className="community-desk">
              <main className="community-feed">
                <div className="community-feed-bar"><div><span className="section-kicker">PUBLIC DISCUSSIONS</span><h2>Ruang percakapan</h2></div><span className="community-count">BELUM ADA THREAD</span></div>
                <div className="community-empty-state"><div className="community-empty-mark">◎</div><span className="section-kicker">START WITH A QUESTION</span><h3>Belum ada percakapan di sini.</h3><p>Komunitas akan menjadi tempat berbagi proses, meminta masukan, dan menyimpan pengetahuan yang berguna. Masuk untuk bersiap berpartisipasi saat diskusi dibuka.</p><a className="button button-primary" href="/login">Masuk ke Neftis <span>↗</span></a></div>
              </main>
              <aside className="community-sidebar">
                <section className="community-info-card"><span className="section-kicker">COMMUNITY NOTES</span><h3>Ruang yang sehat dimulai dari cara berbagi.</h3><ul><li>Berikan konteks saat bertanya.</li><li>Bagikan solusi yang bisa diulang.</li><li>Hormati privasi dan karya orang lain.</li></ul></section>
                <section className="community-topic-card"><span className="section-kicker">TOPIC MAP</span><div><b>AI & prompts</b><b>Web & code</b><b>Digital tools</b><b>Learning</b><b>Ideas & projects</b></div></section>
              </aside>
            </div>
          </section>}

          {page === "learn" && <section className="page-view active learning-space">
            <PageIntro number="04" title={<>Knowledge <em>room</em></>} desc="Panduan ringkas dan jalur belajar untuk memahami teknologi dengan lebih terarah." side={<>FIELD NOTES<br />LEARN / PRACTICE</>} />
            <div className="learning-hero">
              <section className="learning-feature"><span className="section-kicker">FEATURED LEARNING PATH / 001</span><div className="learning-orbit" aria-hidden="true"><span>AI</span></div><div><span className="learning-level">BEGINNER PATH · 4 TOPICS</span><h2>Memahami AI, dari dasar sampai praktik.</h2><p>Kenali cara kerja model, susun prompt yang jelas, pahami batasan, dan evaluasi hasil dengan kritis.</p></div><span className="learning-feature-index">01</span></section>
              <aside className="learning-note"><span className="section-kicker">HOW TO LEARN HERE</span><h3>Pelan, jelas, dan bisa dipraktikkan.</h3><p>Setiap materi dirancang sebagai catatan singkat, bukan sekadar daftar istilah.</p><div className="learning-note-rule"><span>READ</span><i/><span>TRY</span><i/><span>REFLECT</span></div></aside>
            </div>
            <div className="learning-library-head"><div><span className="section-kicker">LEARNING LIBRARY</span><h2>Jelajahi bidang pengetahuan</h2></div><span>CURATED NOTES / 2026</span></div>
            <div className="learning-path-list">
              <article><span className="learning-path-number">01</span><div><span className="section-kicker">AI LITERACY</span><h3>Menulis prompt yang berguna</h3><p>Berikan konteks, tujuan, batasan, dan bentuk jawaban yang kamu butuhkan.</p></div><span className="learning-path-status">FIELD NOTE</span></article>
              <article><span className="learning-path-number">02</span><div><span className="section-kicker">WEB FUNDAMENTALS</span><h3>Bagaimana website dimuat?</h3><p>Kenali browser, DNS, server, request, response, dan aset halaman.</p></div><span className="learning-path-status">FIELD NOTE</span></article>
              <article><span className="learning-path-number">03</span><div><span className="section-kicker">DIGITAL WORKFLOW</span><h3>Membangun alur kerja yang rapi</h3><p>Pilih alat berdasarkan kebutuhan dan kurangi langkah yang tidak perlu.</p></div><span className="learning-path-status">FIELD NOTE</span></article>
            </div>
          </section>}

          {page === "games" && <section className="page-view active arcade-space">
            <PageIntro number="05" title={<>The <em>arcade</em></>} desc="Eksperimen kecil untuk jeda singkat dan tantangan ringan." side={<>PLAY MODE<br />SHORT SESSIONS</>} />
            <div className="arcade-intro"><div><span className="section-kicker">NEFTIS ARCADE / COLLECTION 01</span><h2>Main sebentar.<br/><em>Segarkan pikiran.</em></h2><p>Permainan singkat sedang disiapkan sebagai bagian dari ruang Neftis. Setiap judul akan punya aturan sederhana dan progres yang jelas.</p></div><div className="arcade-emblem" aria-hidden="true"><span>◇</span><i/><i/><i/></div></div>
            <div className="arcade-grid">
              <article className="arcade-card arcade-memory"><div className="arcade-card-art"><span>▦</span><i/><i/><i/><i/></div><div className="arcade-card-copy"><span>01 / MEMORY</span><h3>Memory Grid</h3><p>Latih ingatan visual lewat pola yang berubah.</p><small>IN DEVELOPMENT</small></div></article>
              <article className="arcade-card arcade-reaction"><div className="arcade-card-art"><span>◉</span><i/></div><div className="arcade-card-copy"><span>02 / REFLEX</span><h3>Reaction Test</h3><p>Ukur seberapa cepat kamu merespons sinyal.</p><small>IN DEVELOPMENT</small></div></article>
              <article className="arcade-card arcade-pattern"><div className="arcade-card-art"><span>⌁</span><i/><i/><i/></div><div className="arcade-card-copy"><span>03 / PATTERN</span><h3>Signal Sequence</h3><p>Ikuti urutan dan temukan pola berikutnya.</p><small>IN DEVELOPMENT</small></div></article>
            </div>
          </section>}

          {page === "achievements" && <section className="page-view active milestones-space">
            <PageIntro number="06" title={<>Small <em>milestones</em></>} desc="Pencapaian akan mencatat perjalanan saat aktivitas akun mulai terhubung." side={<>PERSONAL PROGRESS<br />ACCOUNT / JOURNEY</>} />
            <div className="milestone-hero"><div><span className="section-kicker">YOUR NEFTIS JOURNEY</span><h2>Setiap penemuan<br/>punya <em>jejak.</em></h2><p>Ruang ini akan mengumpulkan pencapaian dari aktivitas nyata—menjelajahi alat, mempelajari materi, dan berkontribusi pada komunitas.</p></div><div className="milestone-stamp"><span>✧</span><small>COLLECT<br/>AS YOU GO</small></div></div>
            <div className="milestone-collection">
              <article><span>01</span><div><b>Explorer</b><small>Jelajahi beberapa ruang Neftis.</small></div><i>LOCKED</i></article>
              <article><span>02</span><div><b>Problem solver</b><small>Gunakan alat untuk menyelesaikan tugas.</small></div><i>LOCKED</i></article>
              <article><span>03</span><div><b>Curious learner</b><small>Selesaikan catatan pembelajaran.</small></div><i>LOCKED</i></article>
              <article><span>04</span><div><b>Community voice</b><small>Bagikan pengetahuan kepada komunitas.</small></div><i>LOCKED</i></article>
            </div>
          </section>}

          {page === "services" && <section className="page-view active services-space">
            <PageIntro number="07" title={<>Digital <em>services</em></>} desc="Dukungan praktis untuk ide dan kebutuhan digital yang ingin diwujudkan." side={<>SERVICE DIRECTORY<br />NEFTIS / STUDIO</>} />
            <div className="services-lead"><span className="section-kicker">FROM IDEA TO DELIVERY</span><h2>Butuh bantuan untuk<br/><em>membangun sesuatu?</em></h2><p>Jelajahi jenis dukungan yang tersedia. Detail paket dan permintaan layanan akan ditambahkan setelah alur pemesanan siap.</p></div>
            <div className="service-directory">
              <article><span className="service-index">01</span><div><span className="section-kicker">WEB / PRODUCT</span><h3>Website & digital product</h3><p>Website responsif, landing page, dashboard, dan prototipe produk digital.</p></div><span className="service-arrow">↗</span></article>
              <article><span className="service-index">02</span><div><span className="section-kicker">AUTOMATION</span><h3>Tools & workflow</h3><p>Utilitas khusus dan otomasi untuk mengurangi pekerjaan berulang.</p></div><span className="service-arrow">↗</span></article>
              <article><span className="service-index">03</span><div><span className="section-kicker">LEARNING</span><h3>Technical guidance</h3><p>Panduan implementasi, dokumentasi, dan pendampingan teknis yang mudah diikuti.</p></div><span className="service-arrow">↗</span></article>
            </div>
          </section>}
        </div>
      </main>

      <nav className="mobile-dock" aria-label="Main navigation">
        {navPrimary.map((item) => <button key={item.id} className={page === item.id ? "mobile-dock-link active" : "mobile-dock-link"} onClick={() => navigate(item.id)} aria-current={page === item.id ? "page" : undefined}>
          <span className="mobile-dock-icon"><NeftisIcon name={item.id} /></span><small>{localizedTitles[item.id]}</small>
        </button>)}
      </nav>
      {searchOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}><section className="modal panel" role="dialog" aria-modal="true" aria-label="Search Neftis"><div className="modal-head"><span className="section-kicker">NEFTIS / SEARCH</span><button className="icon-button" onClick={() => setSearchOpen(false)}>×</button></div><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search spaces..." aria-label="Search Neftis spaces" />{searchable.length ? searchable.map((item) => <button className="search-result" key={item.id} onClick={() => navigate(item.id)}>{item.label}<span>OPEN ↗</span></button>) : <p className="empty-state">No matching spaces.</p> }</section></div>}
      {toast && <div className="toast show" role="status">{toast}</div>}
    </div>
  );
}

function PageIntro({ number, title, desc, side }: { number: string; title: React.ReactNode; desc: string; side: React.ReactNode }) {
  return <div className="page-intro"><div><span className="section-kicker">{number} / NEFTIS SPACE</span><h1>{title}</h1><p>{desc}</p></div><div className="intro-side-label">{side}</div></div>;
}
