import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
    try {
        const { message, projectId } = req.body;

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        });

        const stream = await agent.stream(
            {
                messages: [
                    {
                        role: "user",
                        content: message,
                    },
                ],
            },
            {
                context: {
                    projectId,
                },
                streamMode: "values",
            }
        );

        for await (const chunk of stream) {
            res.write(
                `data: ${JSON.stringify(chunk)}\n\n`
            );
        }

        res.end();
    } catch (error) {
        console.error("Error invoking agent:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                error: error.message || "Failed to invoke agent",
            });
        }

        res.end();
    }
});

export default agentRouter;
