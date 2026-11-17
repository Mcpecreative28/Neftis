NEFTIS — CORE FOUNDATION / PHASE 01

ISI PAKET
- Homepage Neftis (responsive, dark/light theme, mobile navigation)
- Global layout dan metadata
- Design system CSS dan animasi
- Konfigurasi Next.js, TypeScript, Tailwind CSS v4, PostCSS, dan ESLint
- package.json untuk instalasi dependency di Vercel

CARA MEMASANG DENGAN MT MANAGER + GITHUB
1. Download ZIP ini, lalu ekstrak menggunakan MT Manager.
2. Buka folder hasil ekstrak. Pastikan package.json, app/, components/, dan file konfigurasi terlihat di dalamnya.
3. Upload SELURUH ISI folder hasil ekstrak ke root repository GitHub Neftis (bukan folder luarnya).
4. Pastikan app/page.tsx dan package.json berada langsung di root repository pada lokasinya masing-masing.
5. Commit perubahan ke branch utama.
6. Hubungkan repository ke Vercel atau tunggu deployment otomatis jika sudah terhubung.
7. Vercel akan memasang dependency dari package.json dan menjalankan `npm run build`.

PENTING
- Jangan membuat folder neftis-core-foundation bersarang di dalam root repository.
- Jangan upload node_modules atau folder .next. Keduanya tidak disertakan.
- Jika repository sudah berisi file konfigurasi, jangan asal menimpa; periksa dulu agar tidak menghapus konfigurasi yang sudah benar.
- Minimum Node.js yang didukung Next.js saat ini adalah 20.9. Vercel menangani runtime build.
- Tahap ini baru fondasi tampilan dan konfigurasi. Login, database, AI Gemini, kuota, admin, dan fitur lain belum diaktifkan.
- Paket ini belum menjalani build penuh di lingkungan proyek; setelah deployment pertama, periksa Build Logs Vercel.
