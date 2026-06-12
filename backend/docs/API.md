# Forum App — API Documentation

**Base URL:** `https://your-domain.com/api`  
**Version:** v1.1.0  
**Auth:** Laravel Sanctum (Bearer Token)

---

## Authentication Header
```
Authorization: Bearer {token}
```

---

## 🟢 Health Check

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/health` | No |

**Response:**
```json
{
  "success": true,
  "message": "Forum Diskusi API is up and running!",
  "data": {
    "version": "1.1.0",
    "environment": "production",
    "timestamp": "2026-06-06T07:19:00.000Z",
    "timezone": "UTC"
  }
}
```

---

## 🔐 Auth

> Rate limit: **10 requests/minute** untuk register & login

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v1/auth/register` | No | Daftar akun baru |
| POST | `/v1/auth/login` | No | Login, mendapat token |
| POST | `/v1/auth/logout` | ✅ | Logout token aktif |
| POST | `/v1/auth/logout-all` | ✅ | Logout semua device |
| POST | `/v1/auth/refresh` | ✅ | Refresh token |
| GET | `/v1/auth/me` | ✅ | Info user yang login |

### POST `/v1/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

### POST `/v1/auth/login`
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "1|abc123...",
    "user": { ... }
  }
}
```

---

## 📂 Categories (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/categories` | No | List semua kategori |
| GET | `/v1/categories/{category}` | No | Detail kategori |
| POST | `/v1/admin/categories` | 🔴 Admin | Buat kategori |
| PUT/PATCH | `/v1/admin/categories/{category}` | 🔴 Admin | Update kategori |
| DELETE | `/v1/admin/categories/{category}` | 🔴 Admin | Hapus kategori |

---

## 🏷️ Tags (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/tags` | No | List semua tag |
| GET | `/v1/tags/{tag}` | No | Detail tag |
| POST | `/v1/admin/tags` | 🔴 Admin | Buat tag |
| PUT/PATCH | `/v1/admin/tags/{tag}` | 🔴 Admin | Update tag |
| DELETE | `/v1/admin/tags/{tag}` | 🔴 Admin | Hapus tag |

---

## 📝 Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/posts` | No | List post (paginasi) |
| GET | `/v1/posts/{post}` | No | Detail post |
| POST | `/v1/posts` | ✅ | Buat post baru |
| PUT/PATCH | `/v1/posts/{post}` | ✅ | Update post (owner) |
| DELETE | `/v1/posts/{post}` | ✅ | Hapus post (owner) |
| POST | `/v1/posts/{post}/accept-answer/{comment}` | ✅ | Tandai jawaban terbaik |
| PATCH | `/v1/moderator/posts/{post}/close` | 🟡 Mod | Tutup post |
| PATCH | `/v1/moderator/posts/{post}/reopen` | 🟡 Mod | Buka kembali post |
| DELETE | `/v1/moderator/posts/{post}` | 🟡 Mod | Force delete post |

### GET `/v1/posts` — Query Params
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Halaman (default: 1) |
| `per_page` | int | Item per halaman |
| `category` | int/string | Filter by category |
| `tag` | string | Filter by tag |
| `search` | string | Cari judul/konten |
| `sort` | string | `latest`, `popular`, `unanswered` |

### POST `/v1/posts`
```json
{
  "title": "Judul post",
  "body": "Isi konten post...",
  "category_id": 1,
  "tags": [1, 2, 3]
}
```

---

## 💬 Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/posts/{post}/comments` | No | List komentar sebuah post |
| GET | `/v1/posts/{post}/comments/{comment}` | No | Detail komentar |
| POST | `/v1/posts/{post}/comments` | ✅ | Buat komentar |
| PUT/PATCH | `/v1/posts/{post}/comments/{comment}` | ✅ | Update komentar (owner) |
| DELETE | `/v1/posts/{post}/comments/{comment}` | ✅ | Hapus komentar (owner) |
| DELETE | `/v1/moderator/comments/{comment}` | 🟡 Mod | Force delete komentar |

### POST `/v1/posts/{post}/comments`
```json
{
  "body": "Isi komentar...",
  "parent_id": null
}
```

---

## 👍 Votes

> Rate limit: **60 requests/minute**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v1/votes` | ✅ | Vote post/comment (toggle) |
| DELETE | `/v1/votes/{vote}` | ✅ | Hapus vote |

### POST `/v1/votes`
```json
{
  "target_id": 1,
  "target_type": "post",
  "vote_type": "upvote"
}
```
> `target_type`: `post` atau `comment`  
> `vote_type`: `upvote` atau `downvote`

**Response:**
```json
{
  "success": true,
  "message": "Vote berhasil disimpan.",
  "data": { "vote_score": 42 }
}
```

> **Catatan perilaku toggle:**
> - Vote baru → simpan
> - Vote sama → batalkan (toggle off)
> - Vote berbeda → ubah (upvote ↔ downvote)

---

## ❤️ Likes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/posts/{post}/likes` | No | Lihat likes sebuah post |
| POST | `/v1/posts/{post}/likes` | ✅ | Like post |
| DELETE | `/v1/posts/{post}/likes` | ✅ | Unlike post |

---

## 🔖 Bookmarks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/bookmarks` | ✅ | List bookmark milik user |
| POST | `/v1/bookmarks` | ✅ | Tambah bookmark |
| DELETE | `/v1/bookmarks/{bookmark}` | ✅ | Hapus bookmark |

### POST `/v1/bookmarks`
```json
{
  "post_id": 1
}
```

---

## 👥 Follows

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/users/{user}/followers` | No | List followers user |
| GET | `/v1/users/{user}/following` | No | List following user |
| POST | `/v1/users/{user}/follow` | ✅ | Follow user |
| DELETE | `/v1/users/{user}/unfollow` | ✅ | Unfollow user |

---

## 🔔 Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/notifications` | ✅ | List notifikasi |
| GET | `/v1/notifications/unread-count` | ✅ | Jumlah notif belum dibaca |
| PATCH | `/v1/notifications/read-all` | ✅ | Tandai semua sudah dibaca |
| PATCH | `/v1/notifications/{notification}/read` | ✅ | Tandai satu sudah dibaca |

---

## 🚩 Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v1/reports` | ✅ | Lapor konten |
| GET | `/v1/admin/reports` | 🟡 Mod | List semua laporan |
| PATCH | `/v1/admin/reports/{report}/resolve` | 🟡 Mod | Selesaikan laporan |

### POST `/v1/reports`
```json
{
  "target_id": 1,
  "target_type": "post",
  "reason": "Konten spam atau menyesatkan"
}
```
> `target_type`: `post` atau `comment`

---

## 👤 Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/users/{user}` | No | Profil publik user |
| PATCH | `/v1/admin/users/{user}/ban` | 🔴 Admin | Ban user |
| PATCH | `/v1/admin/users/{user}/unban` | 🔴 Admin | Unban user |

---

## 📊 Standard Response Format

### Success
```json
{
  "success": true,
  "message": "Pesan sukses.",
  "data": { ... },
  "errors": null
}
```

### Error
```json
{
  "success": false,
  "message": "Pesan error.",
  "data": null,
  "errors": { "field": ["validation message"] }
}
```

### Pagination
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "meta": {
      "current_page": 1,
      "last_page": 10,
      "per_page": 15,
      "total": 150
    }
  }
}
```

---

## ⚠️ HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthenticated |
| 403 | Forbidden (banned / bukan owner) |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Server Error |

---

## 🛡️ Role Reference

| Symbol | Role | Akses |
|--------|------|-------|
| No | Public | Semua endpoint publik |
| ✅ | User | Login + tidak banned |
| 🟡 Mod | Moderator | User + moderasi konten |
| 🔴 Admin | Admin | Full access |
