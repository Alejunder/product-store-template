import arcjet, {tokenBucket, shield, detectBot} from "@arcjet/node";

import "dotenv/config.js";

// init arcjet

export const aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
        // shield protects your app from common atacks like DDoS, brute-force, credential stuffing, etc.
        shield({mode: "LIVE"}),
        detectBot({
            mode: "LIVE",
            // block all bots except search engines like Google, Bing, etc.
            allow: [
                "CATEGORY: SEARCH_ENGINE"
                // see the full list at https://arcjet.com/bot-list
            ],
        }),
        // rate limiting

        tokenBucket({
            mode: "LIVE",
            refillRate: 30, // 30 tokens per second
            interval: 5, // per second
            capacity: 20, // maximum 20 tokens
        })
    ],
});