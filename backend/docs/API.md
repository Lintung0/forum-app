# Forum Diskusi — API Documentation

**Base URL:** `http://localhost:8000/api`  
**Version:** 1.1.0  
**Auth:** Bearer Token (Laravel Sanctum)

---

## Response Format

Semua response menggunakan format berikut:

```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "errors": null
}
```

Response paginated:

```json
{
  "success": true,
  "message": "...",
  "data": {
    "items": [...],
    "meta": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 15,
      "total": 72
    }
  }
}
```

---

## Health Check

### GET /health
Cek status API.

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "1.1.0",
    "environment": "local",
    "timestamp": "2026-06-13T02:30:00.000Z",
    "timezone": "UTC"
  }
}
```

---

## Authentication

Base prefix: `/api/v1/auth`  
Rate limit: 10 req/menit (register & login)

---

### POST /v1/auth/register
Daftar akun baru.

**Body:**
```json
{
  "username": "nidhom",
  "email": "nidhom@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response `201`:**
```json
{
  "data": {
    "user": { "id": "uuid", "username": "nidhom", "email": "nidhom@example.com", "roles": ["user"] },
    "token": "1|abc...",
    "token_type": "Bearer",
    "expires_at": "2026-07-13T02:30:00.000Z"
  }
}
```

---

### POST /v1/auth/login
Login user.

**Body:**
```json
{
  "email": "nidhom@example.com",
  "password": "password123"
}
```

**Response `200`:** sama seperti register.

---

### POST /v1/auth/logout
🔒 Revoke token aktif.

**Response `204`**

---

### POST /v1/auth/logout-all
🔒 Revoke semua token (semua device).

**Response `204`**

---

### POST /v1/auth/refresh
🔒 Ganti token baru, token lama dihapus.

**Response `200`:**
```json
{
  "data": {
    "token": "2|xyz...",
    "token_type": "Bearer",
    "expires_at": "2026-07-13T02:30:00.000Z"
  }
}
```

---

### GET /v1/auth/me
🔒 Ambil data user yang sedang login.

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "username": "nidhom",
    "email": "nidhom@example.com",
    "avatar_url": null,
    "bio": null,
    "reputation_points": 0,
    "level": 1,
    "is_banned": false,
    "roles": ["user"]
  }
}
```

---

## Users

### GET /v1/users/{username}
Ambil profil user beserta post & komentar terbaru.

> `{username}` adalah username, bukan UUID.

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "username": "nidhom",
    "avatar_url": "/storage/avatars/abc.jpg",
    "bio": "...",
    "reputation_points": 120,
    "level": 2,
    "followers_count": 5,
    "following_count": 3,
    "posts_count": 10,
    "comments_count": 25,
    "created_at": "2026-06-01T00:00:00.000Z",
    "recent_posts": [
      {
        "id": "uuid",
        "title": "Judul Post",
        "slug": "judul-post",
        "vote_score": 4,
        "created_at": "2026-06-10T00:00:00.000Z",
        "category": { "name": "Laravel", "slug": "laravel" }
      }
    ],
    "recent_comments": [
      {
        "id": "uuid",
        "post_id": "uuid",
        "post_title": "Judul Post",
        "body": "Isi komentar...",
        "vote_score": 2,
        "is_accepted": false,
        "created_at": "2026-06-11T00:00:00.000Z"
      }
    ]
  }
}
```

---

### PUT /v1/users/{username}
🔒 Update profil sendiri.

**Body (semua opsional):**
```json
{
  "username": "nidhom_baru",
  "bio": "Bio baru saya."
}
```

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "username": "nidhom_baru",
    "bio": "Bio baru saya."
  }
}
```

---

### POST /v1/users/{username}/avatar
🔒 Upload avatar. Kirim sebagai `multipart/form-data`.

**Body:**
| Field  | Type | Keterangan |
|--------|------|------------|
| avatar | file | jpeg/png/jpg/webp, maks 2MB |

**Response `200`:**
```json
{
  "data": {
    "avatar_url": "/storage/avatars/abc123.jpg"
  }
}
```

---

### GET /v1/users/{username}/followers
Daftar followers user (paginated).

**Response `200`:**
```json
{
  "data": {
    "items": [
      { "id": "uuid", "username": "user1", "avatar_url": null, "reputation_points": 0, "level": 1 }
    ],
    "meta": { "current_page": 1, "last_page": 1, "per_page": 20, "total": 1 }
  }
}
```

---

### GET /v1/users/{username}/following
Daftar user yang di-follow (paginated). Format sama seperti followers.

---

### POST /v1/users/{username}/follow
🔒 Follow user.

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "following": { "id": "uuid", "username": "nidhom" },
    "created_at": "2026-06-13T02:30:00.000Z"
  }
}
```

---

### DELETE /v1/users/{username}/unfollow
🔒 Unfollow user.

**Response `200`**

---

## Categories

### GET /v1/categories
Daftar semua kategori.

**Response `200`:**
```json
{
  "data": [
    { "id": "uuid", "name": "Laravel", "slug": "laravel", "description": "..." }
  ]
}
```

---

### GET /v1/categories/{slug}
Detail satu kategori.

---

### POST /v1/admin/categories
🔒🛡️ **Admin only.** Buat kategori baru.

**Body:**
```json
{
  "name": "Vue.js",
  "slug": "vuejs",
  "description": "Diskusi seputar Vue.js"
}
```

---

### PUT /v1/admin/categories/{slug}
🔒🛡️ **Admin only.** Update kategori.

---

### DELETE /v1/admin/categories/{slug}
🔒🛡️ **Admin only.** Hapus kategori.

---

## Tags

### GET /v1/tags
Daftar semua tag.

**Response `200`:**
```json
{
  "data": [
    { "id": "uuid", "name": "php", "slug": "php", "usage_count": 42 }
  ]
}
```

---

### GET /v1/tags/{slug}
Detail satu tag.

---

### POST /v1/admin/tags
🔒🛡️ **Admin only.** Buat tag baru.

**Body:**
```json
{
  "name": "react"
}
```

---

### PUT /v1/admin/tags/{slug}
🔒🛡️ **Admin only.** Update tag.

---

### DELETE /v1/admin/tags/{slug}
🔒🛡️ **Admin only.** Hapus tag.

---

## Posts

### GET /v1/posts
Daftar post (paginated).

**Query Params:**
| Param       | Default  | Keterangan |
|-------------|----------|------------|
| status      | `open`   | `open`, `closed`, `deleted`, `all` |
| category_id | -        | UUID kategori |
| tag         | -        | Slug tag |
| q           | -        | Keyword pencarian (title & body) |
| sort        | `newest` | `newest`, `oldest`, `votes`, `views` |
| per_page    | `15`     | Maks 50 |

**Response `200`:** paginated list of post objects.

---

### GET /v1/posts/{id}
Detail post beserta komentar top-level (+ replies 1 level).

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "title": "Judul Post",
    "slug": "judul-post",
    "body": "Isi post...",
    "status": "open",
    "vote_score": 5,
    "view_count": 120,
    "is_answered": true,
    "accepted_answer_id": "uuid",
    "comments_count": 8,
    "user": { "id": "uuid", "username": "nidhom" },
    "category": { "id": "uuid", "name": "Laravel", "slug": "laravel" },
    "tags": [{ "name": "php", "slug": "php" }],
    "accepted_answer": { "id": "uuid", "body": "...", "user": { ... } },
    "comments": [ ... ],
    "created_at": "2026-06-10T00:00:00.000Z",
    "updated_at": "2026-06-10T00:00:00.000Z"
  }
}
```

---

### POST /v1/posts
🔒 Buat post baru.

**Body:**
```json
{
  "category_id": "uuid",
  "title": "Judul Post Baru",
  "body": "Isi konten post...",
  "tags": ["php", "laravel"]
}
```

> `tags` bisa berupa nama string (akan auto-create jika belum ada) atau UUID.

**Response `201`:** post object.

---

### PUT /v1/posts/{id}
🔒 Update post (pemilik atau moderator).

**Body (semua opsional):**
```json
{
  "title": "Judul Baru",
  "body": "Isi baru...",
  "category_id": "uuid",
  "tags": ["php"],
  "reason": "Perbaikan typo"
}
```

---

### DELETE /v1/posts/{id}
🔒 Hapus post milik sendiri (soft delete, status jadi `deleted`).

**Response `204`**

---

### POST /v1/posts/{postId}/accept-answer/{commentId}
🔒 Terima jawaban. Hanya pemilik post.

**Response `200`**

---

### PATCH /v1/moderator/posts/{id}/close
🔒🛡️ **Moderator/Admin.** Tutup post.

---

### PATCH /v1/moderator/posts/{id}/reopen
🔒🛡️ **Moderator/Admin.** Buka kembali post.

---

### DELETE /v1/moderator/posts/{id}
🔒🛡️ **Moderator/Admin.** Force delete post.

---

## Comments

### GET /v1/posts/{postId}/comments
Daftar komentar top-level beserta replies (paginated).

**Query Params:**
| Param    | Default | Keterangan |
|----------|---------|------------|
| per_page | `20`    | Maks 50 |

---

### GET /v1/posts/{postId}/comments/{commentId}
Detail satu komentar beserta replies.

---

### POST /v1/posts/{postId}/comments
🔒 Tambah komentar atau reply.

**Body:**
```json
{
  "body": "Isi komentar...",
  "parent_id": null
}
```

> Isi `parent_id` dengan UUID comment untuk membuat reply.

**Response `201`:** comment object.

---

### PUT /v1/posts/{postId}/comments/{commentId}
🔒 Update komentar (pemilik atau moderator).

**Body:**
```json
{
  "body": "Isi komentar yang diperbarui."
}
```

---

### DELETE /v1/posts/{postId}/comments/{commentId}
🔒 Hapus komentar milik sendiri (soft delete).

**Response `204`**

---

### DELETE /v1/moderator/comments/{commentId}
🔒🛡️ **Moderator/Admin.** Force delete komentar.

---

## Votes

### POST /v1/votes
🔒 Beri vote. Jika vote sama dikirim ulang, vote dibatalkan (toggle). Jika berbeda, vote diubah.

**Body:**
```json
{
  "target_id": "uuid",
  "target_type": "post",
  "vote_type": "upvote"
}
```

> `target_type`: `post` atau `comment`  
> `vote_type`: `upvote` atau `downvote`

**Response `200`:**
```json
{
  "data": { "vote_score": 6 },
  "message": "Vote berhasil disimpan."
}
```

---

### DELETE /v1/votes/{id}
🔒 Hapus vote milik sendiri.

**Response `200`:**
```json
{
  "data": { "vote_score": 5 }
}
```

---

## Likes

### GET /v1/posts/{postId}/likes
Daftar likes pada sebuah post (paginated).

---

### POST /v1/posts/{postId}/likes
🔒 Toggle like pada post.

**Body:**
```json
{
  "target_id": "uuid",
  "target_type": "post"
}
```

**Response `200`:**
```json
{
  "data": {
    "liked": true,
    "likes_count": 10
  }
}
```

---

### POST /v1/posts/{postId}/comments/{commentId}/likes
🔒 Toggle like pada komentar.

**Body:**
```json
{
  "target_id": "uuid",
  "target_type": "comment"
}
```

**Response `200`:** sama seperti like post.

---

## Bookmarks

### GET /v1/bookmarks
🔒 Daftar bookmark milik user yang login (paginated).

---

### POST /v1/bookmarks
🔒 Tambah bookmark.

**Body:**
```json
{
  "post_id": "uuid"
}
```

**Response `201`:** bookmark object.

---

### DELETE /v1/bookmarks/{id}
🔒 Hapus bookmark.

**Response `204`**

---

## Notifications

### GET /v1/notifications
🔒 Daftar notifikasi milik user yang login (paginated, 20/hal).

**Response `200`:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "type": "new_comment",
        "is_read": false,
        "reference_id": "uuid",
        "reference_type": "comment",
        "actor": { "id": "uuid", "username": "nidhom", "avatar_url": null },
        "created_at": "2026-06-13T02:30:00.000Z"
      }
    ]
  }
}
```

**Tipe notifikasi:** `new_comment`, `new_reply`, `new_upvote`, `answer_accepted`, `new_follower`

---

### GET /v1/notifications/unread-count
🔒 Jumlah notifikasi belum dibaca.

**Response `200`:**
```json
{
  "data": { "unread_count": 3 }
}
```

---

### PATCH /v1/notifications/{id}/read
🔒 Tandai satu notifikasi sebagai sudah dibaca.

**Response `200`**

---

### PATCH /v1/notifications/read-all
🔒 Tandai semua notifikasi sebagai sudah dibaca.

**Response `200`:**
```json
{
  "data": { "updated_count": 5 }
}
```

---

## Reports

### POST /v1/reports
🔒 Laporkan konten.

**Body:**
```json
{
  "target_id": "uuid",
  "target_type": "post",
  "reason": "spam",
  "description": "Konten ini adalah spam."
}
```

> `target_type`: `post`, `comment`, atau `user`

**Response `201`:** report object.

---

### GET /v1/admin/reports
🔒🛡️ **Admin only.** Daftar semua laporan (paginated).

**Query Params:**
| Param  | Keterangan |
|--------|------------|
| status | `pending`, `reviewed`, `resolved`, `dismissed` |

---

### PATCH /v1/admin/reports/{id}/resolve
🔒🛡️ **Admin only.** Update status laporan.

**Body:**
```json
{
  "status": "resolved"
}
```

> `status`: `reviewed`, `resolved`, atau `dismissed`

---

## Admin — User Management

### PATCH /v1/admin/users/{username}/ban
🔒🛡️ **Admin only.** Ban user.

**Response `200`:** user object.

---

### PATCH /v1/admin/users/{username}/unban
🔒🛡️ **Admin only.** Unban user.

**Response `200`:** user object.

---

## Legend

| Simbol | Keterangan |
|--------|------------|
| 🔒 | Butuh autentikasi (`Authorization: Bearer {token}`) |
| 🛡️ | Butuh role admin atau moderator |

## HTTP Status Codes

| Code | Keterangan |
|------|------------|
| 200  | OK |
| 201  | Created |
| 204  | No Content |
| 401  | Unauthenticated |
| 403  | Forbidden |
| 404  | Not Found |
| 422  | Validation Error |
| 429  | Too Many Requests |
| 500  | Server Error |
