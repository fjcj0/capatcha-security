import { createClient } from "redis";
const client = createClient();
client.on("error", (err) => {
    console.log("Redis Error:", err);
});
export async function connectRedis() {
    try {
        await client.connect();
        console.log("Redis Connected");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
export { client };