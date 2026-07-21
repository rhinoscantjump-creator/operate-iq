---
id: P22
title: New client folder pack
description: Generate a standard client folder pack when a proposal is signed — no more copying last year’s folders by hand.
topic: client-onboarding
tools:
  - dropbox
  - hubspot
symptom: "Staff spend the first week of every engagement recreating the same Dropbox or Drive folder tree for each new client."
audience: Firms that store workpapers and client docs in Dropbox (or Drive) and kick off from a CRM or proposal tool.
timeLeak: "30–90 minutes per new client renaming folders, fixing permissions, and chasing the ‘where does this go?’ question."
guardrail: "Templates create folders and placeholders only — confidential prior-year files are never auto-copied without a human review."
draft: false
---

## Before → after

**Before:** Someone duplicates an old client folder, deletes leftovers, renames paths, and invites the wrong people. Naming drifts. Workpapers land in email instead of the pack.

**After:** “Proposal signed” (or checklist stage “Folder ready”) runs a template: `ClientName / YY / 01-Admin, 02-Bank, 03-Payroll, 04-Workpapers, 05-Client-Upload`. Permissions follow a standard group. Intake links point at `05-Client-Upload`.

## Steps to implement

1. **Design one folder pack** — Agree names and nesting once; document what belongs in each folder.
2. **Store a clean template** — Empty folders + README placeholders only — no real client data inside the template.
3. **Connect the trigger** — HubSpot deal Closed Won (or Zapier/Make from proposal tool) → create Dropbox folder from template → rename with client code.
4. **Set permissions by group** — Partners full access; bookkeepers edit; clients upload-only to the client folder.
5. **Link back to the checklist** — Paste the folder URL into the onboarding checklist / CRM so the team stops asking for the path.

## Failure modes

- **Copying a live client folder as the template** — Old SSNs, passwords, and wrong year’s files leak into the new pack.
- **Inconsistent client codes** — Automations break when names include punctuation; use a short code (`ACME-042`) in the path.
- **Over-permissioned shares** — Default “anyone with link” for client upload folders; lock to named emails.

## When not to automate

Trust / estate engagements with custom custody rules, or clients who mandate their own SharePoint structure — create a minimal admin folder manually and map their system in the checklist instead.
