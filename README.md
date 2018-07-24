# Gitbook Printer

This is a basic tool that will read your **New Gitbook**'s `SUMMARY.md`, crawl your course using Chrome *(puppeteer)* and produce a PDF file with all the content in `out/gitbook.pdf`.

# Usage

1. Clone the gitbook repository.

2. Install gitbook printer.
```
yarn global add @wishtack/gitbook-printer
```

*... or for npm users*
```
npm install -g @wishtack/gitbook-printer
```

3. Run gitbook printer on the gitbook url and **indicate the path to your gitbook's `SUMMARY.md`** on your filesystem. 
```
gitbook-printer --base-url https://your-gitbook-url --summary-path ./path/to/gitbook/repo/SUMMARY.md
```
