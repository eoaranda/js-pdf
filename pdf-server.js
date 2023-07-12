const puppeteer = require("puppeteer");
const express = require("express");

const app = express();
const port = 3000;

const defaultHtml = `<html><body><center><h2>Default </h2></center></body></html>`;

app.use(express.json());


app.post("/pdf", async (req, res) => {

    const requestedHtml = req.body['html'];
    const externalId = req.body['externalId'];

    if(!requestedHtml || !externalId){
        return res.status(400).end("Required parameters missing.");
    }

    console.log('PDF generation for: ', externalId);

    try {
        // Start time of process
        const start = performance.now();
        let html = requestedHtml ? requestedHtml : defaultHtml;

        // Create a browser instance
        const browser = await puppeteer.launch();

        // Create a new page
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        //To reflect CSS used for screens instead of print
        await page.emulateMediaType('screen');

        //Generate the PDF
        const pdf = await page.pdf({
            margin: { top: '50px', right: '50px', bottom: '50px', left: '50px' },
            printBackground: true,
            format: 'A4',
        });

        await browser.close();

        const fileData = Buffer.from(pdf, 'base64')

        // End time of process
        const end = performance.now();
        console.log(`Execution time: ${end - start} ms for: ${externalId}`);
        return res.end(fileData);

    } catch (error) {
        return res.status(400).end();
    }

});


// Start Server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
