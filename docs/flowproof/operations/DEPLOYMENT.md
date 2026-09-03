# FlowProof deployment record

## Production

- URL: https://flowproof-one.vercel.app
- Source: https://github.com/Ayodelearog/solari-cookbook
- Provider: Vercel
- Project: `ayodelearogs-projects/flowproof`
- Application root: `products/flowproof/apps/web`
- Framework preset: `nextjs`
- Production deployment: `dpl_Aeor7wRJkBeHpyHBR1NFHZNKgfZP`
- Deployed: 2026-09-03
- Source commit deployed: `3bb53dc`

## Release procedure

1. Run type-check, lint, tests, and the production build from
   `products/flowproof`.
2. Deploy a preview from `products/flowproof/apps/web`.
3. Verify the homepage text and all three `/evidence/<outcome>.png` assets with
   `vercel curl`, which supports deployment protection.
4. Promote the verified preview to production.
5. Wait until the production deployment is READY before testing the public
   alias.
6. Verify the public homepage, evidence assets, browser rendering, and recent
   error logs.

## Verified production checks

- `/` returned HTTP 200 and contained the FlowProof hero and evidence sections.
- `/evidence/pass.png` returned HTTP 200.
- `/evidence/fail.png` returned HTTP 200.
- `/evidence/inconclusive.png` returned HTTP 200.
- Vercel's error-log query returned no logs/errors after deployment.
- The public production page was rendered and inspected in a real browser.

## Configuration lesson

Creating a blank Vercel project via CLI initially selected the `Other` framework
preset. The Next.js build succeeded, but Vercel published only `public/`, making
the root route return 404 while image assets returned 200. Set the project
framework to `nextjs` and leave the output directory on automatic detection.
Do not treat a READY deployment as healthy until the application route and its
evidence assets have been probed.

## Current observability boundary

The app is statically rendered and the post-deploy error scan was clean. No
external log drain, uptime monitor, Web Analytics, or Speed Insights integration
has been configured yet. This is sufficient for the challenge demo, not the
commercial service's production observability target.
