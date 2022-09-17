import axios from 'axios';
import {config} from 'dotenv';
import express from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';


config();
const app = express();

const JOKE_API = 'https://v2.jokeapi.dev/joke/Programming?type=single';
const TELEGRAM_URI = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`;

app.use(express.json())
app.use(
    express.urlencoded({
        extended: true
    })
)

puppeteer.use(StealthPlugin());
// puppeteer.use(
//     AdblockerPlugin({
//         blockTrackers: true
//     })
// );

// healthy check
app.get('/', async (req, res) => {
    res.send('All work pretty');
});

app.get('/get-cards', async (req, res) => {
    var URL = 'https://ksp.co.il/web/cat/35..1044..15848';

    const browser = await puppeteer.launch({
        'args' : [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
        headless: true
    });

    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');

    await page.emulateTimezone('Asia/Jerusalem');

    // get the User Agent on the context of Puppeteer
    const userAgent = await page.evaluate(() => navigator.userAgent );

    // If everything correct then no 'HeadlessChrome' sub string on userAgent
    console.log(userAgent);

    await page.goto(URL);

    let resHtml = await page.evaluate(() => {
        return document.body.outerHTML;
        // return Array.from(document.querySelectorAll('.jss235')).length;
    })

    await browser.close();
    // res.send(`Now ${resHtml} video cards on site, it's cool!`);
    res.send(resHtml);
})

app.post('/new-message', async (req, res) => {
    const {message} = req.body;
    const messageText = message?.text?.toLowerCase()?.trim();
    const chatId = message?.chat?.id;
    if (!messageText || !chatId) {
        return res.sendStatus(400)
    }

    console.log(`chatId: ${chatId}`);

    let responseText = 'I have nothing to say.';

    // if joke, getting new joke
    if (messageText === 'joke') {
        try {
            const response = await axios(JOKE_API)
            responseText = response.data.joke;
        } catch (e) {
            console.log(e)
            res.send(e)
        }
    }

    try {
        await axios.post(TELEGRAM_URI, {
            chat_id: chatId,
            text: responseText
        })
        res.send('Done')
    } catch (e) {
        console.log(e)
        res.send(e)
    }

});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})