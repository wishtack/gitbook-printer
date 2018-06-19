#!/usr/bin/env node

/**
 *
 * (c) 2013-2018 Wishtack
 * https://wishtack.io
 *
 */

const addZero = require('add-zero');
const commander = require('commander');
const easyPdfMerge = require('easy-pdf-merge');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const rimraf = require('rimraf');
const util = require('util');

class GitbookPrinter {

    constructor({baseUrl, outPath, summaryPath}) {
        this._baseUrl = baseUrl.replace(/\/+$/, '');
        this._outPath = outPath;
        this._partialsPath = path.join(this._outPath, 'partials');
        this._summaryPath = summaryPath;
    }

    async savePdf() {

        /* Clean up target. */
        await util.promisify(rimraf)(this._outPath);

        /* Create target directories. */
        fs.mkdirSync(this._outPath);
        fs.mkdirSync(this._partialsPath);

        /* Download partial files. */
        const pdfFilePathList = await this._downloadChapterList();

        /* Merge files. */
        await util.promisify(easyPdfMerge)(pdfFilePathList, path.join(this._outPath, 'gitbook.pdf'));

    }

    async _downloadChapterList() {

        /* Open browser. */
        const browser = await puppeteer.launch();

        const page = await browser.newPage();

        /* Get chapters list from summary. */
        const chapterPathList = await this._getChapterPathList();

        let pdfFilePathList = [];

        for (const [index, chapterPath] of chapterPathList.entries()) {

            const pageUrl = `${this._baseUrl}/${chapterPath}`;

            const pdfFilePath = this._getChapterPdfFilePath({index, chapterPath});

            console.debug(`Printing: ${pageUrl}...`);
            await this._printPage({
                page,
                pageUrl,
                pdfFilePath
            });

            /* Add file to list in order to merge all files later. */
            pdfFilePathList = [...pdfFilePathList, pdfFilePath];

            console.debug(`Created: ${pdfFilePath}.`);

        }

        await browser.close();

        return pdfFilePathList;

    }

    _getChapterPdfFilePath({index, chapterPath}) {

        const chapterIndexDigitCount = 3;

        let chapterFileName = addZero(index, chapterIndexDigitCount);
        if (chapterPath.length > 0) {
            chapterFileName += `-${chapterPath.replace(/\//g, '-')}`;
        }

        chapterFileName += '.pdf';

        return path.join(this._partialsPath, chapterFileName);

    }

    async _printPage({page, pageUrl, pdfFilePath}) {

        await page.goto(pageUrl, {
            waitUntil: 'networkidle2'
        });

        await page.evaluate(() => {
            const style = document.createElement('style');
            style.textContent = '[data-test="headermobile"],[data-test="headerdesktop"] { display: none; }';
            style.textContent += 'h1 { page-break-before: always }';
            document.head.appendChild(style);
        });

        await page.pdf({
            path: pdfFilePath,
            format: 'A4',
            landscape: false
        });

    }

    async _getChapterPathList() {

        const summary = fs.readFileSync(this._summaryPath, 'utf-8');

        return summary
            .split('\n')
            /* Ignore empty lines. */
            .filter(line => line.length > 0)
            /* Grab link URLs. */
            .map(line => line.match(/\((.*?).md\)/))
            .filter(match => match != null)
            .map(match => match[1])
            /* Remove /README suffix. */
            .map(url => url.replace(/README$/, ''));

    }
}

commander
    .option('-b, --base-url <baseUrl>', 'Gitbook Base URL.')
    .option('-s, --summary-path <summaryPath>', 'File Path to SUMMARY.md.')
    .option('-o, --out <outDirPath>', 'Output directory.')
    .parse(process.argv);

if (commander.baseUrl == null || commander.summaryPath == null) {
    commander.help();
}

new GitbookPrinter({
    baseUrl: commander.baseUrl,
    summaryPath: commander.summaryPath,
    outPath: commander.out || 'out'
})
    .savePdf()
    .catch(console.error);

module.exports = {
    GitbookPrinter
};
