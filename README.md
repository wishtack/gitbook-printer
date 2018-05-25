# Gitbook Printer

This is a basic tool that will read your Gitbook's `SUMMARY.md`, crawl your course using Chrome *(puppeteer)* and produce a PDF file with all the content in `out/gitbook.pdf`.

# Usage

```
yarn global add @wishtack/gitbook-printer
gitbook-printer --base-url https://your-gitbook-url --summary-path ./SUMMARY.md
```

## or for npm users
```
npm install -g @wishtack/gitbook-printer
```
