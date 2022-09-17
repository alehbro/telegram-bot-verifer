import axios from 'axios'
import {config} from 'dotenv'
import express from 'express'
import puppeteer from "puppeteer/lib/cjs/puppeteer/puppeteer.js";

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

app.get('/healthy-check', async (req, res) => {
    res.send('All work pretty');
});

app.get('/get-cards', async (req, res) => {
    var URL = 'https://ksp.co.il/web/cat/35..1044..15848';

    const browser = await puppeteer.launch({
        'args' : [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const page = await browser.newPage();

    await page.goto(URL);

    let count = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.jss235')).length;
    })

    await browser.close();
    res.send(`Now ${count} video cards on site, it's cool!`);
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