# Golf Coach App - Debugging Guide

## Overview

This app now includes comprehensive step-by-step debugging to help identify exactly where issues occur in the 15-step swing analysis pipeline.

## The 15 Steps

1. **User uploads images** (Frontend)
2. **FRONTEND compresses images** (2MB max) (Frontend)
3. **User adds annotations** (club, outcome, focus, notes) (Frontend)
4. **Frontend sends FormData to BACKEND** (Frontend → Backend)
5. **BACKEND validates images** (5MB max, MIME types) (Backend)
6. **BACKEND converts to base64 + detects formats** (Backend)
7. **BACKEND fetches last 3 swings from DATABASE** (Backend)
8. **BACKEND builds intelligent prompt with history** (Backend)
9. **BACKEND calls Claude API** (Haiku model) (Backend)
10. **CLAUDE analyzes swing + compares to history** (Claude API)
11. **BACKEND parses response** (extract rating + summary) (Backend)
12. **BACKEND saves complete record to DATABASE** (Backend)
13. **BACKEND returns structured response to FRONTEND** (Backend → Frontend)
14. **FRONTEND updates SwingContext state** (Frontend)
15. **FRONTEND displays AnalysisResults component** (Frontend)

## How to Use the Debugging System

### Frontend Debugging

When you analyze a swing, the **browser console** will show detailed step-by-step logs with:
- Step number and name
- Status (started/completed/failed)
- Duration from start
- Detailed information about each step
- Any errors that occur

**To view recent debug sessions:**
Open the browser console and type:
```javascript
viewDebugSessions()
```

This will show a table of recent debug sessions with their status, duration, and errors.

### Backend Debugging

The **backend terminal/console** will show detailed logs for steps 4-13 with:
- Request ID (shared with frontend)
- Step-by-step progress
- Timestamps and durations
- Detailed information about each operation
- Full error traces if something fails

### Debug API Endpoints

Access these endpoints to view debug information programmatically:

#### 1. View Recent Debug Sessions
```bash
GET http://localhost:8000/api/debug/sessions?limit=10
```

Returns the last 10 debug sessions with complete step-by-step information.

#### 2. View Specific Debug Session
```bash
GET http://localhost:8000/api/debug/sessions/{request_id}
```

Returns detailed information for a specific request by ID.

#### 3. Debug Health Check
```bash
GET http://localhost:8000/api/debug/health
```

Confirms debug endpoints are working.

### Example Usage on Vercel

If your app is deployed to Vercel, you can check the logs:

1. **Frontend**: Open browser DevTools console while using the app
2. **Backend**: View Vercel function logs at https://vercel.com/{your-project}/logs
3. **API**: Call debug endpoints:
   ```bash
   curl https://your-app.vercel.app/api/debug/sessions
   ```

## Identifying Issues

### If Upload Fails Before Backend
**Check frontend console logs:**
- Steps 1-3 should complete
- Step 4 should show "started"
- Look for errors in compression (Step 2) or network request (Step 4)

### If Request Reaches Backend But Fails
**Check backend logs (Vercel function logs or terminal):**
- Step 4 should show "Backend received FormData"
- Look for which step failed (5-12)
- Common issues:
  - Step 5: Image validation (size, format)
  - Step 7: Database connection
  - Step 9: Claude API key or quota issues
  - Step 12: Database write errors

### If Backend Succeeds But Frontend Doesn't Update
**Check frontend console logs:**
- Steps 13-15 should complete
- Look for state update issues (Step 14)
- Look for rendering issues (Step 15)

## Request ID Tracking

Every request has a unique Request ID that flows through both frontend and backend:
- **Frontend format**: `fe-{timestamp}-{random}`
- **Backend inherits** the frontend request ID via `X-Request-Id` header
- Use this ID to correlate frontend and backend logs

## Common Error Patterns

### Pattern 1: Fails at Step 9 (Claude API Call)
**Possible causes:**
- Missing or invalid `ANTHROPIC_API_KEY`
- API quota exceeded
- Network connectivity issues
- Invalid image format for Claude Vision API

**How to diagnose:**
- Check backend logs for API key length
- Check Claude API error message
- Verify environment variable is set on Vercel

### Pattern 2: Fails at Step 7 or 12 (Database)
**Possible causes:**
- Database connection string incorrect
- Database not initialized
- Network issues to Neon Postgres

**How to diagnose:**
- Check `DATABASE_URL` environment variable
- Check Neon Postgres dashboard for connection issues
- Look for database error messages in backend logs

### Pattern 3: Never reaches Step 4
**Possible causes:**
- Image compression failing
- CORS issues
- Frontend-backend URL mismatch

**How to diagnose:**
- Check browser console for errors
- Verify `VITE_API_URL` points to correct backend
- Check network tab for failed requests

## Deployment Checklist

When deploying to Vercel, ensure:

1. ✅ Backend environment variables set:
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL`
   - `DEBUG_MODE=true` (for detailed logs)

2. ✅ Frontend environment variables set:
   - `VITE_API_URL` (should point to backend API)

3. ✅ Check logs after deployment:
   ```bash
   # View recent debug sessions
   curl https://your-app.vercel.app/api/debug/sessions

   # View Vercel function logs
   vercel logs your-project-name
   ```

## Disabling Debug Logging

### Frontend
Edit `frontend/src/utils/debugLogger.js`:
```javascript
this.isEnabled = false; // Set to false to disable
```

### Backend
The backend debug logger always runs, but you can reduce verbosity by setting:
```bash
DEBUG_MODE=false
```

## Support

If you're still stuck after reviewing debug logs:
1. Copy the Request ID from browser console
2. Get the corresponding backend logs from Vercel
3. Share both sets of logs for analysis
4. Include which step is failing and the error message
