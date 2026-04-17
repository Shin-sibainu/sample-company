import { TwitterApi } from "twitter-api-v2";

const required = [
  "TWITTER_API_KEY",
  "TWITTER_API_SECRET",
  "TWITTER_ACCESS_TOKEN",
  "TWITTER_ACCESS_SECRET",
];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Missing env var: ${k}`);
    process.exit(1);
  }
}

const text = process.argv[2];
if (!text) {
  console.error("Usage: node scripts/post-tweet.js <tweet_text>");
  process.exit(1);
}

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const result = await client.v2.tweet(text);
console.log(`Posted. Tweet ID: ${result.data.id}`);
