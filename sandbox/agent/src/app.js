import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { Server } from "socket.io";
import http from 'http';
import { exec } from 'child_process';
import cors from 'cors';

const WORKING_DIR = '/workspace';

const app = express();
const httpServer = http.createServer(app);

app.use(morgan('dev'));
app.use(cors({
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
    origin: "*",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        transports: ['websocket', 'polling']
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000,
    allowUpgrades: true,
    perMessageDeflate: {
        threshold: 1024
    }
});

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Hello from sandbox agent!',
        status: 'success',
    });
});

const socketCommandMap = new Map();

io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    
    // Send welcome message
    socket.emit('terminal-output', `Connected to terminal at ${WORKING_DIR}\r\n`);

    socket.on("terminal-input", (data) => {
        console.log(`[${socket.id}] Input received: ${data}`);
        
        // Remove newline if present
        const command = data.trim();
        
        if (!command) {
            return;
        }

        // Execute command in the working directory
        exec(command, { cwd: WORKING_DIR, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            // Send stdout
            if (stdout) {
                console.log(`[${socket.id}] Output: ${stdout.substring(0, 100)}`);
                socket.emit('terminal-output', stdout);
            }

            // Send stderr if any
            if (stderr) {
                console.log(`[${socket.id}] Error: ${stderr.substring(0, 100)}`);
                socket.emit('terminal-output', stderr);
            }

            // Send command prompt
            socket.emit('terminal-output', `\r\n$ `);

            if (error) {
                console.error(`[${socket.id}] Command error:`, error.message);
            }
        });
    });

    socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
        socketCommandMap.delete(socket.id);
    });
});

/**
 * @route GET /list-files
 */
app.get("/list-files", async (req, res) => {
    const listFiles = async (dir, baseDir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        const files = [];

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            if (entry.isDirectory() && ['node_modules', '.git', 'dist'].includes(entry.name)) {
                continue;
            }

            if (entry.isDirectory()) {
                files.push(...await listFiles(fullPath, baseDir));
            } else {
                files.push(relativePath);
            }
        }

        return files;
    };

    try {
        const files = await listFiles(WORKING_DIR, WORKING_DIR);
        res.status(200).json({
            message: 'Files listed successfully',
            files,
        });
    } catch (err) {
        res.status(500).json({
            message: `Error listing files: ${err.message}`,
            status: 'error',
        });
    }
});

/**
 * @route GET /read-files
 */
app.get("/read-files", async (req, res) => {
    const files = req.query.files;

    if (!files) {
        return res.status(400).json({
            message: 'No files specified in query parameter',
            status: 'error',
        });
    }

    const fileList = files.split(',');

    const results = await Promise.all(fileList.map(async (file) => {
        const filePath = path.join(WORKING_DIR, file);
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return {
                [filePath.replace(WORKING_DIR, '')]: content,
            };
        } catch (err) {
            return {
                [filePath.replace(WORKING_DIR, '')]: `Error reading file: ${err.message}`,
            };
        }
    }));

    res.status(200).json({
        message: 'File contents',
        files: results,
    });
});

/**
 * @route PATCH /update-files
 */
app.patch("/update-files", async (req, res) => {
    const updates = req.body.updates;

    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            message: 'Invalid request body. Expected a JSON object with an "updates" property containing an array of file updates.',
            status: 'error',
        });
    }

    const results = await Promise.all(updates.map(async (update) => {
        const { file, content } = update;
        const filePath = path.join(WORKING_DIR, file);
        try {
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs.promises.writeFile(filePath, content, 'utf-8');
            return {
                [filePath]: 'File updated successfully',
            };
        } catch (err) {
            return {
                [filePath]: `Error updating file: ${err.message}`,
            };
        }
    }));

    res.status(200).json({
        message: 'File update results',
        results,
    });
});

/**
 * @route POST /create-files
 */
app.post("/create-files", async (req, res) => {
    const files = req.body.files;

    if (!files || !Array.isArray(files)) {
        return res.status(400).json({
            message: 'Invalid request body. Expected a JSON object with a "files" property containing an array of file objects.',
            status: 'error',
        });
    }

    const results = await Promise.all(files.map(async (fileObj) => {
        const { file, content } = fileObj;
        const filePath = path.join(WORKING_DIR, file);
        try {
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs.promises.writeFile(filePath, content, 'utf-8');
            return {
                [filePath]: 'File created successfully',
            };
        } catch (err) {
            return {
                [filePath]: `Error creating file: ${err.message}`,
            };
        }
    }));

    res.status(200).json({
        message: 'File creation results',
        results,
    });
});

export default httpServer;