---
id: P03
title: Gmail receipts → Xero
description: Best software patterns to automatically file receipts from Gmail to Xero for bookkeeping firms.
topic: receipt-capture
tools:
  - gmail
  - xero
symptom: "We use Xero but receipts still die in Gmail before they become draft bills or spend claims."
audience: Bookkeeping practices standardized on Xero with high email receipt volume.
timeLeak: "1–2 hours per client monthly hunting Gmail for missing documentation."
guardrail: "Draft transactions only — publish to Xero after human review of vendor, tax, and account codes."
draft: false
---

## Before → after

**Before:** Gmail holds receipts. Staff download and upload to Xero one at a time.

**After:** Gmail rules feed a capture tool that creates **draft** spend money or bill entries in Xero.

## Steps to implement

1. **Shared Gmail label** per workflow stage (`Xero/Inbox`, `Xero/Approved`).
2. **Pick a Xero-connected capture tool** — Hubdoc (Xero-owned), Dext, or email-to-Xero where supported.
3. **Client-specific routing** — Separate inboxes or plus-tags per client org in Xero.
4. **Default tax and account rules** — Vendor-based rules reduce repetitive coding.
5. **Approval before publish** — Reviewer checks GST/VAT treatment and account codes.

## Failure modes

- **Multi-currency receipts** — Disable auto-publish; route to senior bookkeeper.
- **Split transactions** — Single receipt, multiple GL lines always need manual split.

## When not to automate

Receipts without clear business purpose or mixed personal use — hold for client confirmation.
