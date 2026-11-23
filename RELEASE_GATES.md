# MemeMasters release gates

## Source verified in this repository
- The root HTML, CSS, JS module and editor-core module implement a dependency-free local browser image editor.
- Unit tests cover image crop/contain geometry, caption wrapping, filename safety, and numeric validation.
- Static contract tests check the local asset/CSP privacy boundary and guard against credential-bearing inputs.
- The CI workflow runs on pull requests and main pushes. Green CI is a **code gate**, not evidence of a public deployment.

## Required acceptance before public launch
1. Verify the CI workflow passes on the merged main commit.
2. Configure an owned static host for the root files, with HTTPS, correct MIME types for .mjs, and a working 404.
3. Open the hosted editor on Android Chrome, iOS Safari, and a desktop browser. Import real JPG/PNG/WebP images, test an oversized file, change fit/format, download PNG, reopen it, and confirm text and dimensions.
4. Verify no requests transmit uploaded image data. Do not add behavioral ads or analytics without a new privacy review.
5. Confirm the download button works on devices with pop-up or download restrictions.
6. Confirm the Bobsome1 services link, ownership, and support contact before announcing publicly.

## Not in this MVP
No AI image generation, payments, subscriptions, account login, NFT, crypto rewards, stored galleries, video generation, verified real revenue or earnings forecasts. Historical markdown QA and revenue claims in this repository do not supply current application evidence.

## Previously exposed example credential
The historical bug report contained a nonblank password example in a public document. The current branch has been redacted. Git history can still expose the old text; **rotate/revoke any account credential that was ever used**, audit where it may have been reused, and consider a coordinated history-rewrite and GitHub cache-removal process. Redaction alone is not revocation.

## Rollback
The rebuilding feature can be reverted independently of the historical documents. No server state, subscribers, purchases, or user images are changed by the local editor.
