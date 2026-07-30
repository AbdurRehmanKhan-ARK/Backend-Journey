# API Reference

Base URL: `http://localhost:8000/api/v1`

All routes below are prefixed with `/users` (e.g. `/api/v1/users/register`).

All responses follow the same shape:

**Success:**
```json
{
  "statusCode": 200,
  "message": "Description of what happened",
  "data": { }
}
```

**Error:**
```json
{
  "statusCode": 400,
  "message": "Description of what went wrong",
  "data": null,
  "success": false,
  "errors": []
}
```

---

## Authentication

Two tokens are used, both sent as `httpOnly` cookies (`accessToken`, `refreshToken`) and also returned in the response body for clients that cannot rely on cookies (mobile apps).

Routes marked **Auth required: Yes** expect either:
- The `accessToken` cookie, or
- An `Authorization: Bearer <token>` header

See `Backend-Concepts.md` for the full token theory.

---

## POST /register

Creates a new user account.

**Auth required:** No

**Content-Type:** `multipart/form-data`

**Body:**

| Field | Type | Required | Notes |
|---|---|---|---|
| username | text | Yes | 3 to 20 chars, lowercase letters/numbers/underscores/dots only |
| fullname | text | Yes | 3 to 50 chars |
| email | text | Yes | Must be a valid email format |
| password | text | Yes | 8+ chars, upper, lower, number, special character |
| avatar | file | Yes | Uploaded to Cloudinary |
| coverImage | file | No | Uploaded to Cloudinary |

**Success (201):**
```json
{
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "_id": "...",
    "username": "abdur_123",
    "email": "abdur@example.com",
    "fullname": "Abdur Rehman Khan",
    "avatar": "https://res.cloudinary.com/...",
    "coverImage": "https://res.cloudinary.com/...",
    "watchHistory": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**

| Status | Reason |
|---|---|
| 400 | A required field is missing or invalid (bad email, weak password, etc.) |
| 400 | Avatar missing, or avatar upload to Cloudinary failed |
| 409 | Username or email already registered |

---

## POST /login

Authenticates a user and issues an access/refresh token pair.

**Auth required:** No

**Content-Type:** `application/json`

**Body:**

| Field | Type | Required | Notes |
|---|---|---|---|
| username | text | One of username/email required | |
| email | text | One of username/email required | |
| password | text | Yes | |

**Success (200):** sets `accessToken` and `refreshToken` cookies, returns:
```json
{
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "user": { "...sensitive fields stripped..." },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Errors:**

| Status | Reason |
|---|---|
| 400 | Both username and email missing |
| 401 | No matching user, or password incorrect (identical message/status for both, intentionally, to prevent account enumeration) |

---

## POST /logout

Logs the current user out, revoking their refresh token server side.

**Auth required:** Yes

**Body:** none

**Success (200):** clears `accessToken` and `refreshToken` cookies, `$unset`s the stored `refreshToken` on the user's DB record.
```json
{
  "statusCode": 200,
  "message": "User logged out successfully"
}
```

**Errors:**

| Status | Reason |
|---|---|
| 401 | Missing or invalid access token |

---

## POST /refresh-token

Issues a new access/refresh token pair using a still valid refresh token, without requiring the user to log in again.

**Auth required:** No (intentionally public, since this exists specifically for when the access token has already expired)

**Body (optional, only needed if not using cookies):**

| Field | Type | Required |
|---|---|---|
| refreshToken | text | Only if not sent via cookie |

**Success (200):** sets new `accessToken` and `refreshToken` cookies, returns:
```json
{
  "statusCode": 200,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Errors:**

| Status | Reason |
|---|---|
| 401 | No refresh token provided |
| 401 | Refresh token invalid, expired, or tampered with |
| 401 | Refresh token does not match the one stored in the database (already used, or user has since logged out) |

---

## POST /change-password

Changes the password for the currently authenticated user.

**Auth required:** Yes

**Content-Type:** `application/json`

**Body:**

| Field | Type | Required | Notes |
|---|---|---|---|
| oldPassword | text | Yes | Must match the current password |
| newPassword | text | Yes | Same strength rules as registration |
| confirmPassword | text | Yes | Must match newPassword exactly |

**Success (200):**
```json
{
  "statusCode": 200,
  "message": "Password changed successfully"
}
```

**Errors:**

| Status | Reason |
|---|---|
| 400 | A field is missing |
| 400 | newPassword and confirmPassword do not match |
| 400 | newPassword does not meet strength requirements |
| 400 | oldPassword is incorrect |
| 404 | User not found (edge case, shouldn't normally happen if auth passed) |

---

## GET /current-user

Returns the currently authenticated user's profile.

**Auth required:** Yes

**Body:** none

**Success (200):**
```json
{
  "statusCode": 200,
  "message": "Current user fetched successfully",
  "data": { "...sensitive fields stripped..." }
}
```

**Errors:**

| Status | Reason |
|---|---|
| 401 | Missing or invalid access token |

---

## PATCH /update-account

Updates the current user's fullname and email.

**Auth required:** Yes

**Content-Type:** `application/json`

**Body:**

| Field | Type | Required | Notes |
|---|---|---|---|
| fullname | text | Yes | 3 to 50 chars |
| email | text | Yes | Must be valid format, and not already taken by another user |

**Success (200):**
```json
{
  "statusCode": 200,
  "message": "Account details updated successfully",
  "data": { "...updated user, sensitive fields stripped..." }
}
```

**Errors:**

| Status | Reason |
|---|---|
| 400 | Field missing or invalid format |
| 409 | Email already in use by a different account |

---

## PATCH /update-avatar

Replaces the current user's avatar image.

**Auth required:** Yes

**Content-Type:** `multipart/form-data`

**Body:**

| Field | Type | Required |
|---|---|---|
| avatar | file | Yes |

**Success (200):** old avatar is deleted from Cloudinary after the new one is successfully saved.
```json
{
  "statusCode": 200,
  "message": "Avatar updated successfully",
  "data": { "...updated user, sensitive fields stripped..." }
}
```

**Errors:**

| Status | Reason |
|---|---|
| 400 | No file provided |
| 400 | Upload to Cloudinary failed |

---

## PATCH /update-cover-image

Replaces the current user's cover image.

**Auth required:** Yes

**Content-Type:** `multipart/form-data`

**Body:**

| Field | Type | Required |
|---|---|---|
| coverImage | file | Yes |

**Success (200):** old cover image is deleted from Cloudinary after the new one is successfully saved.
```json
{
  "statusCode": 200,
  "message": "Cover image updated successfully",
  "data": { "...updated user, sensitive fields stripped..." }
}
```

**Errors:**

| Status | Reason |
|---|---|
| 400 | No file provided |
| 400 | Upload to Cloudinary failed |

---

## Route Summary Table

| Method | Endpoint | Auth | Body Type |
|---|---|---|---|
| POST | /register | No | multipart/form-data |
| POST | /login | No | application/json |
| POST | /logout | Yes | none |
| POST | /refresh-token | No | application/json (optional) |
| POST | /change-password | Yes | application/json |
| GET | /current-user | Yes | none |
| PATCH | /update-account | Yes | application/json |
| PATCH | /update-avatar | Yes | multipart/form-data |
| PATCH | /update-cover-image | Yes | multipart/form-data |