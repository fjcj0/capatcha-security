import { client } from "../config/redis.config.js";
import { getFingerPrint } from "../utils/utils.js";
import svgCapatcha from "svg-captcha";
const LIMIT = 10;
const WINDOW = 60;
const CAPATCH_TTL = 300;
export async function limitRequests(request, response, next) {
    try {
        const fp = getFingerPrint(request);
        const requiredKey = `capatcha:${fp}:required`;
        const passedKey = `capatcha:${fp}:passed`;
        const required = await client.get(requiredKey);
        const passed = await client.get(passedKey);
        if (required === "1" && passed !== "1") {
            const capatacha = svgCapatcha.create({
                noise: 3,
                color: true,
                size: 5,
            });
            await client.set(
                `capatcha:${fp}:challange`,
                capatacha.text,
                { EX: CAPATCH_TTL }
            );
            return response.status(403).json({
                success: false,
                message: "Captcha required",
                capatachaRequired: true,
                capatacha: capatacha.data,
            });
        }
        const key = `request:${fp}`;
        const count = await client.incr(key);
        if (count === 1) {
            await client.expire(key, WINDOW);
        }
        if (count > LIMIT) {
            const capatacha = svgCapatcha.create({
                noise: 3,
                color: true,
                size: 5,
            });
            await client.set(
                `capatcha:${fp}:challange`,
                capatacha.text,
                { EX: CAPATCH_TTL }
            );
            await client.set(requiredKey, "1", {
                EX: CAPATCH_TTL,
            });
            return response.status(429).json({
                success: false,
                capatachaRequired: true,
                capatacha: capatacha.data,
                message: "Solve captcha to continue",
            });
        }
        next();
    } catch (error) {
        return response.status(500).json({
            success: false,
            error: `Internal Server Error: ${error instanceof Error ? error.message : error}`,
        });
    }
}