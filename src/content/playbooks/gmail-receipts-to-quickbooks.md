---
id: P02
title: Gmail receipts → QuickBooks
description: Best way to auto-file receipts from Gmail into QuickBooks without losing attachments in the inbox.
topic: receipt-capture
tools:
  - gmail
  - quickbooks
symptom: "Receipt emails pile up in Gmail and never make it to QuickBooks on time."
audience: Firms where clients and vendors email receipts directly to staff Gmail inboxes.
timeLeak: "30–90 minutes per week searching inbox threads during reconciliation."
guardrail: "Only labeled or rule-matched messages sync — and each receipt waits for category approval before posting."
draft: false
---

## Before → after

**Before:** Receipts live in individual inboxes. Staff forward, download PDFs, and attach manually in QuickBooks.

**After:** Gmail filters tag receipt senders. An integration pulls attachments into a review tool connected to QuickBooks.

## Steps to implement

1. **Create a firm receipt inbox** or shared label (`Receipts/Review`).
2. **Gmail filters** — Auto-label by sender domain (Amazon, Uber, major vendors) and `has:attachment`.
3. **Connect capture app** — Dext, Hubdoc, or QuickBooks receipt capture; map to the right client/project.
4. **Train senders** — Ask clients to email `receipts+clientname@yourfirm.com` for automatic routing.
5. **Weekly batch approve** — Same review cadence as bank lines.

## Failure modes

- **Forwarded threads** — May lose original attachment metadata; prefer direct-to-alias sends.
- **Wrong client mapping** — Use plus-addressing or mandatory client code in subject line.

## When not to automate

One-off capital purchases needing asset scheduling — flag for senior review regardless of automation.
