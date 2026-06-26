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

        // Create writer function to stream tool activity to client in real-time
        const writer = (text) => res.write(text);

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
                    writer,  // Pass writer to agent context so tools can use it
                },
                streamMode: "values",
            }
        );

        for await (const chunk of stream) {
            res.write(
                `data: ${JSON.stringify(chunk)}\n\n`
            );
        }

        // Ensure response is properly ended
        res.write("data: [DONE]\n\n");
        res.end();
    } catch (error) {
        console.error("Error invoking agent:", error);

        // Only send error response if headers haven't been sent yet
        if (!res.headersSent) {
            return res.status(500).json({
                error: error.message || "Failed to invoke agent",
            });
        } else {
            // Headers already sent; clean stream end
            res.write(`Error: ${error.message}\n\n`);
            res.end();
        }
    }
});

export default agentRouter;