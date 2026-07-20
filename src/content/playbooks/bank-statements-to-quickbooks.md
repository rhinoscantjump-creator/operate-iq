---
id: P01
title: Bank statements → QuickBooks
description: How to automatically extract data from bank statements into QuickBooks without manual retyping.
topic: receipt-capture
tools:
  - quickbooks
symptom: "Staff spend hours retyping bank statement lines into QuickBooks every month."
audience: Boutique bookkeeping firms using QuickBooks Online with 20–80 client accounts.
timeLeak: "3–6 hours per client per month on statement reconciliation prep."
guardrail: "OCR proposals stay in a review queue — nothing posts until a bookkeeper approves the batch."
draft: false
---

## Before → after

**Before:** PDF bank statements arrive by email. Someone opens each PDF, reads transactions, and creates or matches entries in QuickBooks manually.

**After:** Statements land in a shared intake folder or inbox rule. OCR extracts payee, date, and amount. Rules suggest categories. A bookkeeper approves a batch in one sitting.

## Steps to implement

1. **Standardize intake** — Create a dedicated email alias (`statements@yourfirm.com`) or Dropbox folder per client.
2. **Choose an extraction layer** — QuickBooks bank feeds where available; for PDF-only banks, use a document parser (Dext, Hubdoc, or similar) that exports to QuickBooks.
3. **Map accounts once** — Build a client-level chart mapping (common payees → GL accounts).
4. **Set review cadence** — Weekly 30-minute batch review beats month-end panic.
5. **Log exceptions** — Flag ambiguous lines for client clarification instead of guessing.

## Failure modes

- **Multi-page PDFs with poor scan quality** — OCR confidence drops; route to manual queue.
- **Commingled accounts** — Split personal/business before automation; do not auto-post mixed feeds.
- **Duplicate imports** — Dedupe on date + amount + payee hash.

## When not to automate

First month with a new client, messy historical books, or trust accounts with strict compliance — stay manual until the chart and rules are stable.
