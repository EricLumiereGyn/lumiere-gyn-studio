const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/generate-description", async (req, res) => {
  const { name, type, materials, dimensions, lightSource, brand } = req.body;
  const prompt = `Crie uma descrição detalhada e envolvente para um produto de iluminação com os seguintes dados:
- Nome: ${name}
- Tipo: ${type}
- Materiais: ${materials}
- Dimensões: ${dimensions}
- Fonte de luz: ${lightSource}
- Marca: ${brand}`;

  try {
    const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.7,
  max_tokens: 800
});
    res.json({ description: completion.data.choices[0].message.content });
  } catch (e) {
    console.error("Erro ao gerar descrição:", e);
    res.status(500).json({ error: "Erro ao gerar descrição" });
  }
});

app.listen(3001, () => console.log("Servidor rodando em http://localhost:3001"));
