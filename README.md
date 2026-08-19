# 27chat

**The work didn’t stop.** A quiet memorial feed for remarkable people who left at 27 — songs, poems, paintings, performances. Honor the work. Never the manner of leaving.

This is a **static** dress rehearsal of the SubX chrome (three-column X-like shell: left nav, center feed, right rail, hash routes, sign-in modal that closes, mobile hamburger). It is **not** the FastAPI / Next `subx` stack. No React, no Next, no FastAPI, no Firebase, no model calls.

Wordmark: **27chat**. Tagline: *The work didn’t stop.*

This is a memorial, not a curse shrine. No “curse,” no club myth, no white-lighter folklore. Dummy posts talk about the records, the canvases, the poems, the rooms they played. We do not describe how anyone left.

## GitHub Pages + custom domain

These files are meant to drop into an empty public repo and be served from GitHub Pages at **27chat.com**.

1. Push this folder’s contents to branch `main` (site root, not `/docs`).
2. Repo **Settings → Pages**: Deploy from branch `main` / `/` (root).
3. Custom domain: `27chat.com`. The `CNAME` file in this repo already contains exactly that.

**DNS at GoDaddy still needs to point at GitHub Pages.** Do not change DNS from this repo. Typical GitHub Pages records:

- Apex `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- or a `CNAME` for `www` to `<your-user>.github.io`

Until DNS is pointed, Pages will serve on the github.io URL only if the repo is project-pages configured; for the custom domain, use a user/org Pages root as above.

## What this is / is not

- Feed-first **dummy** posts about the work: Delta blues, the Stones’ founding sound, inverted Strat, Texas voice, Doors poems, Grateful Dead blues, Canned Heat harmonica, Badfinger melody, Big Star, Minutemen sentences, Basquiat crowns, Nirvana quiet-loud, Hole bass, Back to Black, Brooke’s sonnet, Chekov and indie film, Inner Circle reggae, SHINee writing. Fake handles only.
- Ranking chrome (For You / Following / Hot / New) shows different slices of the seed feed.
- Sign-in modal closes (X, Escape, overlay click); auth is stubbed locally. No Firebase project keys.
- No AskAI. No cross-post to X or Reddit. We are not X.com.
- Flagships stay dark. This rehearsal is 27chat only.
- Memorial of the work, not a shrine to a myth. Dummy feed is enough for this dress rehearsal.
