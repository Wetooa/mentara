# Connection Troubleshooting Guide

## Frontend Cannot Connect to Backend

### Symptoms
- Error: "Network error: Unable to connect to server. Please check your internet connection."
- Frontend cannot make API requests to the backend

### Common Causes and Solutions

#### 1. Backend Server Not Running
**Check:**
```bash
# Check if backend is running on port 3001
lsof -i :3001
# Or
curl http://localhost:3001/api/health
```

**Solution:**
```bash
cd mentara-api
npm run start:dev
```

#### 2. Port Mismatch
**Check:**
- Backend default port: `3001` (configurable via `PORT` env var)
- Frontend API URL: Should be `http://localhost:3001/api`
- Frontend default port: `3000` (Next.js default)

**Solution:**
- Ensure `NEXT_PUBLIC_API_URL=http://localhost:3001/api` is set in frontend `.env.local`
- Or ensure backend is running on the port specified in frontend config

#### 3. CORS Issues
**Check:**
- Backend CORS allows frontend origin
- Development: `http://localhost:3000` and `http://localhost:3001` are allowed
- Production: Must match `FRONTEND_URL` environment variable

**Solution:**
- Backend CORS is configured in `src/main.ts`
- In development, CORS is permissive (allows any localhost origin)
- Check browser console for CORS errors

#### 4. Environment Variables Not Set
**Frontend Required:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend Required:**
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Solution:**
- Create `.env.local` in `mentara-web/` directory
- Create `.env` in `mentara-api/` directory
- Restart both servers after changing env vars

#### 5. API URL Configuration Mismatch
**Check:**
- `mentara-web/lib/api/client.ts` - Default: `http://localhost:3001/api`
- `mentara-web/lib/config/api.ts` - Default: `http://localhost:3001/api`
- Both should match

**Solution:**
- Ensure both files use the same default URL
- Or set `NEXT_PUBLIC_API_URL` environment variable

#### 6. Network/Firewall Issues
**Check:**
- Local firewall blocking connections
- VPN or proxy interfering
- Antivirus blocking localhost connections

**Solution:**
- Temporarily disable firewall/antivirus
- Check if `127.0.0.1` works instead of `localhost`
- Try accessing backend directly: `curl http://localhost:3001/api/health`

### Debugging Steps

1. **Check Backend Status:**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"success":true,"data":{"status":"ok",...}}`

2. **Check Frontend API URL:**
   - Open browser console
   - Look for: `[API Client] Base URL: http://localhost:3001/api`
   - If different, check environment variables

3. **Check Network Tab:**
   - Open browser DevTools → Network tab
   - Make an API request
   - Check if request is being made to correct URL
   - Check response status and CORS headers

4. **Check Backend Logs:**
   ```bash
   # Backend should show:
   ✅ Application is running on: http://[::1]:3001
   🔌 WebSocket (Socket.io) support enabled
   ```

5. **Test CORS:**
   ```bash
   curl -X OPTIONS http://localhost:3001/api/health \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -v
   ```
   Should show: `Access-Control-Allow-Origin: http://localhost:3000`

### Quick Fix Checklist

- [ ] Backend server is running (`npm run start:dev` in `mentara-api/`)
- [ ] Backend is accessible at `http://localhost:3001/api/health`
- [ ] Frontend has `NEXT_PUBLIC_API_URL=http://localhost:3001/api` in `.env.local`
- [ ] Both servers restarted after env var changes
- [ ] No firewall/antivirus blocking localhost
- [ ] Browser console shows correct API URL
- [ ] Network tab shows requests being made

### Still Not Working?

1. Check backend logs for errors
2. Check frontend console for detailed error messages
3. Verify both servers are on same network (localhost)
4. Try accessing backend directly in browser: `http://localhost:3001/api/health`
5. Check if port 3001 is already in use by another process

