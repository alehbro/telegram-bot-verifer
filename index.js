import axios from 'axios';
import {config} from 'dotenv';
import express from 'express';

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

const sleep = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('done');
        }, 2000);
    })
}

const intervalSending = async () => {
    for (let i = 0; i < 3; i++) {
        console.log(`now is ${i}`);
        await sleep();
    }
}

const headers = {
    accept: '*/*',
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,lt;q=0.6",
    "cache-control": "no-cache",
    cookie: "cfontsize=0; ID_computer=1025441130; _fbp=fb.2.1652287270943.1949498620; remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d=eyJpdiI6IklSWEVyMkF2VzlhMTNZcThaWG0ycFE9PSIsInZhbHVlIjoieWNtWFNFUG9zaUFrekRiTVNRV012UHM1VUxDSGY4ZDlXZ01UTW1lTlZVN09HdVU4dFNiSVo1dkh0RGdvcmVXblFEUTNHbTBGampTM1ZMUHY1eVkzdGpBRG1NanowRjE1SDJBSzlhRlwvNDNjPSIsIm1hYyI6ImRlMzNjYzczYmI0MzdjNjA1MTY4MjQwZTE2N2Y1N2NkYWEwYzExOGM3MDJjYjBlYzliNzI2MDY2ZWQ2ZDZhN2QifQ%3D%3D; AmexDiscount={\"pointsToBurn\":null,\"discountInShekels\":null}; store=shipment; language=en; remoteVer=7.01; _gcl_au=1.1.905079337.1662025388; _gid=GA1.3.813834898.1667915964; PHPSESSID=ok0b6vumav9bs539ia5kpok8o0; _ga=GA1.3.1216597503.1652287271; _gat=1; _gat_gtag_UA_109261_1=1; _ga_04VL5ZQ1FG=GS1.1.1667935363.93.1.1667936185.36.0.0",
    lang: "ru",
    pragma: "no-cache",
    referer: "https://ksp.co.il/web/cat/35..1044..43845",
    "sec-ch-ua": `"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"`,
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "macOS",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    token: "429321a9754c5232cfceb31f0e960980",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36}"
}

// healthy check
app.get('/', async (req, res) => {
    res.send('All work pretty');
});

app.get('/get-cards', async (req, res) => {
    try {
        const GPU_KSP_URL = 'https://ksp.co.il/m_action/api/category/35..1044..43845?sort=1';
        const responseJson = await fetch(GPU_KSP_URL, {
            headers
        });
        const items = (await responseJson.json()).result.items;
        res.send({
            statusText: 'All very good!',
            data: items,
        });
    } catch (e) {
        res.send({
            statusText: 'has been error',
            data: e,
        });
    }
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

    if (messageText === 'test-interval') {
        try {

        } catch (e) {
            console.log(e);
            res.send(e);
        }
    }

    try {
        await axios.post(TELEGRAM_URI, {
            chat_id: chatId,
            text: responseText
        })
        res.send('Done!')
    } catch (e) {
        console.log(e)
        res.send(e)
    }

});


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
