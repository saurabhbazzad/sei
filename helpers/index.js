const axios = require('axios')
const cheerio = require('cheerio');
const OpenAI = require('openai')
const fs = require('fs')
require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const openai = new OpenAI({key:OPENAI_API_KEY});

const policyDocFilePath = './objects/policydoc.txt';
const sysPromptFilePath = './objects/sysprompt.txt';
let policy_doc, sys_prompt;
try {
  policy_doc = fs.readFileSync(policyDocFilePath, 'utf8')
  sys_prompt = fs.readFileSync(sysPromptFilePath, 'utf8')
} catch (err) {
  console.error('Error reading the file:', err);
}

async function scrapeWebPage(url) {
    try {
        // Fetch the webpage content
        const { data: html } = await axios.get(url);
        
        // Load the HTML into cheerio
        const $ = cheerio.load(html);
        
        // Initialize a single list to store all text content
        const textContent = [];

        // Extract title
        const title = $('title').text().trim();
        if (title) textContent.push(title);

        // Extract headings
        $('h1, h2, h3, h4, h5, h6').each((i, element) => {
            const text = $(element).text().trim();
            if (text) textContent.push(text);
        });

        // Extract paragraphs
        $('p').each((i, element) => {
            const text = $(element).text().trim();
            if (text) textContent.push(text);
        });

        // Extract unordered list items
        $('ul').each((i, element) => {
            const text = $(element).text().trim();
            if (text) textContent.push(text);
        });

        return textContent;
    } catch (error) {
        console.error(`Error scraping the webpage: ${error.message}`);
        throw new Error('Failed to scrape the webpage.');
    }
}

async function chatWithGPT(text) {
    let userPrompt = `Compliance Policy:\n${policy_doc}\nMarketing Document:\n${text}`
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // You can use 'gpt-4' if available
            messages: [
                { role: 'system', content: sys_prompt},
                { role: 'user', content: userPrompt },
            ],
        });
        return response.choices[0].message
    } catch (error) {
        console.error('Error calling OpenAI API:', error.message);
    }
}


module.exports = {
    scrapeWebPage,
    chatWithGPT
}