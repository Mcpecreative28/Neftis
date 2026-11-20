NEFTIS V6 — APP ROUTER FOUNDATION
=================================

Paket ini memindahkan fondasi V5 ke struktur route Next.js App Router tanpa mengganti bahasa visual utamanya.

ROUTE PUBLIK
- /                 Overview
- /ai               Neftis AI
- /tools            Tools library
- /community        Community
- /learn            Knowledge room
- /games            Arcade
- /achievements     Achievements
- /services         Services

STRUKTUR UTAMA
- app/(public)/             Route group publik; nama group tidak muncul di URL.
- app/layout.tsx            Root layout dan metadata.
- app/globals.css           CSS V5 dipertahankan, dengan tambahan styling Tools.
- components/layout/        Shell utama dan navigasi berbasis URL.
- components/tools/         Enam utilitas Tools yang sudah ada di repository.

PREFERENSI V5 YANG DIPERTAHANKAN
- neftis-language
- neftis-theme
- neftis-custom-accent
- neftis-custom-background
- neftis-custom-panel
- neftis-custom-text
- 15 pilihan bahasa, 25 tema, editor warna kustom, dan arah RTL Arab.

DEPLOY
1. Ekstrak ZIP.
2. Upload seluruh isi folder neftis-v6 ke root repository GitHub Neftis pada branch main.
3. Commit perubahan. Vercel akan menjalankan deployment otomatis jika integrasi repository aktif.
4. Framework preset: Next.js. Root directory: ./ . Build/install/output gunakan default.

CATATAN IMPLEMENTASI
- Navigasi halaman publik sekarang memakai URL App Router, bukan hanya state lokal.
- Tools berisi Text formatter, Base64 converter, JSON inspector, Word counter, Unit converter, dan Color converter.
- AI, login, database, komunitas dinamis, kuota, dan layanan server belum dihubungkan pada paket fondasi ini.
- File ini belum lolos `next build` karena dependensi tidak tersedia di lingkungan pembuatan ZIP dan akses registry tidak tersedia. Verifikasi build produksi masih diperlukan di Vercel.
