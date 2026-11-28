import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getAdminContext();
  if (admin) redirect("/admin");

  const { auth } = await import("@/lib/auth/server");
  const { data } = await auth.getSession();
  const signedIn = Boolean(data?.user?.id);

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link href="/" className="admin-brand"><span>N</span> NEFTIS <small>ADMIN</small></Link>
        <p className="admin-kicker">AREA KHUSUS PENGELOLA</p>
        <h1>Masuk ke <em>ruang admin.</em></h1>
        {signedIn ? (
          <>
            <p className="admin-login-explanation">Kamu sudah masuk ke Neftis, tetapi akun ini belum tercatat sebagai administrator. Akun biasa tidak otomatis mendapat akses admin.</p>
            <div className="admin-login-steps">
              <strong>Bagaimana akses admin diberikan?</strong>
              <ol>
                <li>Email akun pemilik ditambahkan ke <code>NEFTIS_SUPERADMIN_EMAILS</code> di Environment Variables Vercel, atau</li>
                <li>Administrator yang sudah berwenang memberikan peran melalui data keanggotaan admin.</li>
              </ol>
              <p>Setelah perubahan akses diterapkan, keluar lalu masuk kembali menggunakan email yang sudah diberi izin.</p>
            </div>
            <Link className="admin-login-action" href="/dashboard">Kembali ke dashboard ↗</Link>
          </>
        ) : (
          <>
            <p className="admin-login-explanation">Gunakan akun Neftis biasa yang sudah diberi izin administrator. Tidak ada pendaftaran admin terpisah dan membuat akun baru tidak otomatis memberi akses ke halaman ini.</p>
            <Link className="admin-login-action" href="/login?next=%2Fadmin">Masuk dengan akun Neftis ↗</Link>
          </>
        )}
        <Link className="admin-login-back" href="/">Kembali ke beranda</Link>
      </section>
    </main>
  );
}
