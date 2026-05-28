# Product Requirements Document (PRD)
## Tugas Besar Enterprise Application Integration (EAI) — Genap 25-26

---

## 1. Informasi Proyek

| Atribut | Detail |
|---|---|
| **Judul Proyek** | Pembangunan Aplikasi Terintegrasi Menggunakan GraphQL API dan Docker |
| **Tema Aplikasi** | Supply Chain Warehouse Tracking (Manajemen Logistik Gudang) |
| **Mata Kuliah** | Enterprise Application Integration (EAI) |
| **Semester** | Genap 2025–2026 |

### Tujuan Proyek

- Membuat API menggunakan GraphQL
- Mengelola service menggunakan Docker
- Membangun client HTML yang terhubung ke API
- Menguasai proses deployment berbasis container
- Menyusun dokumentasi teknis

---

## 2. Deskripsi & Alur Bisnis (Business Flow)

Sistem ini merupakan aplikasi logistik internal (*back-office*) untuk mencatat pergerakan stok barang di gudang utama sebelum didistribusikan ke cabang.

### Alur Proses Utama

```
[Supplier] ──► [Penerimaan Barang] ──► [Gudang Utama] ──► [Pengeluaran Barang] ──► [Cabang]
                                              │
                                        [Audit Stok]
                                     (Alert jika < 50 unit)
```

### Detail Alur

1. **Penerimaan Barang**
   Petugas mencatat kedatangan barang dari supplier → stok bertambah (`recordIncomingGoods`).

2. **Pengeluaran Barang**
   Petugas mencatat pengiriman barang keluar dari gudang ke cabang → stok berkurang (`dispatchGoods`).

3. **Audit Stok**
   Sistem secara otomatis memunculkan peringatan dengan menampilkan daftar barang yang kuantitasnya berada di bawah batas minimum kritis (`getLowStockItems`).

---

## 3. Arsitektur Teknis & Tech Stack

Sistem dibagi menjadi beberapa lapisan (layers) yang modular dan konsisten.

### Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                       │
│                                                         │
│  ┌──────────────────┐       ┌──────────────────────┐    │
│  │  Frontend Layer  │       │    Backend Layer     │    │
│  │                  │──────►│                      │    │
│  │  HTML + Vanilla  │ HTTP  │  Node.js             │    │
│  │  JavaScript      │       │  @apollo/server      │    │
│  │  (Fetch API)     │◄──────│  graphql             │    │
│  └──────────────────┘       └──────────┬───────────┘    │
│                                        │ mongoose       │
│                                        ▼                │
│                             ┌──────────────────────┐    │
│                             │   Database Layer     │    │
│                             │                      │    │
│                             │   MongoDB Atlas      │    │
│                             │   (Cloud)            │    │
│                             └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Tabel Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| **Backend (API)** | Node.js | Runtime JavaScript server-side |
| | `@apollo/server` | GraphQL server framework |
| | `graphql` | Implementasi GraphQL core |
| **Database** | MongoDB Atlas | Cloud-hosted NoSQL database |
| | `mongoose` | ODM (Object Data Modeling) untuk MongoDB |
| **Frontend (Client)** | HTML Native | Struktur halaman web |
| | Vanilla JavaScript | Logika client & Fetch API untuk request GraphQL |
| **Infrastruktur** | Docker Desktop | Containerization |
| | `Dockerfile` | Build image backend |
| | `docker-compose.yml` | Orkestrasi multi-service |

### Struktur Direktori Proyek

```
project-root/
├── backend/
│   ├── src/
│   │   ├── schema/
│   │   │   └── typeDefs.js        # Definisi GraphQL Schema
│   │   ├── resolvers/
│   │   │   ├── index.js           # Aggregator resolver
│   │   │   ├── queryResolvers.js  # Resolver untuk Query
│   │   │   └── mutationResolvers.js # Resolver untuk Mutation
│   │   ├── models/
│   │   │   └── Item.js            # Mongoose Model
│   │   └── index.js               # Entry point server
│   ├── Dockerfile
│   └── package.json
├── client/
│   └── index.html                 # Frontend HTML + JS
├── docker-compose.yml
└── README.md
```

---

## 4. Struktur Data & Skema GraphQL

### Entitas Utama: `Item`

| Field | Tipe Data | Keterangan |
|---|---|---|
| `id` | `ID!` | Unik, auto-generated oleh MongoDB |
| `sku` | `String!` | Kode unik barang (Stock Keeping Unit) |
| `name` | `String!` | Nama barang |
| `quantity` | `Int!` | Jumlah stok saat ini |
| `status` | `String!` | Status ketersediaan barang |

**Nilai `status` yang valid:**
- `IN_STOCK` — Stok tersedia normal (≥ 50 unit)
- `RECEIVED` — Barang baru diterima dari supplier
- `OUT_OF_STOCK` — Stok habis (0 unit)

### GraphQL Schema (typeDefs)

```graphql
type Item {
  id: ID!
  sku: String!
  name: String!
  quantity: Int!
  status: String!
}

type Query {
  getLowStockItems: [Item!]!
}

type Mutation {
  recordIncomingGoods(sku: String!, name: String!, quantity: Int!): Item!
  dispatchGoods(sku: String!, quantity: Int!): Item!
}
```

### Daftar Operasi API

#### Query

| Operasi | Deskripsi | Return |
|---|---|---|
| `getLowStockItems` | Mengambil daftar barang dengan stok di bawah batas aman (< 50 unit) | `[Item!]!` |

#### Mutation

| Operasi | Parameter | Deskripsi | Return |
|---|---|---|---|
| `recordIncomingGoods` | `sku`, `name`, `quantity` | Mencatat barang masuk dari supplier; menambah stok secara otomatis | `Item!` |
| `dispatchGoods` | `sku`, `quantity` | Mencatat barang keluar ke cabang; memotong stok secara otomatis | `Item!` |

### Aturan Bisnis Resolver

- `recordIncomingGoods`: Jika barang dengan `sku` sudah ada → tambah `quantity`. Jika belum ada → buat dokumen baru. Update `status` secara otomatis.
- `dispatchGoods`: Validasi stok mencukupi sebelum dikurangi. Jika `quantity` hasil pengurangan = 0, ubah `status` menjadi `OUT_OF_STOCK`. Lempar error jika stok tidak cukup (*error handling*).
- `getLowStockItems`: Filter semua item dengan `quantity < 50`.

---

## 5. Garis Waktu & Pembagian Tugas (Worksheet)

| Fase | Target Pekerjaan | Status |
|---|---|---|
| **Week 1** | Tentukan tema project. Buat folder `backend/` & `client/`. Setup GraphQL schema dasar. Setup `Dockerfile` backend. | ✅ SELESAI |
| **Week 2** | Buat resolvers. Buat query dan mutation. Hubungkan ke database MongoDB Atlas. | ✅ SELESAI |
| **Week 3** | Buat `docker-compose.yml`. Testing API dalam container. Buat tampilan HTML client. | 🔲 To Do |
| **Week 4** | Finalisasi fitur. Buat dokumentasi (README, ERD, Screenshot, Diagram). | 🔲 To Do |

---

## 6. Target Penilaian (KPI Kelompok)

Standar rubrikasi untuk mencapai predikat **High (Sangat Baik)**:

| Kriteria | Bobot | Standar High |
|---|---|---|
| **Arsitektur** | 15% | Direktori wajib dipisah (modular), diagram detail tersedia, alur data dari frontend ke database konsisten |
| **GraphQL** | 20% | Skema lengkap, file displit (modular), fungsi Query/Mutation berjalan optimal, **wajib ada error handling** di dalam resolver |
| **Docker** | 20% | `Dockerfile` teroptimasi (ukuran ringan), `docker-compose` berjalan mulus, service stabil tanpa error |
| **Dokumentasi** | 15% | PDF berisi README, panduan instalasi, dokumentasi API, desain arsitektur, dan screenshot lengkap (query & client) |

### Checklist Final Sebelum Pengumpulan

- [ ] Semua resolver memiliki blok `try/catch` (error handling)
- [ ] `Dockerfile` menggunakan base image ringan (misal: `node:18-alpine`)
- [ ] `docker-compose.yml` dapat dijalankan dengan satu perintah `docker compose up`
- [ ] File schema dan resolver **terpisah** (bukan satu file monolitik)
- [ ] HTML client dapat melakukan ketiga operasi (1 query + 2 mutation) dari browser
- [ ] README mencakup: cara instalasi, cara menjalankan, dan contoh request API
- [ ] Tersedia diagram arsitektur (ERD + Data Flow Diagram)
- [ ] Screenshot hasil pengujian query & mutation tersedia

---

*Dokumen ini merupakan acuan teknis bersama kelompok. Setiap perubahan arsitektur atau scope wajib didiskusikan dan diperbarui di sini.*