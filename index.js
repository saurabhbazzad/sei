const express = require('express')

const app = express()
require('dotenv').config();

const { scrapeWebPage, chatWithGPT }  = require('./helpers');

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/test', (req, res, next)=> res.status(200).send('Server Running'))
app.post('/checkcompliance', async (req, res, next)=>{
    url = req.body.url
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required.' });
    }

    try {
        const data = await scrapeWebPage(url);
        output = await chatWithGPT(data.join('\n'))
        res.status(200).json(output);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
app.use((req, res, next) => {
    res.status(404).json({ error: '404 Not Found', message: 'The requested resource could not be found.'});
});


const port = process.env.PORT || 5001
app.listen(port, ()=>console.log(`Server running on http://localhost:${port}`))