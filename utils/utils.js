import crypto from "crypto";
export function getFingerPrint(request) {
    const raw = [
        request.ip,
        request.headers["user-agent"] || "null",
        request.headers["accept-language"] || "null",
        request.headers["sec-ch-ua"] || "null",
        request.headers["sec-fetch-site"] || "null",
    ].join("|");
    return crypto
        .createHash("sha256")
        .update(raw)
        .digest("hex");
}