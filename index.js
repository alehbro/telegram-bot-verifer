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

// healthy check
app.get('/', async (req, res) => {
    res.send('All work pretty');
});

app.get('/get-cards', async (req, res) => {
    const GPU_KSP_URL = 'https://ksp.co.il/m_action/api/category/35..1044..43845?sort=1';
    const responseJson = await fetch(GPU_KSP_URL);
    const items = (await responseJson.json()).result.items;
    res.send(items);
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
