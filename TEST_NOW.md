# 🧪 TEST NOW - Quick Start Guide

## ⚡ **Test in 60 Seconds**

### **Option 1: Automated Test**

```bash
# Make sure dev server is running
npm run dev

# In another terminal
npm run test:vlayer
```

**Expected output:**
```
🧪 vlayer Verification Test Suite
✅ Direct ETHGlobal Buenos Aires page - 500ms
✅ Proof Generation - 8000ms
✅ Proof Verification - 100ms
✅ Status Check - 50ms
🎉 All tests passed!
```

---

### **Option 2: Manual Browser Test**

1. **Start server:**
   ```bash
   npm run dev
   ```

2. **Open:** http://localhost:3000

3. **Connect wallet** (click "Login" button)

4. **Go to "Verify Hacker" tab**

5. **Get your token:**
   - Open new tab: https://ethglobal.com/events/buenosaires/home
   - Log in
   - Press F12
   - Application → Local Storage → ethglobal.com
   - Copy `ethglobal_access_token` value

6. **Paste token in SwagSwap**

7. **Click "Verify ETHGlobal Status"**

8. **Wait ~5-8 seconds** (you'll see logs in terminal)

9. **Success!** 🎉 Confetti appears!

---

## 📊 **What You'll See in Logs**

```
🚀 Generating proof for wallet: 0x...
📍 Checking event page: https://ethglobal.com/events/buenosaires/home
🌐 Using headless browser to render JavaScript...
♻️ Reusing existing browser instance
🍪 Setting authentication cookie...
🔗 Navigating to page...
⏳ Waiting for content to render...
✅ Selector found: p.font-semibold
📝 Extracting confirmation text...
✅ Extracted text: You are fully confirmed to attend this event!
📄 Page title: ETHGlobal Buenos Aires
📸 Capturing screenshot...
✅ Screenshot captured
✅ Browser proof generated successfully in 5432ms
✅ Confirmation text validated successfully
🎯 User is confirmed for ETHGlobal Buenos Aires!
```

---

## ✅ **Success Checklist**

When it works, you should see:
- [x] "Web Proof generated successfully!" message
- [x] "You are confirmed for ETHGlobal Buenos Aires!" text
- [x] Green verified badge appears
- [x] Confetti animation 🎉
- [x] "✅ Verified Hacker" status displayed

---

## ❌ **Troubleshooting**

### **Error: "Browser launch failed"**
```bash
# Install Chrome dependencies
npm install
```

### **Error: "Selector not found"**
**Cause:** Not confirmed for Buenos Aires, or token expired

**Fix:**
1. Go to https://ethglobal.com/events/buenosaires/home
2. Make sure you see: "You are fully confirmed to attend this event!"
3. If not → Complete registration
4. Get fresh token

### **Error: "Token expired"**
**Fix:** Get new token (they expire after ~14 days)

### **Error: "Timeout after 30 seconds"**
**Fix:** Check internet connection, try again

---

## 🎯 **Quick Debug**

If something fails:

```bash
# Check logs in terminal (server side)
# Look for ❌ errors

# Common issues:
# 1. Wrong token → Get fresh one
# 2. Not confirmed → Complete registration
# 3. Timeout → Check internet, retry
```

---

## 📞 **Still Not Working?**

1. **Check token is correct:**
   - Starts with `eyJ`
   - From Local Storage (not Cookies!)
   - Key name: `ethglobal_access_token`

2. **Check you're registered:**
   - Visit event page when logged in
   - Must see confirmation text
   - If not → complete registration first

3. **Check server logs:**
   - Look for specific error messages
   - They're very detailed!

---

## 🎉 **It Works!**

Once you see the verified badge and confetti:
- ✅ Implementation is working
- ✅ Browser automation successful
- ✅ Proof generation complete
- ✅ Ready for production!

**You're all set! 🚀**

