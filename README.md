# ESB-THAI

## Local development and verification

Install dependencies, start the local app, run the test suite, and create a production build with:

```bash
npm install
npm run dev
npm test
npm run build
```

## Hosted delivery

The hosted `main` app continues to serve the previous version while this work is on a branch or in an open pull request. The generated curriculum and delivery changes become available on the hosted app only after this PR is merged into `main` and the hosting deployment for that merge completes.
