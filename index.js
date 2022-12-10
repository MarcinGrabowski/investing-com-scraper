const puppeteer = require("puppeteer")
const fs = require("fs")
const request = require('request')
require('dotenv').config()

const scraping = async () => {
    var startTime = performance.now();
    console.log('RUN scraping ' + new Date().toLocaleString());
    puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ]
    }).then(async browser => {
        const page = await browser.newPage()
        await page.setViewport({
            width: 650,
            height: 650,
        });

        await page.goto('https://sslecal2.investing.com/?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&countries=25,32,37,22,26,39,14,48,35,6,7,17,43,53,110,36,5,72,12,61,93,4,10&calType=day&timeZone=57&lang=15', 
        {timeout: 5000, waitUntil: 'networkidle2'});
        await page.waitForTimeout(3000);
        await page.evaluate( function(){
            setTimeFrame("timeFrame_today","today", false);
        });
        await page.waitForTimeout(3000);

        await page.waitForSelector('div.inlineblock');
        const element = await page.$('div.inlineblock');

        await element.screenshot({path: 'events.png'});

        await page.waitForTimeout(3000);
        publish()
        await page.waitForTimeout(3000);
        await browser.close()
        process.exit()
    }).catch((e) => {
        console.log("[ERROR PUPPETEER]: ", e);
        scraping();
    });
}

scraping()

async function publish() {
    var headersOpt = {  
        "Content-Type": "multipart/form-data"
    };

    var readStream = fs.createReadStream(__dirname + "/events.png");
    await request(
        {
        method:'post',
        url: process.env.DC_ADDRESS,
        formData: { 'username': 'Investing.com', 'image': readStream },
        headers: headersOpt,
        json: true,
    }, function (error, response, body) {
        console.log(error); 
    });
}