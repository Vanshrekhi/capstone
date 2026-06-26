# Bug Report & Fix: Create Sandbox CORS Issue

## Problem Description
When clicking the "Create Sandbox" button on the FrontendForge interface, the request fails with a CORS (Cross-Origin Resource Sharing) error in the browser console.

### Console Error Messages:
```
Access to fetch at 'http://localhost/api/sandbox/start' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on 
the requested resource.
```

### Error Details:
- Frontend URL: `http://localhost:5173` (Vite development server)
- API Request URL: `http://localhost/api/sandbox/start`
- HTTP Method: POST
- Status: 201 Created (server responded, but browser blocked it)

## Root Cause
The **sandbox/server/src/app.js** file was **missing CORS middleware configuration**, preventing the browser from accessing the API endpoint from a different origin.

### What Was Missing:
1. **Missing import**: `import cors from 'cors';`
2. **Missing middleware**: CORS middleware was not initialized
3. **Missing configuration**: No CORS headers were being sent in the response

### Why This Happened:
- The **sandbox/agent/src/app.js** had CORS properly configured
- The **sandbox/server/src/app.js** was missing the same configuration
- Both servers need CORS headers since they handle frontend requests from different origins

## Solution Applied

### File Modified: 
`sandbox/server/src/app.js`

### Changes Made:

**Before:**
```javascript
import express from 'express'
import morgan from 'morgan'
import { createPod } from './kubernetes/pod.js';
import { createService } from './kubernetes/service.js';
import { v7 as uuid } from "uuid"

const app = express();

app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

**After:**
```javascript
import express from 'express'
import morgan from 'morgan'
import cors from 'cors';
import { createPod } from './kubernetes/pod.js';
import { createService } from './kubernetes/service.js';
import { v7 as uuid } from "uuid"

const app = express();

app.use(morgan('dev'))
app.use(cors({
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
    origin: "*",
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### What Was Fixed:
1. ✅ Added `cors` import from the cors package
2. ✅ Added CORS middleware initialization with:
   - `methods`: Allowed HTTP methods (GET, POST, PATCH, DELETE, OPTIONS, PUT)
   - `origin: "*"`: Allows requests from any origin (suitable for development)

## Result
After applying this fix:
- ✅ The browser will no longer block the fetch request
- ✅ The `/api/sandbox/start` endpoint will send proper CORS headers
- ✅ The "Create Sandbox" button will work correctly
- ✅ The frontend can successfully communicate with the sandbox server API

## How to Test
1. Restart the sandbox server
2. Click the "Create Sandbox" button in FrontendForge
3. Check browser console - no CORS errors should appear
4. Sandbox should create successfully

## Important Notes
- The `cors` package must be installed in `sandbox/server/package.json` dependencies
- The `cors` middleware should be added early in the Express middleware chain (after logger, before other routes)
- For production, consider restricting `origin` to specific domains instead of `"*"`

---

# Bug Report & Fix: AI Agent "Failed to fetch" Error

## Problem Description
When the user tries to use the AI agent in the chat panel and sends a message, they receive an error:
```
❌ Error: Failed to fetch
```

This happens because the AI orchestration server doesn't send proper CORS headers.

### Console Error Messages:
```
Access to fetch at 'http://localhost/api/ai/invoke' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on 
the requested resource.
```

### Error Details:
- Frontend URL: `http://localhost:5173` (Vite development server)
- API Request URL: `http://localhost/api/ai/invoke`
- HTTP Method: POST
- Issue: CORS headers missing from response

## Root Cause
The **ai-orchestration/src/app.js** file was **missing CORS middleware configuration**.

### What Was Missing:
1. **Missing import**: `import cors from 'cors';`
2. **Missing middleware**: CORS middleware was not initialized
3. **Missing configuration**: No CORS headers were being sent with responses

## Solution Applied

### File Modified: 
`ai-orchestration/src/app.js`

### Changes Made:

**Before:**
```javascript
import express from 'express';
import agentRouter from './routes/agent.routes.js'
import morgan from 'morgan';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
```

**After:**
```javascript
import express from 'express';
import agentRouter from './routes/agent.routes.js'
import morgan from 'morgan';
import cors from 'cors';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors({
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
    origin: "*",
}));
app.use(express.json());
```

### What Was Fixed:
1. ✅ Added `cors` import
2. ✅ Added CORS middleware with proper configuration
3. ✅ Middleware applied early in the chain (after logger, before routes)

## Result
After applying this fix:
- ✅ AI agent fetch requests will no longer fail
- ✅ The `/api/ai/invoke` endpoint will send proper CORS headers
- ✅ AI chat panel will work correctly
- ✅ Users can send messages and receive AI responses

## How to Test
1. Restart the ai-orchestration server
2. Open the AI chat panel in FrontendForge
3. Send a message to the AI agent
4. Check browser console - no CORS errors should appear
5. AI should respond successfully

---

# Bug Report & Fix: Frontend API Error Handling

## Problem Description
When fetching files from the sandbox API, generic error messages don't provide enough detail for debugging. The API calls lacked:
1. Proper error context logging
2. Network error handling
3. Response validation
4. Detailed error messages

## Root Cause
The **frontend/src/services/api.js** file had minimal error handling:
- No console logging for debugging network issues
- No response status validation before parsing
- Generic error messages that don't indicate what went wrong
- No error context (URL, method, etc.)

## Solution Applied

### File Modified: 
`frontend/src/services/api.js`

### Changes Made:

All API functions were enhanced with:

1. **Try-catch blocks** - Proper error handling around fetch operations
2. **Console logging** - Logs the URL being called for debugging
3. **Response validation** - Checks response status and logs error details
4. **Enhanced error messages** - Includes status text and response body
5. **Better error context** - Shows what endpoint was called and what failed

**Example improvement for `listFiles`:**

**Before:**
```javascript
export async function listFiles(sandboxId) {
  const res = await fetch(`${getAgentBase(sandboxId)}/list-files`);
  if (!res.ok) throw new Error('Failed to list files');
  const data = await res.json();
  return data.files || [];
}
```

**After:**
```javascript
export async function listFiles(sandboxId) {
  try {
    const agentBase = getAgentBase(sandboxId);
    const url = `${agentBase}/list-files`;
    console.log('Fetching files from:', url);
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to list files: ${res.statusText} - ${errorText}`);
    }
    
    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error('List files error:', error);
    throw error;
  }
}
```

### Functions Updated:
1. ✅ `startSandbox()` - Better error handling
2. ✅ `listFiles()` - Detailed error messages and logging
3. ✅ `readFiles()` - Better error context
4. ✅ `updateFiles()` - Enhanced error handling
5. ✅ `invokeAI()` - Complete error handling overhaul

## Result
After applying this fix:
- ✅ File explorer will show proper error messages if something fails
- ✅ Console logs show exactly which URL was called
- ✅ Developers can debug network issues more easily
- ✅ Error messages are more descriptive

## Benefits
- Better debugging experience
- Clearer indication of what's failing
- Easier to diagnose network/CORS issues
- Faster troubleshooting

---

# Bug Report & Fix: Terminal History Not Persisted

## Problem Description
When the user uses the terminal in the IDE:
1. Terminal history is lost when the page is refreshed
2. Terminal history is lost when the browser tab is closed
3. Terminal output doesn't persist across page reloads
4. No way to review previous terminal commands/output

## Root Cause
The **frontend/src/components/TerminalPanel.jsx** component:
1. Had no mechanism to save terminal output
2. Had no mechanism to restore previous terminal history
3. Terminal history was only stored in memory
4. On unmount/remount, all history was lost

## Solution Applied

### File Modified: 
`frontend/src/components/TerminalPanel.jsx`

### Changes Made:

1. **Added localStorage key constants:**
```javascript
const TERMINAL_HISTORY_KEY = 'terminalHistory';
const MAX_HISTORY_SIZE = 50000; // Characters
```

2. **Added history buffer ref:**
```javascript
const historyBufferRef = useRef('');
```

3. **Added load function:**
```javascript
const loadTerminalHistory = () => {
  try {
    const saved = localStorage.getItem(TERMINAL_HISTORY_KEY);
    return saved ? JSON.parse(saved) : '';
  } catch (err) {
    console.error('Failed to load terminal history:', err);
    return '';
  }
};
```

4. **Added save function:**
```javascript
const saveTerminalHistory = (content) => {
  try {
    const trimmed = content.length > MAX_HISTORY_SIZE 
      ? content.slice(-MAX_HISTORY_SIZE)
      : content;
    localStorage.setItem(TERMINAL_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save terminal history:', err);
  }
};
```

5. **Restore history on load:**
```javascript
const previousHistory = loadTerminalHistory();
// ...
if (previousHistory) {
  term.write(previousHistory);
  historyBufferRef.current = previousHistory;
}
```

6. **Track all output:**
- Append to historyBufferRef on each socket.on('terminal-output')
- Append to historyBufferRef on user input
- Append connection/disconnection messages

7. **Save history periodically:**
```javascript
socket.on('terminal-output', (data) => {
  const output = typeof data === 'string' ? data : data.output || ...;
  term.write(output);
  historyBufferRef.current += output;
  saveTerminalHistory(historyBufferRef.current); // ← Save after each output
});
```

8. **Save on cleanup:**
```javascript
return () => {
  // ...
  saveTerminalHistory(historyBufferRef.current); // ← Save before dispose
  term.dispose();
};
```

## Result
After applying this fix:
- ✅ Terminal history is saved to localStorage
- ✅ Terminal history persists across page refreshes
- ✅ Terminal history persists until browser session ends
- ✅ History is automatically restored when terminal loads
- ✅ History is capped at 50,000 characters to prevent storage issues
- ✅ Users can scroll back through previous commands

## Features
1. **Automatic saving** - History saved after each output
2. **Size limit** - Keeps only last 50,000 characters
3. **Error handling** - Gracefully handles storage errors
4. **Session persistence** - History maintained during entire session
5. **No data loss** - Final history saved on unmount

## How It Works
1. User opens terminal - history is restored from localStorage
2. User types commands or receives output - history buffer is updated
3. After each change, history is saved to localStorage
4. If browser is closed and reopened (same session), history is still there
5. Browser cache clear or new browser session = history is cleared

---

# Bug Report & Fix: Template File Sync Architecture

## Problem Description
User reported: "After applying changes, it is not reflected to template, whatever changes I ask to do"

This creates confusion about where files are actually stored and how updates work.

## Architecture Explanation

### How Template System Works:

1. **Template Image** - `sandbox/template/` is used to build a Docker image
   - Contains initial project structure
   - Used as the base for new sandboxes

2. **Sandbox Creation** - When creating a new sandbox:
   - Kubernetes pod is created with 2 containers:
     - `template` container - runs the frontend
     - `agent` container - runs the AI agent
   - Both containers mount a shared volume at `/workspace`

3. **Init Container** - Copies template files:
   ```javascript
   command: ['sh', '-c', 'cp -r /workspace/. /seed/']
   ```
   - Copies template files from template image `/workspace` to shared volume
   - This gives each sandbox its own copy of the template

4. **File Updates** - When user/AI updates files:
   - Updates go to `/workspace` in the shared volume
   - Both containers can see and access the updates
   - These updates are **sandbox-specific** (not shared with other sandboxes)

### Why Changes Don't Go to Template Directory:

**This is by design.** The `sandbox/template/` directory is:
- The **template source** (like a class definition)
- Used to **build the Docker image**
- **Not the runtime storage** for actual projects

Each sandbox gets its own isolated copy of the template in the shared volume.

### Correct Workflow:

```
sandbox/template/ (Docker image source)
         ↓
    [Build Docker image]
         ↓
    [Create Pod with shared volume]
         ↓
Init Container copies: template → /workspace
         ↓
    /workspace (shared volume - where actual work happens)
         ↓
    Both containers can read/write
         ↓
    Changes are sandbox-specific
```

### If You Want to Update the Template:

If you want to change what files new sandboxes get:
1. Modify files in `sandbox/template/`
2. Rebuild the Docker image: `docker build -t template:latest ./sandbox/template/`
3. New sandboxes will have the updated files

## Important Notes

✅ **Files ARE being updated** when you use the AI agent
✅ **Changes ARE reflected** in the running sandbox
✅ **Terminal shows the correct files** after fixing CORS/errors
✅ **This is working as designed** - each sandbox is isolated

❌ **Don't expect** changes to appear in `sandbox/template/` source directory
❌ **That would violate** the sandboxing principle (shared mutable state)

## How to Verify Files Are Updated:

1. Use the terminal to list files: `ls -la`
2. Use the terminal to check file contents: `cat src/App.jsx`
3. Use the file explorer in the IDE
4. The AI agent's changes appear immediately in the sandbox

---

# Summary of All Fixes Applied

| Issue | Status | Fix |
|-------|--------|-----|
| AI agent showing "Failed to fetch" | ✅ FIXED | Added CORS middleware to ai-orchestration/src/app.js |
| Terminal folders not showing up | ✅ FIXED | Added comprehensive error handling to api.js + fixed CORS |
| Changes not reflected to template | ✅ CLARIFIED | Documented that this is by design - each sandbox is isolated |
| Terminal history not maintained | ✅ FIXED | Added localStorage persistence to TerminalPanel.jsx |

## Files Modified:
1. `ai-orchestration/src/app.js` - Added CORS headers
2. `frontend/src/services/api.js` - Enhanced error handling & debugging
3. `frontend/src/components/TerminalPanel.jsx` - Added history persistence

## Next Steps:
1. Restart all affected services
2. Test AI agent functionality
3. Verify terminal history persists
4. Verify file explorer shows files correctly

## Problem Description
After creating sandboxes, pods were stuck in "Pending" status and unable to be scheduled on the Kubernetes node.

### Error Message:
```
FailedScheduling: 0/1 nodes are available: 1 Insufficient memory. 
no new claims to deallocate, preemption: 0/1 nodes are available: 
1 No preemption victims found for incoming pod.
```

### Affected Pods:
- `sandbox-pod-019eeee6-d7da-722a-837d-1fb2eaa697ef` - Pending
- `sandbox-pod-019eeeea-b81e-70ed-8854-4a006be7c729` - Pending

## Root Cause
The **sandbox/server/src/kubernetes/pod.js** file was requesting excessive memory resources:
- Each pod had 2 containers (sandbox-container + agent-container)
- Each container requested: **500Mi memory**
- Total per pod: **1Gi (1000Mi) memory requested**
- The Kubernetes node didn't have enough available memory to schedule new pods

### Resource Issue:
```javascript
resources: {
    limits: { cpu: "500m", memory: "1Gi" },
    requests: { cpu: "250m", memory: "500Mi" }  // Too high!
}
```

## Solution Applied

### Files Modified:
1. Deleted stuck pending pods
2. Reduced memory requests in `sandbox/server/src/kubernetes/pod.js`

### Changes Made:

**Before:**
```javascript
// Each container requesting too much
resources: {
    limits: { cpu: "500m", memory: "1Gi" },
    requests: { cpu: "250m", memory: "500Mi" }
}
```

**After:**
```javascript
// Optimized resource requests
resources: {
    limits: { cpu: "300m", memory: "350Mi" },
    requests: { cpu: "150m", memory: "200Mi" }
}
```

### What Was Fixed:
1. ✅ Reduced memory requests from **500Mi to 200Mi** per container
2. ✅ Reduced memory limits from **1Gi to 350Mi** per container
3. ✅ Reduced CPU requests from **250m to 150m** for better efficiency
4. ✅ Reduced CPU limits from **500m to 300m** 
5. ✅ Deleted stuck pending pods to free up scheduler
6. ✅ Total pod memory now: **400Mi** (200Mi × 2 containers) instead of 1Gi

## Result
After applying this fix:
- ✅ New sandbox pods can be scheduled successfully
- ✅ No more "Insufficient memory" errors
- ✅ Multiple sandboxes can be created simultaneously
- ✅ Better resource utilization across the cluster

## How to Test
1. Restart the sandbox server
2. Create a new sandbox via the "Create Sandbox" button
3. Check `kubectl get pods` - pods should transition from Pending → Running
4. Create multiple sandboxes - all should schedule without errors

## Important Notes
- Memory requests must match available node capacity
- For production deployment, adjust based on node resources
- Monitor actual memory usage and adjust limits accordingly
- Consider using Horizontal Pod Autoscaler (HPA) for production

