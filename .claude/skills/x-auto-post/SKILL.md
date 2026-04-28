---
name: x-auto-post
description: Claude Code関連の海外トレンド・ニュースを収集し、日本語でカジュアルにリライトしてX投稿の下書きを生成するスキル。「X投稿」「ツイート作成」「下書き生成」「今日の投稿」「Claude Codeのネタ」「トレンド収集して投稿」などと言われたら使う。情報収集から下書きファイル出力、scripts/post-tweet.js経由の投稿まで一貫して対応する。
---

# X自動投稿スキル — Claude Code 情報発信

Claude Codeに関する海外の最新情報を収集し、日本語のX投稿として下書き・投稿するスキル。
**researcher（リサーチ部）と content-writer（コンテンツ部）の2つのサブエージェントで分業する。**

サブエージェント定義: `.claude/agents/researcher.md`, `.claude/agents/content-writer.md`

## ワークフロー概要

```
STEP 0: 日付確認
STEP 1: @researcher → 情報収集（バックグラウンド可）
STEP 2: @content-writer → 下書き生成
STEP 3: ユーザーに結果を提示
STEP 4: 投稿（GitHub Actions or 手動）
```

---

## STEP 0: 日付確認 & 対象日決定

**最初に今日の日付を必ず確認する。** システムから提供される現在日時を使い、情報収集の期間（直近1週間）を正確に判定する。

### 対象日の自動決定ロジック（完全自動実行向け）

Routines 等から無人で起動される場合、以下の優先順位で **対象日** を決める:

1. `drafts/YYYY-MM-DD.md`（今日分）が存在しない → **今日分**を作成
2. 今日分が存在し、4投稿すべて未投稿 → **スキップして終了**（重複生成しない）
3. 今日分が存在し、1件以上投稿済み → **翌日分 `YYYY-MM-DD.md`** を作成
4. 翌日分も既にある場合 → スキップして終了

このロジックにより、毎日同じRoutineで起動しても不要な再生成や上書きが発生しない。

---

## STEP 1: researcher サブエージェント（情報収集）

`researcher` サブエージェントを起動する:

```
@"researcher (agent)" 今日は{YYYY-MM-DD}です。Claude Code関連の最新トレンドを収集してください。
```

### 出力先

`.company/research/inbox/{YYYY-MM-DD}.md`

### バックグラウンド実行

ユーザーが「先にネタだけ集めて」「調査だけ回して」と言った場合は、バックグラウンドで起動する。調査完了の通知が届いたらSTEP 2に進むか確認する。

---

## STEP 2: content-writer サブエージェント（下書き生成）

STEP 1 完了後、`content-writer` サブエージェントを起動する:

```
@"content-writer (agent)" 今日は{YYYY-MM-DD}です。リサーチ結果を元にX投稿の下書きを生成してください。
```

### 入力

`.company/research/inbox/{YYYY-MM-DD}.md`（STEP 1 の出力）

### 出力先

`drafts/{YYYY-MM-DD}.md`

---

## STEP 3: ユーザーへの結果提示

content-writer 完了後、`drafts/{YYYY-MM-DD}.md` を読み、ユーザーに以下を伝える:

- ファイルパスの案内
- 4投稿の簡単なサマリー（各1行、文字数付き）
- 投稿スケジュール（6時間ごと: 09:00 / 15:00 / 21:00 / 03:00）
- 「GitHub Actionsが自動で投稿します」と案内
- または「手動で投稿しますか？」と確認（ユーザー対話時）

### Routines 無人実行時

下書き生成後は **承認プロセスを挟まず main ブランチへ直接 commit & push する**。

```bash
git checkout main && git pull origin main
git add drafts/YYYY-MM-DD.md
git commit -m "add: drafts for YYYY-MM-DD"
git push origin main
```

push成功後、サマリー（ファイルパス・4投稿の概要・文字数）を出力して終了。

---

## STEP 4: 投稿（GitHub Actions 自動投稿）

下書きを `drafts/` に出力し、git push すると GitHub Actions が 6 時間おきに未投稿分を 1 件ずつ X へ投稿する。

**仕組み:**

- `.github/workflows/post.yml` が 9:00 / 15:00 / 21:00 / 03:00 (JST) に起動
- `scripts/post-next.js` が `drafts/` から未投稿の投稿を 1 件見つけて投稿
- 投稿後に投稿ログを更新し、自動で commit & push

**前提:**

- GitHub Secrets に X API キー 4 つが登録済み

**手順:**

1. ユーザーに内容を確認してもらう（Routines無人実行時はスキップ）
2. 承認されたら git add → commit → push
   ```bash
   git checkout main && git pull origin main
   git add drafts/ && git commit -m "add: drafts for YYYY-MM-DD"
   git push origin main
   ```
3. あとは GitHub Actions が自動で投稿（6 時間ごと）
4. 手動で即時投稿したい場合は Actions タブ → `X Auto Post` → `Run workflow`

**自動トリガー構成（参考）:**

- Routines が定時に本スキルを起動 → drafts を main に push
- GitHub Actions cron（9/15/21/03 JST）が投稿を実行
- この二段構えで人間の介在なしに回る

**手動で 1 件だけ投稿したい場合:**

```bash
node scripts/post-tweet.js "投稿本文をここに"
```

---

## セーフガード

- CTA付き投稿が連続しないようチェック
- 同じネタの重複投稿を防止（過去の下書きファイルと照合）
- 投稿後にログを `drafts/` に記録（投稿済みフラグを付与）
- 異常があれば Actions ログに記録
