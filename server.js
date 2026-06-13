import 'dotenv/config';
import express from "express";
import morgan from "morgan";
import { connectRedis } from "./config/redis.config.js";
import { limitRequests } from "./middlewares/server.guard.js";
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
(async () => {
    await connectRedis();
    app.listen(2500, () =>
        console.log("Server running on http://localhost:2500")
    );
})();