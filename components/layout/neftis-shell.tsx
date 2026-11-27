"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ToolsLibrary from "@/components/tools/tools-library";
import AIWorkspace from "@/components/ai/ai-workspace";

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
 ["atelier","Atelier","#f3f0e8","#cf6848"],
 ["night","Midnight","#11151c","#d6e5a0"],
 ["forest","Moss","#17251e","#b9d38b"],
 ["ocean","Ocean","#102630","#72d7d0"],
 ["lavender","Lavender","#efedf5","#7967a8"],
 ["mono","Monochrome","#f4f4f0","#24272b"],
] as const;


type HomeCopy = { eyebrow:string; headlineTop:string; headlineAccent:string; description:string; section:string; begin:string; activity:string; recent:string; activityEmpty:string; community:string; fromCommunity:string; question:string; questionDesc:string; footer:string; footerNote:string };
const homeCopy: Partial<Record<LocaleCode,HomeCopy>> = {
 id:{eyebrow:"RUANG DIGITAL TERBUKA",headlineTop:"Buka ruang untuk",headlineAccent:"hal berikutnya.",description:"Tempat bersama untuk menemukan alat berguna, berpikir bersama AI, bertukar gagasan, dan mempelajari hal baru.",section:"RUANG BERSAMA",begin:"Mulai jelajahi",activity:"AKTIVITASMU",recent:"Aktivitas terbaru",activityEmpty:"Aktivitasmu akan muncul di sini saat kamu menjelajahi Neftis.",community:"JEJAK KOMUNITAS",fromCommunity:"Dari komunitas",question:"Alat kecil apa yang paling menghemat waktumu?",questionDesc:"Bagikan utilitas sederhana yang membuat pekerjaan sehari-hari lebih mudah.",footer:"© NEFTIS / RUANG DIGITAL",footerNote:"TERBUKA UNTUK SEMUA · DIBUAT UNTUK DIJELAJAHI"},
 en:{eyebrow:"AN OPEN DIGITAL SPACE",headlineTop:"Make room for",headlineAccent:"what comes next.",description:"A shared place to discover useful tools, think with AI, exchange ideas, and learn something new.",section:"THE COMMONS",begin:"A place to begin",activity:"YOUR ACTIVITY",recent:"Recent activity",activityEmpty:"Your activity will appear here as you explore Neftis.",community:"COMMUNITY SIGNAL",fromCommunity:"From the community",question:"What small tool saves you the most time?",questionDesc:"Share the little utilities that make everyday work easier.",footer:"© NEFTIS / DIGITAL COMMONS",footerNote:"OPEN BY DESIGN · MADE TO EXPLORE"},
 ar:{eyebrow:"مساحة رقمية مفتوحة",headlineTop:"اترك مساحة",headlineAccent:"لما هو قادم.",description:"مساحة مشتركة لاكتشاف الأدوات المفيدة والتفكير مع الذكاء الاصطناعي وتبادل الأفكار وتعلّم أشياء جديدة.",section:"المساحة المشتركة",begin:"ابدأ الاستكشاف",activity:"نشاطك",recent:"النشاط الأخير",activityEmpty:"سيظهر نشاطك هنا أثناء استكشاف نيفتيس.",community:"إشارات المجتمع",fromCommunity:"من المجتمع",question:"ما الأداة الصغيرة التي توفر معظم وقتك؟",questionDesc:"شارك الأدوات البسيطة التي تجعل العمل اليومي أسهل.",footer:"© NEFTIS / مساحة رقمية",footerNote:"مفتوح للجميع · صُمم للاستكشاف"},
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
  const page = pageByRoute[pathname] ?? "home";
  const [menuOpen, setMenuOpen] = useState(false);
  const [usagePeriod, setUsagePeriod] = useState("7d");
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
    root.dir = language === "ar" ? "rtl" : "ltr";
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
          <button className="profile-button" onClick={() => notify("Autentikasi akan tersedia pada tahap berikutnya.")}><span className="avatar">G</span><span><strong>Guest session</strong><small>Preview mode</small></span><span className="more">···</span></button>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <a className="mobile-brand" href="/" onClick={(e) => { e.preventDefault(); navigate("home"); }} aria-label="Neftis home"><span className="mobile-brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M9 31V9l22 22V9" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="31" cy="9" r="3" fill="var(--accent)"/></svg></span><strong>neftis<span>.</span></strong></a>
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="neftis-sidebar">☰</button>
          <div className="breadcrumbs"><span>NEFTIS</span><i>/</i><strong>{localizedTitles[page]}</strong></div>
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
            <button className="sign-in-button" onClick={() => router.push("/login")}>{t.signIn}</button>
          </div>
        </header>

        <div className="content-wrap">
          {page === "home" && <>
            <section className="page-view active">
              <div className="home-stage">
                <div className="home-edition"><span>NEFTIS / DIGITAL COMMONS</span><span>ISSUE 001 — 2026</span></div>
                <div className="home-hero">
                  <div className="home-copy">
                    <div className="eyebrow"><span className="eyebrow-line" /><span>{copy.eyebrow}</span></div>
                    <h1>{copy.headlineTop}<br /><em>{copy.headlineAccent}</em></h1>
                    <p>{copy.description}</p>
                    <div className="hero-actions"><button className="button button-primary" onClick={() => navigate("ai")}>{t.openAI} <span>↗</span></button><button className="button button-quiet" onClick={() => navigate("tools")}>{t.explore} <span>→</span></button></div>
                    <div className="home-proof"><span className="pulse-dot" /> OPEN ACCESS <i /> MADE FOR CURIOUS MINDS</div>
                  </div>
                  <div className="home-art" aria-label="Neftis digital commons illustration">
                    <div className="home-art-top"><span>FIG. 01 / A PLACE TO CONNECT</span><span>NEF—001</span></div>
                    <div className="home-art-scene">
                      <div className="scene-ring scene-ring-a" /><div className="scene-ring scene-ring-b" /><div className="scene-ring scene-ring-c" />
                      <div className="scene-disc"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 49V15l36 34V15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="50" cy="15" r="4" fill="var(--accent)"/></svg></div>
                      <span className="scene-tag scene-tag-one">01 / THINK</span><span className="scene-tag scene-tag-two">02 / MAKE</span><span className="scene-tag scene-tag-three">03 / SHARE</span>
                      <span className="scene-coordinate">EST. FOR IDEAS<br />OPEN BY DESIGN</span>
                    </div>
                    <div className="home-art-bottom"><span>TOOLS · KNOWLEDGE · PEOPLE</span><span>↗ EXPLORE</span></div>
                  </div>
                </div>
                <div className="home-statline"><span>01 <b>THINK</b></span><span>02 <b>CREATE</b></span><span>03 <b>DISCOVER</b></span><span className="home-stat-note">A SHARED SPACE, WITHOUT THE NOISE.</span></div>
              </div>
              <div className="section-heading"><div><span className="section-kicker">{copy.section}</span><h2>{copy.begin}</h2></div><span className="section-count">01 / 04</span></div>
              <div className="feature-grid">{spaces.map((space) => <button key={space.id} className={`feature-card ${space.tone}`} onClick={() => navigate(space.id)}><div className="card-meta"><span>{space.no} — {space.tag}</span><span>{space.icon}</span></div><div className="feature-symbol"><NeftisIcon name={space.id} /></div><h3>{space.title}</h3><p>{space.desc}</p><span className="card-arrow">↗</span></button>)}</div>
              <section className="usage-section panel" aria-labelledby="usage-title">
                <div className="usage-heading">
                  <div><span className="section-kicker">ACCOUNT / AI ACTIVITY</span><h2 id="usage-title">Token usage</h2><p>Track AI consumption across your Neftis workspace.</p></div>
                  <div className="usage-periods" role="group" aria-label="Usage time range">
                    {[["1d","1 day"],["7d","7 days"],["14d","14 days"],["1m","1 month"],["1y","1 year"]].map(([value,label]) => <button type="button" key={value} className={usagePeriod === value ? "active" : ""} aria-pressed={usagePeriod === value} onClick={() => setUsagePeriod(value)}>{label}</button>)}
                  </div>
                </div>
                <div className="usage-metrics">
                  <article><span>TOTAL TOKENS</span><strong>—</strong><small>Awaiting connected AI usage</small></article>
                  <article><span>REQUESTS</span><strong>—</strong><small>No recorded requests yet</small></article>
                  <article><span>ACTIVE MODELS</span><strong>—</strong><small>Provider connection pending</small></article>
                </div>
                <div className="usage-chart-empty"><div className="usage-chart-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 38h36M10 32l9-10 7 5 12-15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="38" cy="12" r="3" fill="currentColor"/></svg></div><strong>Usage analytics will appear here</strong><p>We’ll show real token traffic for the selected {usagePeriod === "1d" ? "day" : usagePeriod === "7d" ? "7-day" : usagePeriod === "14d" ? "14-day" : usagePeriod === "1m" ? "monthly" : "yearly"} period after AI requests are connected and recorded. No sample numbers are shown.</p></div>
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
