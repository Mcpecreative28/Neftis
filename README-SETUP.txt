NEFTIS — CORE FOUNDATION / VISUAL UPDATE 01
============================================

Paket ini adalah fondasi tampilan Neftis berbasis Next.js. Desainnya mengadaptasi
bahasa visual dari arsip AifalxzGen1 yang kamu berikan: sidebar gelap, topbar,
aksen lime, kartu fitur, orbital graphic, dan layout responsif.

ISI UTAMA
- app/page.tsx                  Halaman utama
- app/layout.tsx                Metadata dan root layout
- app/globals.css               Styling dashboard dan responsif
- components/neftis-home.tsx    Navigasi dan tampilan halaman
- package.json                  Dependensi dan perintah proyek
- next.config.ts                Konfigurasi Next.js
- tsconfig.json                 Konfigurasi TypeScript
- postcss.config.mjs            Integrasi Tailwind CSS v4
- eslint.config.mjs             Konfigurasi ESLint

CARA MEMASANG DENGAN MT MANAGER + GITHUB
1. Ekstrak ZIP ini.
2. Buka folder neftis-core-foundation.
3. Upload SELURUH ISI folder tersebut ke root repository GitHub Neftis.
   Jangan upload folder pembungkus neftis-core-foundation sebagai subfolder.
4. Jika GitHub menanyakan konflik file, pilih untuk mengganti file fondasi lama
   dengan versi baru dari paket ini.
5. Commit perubahan ke branch main.
6. Vercel akan memulai deployment otomatis jika repository sudah terhubung.

PENGATURAN VERCEL
- Framework Preset: Next.js
- Root Directory: ./
- Build Command: default / next build
- Output Directory: default
- Install Command: default / npm install
- Environment Variables: belum diperlukan untuk fondasi UI ini.

PENTING
- Halaman AI saat ini masih preview lokal; belum memanggil Gemini.
- Login, database, kuota, komunitas, dan tools dinamis belum dihubungkan.
- Tidak ada API key yang perlu dimasukkan pada tahap ini.
- Paket ini belum dinyatakan lolos build produksi. Setelah deploy, periksa tab
  Deployments > Build Logs. Jika gagal, kirim log error lengkap untuk diperbaiki.

VERSI
Neftis Core Foundation — Visual Direction: AifalxzGen1-inspired dashboard


PREFERENCES UPDATE
- 15 interface language options (navigation and primary controls translated).
- 25 color presets plus custom accent picker.
- Language, theme, and accent are saved in localStorage.
- Arabic enables RTL layout direction.


V4 preference system
- Theme presets now update the full CSS token set: background, surface, secondary surface, borders, text, muted text, accent, and shadows.
- Custom colors: accent, background, panel, and text. Preferences persist in local storage.
- Theme state is applied at the document root so shared components inherit the same palette.
- Locale selection updates the document language/direction and localized navigation/search labels. The current translation dictionary still does not cover every long-form page paragraph; remaining page-copy localization is a separate content pass.

V5 UI refinements
- Arabic mode now mirrors the desktop shell and mobile navigation, applies Arabic-friendly font fallbacks, and uses right-aligned Arabic hero copy.
- Theme menu uses a compact, scrollable swatch grid to reduce screen coverage.
- Custom colors use an in-app palette and HEX editor instead of the browser/Android native color dialog.
- Wide-screen layouts receive separate spacing, hero, card, and sidebar sizing rules.
- Existing theme presets, local preference persistence, and the V2 visual direction are preserved.

NEFTIS V6 — TOOLS LIBRARY
- The Tools page now contains six working browser-side utilities: Text Formatter, Base64 Converter, JSON Inspector, Word Counter, Unit Converter, and Color Converter.
- These utilities run locally in the browser; no API key, database, or additional package is required.
- Base64 conversion uses UTF-8-safe browser APIs. JSON errors and invalid color/unit input are surfaced in the tool workspace.
- Replace the project files with this ZIP's contents and allow Vercel to run the existing Next.js build.
