# X投稿下書き — 2026-04-13

## 投稿1（速報型）
> ソース: [Computer use feature now available in Claude Code CLI - The Tech Outlook](https://www.thetechoutlook.com/new-release/software-apps/computer-use-feature-now-available-in-claude-code-cli/)

Claude CodeのCLIにComputer Useが来た。ターミナルからネイティブアプリを開いて、UIをクリックして、自分が書いたコードを自分でテストして、壊れたら直すところまでやる。APIがないアプリのテストを丸ごと任せられるのがでかい。/mcpからcomputer-useをオンにするだけ。Pro/Maxプランで研究プレビュー中。

---

## 投稿2（解説型・CTA付き）
> ソース: [Claude Code Source Leaked via npm Packaging Error - The Hacker News](https://thehackernews.com/2026/04/claude-code-tleaked-via-npm-packaging.html)

3月末にClaude Codeのソースコード51.2万行がnpmから漏れた件、海外で大騒ぎになってる。原因は.npmignoreの設定漏れでソースマップが丸ごと公開。発見者のツイートは2100万viewを超えて、クリーンルーム版の再実装リポジトリが2時間で5万スターついたらしい。漏れたのはモデル本体じゃなくてエージェント基盤のコードだけど、ツール呼び出しやマルチエージェントの設計が丸見えになった。詳しい解説はこちら https://claude-code-academy.dev/

---

## 投稿3（Tips型）
> ソース: [Claude Code Tips: 45 tips for getting the most out of Claude Code - GitHub](https://github.com/ykdojo/claude-code-tips)

💡 Claude Codeの/rewind知ってた？会話履歴とコードの状態を好きなチェックポイントまで巻き戻せるやつ。「この方針で試してみて、ダメだったら戻す」が一瞬でできる。実験的な実装を気軽に試せるようになるから、使ってない人は今日から試してみて。

---

## メモ
- 投稿順の推奨: 朝に速報型 → 昼に解説型 → 夜にTips型
- 今日のCTA: 投稿2に含む
