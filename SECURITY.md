# Security Policy

## Archived project

This repository is **archived and no longer actively maintained** (see
[README.md](README.md)). It should **not** be considered production-ready,
and **security updates are not guaranteed** — there is no maintainer
monitoring this project for vulnerabilities or applying patches going
forward.

## If you fork or deploy this project

Anyone who forks, deploys, or otherwise runs a copy of this code is
responsible for their own security review before doing so, including:

- Auditing all dependencies (`npm audit` or equivalent) for known
  vulnerabilities, since the versions pinned in this repository may be
  outdated by the time you use them.
- Reviewing the project's own known gaps before deploying it anywhere
  public — see "Known Limitations" in [README.md](README.md), in
  particular that the AI endpoint trusts a client-supplied `userId` without
  server-side auth verification, and that the vault PIN feature is a
  client-side UX gate, not real access control.
- Reviewing and configuring your own infrastructure correctly (Supabase
  Row Level Security policies, API keys/scopes, CORS, rate limiting, etc.)
  rather than assuming the defaults in this repository are hardened.
- Rotating or reissuing any credentials before use — do not reuse
  credentials that may have been associated with the original project's
  infrastructure.

## Reporting a vulnerability

There is no dedicated security contact for this project. If you discover a
vulnerability, please do not open a public issue with exploit details.
Given the archived status, a fix is unlikely to be published here — if you
maintain a fork, address it there.

## Secrets

Never commit secrets (API keys, database credentials, tokens, private
keys, etc.) to this repository or any fork of it. Use the `.env.example`
files as templates and keep real values in untracked `.env` files.
