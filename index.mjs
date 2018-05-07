import puppeteer from 'puppeteer';

export class GitbookPrinter {

    async printGitBook({summaryPath, url}) {

        const browser = await puppeteer.launch();

        const page = await browser.newPage();

        const pathList = await this._summaryPathToPathList({summaryPath});

        for (const [index, path] of pathList.entries()) {

            const pageUrl = `${url}/${path}`;
            const pdfPath = `out/${100 + index}.pdf`;

            console.debug(`Printing: ${pageUrl}...`);
            await this._printPage({
                page,
                pageUrl,
                pdfPath
            });
            console.debug(`Created: ${pdfPath}.`);

        }

        await browser.close();

    }

    async _printPage({page, pageUrl, pdfPath}) {

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
            path: pdfPath,
            format: 'A4',
            landscape: true
        });

    }

    async _summaryPathToPathList({summaryPath}) {

        const { default: fs } = await import('fs');

        const summary = fs.readFileSync(summaryPath, 'utf-8');

        return summary
            .split('\n')
            .filter(line => line.length > 0)
            .map(line => line.match(/\((.+).md\)/))
            .filter(match => match != null)
            .map(match => match[1])
            .map(value => value === 'README' ? '' : value);

    }
}

new GitbookPrinter()
    .printGitBook({
        summaryPath: '/Users/r/dev/wishtack/guide-angular/SUMMARY.md',
        url: 'https://guide-angular.wishtack.io'
    });
