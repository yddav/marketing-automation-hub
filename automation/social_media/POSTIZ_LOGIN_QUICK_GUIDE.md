# Postiz Login Quick Guide

**Problem**: Login form hangs at `http://localhost:4200/auth/login`

**Solution**: Add `provider: "LOCAL"` to login request

---

## ✅ Working Credentials

```
Email:    admin@untrapd.hub
Password: UnTrapdHub2025!
Provider: LOCAL
```

---

## 🔧 Quick Fix

### API Login (Works Now)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@untrapd.hub",
    "password": "UnTrapdHub2025!",
    "provider": "LOCAL"
  }'
```

### Frontend Fix Needed
The login form at `http://localhost:4200/auth/login` needs to include the `provider` field.

**Current (Broken)**:
```javascript
const loginData = {
  email: formData.email,
  password: formData.password
};
```

**Fixed**:
```javascript
const loginData = {
  email: formData.email,
  password: formData.password,
  provider: "LOCAL"  // Add this line
};
```

---

## 📋 Available Provider Values

From Postiz Prisma schema:
- `LOCAL` - Email/password authentication (what we use)
- `GITHUB` - GitHub OAuth
- `GOOGLE` - Google OAuth
- `FARCASTER` - Web3 authentication
- `WALLET` - Crypto wallet
- `GENERIC` - Custom provider

---

## 🔍 Investigation Summary

1. **Root Cause**: Login DTO requires `provider` field (mandatory validation)
2. **Frontend Issue**: Form doesn't send `provider` field → 400 Bad Request
3. **Backend Location**: `http://localhost:3000/auth/login` (not port 4200)
4. **Database User**: Confirmed `admin@untrapd.hub` exists and is activated

---

## 📝 Next Steps

1. Update frontend login form to include `provider: "LOCAL"`
2. Test login works after fix
3. Continue with social media account connections

---

**See**: `POSTIZ_LOGIN_SOLUTION.md` for complete technical details

**Status**: ✅ RESOLVED - API works, frontend needs fix
