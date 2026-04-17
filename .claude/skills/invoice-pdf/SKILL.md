---
name: invoice-pdf
description: 請求書PDFを生成する。「請求書を作って」「invoice作成」「請求書PDFが欲しい」で起動。宛先・品目・金額を伝えるだけでインボイス制度対応の請求書PDFを出力。
user-invocable: true
argument-hint: [宛先 品目 金額]
---

# 請求書PDF生成

## いつ使うか

- `/invoice-pdf` を実行したとき
- 「請求書を作って」「請求書PDF」「invoice作成」と言われたとき

## 実行手順

### Step 0: 自社情報の確認

`.company/invoice-config.json` を読み込む。ファイルが存在しない場合は `AskUserQuestion` で以下を聞き、作成する:

```json
{
  "company_name": "会社名 or 屋号",
  "postal_code": "〒000-0000",
  "address": "住所",
  "tel": "電話番号",
  "email": "メールアドレス",
  "registration_number": "T1234567890123",
  "bank_name": "銀行名",
  "branch_name": "支店名",
  "account_type": "普通",
  "account_number": "口座番号",
  "account_holder": "口座名義"
}
```

### Step 1: 請求情報の収集

引数やユーザーの発言から以下を特定する。不足があれば `AskUserQuestion` でまとめて聞く:

| 項目 | 必須 | デフォルト |
|-----|------|----------|
| 宛先（会社名） | 必須 | - |
| 品目（複数可） | 必須 | - |
| 数量 | 必須 | 1 |
| 単価 | 必須 | - |
| 税率 | 任意 | 10% |
| 請求書番号 | 任意 | INV-YYYYMMDD-001（自動採番） |
| 発行日 | 任意 | 今日 |
| 支払期限 | 任意 | 翌月末 |
| 備考 | 任意 | なし |

品目の入力例: 「Webサイト制作 50万、保守費用 月3万x3ヶ月」

### Step 2: JSONデータの作成

収集した情報を以下のJSON形式にまとめる:

```json
{
  "invoice_number": "INV-20260413-001",
  "issue_date": "2026-04-13",
  "due_date": "2026-05-31",
  "client_name": "株式会社〇〇",
  "items": [
    {
      "name": "Webサイト制作",
      "quantity": 1,
      "unit_price": 500000,
      "tax_rate": 10
    }
  ],
  "notes": "備考"
}
```

### Step 3: PDF生成

以下のコマンドでPDF生成スクリプトを実行する:

```bash
"/c/Users/じゅぶ/AppData/Local/Programs/Python/Python313/python.exe" .claude/skills/invoice-pdf/scripts/generate_invoice.py <<'INVOICE_JSON'
{上記のJSON}
INVOICE_JSON
```

スクリプトは以下を行う:
- 自社情報を `.company/invoice-config.json` から読み込み
- インボイス制度対応の請求書PDFを生成
- `invoices/INV-YYYYMMDD-001.pdf` に保存

### Step 4: 完了報告

生成したPDFのパスと請求内容の概要を表示する:

```
請求書を作成しました:
- ファイル: invoices/INV-20260413-001.pdf
- 宛先: 株式会社〇〇
- 合計: ¥550,000（税込）
```

## 注意事項

- 金額は半角数字に変換する（「50万」→ 500000）
- 請求書番号が重複しないよう `invoices/` ディレクトリ内の既存ファイルを確認する
- 軽減税率（8%）の品目がある場合は税率ごとに内訳を表示する
