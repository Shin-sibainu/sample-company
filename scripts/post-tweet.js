import { TwitterApi } from "twitter-api-v2";
import fs from "node:fs";
import path from "node:path";

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

function getTodayJST() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

function parseArgs(argv) {
  const args = { slot: null, date: null, text: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--slot") args.slot = parseInt(argv[++i], 10);
    else if (a === "--date") args.date = argv[++i];
    else if (args.text == null) args.text = a;
  }
  return args;
}

function extractSlot(md, slot) {
  const re = new RegExp(
    `##\\s*投稿${slot}[^\\n]*\\n([\\s\\S]*?)\\n---`,
    "m"
  );
  const m = md.match(re);
  if (!m) return null;
  const lines = m[1].split("\n");
  const body = [];
  let started = false;
  for (const line of lines) {
    if (!started) {
      if (line.startsWith(">") || line.trim() === "") continue;
      started = true;
    }
    body.push(line);
  }
  return body.join("\n").trim();
}

function isAlreadyPosted(md, slot) {
  return new RegExp(`-\\s*投稿${slot}:\\s*✅`, "m").test(md);
}

function updateLog(md, slot, tweetId) {
  return md.replace(
    new RegExp(`(-\\s*投稿${slot}:)\\s*未投稿`, "m"),
    `$1 ✅ 投稿済み (ID: ${tweetId})`
  );
}

const args = parseArgs(process.argv);

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

if (args.slot) {
  const date = args.date || getTodayJST();
  const file = path.join("drafts", `${date}.md`);
  if (!fs.existsSync(file)) {
    console.error(`Draft not found: ${file}`);
    process.exit(1);
  }
  const md = fs.readFileSync(file, "utf8");
  if (isAlreadyPosted(md, args.slot)) {
    console.log(`Slot ${args.slot} already posted. Skipping.`);
    process.exit(0);
  }
  const body = extractSlot(md, args.slot);
  if (!body) {
    console.error(`Slot ${args.slot} not found in ${file}`);
    process.exit(1);
  }
  console.log(`Posting slot ${args.slot} from ${file} (${body.length} chars)`);
  const result = await client.v2.tweet(body);
  const id = result.data.id;
  console.log(`Posted. Tweet ID: ${id}`);
  fs.writeFileSync(file, updateLog(md, args.slot, id));
  console.log(`Log updated: ${file}`);
} else if (args.text) {
  const result = await client.v2.tweet(args.text);
  console.log(`Posted. Tweet ID: ${result.data.id}`);
} else {
  console.error("Usage: node scripts/post-tweet.js --slot <N> [--date YYYY-MM-DD]");
  console.error("       node scripts/post-tweet.js <tweet_text>");
  process.exit(1);
}
