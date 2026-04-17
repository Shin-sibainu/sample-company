const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaTerminal, FaCode, FaRocket, FaMagic, FaCogs, FaLightbulb,
  FaCheckCircle, FaDownload, FaKeyboard, FaPlug, FaBook, FaArrowRight
} = require("react-icons/fa");

// --- Icon Helper ---
function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// --- Color Palette ---
const C = {
  darkBg:    "1A1B2E",
  darkBg2:   "242540",
  cream:     "F8F5F0",
  warmWhite: "FFFFFF",
  amber:     "D4956A",
  amberLight:"F0D4B8",
  amberDark: "B87A4F",
  text:      "2C2C3E",
  textMuted: "6B6B80",
  accent:    "E8985E",
  cardBg:    "FFFFFF",
  cardBorder:"E8E4DE",
  teal:      "2A9D8F",
  navy:      "264653",
};

// --- Fonts ---
const TITLE_FONT = "Georgia";
const BODY_FONT  = "Calibri";

// --- Shadow helper (fresh object each time) ---
const cardShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.10 });

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
  pres.author = "Claude Code";
  pres.title = "Claude Code入門";

  // Pre-render all icons
  const icons = {
    terminal:  await iconToBase64Png(FaTerminal,    "#" + C.amber, 256),
    code:      await iconToBase64Png(FaCode,         "#" + C.amber, 256),
    rocket:    await iconToBase64Png(FaRocket,       "#" + C.amber, 256),
    magic:     await iconToBase64Png(FaMagic,        "#" + C.amber, 256),
    cogs:      await iconToBase64Png(FaCogs,         "#" + C.amber, 256),
    lightbulb: await iconToBase64Png(FaLightbulb,    "#" + C.amber, 256),
    check:     await iconToBase64Png(FaCheckCircle,  "#" + C.teal,  256),
    download:  await iconToBase64Png(FaDownload,     "#" + C.amber, 256),
    keyboard:  await iconToBase64Png(FaKeyboard,     "#" + C.amber, 256),
    plug:      await iconToBase64Png(FaPlug,         "#" + C.amber, 256),
    book:      await iconToBase64Png(FaBook,         "#FFFFFF",     256),
    arrow:     await iconToBase64Png(FaArrowRight,   "#" + C.amber, 256),
    // White versions for dark bg
    terminalW: await iconToBase64Png(FaTerminal,     "#FFFFFF",     256),
    rocketW:   await iconToBase64Png(FaRocket,       "#FFFFFF",     256),
    checkW:    await iconToBase64Png(FaCheckCircle,  "#" + C.amberLight, 256),
  };

  // ========================================
  // SLIDE 1: Title
  // ========================================
  {
    const s = pres.addSlide();
    s.background = { color: C.darkBg };

    // Decorative top-right shape
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.0, y: -0.5, w: 4.0, h: 2.5,
      fill: { color: C.darkBg2 },
      rotate: 15,
    });

    // Decorative bottom-left shape
    s.addShape(pres.shapes.RECTANGLE, {
      x: -1.0, y: 4.0, w: 4.0, h: 2.5,
      fill: { color: C.darkBg2 },
      rotate: -10,
    });

    // Accent line
    s.addShape(pres.shapes.RECTANGLE, {
      x: 1.0, y: 1.8, w: 1.2, h: 0.06,
      fill: { color: C.amber },
    });

    // Terminal icon
    s.addImage({ data: icons.terminalW, x: 1.0, y: 1.0, w: 0.55, h: 0.55 });

    // Title
    s.addText("Claude Code入門", {
      x: 1.0, y: 2.1, w: 8.0, h: 1.2,
      fontFace: TITLE_FONT, fontSize: 44, color: "FFFFFF",
      bold: true, margin: 0,
    });

    // Subtitle
    s.addText("AIと一緒にコードを書く、新しい開発体験", {
      x: 1.0, y: 3.2, w: 8.0, h: 0.6,
      fontFace: BODY_FONT, fontSize: 18, color: C.amberLight,
      margin: 0,
    });

    // Bottom tag
    s.addText("Powered by Anthropic", {
      x: 1.0, y: 4.8, w: 4.0, h: 0.4,
      fontFace: BODY_FONT, fontSize: 12, color: C.textMuted, italic: true,
      margin: 0,
    });
  }

  // ========================================
  // SLIDE 2: Claude Codeとは？
  // ========================================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };

    // Title
    s.addText("Claude Codeとは？", {
      x: 0.8, y: 0.4, w: 8.4, h: 0.8,
      fontFace: TITLE_FONT, fontSize: 36, color: C.text, bold: true, margin: 0,
    });

    // Accent bar below title
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.15, w: 1.0, h: 0.05,
      fill: { color: C.amber },
    });

    // Left column: Description card
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.6, w: 5.0, h: 3.4,
      fill: { color: C.cardBg },
      shadow: cardShadow(),
    });

    // Left accent bar on card
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.6, w: 0.07, h: 3.4,
      fill: { color: C.amber },
    });

    s.addImage({ data: icons.terminal, x: 1.2, y: 1.9, w: 0.45, h: 0.45 });

    s.addText("ターミナルで動くAIアシスタント", {
      x: 1.8, y: 1.9, w: 3.8, h: 0.45,
      fontFace: BODY_FONT, fontSize: 16, color: C.text, bold: true, margin: 0,
      valign: "middle",
    });

    s.addText([
      { text: "Claude Codeは、Anthropic公式のCLIツールです。", options: { breakLine: true } },
      { text: "", options: { breakLine: true, fontSize: 8 } },
      { text: "ターミナル上でClaudeと対話しながら、コードの", options: { breakLine: true } },
      { text: "作成・編集・デバッグ・リファクタリングなど、", options: { breakLine: true } },
      { text: "あらゆる開発タスクをこなすことができます。", options: { breakLine: true } },
      { text: "", options: { breakLine: true, fontSize: 8 } },
      { text: "ファイルの読み書き、コマンド実行、Git操作まで、", options: { breakLine: true } },
      { text: "開発ワークフロー全体をサポートします。", options: {} },
    ], {
      x: 1.2, y: 2.6, w: 4.3, h: 2.2,
      fontFace: BODY_FONT, fontSize: 14, color: C.text,
      lineSpacingMultiple: 1.3, margin: 0,
    });

    // Right column: Key points
    const points = [
      { icon: icons.code,   label: "コード生成・編集" },
      { icon: icons.magic,   label: "バグ修正・リファクタ" },
      { icon: icons.cogs,    label: "コマンド実行・Git操作" },
      { icon: icons.lightbulb, label: "コードの解説・質問応答" },
    ];

    points.forEach((p, i) => {
      const yBase = 1.6 + i * 0.85;
      // Card background
      s.addShape(pres.shapes.RECTANGLE, {
        x: 6.2, y: yBase, w: 3.2, h: 0.7,
        fill: { color: C.cardBg },
        shadow: cardShadow(),
      });
      // Icon circle
      s.addShape(pres.shapes.OVAL, {
        x: 6.4, y: yBase + 0.1, w: 0.5, h: 0.5,
        fill: { color: C.cream },
      });
      s.addImage({ data: p.icon, x: 6.5, y: yBase + 0.2, w: 0.3, h: 0.3 });
      // Label
      s.addText(p.label, {
        x: 7.1, y: yBase, w: 2.1, h: 0.7,
        fontFace: BODY_FONT, fontSize: 14, color: C.text, bold: true,
        valign: "middle", margin: 0,
      });
    });
  }

  // ========================================
  // SLIDE 3: セットアップ
  // ========================================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };

    s.addText("セットアップ", {
      x: 0.8, y: 0.4, w: 8.4, h: 0.8,
      fontFace: TITLE_FONT, fontSize: 36, color: C.text, bold: true, margin: 0,
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.15, w: 1.0, h: 0.05,
      fill: { color: C.amber },
    });

    // Step cards
    const steps = [
      {
        num: "01",
        title: "インストール",
        desc: "npm install -g @anthropic-ai/claude-code",
        icon: icons.download,
      },
      {
        num: "02",
        title: "認証",
        desc: "claude コマンドを実行し、Anthropicアカウントでログイン",
        icon: icons.keyboard,
      },
      {
        num: "03",
        title: "起動",
        desc: "プロジェクトのディレクトリで claude を実行して開始",
        icon: icons.rocket,
      },
    ];

    steps.forEach((step, i) => {
      const yBase = 1.5 + i * 1.25;

      // Card
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.8, y: yBase, w: 8.4, h: 1.05,
        fill: { color: C.cardBg },
        shadow: cardShadow(),
      });

      // Number circle
      s.addShape(pres.shapes.OVAL, {
        x: 1.1, y: yBase + 0.17, w: 0.7, h: 0.7,
        fill: { color: C.amber },
      });
      s.addText(step.num, {
        x: 1.1, y: yBase + 0.17, w: 0.7, h: 0.7,
        fontFace: TITLE_FONT, fontSize: 20, color: "FFFFFF",
        bold: true, align: "center", valign: "middle", margin: 0,
      });

      // Icon
      s.addImage({ data: step.icon, x: 2.1, y: yBase + 0.22, w: 0.45, h: 0.45 });

      // Title
      s.addText(step.title, {
        x: 2.8, y: yBase + 0.08, w: 5.5, h: 0.45,
        fontFace: BODY_FONT, fontSize: 18, color: C.text, bold: true,
        valign: "middle", margin: 0,
      });

      // Description (code-like for step 1)
      s.addText(step.desc, {
        x: 2.8, y: yBase + 0.52, w: 5.8, h: 0.4,
        fontFace: i === 0 ? "Consolas" : BODY_FONT,
        fontSize: i === 0 ? 12 : 13,
        color: i === 0 ? C.amberDark : C.textMuted,
        valign: "middle", margin: 0,
      });

      // Arrow between steps
      if (i < steps.length - 1) {
        s.addImage({ data: icons.arrow, x: 4.8, y: yBase + 1.06, w: 0.3, h: 0.3 });
      }
    });
  }

  // ========================================
  // SLIDE 4: 基本的な使い方
  // ========================================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };

    s.addText("基本的な使い方", {
      x: 0.8, y: 0.4, w: 8.4, h: 0.8,
      fontFace: TITLE_FONT, fontSize: 36, color: C.text, bold: true, margin: 0,
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.15, w: 1.0, h: 0.05,
      fill: { color: C.amber },
    });

    // Terminal-style card (left)
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.5, w: 5.2, h: 3.6,
      fill: { color: "1E1E2E" },
      shadow: cardShadow(),
    });

    // Terminal title bar
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.5, w: 5.2, h: 0.4,
      fill: { color: "2D2D44" },
    });

    // Dots
    s.addShape(pres.shapes.OVAL, { x: 1.0, y: 1.6, w: 0.15, h: 0.15, fill: { color: "FF5F57" } });
    s.addShape(pres.shapes.OVAL, { x: 1.25, y: 1.6, w: 0.15, h: 0.15, fill: { color: "FEBC2E" } });
    s.addShape(pres.shapes.OVAL, { x: 1.5, y: 1.6, w: 0.15, h: 0.15, fill: { color: "28C840" } });

    s.addText("Terminal", {
      x: 1.8, y: 1.5, w: 3.0, h: 0.4,
      fontFace: BODY_FONT, fontSize: 11, color: "888899",
      valign: "middle", margin: 0,
    });

    // Terminal content
    s.addText([
      { text: "$ claude", options: { color: "28C840", fontFace: "Consolas", breakLine: true } },
      { text: "", options: { fontSize: 8, breakLine: true } },
      { text: "> このファイルのバグを修正して", options: { color: C.amberLight, fontFace: "Consolas", breakLine: true } },
      { text: "", options: { fontSize: 8, breakLine: true } },
      { text: "  ファイルを読み込んでいます...", options: { color: "888899", fontFace: "Consolas", breakLine: true } },
      { text: "  バグを特定しました。修正します。", options: { color: "888899", fontFace: "Consolas", breakLine: true } },
      { text: "", options: { fontSize: 8, breakLine: true } },
      { text: "  ✓ src/app.ts を修正しました", options: { color: "28C840", fontFace: "Consolas", breakLine: true } },
      { text: "  ✓ テストが全てパスしました", options: { color: "28C840", fontFace: "Consolas" } },
    ], {
      x: 1.1, y: 2.1, w: 4.6, h: 2.8,
      fontSize: 12, lineSpacingMultiple: 1.2, margin: 0,
    });

    // Right side: Usage examples
    const usages = [
      { title: "自然言語で指示", desc: "日本語でやりたいことを\n伝えるだけでOK" },
      { title: "コンテキスト理解", desc: "プロジェクト全体を把握し\n最適な変更を提案" },
      { title: "安全な実行", desc: "変更前に確認を求め\nリスクのある操作を防止" },
    ];

    usages.forEach((u, i) => {
      const yBase = 1.5 + i * 1.2;

      s.addShape(pres.shapes.RECTANGLE, {
        x: 6.3, y: yBase, w: 3.1, h: 1.0,
        fill: { color: C.cardBg },
        shadow: cardShadow(),
      });

      s.addShape(pres.shapes.RECTANGLE, {
        x: 6.3, y: yBase, w: 0.06, h: 1.0,
        fill: { color: C.amber },
      });

      s.addText(u.title, {
        x: 6.6, y: yBase + 0.08, w: 2.6, h: 0.35,
        fontFace: BODY_FONT, fontSize: 14, color: C.text, bold: true,
        margin: 0,
      });

      s.addText(u.desc, {
        x: 6.6, y: yBase + 0.45, w: 2.6, h: 0.5,
        fontFace: BODY_FONT, fontSize: 11, color: C.textMuted,
        margin: 0,
      });
    });
  }

  // ========================================
  // SLIDE 5: 便利な機能
  // ========================================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };

    s.addText("便利な機能", {
      x: 0.8, y: 0.4, w: 8.4, h: 0.8,
      fontFace: TITLE_FONT, fontSize: 36, color: C.text, bold: true, margin: 0,
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.15, w: 1.0, h: 0.05,
      fill: { color: C.amber },
    });

    // 2x3 grid of feature cards
    const features = [
      { icon: icons.keyboard, title: "スラッシュコマンド", desc: "/commit, /review-pr など\nワンコマンドで定型操作" },
      { icon: icons.plug,     title: "MCP連携",           desc: "外部ツール・サービスと\nシームレスに接続" },
      { icon: icons.cogs,     title: "Hooks",             desc: "ツール実行時に\nカスタムスクリプトを自動実行" },
      { icon: icons.code,     title: "マルチファイル編集", desc: "複数ファイルを同時に\n理解・編集" },
      { icon: icons.magic,    title: "Git操作",           desc: "コミット、ブランチ作成\nPR作成をAIがサポート" },
      { icon: icons.lightbulb,title: "CLAUDE.md",         desc: "プロジェクト固有の\nルールや指示を定義" },
    ];

    features.forEach((f, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const xBase = 0.8 + col * 3.05;
      const yBase = 1.5 + row * 1.85;

      // Card
      s.addShape(pres.shapes.RECTANGLE, {
        x: xBase, y: yBase, w: 2.8, h: 1.65,
        fill: { color: C.cardBg },
        shadow: cardShadow(),
      });

      // Icon circle
      s.addShape(pres.shapes.OVAL, {
        x: xBase + 0.2, y: yBase + 0.2, w: 0.55, h: 0.55,
        fill: { color: C.cream },
      });
      s.addImage({ data: f.icon, x: xBase + 0.3, y: yBase + 0.3, w: 0.35, h: 0.35 });

      // Title
      s.addText(f.title, {
        x: xBase + 0.9, y: yBase + 0.2, w: 1.7, h: 0.5,
        fontFace: BODY_FONT, fontSize: 14, color: C.text, bold: true,
        valign: "middle", margin: 0,
      });

      // Description
      s.addText(f.desc, {
        x: xBase + 0.2, y: yBase + 0.9, w: 2.4, h: 0.6,
        fontFace: BODY_FONT, fontSize: 11, color: C.textMuted,
        margin: 0,
      });
    });
  }

  // ========================================
  // SLIDE 6: 活用のヒント
  // ========================================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };

    s.addText("活用のヒント", {
      x: 0.8, y: 0.4, w: 8.4, h: 0.8,
      fontFace: TITLE_FONT, fontSize: 36, color: C.text, bold: true, margin: 0,
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.15, w: 1.0, h: 0.05,
      fill: { color: C.amber },
    });

    const tips = [
      {
        icon: icons.check,
        title: "具体的に指示する",
        desc: "「このファイルのログイン関数にバリデーションを追加して」のように、対象と目的を明確に伝えると精度が上がります。",
      },
      {
        icon: icons.check,
        title: "CLAUDE.mdを活用する",
        desc: "プロジェクトのコーディング規約やアーキテクチャをCLAUDE.mdに書いておくと、一貫性のあるコードを生成します。",
      },
      {
        icon: icons.check,
        title: "段階的に進める",
        desc: "大きなタスクは小さなステップに分けて依頼すると、確認しながら安全に進められます。",
      },
      {
        icon: icons.check,
        title: "レビューを忘れずに",
        desc: "AIが生成したコードは必ず確認してください。変更内容の差分を見て、意図通りかチェックしましょう。",
      },
    ];

    tips.forEach((tip, i) => {
      const yBase = 1.5 + i * 0.95;

      // Card
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.8, y: yBase, w: 8.4, h: 0.8,
        fill: { color: C.cardBg },
        shadow: cardShadow(),
      });

      // Check icon
      s.addImage({ data: tip.icon, x: 1.1, y: yBase + 0.17, w: 0.4, h: 0.4 });

      // Title
      s.addText(tip.title, {
        x: 1.7, y: yBase + 0.05, w: 2.0, h: 0.4,
        fontFace: BODY_FONT, fontSize: 15, color: C.text, bold: true,
        valign: "middle", margin: 0,
      });

      // Description
      s.addText(tip.desc, {
        x: 3.7, y: yBase + 0.05, w: 5.2, h: 0.7,
        fontFace: BODY_FONT, fontSize: 12, color: C.textMuted,
        margin: 0,
      });
    });
  }

  // ========================================
  // SLIDE 7: まとめ
  // ========================================
  {
    const s = pres.addSlide();
    s.background = { color: C.darkBg };

    // Decorative shapes
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.5, y: -0.8, w: 5.0, h: 3.0,
      fill: { color: C.darkBg2 },
      rotate: 12,
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: -1.5, y: 3.5, w: 5.0, h: 3.0,
      fill: { color: C.darkBg2 },
      rotate: -8,
    });

    // Icon
    s.addImage({ data: icons.rocketW, x: 1.0, y: 1.0, w: 0.6, h: 0.6 });

    // Accent bar
    s.addShape(pres.shapes.RECTANGLE, {
      x: 1.0, y: 1.8, w: 1.2, h: 0.06,
      fill: { color: C.amber },
    });

    // Title
    s.addText("さあ、はじめよう", {
      x: 1.0, y: 2.1, w: 8.0, h: 1.0,
      fontFace: TITLE_FONT, fontSize: 40, color: "FFFFFF",
      bold: true, margin: 0,
    });

    // Summary points
    s.addText([
      { text: "✓  ", options: { color: C.amberLight, bold: true } },
      { text: "npm install -g @anthropic-ai/claude-code でインストール", options: { color: "CCCCDD", fontFace: BODY_FONT, breakLine: true } },
      { text: "", options: { fontSize: 8, breakLine: true } },
      { text: "✓  ", options: { color: C.amberLight, bold: true } },
      { text: "プロジェクトディレクトリで claude を実行", options: { color: "CCCCDD", fontFace: BODY_FONT, breakLine: true } },
      { text: "", options: { fontSize: 8, breakLine: true } },
      { text: "✓  ", options: { color: C.amberLight, bold: true } },
      { text: "自然言語で開発タスクを依頼するだけ", options: { color: "CCCCDD", fontFace: BODY_FONT } },
    ], {
      x: 1.0, y: 3.2, w: 8.0, h: 1.5,
      fontSize: 15, lineSpacingMultiple: 1.2, margin: 0,
    });

    // Bottom link
    s.addText("claude.ai/claude-code", {
      x: 1.0, y: 4.85, w: 4.0, h: 0.4,
      fontFace: BODY_FONT, fontSize: 13, color: C.amber, italic: true,
      margin: 0,
    });
  }

  // --- Save ---
  const outputPath = "Claude_Code入門.pptx";
  await pres.writeFile({ fileName: outputPath });
  console.log("Created: " + outputPath);
}

main().catch(err => { console.error(err); process.exit(1); });
