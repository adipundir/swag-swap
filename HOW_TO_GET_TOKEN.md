# 🔑 How to Get Your ETHGlobal Access Token

## Step-by-Step Guide

### 1. Open ETHGlobal Dashboard
Go to **https://dashboard.ethglobal.com** and **log in** with your account.

### 2. Open Developer Tools
Press **F12** on your keyboard (or right-click anywhere and select "Inspect").

### 3. Navigate to Local Storage
In the DevTools window:
1. Click the **Application** tab (at the top)
2. In the left sidebar, expand **Local Storage**
3. Click on **https://dashboard.ethglobal.com**

### 4. Find the Token
Look for a key named exactly:
```
ethglobal_access_token
```

### 5. Copy the Value
Click on the value (it starts with `eyJ`) and copy the entire string.

**Example:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAzMzUxMiwiZW1haWwiOiJwdW5kaXIuYWRpdHlhQG91dGxvb2suY29tIiwiaWF0IjoxNzYzODY0OTAyLCJleHAiOjE3NjUwNzQ1MDJ9.i_o0t_hNIvpRuGRcYkGEj_8XUDFMhtG9Yxqio0Z_1vM
```

### 6. Use in SwagSwap
1. Go to SwagSwap app
2. Connect your wallet
3. Click "Verify Hacker" tab
4. Click "Show access token input"
5. Paste the token
6. Click "Verify ETHGlobal Status"

---

## Visual Guide

```
DevTools (F12)
  ↓
Application Tab
  ↓
Local Storage
  ↓
dashboard.ethglobal.com
  ↓
ethglobal_access_token ← THIS IS IT!
  ↓
Copy the value (eyJ...)
  ↓
Paste in SwagSwap
```

---

## What is This Token?

This is a **JSON Web Token (JWT)** that proves you're logged into ETHGlobal.

**Structure:**
- **Starts with:** `eyJ` (base64 encoded JSON)
- **Contains:** Your user ID, email, expiry date
- **Expires:** After ~14 days
- **Purpose:** Authenticate API requests

**Security:**
- ✅ Time-limited (expires automatically)
- ✅ Can only access your ETHGlobal data
- ✅ Doesn't give access to your password
- ✅ Standard OAuth/JWT format

---

## Troubleshooting

### Token Not Found
**Problem:** Can't find `ethglobal_access_token` in Local Storage

**Solutions:**
1. Make sure you're logged in to dashboard.ethglobal.com
2. Refresh the page after logging in
3. Try logging out and back in
4. Clear browser cache and log in again

### Token Expired
**Problem:** Error says "Invalid or expired access token"

**Solution:**
1. Log out of dashboard.ethglobal.com
2. Log back in
3. Get a fresh token from Local Storage
4. Tokens expire after ~14 days

### Wrong Token
**Problem:** Pasted something that doesn't start with `eyJ`

**Solution:**
- Make sure you copied the **VALUE** (right column), not the KEY (left column)
- The key name is `ethglobal_access_token`
- The value starts with `eyJ`

### Token Too Short
**Problem:** Token seems incomplete

**Solution:**
- Make sure you copied the **entire** value
- JWT tokens are long (usually 100-200+ characters)
- Should have 3 parts separated by dots (`.`)

---

## For Developers

The token is a JWT with this structure:

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id": 1033512,
    "email": "your@email.com",
    "iat": 1763864902,
    "exp": 1765074502
  },
  "signature": "..."
}
```

You can decode it at [jwt.io](https://jwt.io) to inspect (but don't share it!).

---

## Security Notes

**Safe to use:**
- ✅ In SwagSwap (we don't store it)
- ✅ For testing (it expires)
- ✅ On your local machine

**DON'T:**
- ❌ Share it publicly (GitHub, Discord, etc.)
- ❌ Use it on untrusted websites
- ❌ Store it permanently

**Why?**
Anyone with your token can access your ETHGlobal account data until it expires.

---

**Need Help?** Open an issue on GitHub or ask in the hackathon Discord!

