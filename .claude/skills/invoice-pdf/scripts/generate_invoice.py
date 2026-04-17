#!/c/Users/じゅぶ/AppData/Local/Programs/Python/Python313/python.exe
"""請求書PDF生成スクリプト（インボイス制度対応）"""

import json
import sys
import io
import os
from pathlib import Path
from collections import defaultdict

# Windows環境でstdinをUTF-8に強制
sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# --- 定数 ---
PAGE_W, PAGE_H = A4
MARGIN_LEFT = 20 * mm
MARGIN_RIGHT = 20 * mm
MARGIN_TOP = 20 * mm
CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT

COLOR_PRIMARY = HexColor("#1a1a2e")
COLOR_ACCENT = HexColor("#4a6fa5")
COLOR_LIGHT_BG = HexColor("#f5f7fa")
COLOR_BORDER = HexColor("#d0d5dd")
COLOR_TEXT = HexColor("#333333")
COLOR_SUB = HexColor("#666666")

FONT_DIR = "C:/Windows/Fonts"


def register_fonts():
    """日本語フォント登録"""
    meiryo = os.path.join(FONT_DIR, "meiryo.ttc")
    meiryo_bold = os.path.join(FONT_DIR, "meiryob.ttc")
    if os.path.exists(meiryo):
        pdfmetrics.registerFont(TTFont("Meiryo", meiryo, subfontIndex=0))
    if os.path.exists(meiryo_bold):
        pdfmetrics.registerFont(TTFont("Meiryo-Bold", meiryo_bold, subfontIndex=0))
    else:
        pdfmetrics.registerFont(TTFont("Meiryo-Bold", meiryo, subfontIndex=0))


def fmt_currency(amount: int) -> str:
    """¥1,234,567 形式"""
    return f"¥{amount:,}"


def draw_invoice(c: canvas.Canvas, data: dict, config: dict):
    """請求書を描画"""
    y = PAGE_H - MARGIN_TOP

    # --- ヘッダー: タイトル ---
    c.setFont("Meiryo-Bold", 24)
    c.setFillColor(COLOR_PRIMARY)
    c.drawCentredString(PAGE_W / 2, y, "請  求  書")
    y -= 12 * mm

    # --- 請求書メタ情報（右寄せ） ---
    right_x = PAGE_W - MARGIN_RIGHT
    c.setFont("Meiryo", 9)
    c.setFillColor(COLOR_SUB)

    meta_lines = [
        f"請求書番号: {data['invoice_number']}",
        f"発行日: {data['issue_date']}",
        f"お支払期限: {data['due_date']}",
    ]
    for line in meta_lines:
        c.drawRightString(right_x, y, line)
        y -= 5 * mm
    y -= 3 * mm

    # --- 宛先 ---
    c.setFont("Meiryo-Bold", 14)
    c.setFillColor(COLOR_PRIMARY)
    c.drawString(MARGIN_LEFT, y, f"{data['client_name']}  御中")
    y -= 3 * mm

    # 宛先下線
    c.setStrokeColor(COLOR_ACCENT)
    c.setLineWidth(1.5)
    c.line(MARGIN_LEFT, y, MARGIN_LEFT + 180 * mm, y)
    y -= 10 * mm

    # --- 合計金額ボックス ---
    items = data["items"]
    tax_groups = defaultdict(lambda: {"subtotal": 0, "tax": 0})
    for item in items:
        amount = item["quantity"] * item["unit_price"]
        rate = item.get("tax_rate", 10)
        tax_groups[rate]["subtotal"] += amount
        tax_groups[rate]["tax"] += int(amount * rate / 100)

    grand_subtotal = sum(g["subtotal"] for g in tax_groups.values())
    grand_tax = sum(g["tax"] for g in tax_groups.values())
    grand_total = grand_subtotal + grand_tax

    box_h = 16 * mm
    c.setFillColor(COLOR_LIGHT_BG)
    c.setStrokeColor(COLOR_ACCENT)
    c.setLineWidth(1)
    c.roundRect(MARGIN_LEFT, y - box_h, CONTENT_W, box_h, 3 * mm, fill=1, stroke=1)

    c.setFont("Meiryo", 11)
    c.setFillColor(COLOR_SUB)
    c.drawString(MARGIN_LEFT + 5 * mm, y - 10 * mm, "ご請求金額（税込）")

    c.setFont("Meiryo-Bold", 20)
    c.setFillColor(COLOR_PRIMARY)
    c.drawRightString(right_x - 5 * mm, y - 11 * mm, fmt_currency(grand_total))
    y -= box_h + 8 * mm

    # --- 明細テーブル ---
    col_widths = [90 * mm, 20 * mm, 30 * mm, 30 * mm]
    col_x = [MARGIN_LEFT]
    for w in col_widths[:-1]:
        col_x.append(col_x[-1] + w)
    table_right = MARGIN_LEFT + CONTENT_W

    # ヘッダー行
    header_h = 9 * mm
    c.setFillColor(COLOR_PRIMARY)
    c.rect(MARGIN_LEFT, y - header_h, CONTENT_W, header_h, fill=1, stroke=0)

    c.setFillColor(HexColor("#ffffff"))
    c.setFont("Meiryo-Bold", 9)
    headers = ["品目", "数量", "単価", "金額"]
    for i, h in enumerate(headers):
        if i == 0:
            c.drawString(col_x[i] + 3 * mm, y - 6 * mm, h)
        else:
            c.drawRightString(col_x[i] + col_widths[i] - 3 * mm, y - 6 * mm, h)
    y -= header_h

    # 明細行
    row_h = 8 * mm
    c.setFont("Meiryo", 9)
    for idx, item in enumerate(items):
        amount = item["quantity"] * item["unit_price"]
        rate = item.get("tax_rate", 10)
        rate_mark = "※" if rate == 8 else ""

        if idx % 2 == 0:
            c.setFillColor(HexColor("#fafbfc"))
            c.rect(MARGIN_LEFT, y - row_h, CONTENT_W, row_h, fill=1, stroke=0)

        c.setFillColor(COLOR_TEXT)
        name_display = f"{item['name']}{rate_mark}"
        c.drawString(col_x[0] + 3 * mm, y - 5.5 * mm, name_display)
        c.drawRightString(col_x[1] + col_widths[1] - 3 * mm, y - 5.5 * mm, str(item["quantity"]))
        c.drawRightString(col_x[2] + col_widths[2] - 3 * mm, y - 5.5 * mm, fmt_currency(item["unit_price"]))
        c.drawRightString(col_x[3] + col_widths[3] - 3 * mm, y - 5.5 * mm, fmt_currency(amount))
        y -= row_h

    # テーブル下線
    c.setStrokeColor(COLOR_BORDER)
    c.setLineWidth(0.5)
    c.line(MARGIN_LEFT, y, table_right, y)
    y -= 5 * mm

    # --- 小計・税・合計 ---
    summary_x = col_x[2]
    c.setFont("Meiryo", 9)
    c.setFillColor(COLOR_TEXT)

    c.drawString(summary_x, y, "小計")
    c.drawRightString(table_right - 3 * mm, y, fmt_currency(grand_subtotal))
    y -= 6 * mm

    for rate in sorted(tax_groups.keys()):
        label = f"消費税（{rate}%）"
        if rate == 8:
            label += " ※軽減税率"
        c.drawString(summary_x, y, label)
        c.drawRightString(table_right - 3 * mm, y, fmt_currency(tax_groups[rate]["tax"]))
        y -= 6 * mm

    # 合計行
    c.setStrokeColor(COLOR_ACCENT)
    c.setLineWidth(1)
    c.line(summary_x, y + 2 * mm, table_right, y + 2 * mm)
    y -= 2 * mm

    c.setFont("Meiryo-Bold", 11)
    c.setFillColor(COLOR_PRIMARY)
    c.drawString(summary_x, y, "合計（税込）")
    c.drawRightString(table_right - 3 * mm, y, fmt_currency(grand_total))
    y -= 10 * mm

    # 軽減税率注記
    has_reduced = any(item.get("tax_rate", 10) == 8 for item in items)
    if has_reduced:
        c.setFont("Meiryo", 8)
        c.setFillColor(COLOR_SUB)
        c.drawString(MARGIN_LEFT, y, "※ 軽減税率（8%）対象品目")
        y -= 6 * mm

    # --- 備考 ---
    notes = data.get("notes", "")
    if notes:
        y -= 3 * mm
        c.setFont("Meiryo-Bold", 9)
        c.setFillColor(COLOR_PRIMARY)
        c.drawString(MARGIN_LEFT, y, "備考")
        y -= 5 * mm
        c.setFont("Meiryo", 9)
        c.setFillColor(COLOR_TEXT)
        for line in notes.split("\n"):
            c.drawString(MARGIN_LEFT + 3 * mm, y, line)
            y -= 5 * mm

    # --- 振込先 ---
    y -= 5 * mm
    c.setFont("Meiryo-Bold", 9)
    c.setFillColor(COLOR_PRIMARY)
    c.drawString(MARGIN_LEFT, y, "お振込先")
    y -= 5 * mm

    c.setFont("Meiryo", 9)
    c.setFillColor(COLOR_TEXT)
    bank_info = [
        f"{config['bank_name']}  {config['branch_name']}",
        f"{config['account_type']}  {config['account_number']}",
        f"口座名義: {config['account_holder']}",
    ]
    for line in bank_info:
        c.drawString(MARGIN_LEFT + 3 * mm, y, line)
        y -= 5 * mm

    # --- 発行者情報（右下） ---
    issuer_y = 55 * mm
    c.setStrokeColor(COLOR_BORDER)
    c.setLineWidth(0.5)
    c.line(PAGE_W / 2 + 10 * mm, issuer_y + 35 * mm, right_x, issuer_y + 35 * mm)

    ix = PAGE_W / 2 + 15 * mm
    iy = issuer_y + 28 * mm

    c.setFont("Meiryo-Bold", 11)
    c.setFillColor(COLOR_PRIMARY)
    c.drawString(ix, iy, config["company_name"])
    iy -= 6 * mm

    c.setFont("Meiryo", 8)
    c.setFillColor(COLOR_SUB)
    reg = config.get("registration_number", "")
    if reg:
        c.drawString(ix, iy, f"登録番号: {reg}")
        iy -= 5 * mm

    c.drawString(ix, iy, config.get("postal_code", ""))
    iy -= 4.5 * mm
    c.drawString(ix, iy, config.get("address", ""))
    iy -= 4.5 * mm

    tel = config.get("tel", "")
    email = config.get("email", "")
    if tel:
        c.drawString(ix, iy, f"TEL: {tel}")
        iy -= 4.5 * mm
    if email:
        c.drawString(ix, iy, f"Email: {email}")


def main():
    register_fonts()

    # JSONを標準入力から読み込み
    raw = sys.stdin.read()
    data = json.loads(raw)

    # 自社設定読み込み
    config_path = Path(".company/invoice-config.json")
    if not config_path.exists():
        print(f"ERROR: {config_path} が見つかりません。先に自社情報を設定してください。", file=sys.stderr)
        sys.exit(1)

    config = json.loads(config_path.read_text(encoding="utf-8"))

    # 出力先ディレクトリ
    out_dir = Path("invoices")
    out_dir.mkdir(exist_ok=True)

    filename = f"{data['invoice_number']}.pdf"
    out_path = out_dir / filename

    # PDF生成
    c = canvas.Canvas(str(out_path), pagesize=A4)
    c.setTitle(f"請求書 {data['invoice_number']}")
    c.setAuthor(config["company_name"])

    draw_invoice(c, data, config)
    c.save()

    print(json.dumps({
        "status": "ok",
        "path": str(out_path),
        "invoice_number": data["invoice_number"],
        "total": sum(
            item["quantity"] * item["unit_price"] * (100 + item.get("tax_rate", 10)) // 100
            for item in data["items"]
        ),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
