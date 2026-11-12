# Barbershop Queue

Prototipe aplikasi antrean barbershop multi-tenant dengan Next.js, React, TypeScript, PostgreSQL, Prisma 7, bcrypt, dan Server-Sent Events (SSE). Project ini berbeda dari repository `malesngantri` yang berfokus pada showcase desain UI.

## Fitur di source

- Halaman publik per barbershop dan formulir booking.
- Dashboard antrean, pemanggilan, perubahan status layanan, dan daftar booking.
- Peran SUPER_ADMIN, SHOP_ADMIN, BARBER, dan CUSTOMER di schema.
- Pengaturan barber, jam operasional, hari libur, serta event antrean melalui SSE.
- Session cookie bertanda tangan dan bootstrap akun dari environment lokal.

## Menjalankan lokal

Siapkan Node.js 22 LTS, pnpm 10, dan database PostgreSQL kosong.

```sh
pnpm install --frozen-lockfile
```

Salin `.env.example` menjadi `.env`. Isi DATABASE_URL, SESSION_SECRET, SHOP_NAME, SHOP_SLUG, SHOP_ADMIN_EMAIL, dan SHOP_ADMIN_PASSWORD. SESSION_SECRET minimal 32 karakter acak; password bootstrap minimal 12 karakter. Contoh membuat secret acak:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
pnpm prisma:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Buka `http://localhost:3000/login` dan masuk dengan akun owner yang diatur secara lokal. Bootstrap membuat satu barbershop dan SHOP_ADMIN; superadmin terpisah bersifat opsional jika kedua variabelnya diisi. Bootstrap tidak mereset password yang sudah ada dan tidak membuat akun, pelanggan, atau transaksi demo.

Atur jam operasional/hari libur dan buat barber melalui dashboard sebelum mencoba booking di `/public/[slug]`. Fitur pembuatan tenant dari UI belum lengkap; tenant pertama dibuat melalui bootstrap. Halaman publik hanya menerima nama antrean anonim dan tidak menerima nomor telepon pelanggan dari endpoint antrean harian.

## Pemeriksaan

```sh
pnpm test:session
pnpm exec tsc --noEmit
pnpm build
```

Status hasil pemeriksaan export dicatat pada laporan persiapan terpisah. Ini merupakan prototipe portfolio; subscription/payment masih model dasar. SSE menggunakan memory proses, sehingga deployment multi-instance membutuhkan pub/sub bersama. Tidak menyertakan database, cookie, upload pengguna, atau konfigurasi rahasia.
