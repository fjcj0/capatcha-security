import 'dotenv/config';
import express from "express";
import morgan from "morgan";
import { connectRedis } from "./config/redis.config.js";
import { limitRequests } from "./middlewares/server.guard.js";
import svgCapatcha from 'svg-captcha';
const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(morgan("dev"));
app.get("/data", limitRequests, (request, response) => {
    return response.status(200).json({
        success: true,
        message: "Access granted",
    });
});
app.post("/submit", limitRequests, async (request, response) => {
    try {
        const { value } = request.body;
        const isValid = value === "correct";
        const fp = getFingerPrint(request);
        if (!isValid) {
            const capatcha = svgCapatcha.create({
                noise: 3,
                color: true,
                size: 5,
            });
            await client.set(
                `capatcha:${fp}:challange`,
                capatcha.text,
                { EX: CAPATCH_TTL }
            );
            await client.set(`capatcha:${fp}:required`, "1", {
                EX: CAPATCH_TTL,
            });
            return response.status(400).json({
                success: false,
                error: "Invalid input, capatcha regenerated",
                capatchaRequired: true,
                capatcha: capatcha.data,
            });
        }
        await client.set(`capatcha:${fp}:passed`, "1", {
            EX: CAPATCH_TTL,
        });
        return response.status(200).json({
            success: true,
            message: "Data accepted",
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            error: `Internal Server Error: ${error instanceof Error ? error.message : error}`,
        });
    }
});
(async () => {
    await connectRedis();
    app.listen(2500, () =>
        console.log("Server running on http://localhost:2500")
    );
})();