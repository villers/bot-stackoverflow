const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");
const functions = require("@google-cloud/functions-framework");

require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPEN_API_KEY,
});
const openai = new OpenAIApi(configuration);

const tags = ["devops", "nodejs", "github-actions"];

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

const getLastArticle = async () => {
  const tag = tags.random();
  const questions = await axios.get(
    `https://api.stackexchange.com/2.3/questions?order=desc&sort=creation&tagged=${tag}&site=stackoverflow&filter=withbody`
  );
  const randomQuestion = questions.data.items.random();
  const prompt = `Imagine que tu es un devops expérimenté et que tu as un étudiant qui te pause la question suivante:

${randomQuestion.title}
${randomQuestion.body}

Tu dois répondre dans la même lanque que la question au format markdown.`;

  const completion = await openai.createCompletion({
    model: "text-davinci-002",
    prompt,
    format: "text",
    max_tokens: 250,
  });

  return {
    id: randomQuestion.question_id,
    title: randomQuestion.title,
    body: randomQuestion.body,
    usage: completion.data.usage,
    response: completion.data.choices[0].text,
  };
};

functions.http("botStackoverflow", async (req, res) => {
  const data = await getLastArticle();
  res.status(200).json(data);
  return data;
});

module.exports = getLastArticle;
