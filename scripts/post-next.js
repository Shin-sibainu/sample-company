import { TwitterApi } from "twitter-api-v2";
import fs from "node:fs";
import path from "node:path";

const DRAFTS_DIR = "drafts";

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

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

function findLatestDraft() {
  if (!fs.existsSync(DRAFTS_DIR)) {
    console.error(`No ${DRAFTS_DIR}/ directory found`);
    process.exit(0);
  }
  const files = fs
    .readdirSync(DRAFTS_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort()
    .reverse();
  if (files.length === 0) {
    console.log("No drafts to post. Exiting.");
    process.exit(0);
  }
  return path.join(DRAFTS_DIR, files[0]);
}

function parseDraft(content) {
  const posts = [];
  const sections = content.split(/\n---\n/);
  for (const section of sections) {
    const headerMatch = section.match(/##\s*投稿(\d+)[（(]([^）)]+)[）)]/);
    if (!headerMatch) continue;
    const num = parseInt(headerMatch[1], 10);
    const type = headerMatch[2];

    const lines = section.split("\n");
    const bodyLines = [];
    let afterBlockquote = false;
    for (const line of lines) {
      if (line.startsWith("##")) continue;
      if (line.startsWith(">")) {
        afterBlockquote = true;
        continue;
      }
      if (afterBlockquote) bodyLines.push(line);
    }
    const body = bodyLines.join("\n").trim();
    if (body) posts.push({ num, type, body });
  }
  return posts;
}

function parseLog(content) {
  const logSection = content.split("## 投稿ログ")[1];
  if (!logSection) return {};
  const status = {};
  const re = /投稿(\d+):\s*([^\n(]+?)(?:\s*\(ID:\s*(\d+)\))?$/gm;
  let m;
  while ((m = re.exec(logSection)) !== null) {
    const num = parseInt(m[1], 10);
    status[num] = { state: m[2].trim(), id: m[3] || null };
  }
  return status;
}

function updateLog(content, num, tweetId) {
  const [before, logPart] = content.split("## 投稿ログ");
  if (!logPart) return content;
  const updated = logPart.replace(
    new RegExp(`(投稿${num}:\\s*)[^\\n]+`),
    `$1✅ 投稿済み (ID: ${tweetId})`,
  );
  return `${before}## 投稿ログ${updated}`;
}

async function main() {
  const draftPath = findLatestDraft();
  const content = fs.readFileSync(draftPath, "utf-8");
  const posts = parseDraft(content);
  const status = parseLog(content);

  console.log(`Draft: ${draftPath}`);
  console.log(`Posts: ${posts.length}`);
  console.log(`Status:`, status);

  const next = posts.find((p) => {
    const s = status[p.num];
    return !s || !s.state.includes("投稿済み");
  });

  if (!next) {
    console.log("All posts already published. Nothing to do.");
    process.exit(0);
  }

  console.log(`Posting #${next.num} (${next.type}):`);
  console.log(next.body);

  const result = await client.v2.tweet(next.body);
  const tweetId = result.data.id;
  console.log(`✅ Posted. Tweet ID: ${tweetId}`);

  const updated = updateLog(content, next.num, tweetId);
  fs.writeFileSync(draftPath, updated, "utf-8");
  console.log(`Log updated: ${draftPath}`);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
