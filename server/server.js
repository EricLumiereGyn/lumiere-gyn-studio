const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const uploadProductAssets = require("./Drive-uploader/upload");
const { v4: uuidv4 } = require("uuid");
const generateImageRoute = require("./generateimage");
const generateGpt4oImageRoute = require("./generateImageViaGpt4o");
// Inicializa express antes de usar
const app = express();

// Middlewares
app.use("/", generateGpt4oImageRoute);
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: path.join(__dirname, 'tmp') }));
app.use("/generate-image", generateImageRoute);
app.use('/tmp', express.static(path.join(__dirname, 'tmp')));

dotenv.config();

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/generate-description", async (req, res) => {
  const { name, type, materials, dimensions, lightSource, brand } = req.body;
  console.log("Dados recebidos do frontend:", req.body);

  const prompt = `
  Aja como um redator profissional especialista em iluminação, design de interiores e SEO. Crie uma descrição seguindo exatamente este modelo abaixo, com espaçamento e formatação de markdown (parágrafos, listas, títulos, linhas ---) preservados. Use linguagem rica, profissional e criativa, mas nunca fuja da estrutura. Adapte os dados abaixo dentro do texto.
  
  Dados:
  - Nome: ${name}
  - Tipo: ${type}
  - Materiais: ${materials}
  - Dimensões: ${dimensions}
  - Fonte de luz: ${lightSource}
  - Marca: ${brand}
  
  Modelo a seguir:
  
  "Este modelo da linha ${brand} combina sofisticação e versatilidade. Ideal para ambientes que pedem presença marcante e iluminação decorativa funcional, ele oferece um equilíbrio perfeito entre estética e desempenho.
  
  ---
  
  ## Detalhes que Inspiram
  
  - Estrutura em ${materials.toLowerCase()} de alta qualidade  
  - Iluminação ${lightSource.toLowerCase()} eficiente e aconchegante  
  - Medidas compactas e bem proporcionadas (${dimensions})  
  - Estilo moderno que valoriza qualquer ambiente  
  - Produto com a confiabilidade da marca ${brand}
  
  ---
  
  ## Para Ambientes com Estilo
  
  Seja para compor um projeto minimalista ou sofisticado, este produto é uma peça-chave que alia funcionalidade e beleza:
  
  - Design moderno com presença marcante  
  - Luz suave e bem distribuída  
  - Ideal para salas, escritórios ou áreas de recepção  
  - Eficiência e durabilidade para o dia a dia  
  - Produto da marca ${brand}"
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    res.json({ description: completion.choices[0].message.content });
  } catch (e) {
    console.error("Erro ao gerar descrição:", e);
    res.status(500).json({ error: "Erro ao gerar descrição." });
  }
});

app.post("/upload", async (req, res) => {
  try {
    const { marca, codigo } = req.body;
    const user = req.body.user || "anônimo";
    const produtoId = uuidv4();

    if (!req.files) {
      return res.status(400).send("Nenhum arquivo enviado.");
    }

    const arquivos = [];
    const camposEsperados = ["FundoBranco", "CloseUp", "Ambientado", "DesenhoTecnico", "Descricao"];

    for (const campo of camposEsperados) {
      if (req.files[campo]) {
        const file = req.files[campo];
        const tempPath = path.join(__dirname, "tmp", file.name);
        await file.mv(tempPath);
        arquivos.push({
          caminho: tempPath,
          nome: file.name,
          mimeType: file.mimetype,
        });
      }
    }

    await uploadProductAssets({ marca, codigo, arquivos });

    try {
      const nome = req.body.nome || "Produto sem nome";
      const type = req.body.tipo || "";
      const materials = req.body.materials || "";
      const dimensions = req.body.dimensions || "";
      const lightSource = req.body.lightSource || "";
      let descricaoText = "";
      const descricaoFile = req.files?.DescricaoText || req.files?.descricaoText;

      if (descricaoFile) {
        descricaoText = fs.readFileSync(descricaoFile.tempFilePath, "utf8");
      }

      const capa = arquivos.find(a => a.nome.includes("FundoBranco"));
      const capaBase64 = capa
        ? fs.readFileSync(capa.caminho, { encoding: "base64" })
        : null;

      const historicoPath = path.join(__dirname, "historico", `${user}.json`);
      let historico = [];

      if (fs.existsSync(historicoPath)) {
        historico = JSON.parse(fs.readFileSync(historicoPath, "utf8"));
      }

      const historicoAlteracoes = [
        {
          acao: "criação",
          por: user,
          em: new Date().toISOString(),
        },
      ];

      historico.push({
  id: produtoId, // ✅ ID único
  codigo,
  nome,
  marca,
  type,
  materials,
  dimensions,
  lightSource,
  imagemCapaBase64: capaBase64
    ? `data:${capa.mimeType};base64,${capaBase64}`
    : null,
  descricao: descricaoText,
  data: new Date().toISOString(),
  criadoPor: user,
  historicoAlteracoes,
  enviadoParaTiny: false,
  user
});

      fs.writeFileSync(historicoPath, JSON.stringify(historico, null, 2));
    } catch (erroHist) {
      console.error("Erro ao salvar histórico:", erroHist);
    }

    for (const file of arquivos) {
      fs.unlinkSync(file.caminho);
    }

    res.send("Upload concluído com sucesso! 🚀");

  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).send("Erro no servidor ao salvar o projeto.");
  }
});

app.put("/produto/:id", async (req, res) => {
  const { id } = req.params;
  const novosDados = req.body;
  const user = req.body.user;

  if (!user) {
    return res.status(400).json({ erro: "Usuário não informado" });
  }

  const historicoPath = path.join(__dirname, "historico", `${user}.json`);
  let historico = [];

  if (fs.existsSync(historicoPath)) {
    historico = JSON.parse(fs.readFileSync(historicoPath, "utf8"));
  }

  const index = historico.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ erro: "Produto não encontrado" });
  }

  const edicao = {
    acao: "edição",
    por: user,
    em: new Date().toISOString()
  };

  historico[index] = {
    ...historico[index],
    ...novosDados,
    historicoAlteracoes: [
      ...(historico[index].historicoAlteracoes || []),
      edicao
    ]
  };

  fs.writeFileSync(historicoPath, JSON.stringify(historico, null, 2));
  res.json({ sucesso: true });
});


app.get("/historico/:user", (req, res) => {
  const user = req.params.user;
  const historicoPath = path.join(__dirname, "historico", `${user || "anonimo"}.json`);

  if (!fs.existsSync(historicoPath)) {
    return res.status(404).json({ error: "Histórico não encontrado para este usuário." });
  }

  try {
    const data = fs.readFileSync(historicoPath, "utf8");
    const historico = JSON.parse(data);
    res.json({ historico });
  } catch (error) {
    console.error("Erro ao ler o histórico:", error);
    res.status(500).json({ error: "Erro ao carregar o histórico." });
  }
});

app.get("/historico-global", (req, res) => {
  const pastaHistorico = path.join(__dirname, "historico");

  if (!fs.existsSync(pastaHistorico)) {
    return res.status(404).json({ error: "Pasta de históricos não encontrada." });
  }

  try {
    const arquivos = fs.readdirSync(pastaHistorico).filter(f => f.endsWith(".json"));
    let todosProdutos = [];

    for (const arquivo of arquivos) {
      const data = fs.readFileSync(path.join(pastaHistorico, arquivo), "utf8");
      const produtos = JSON.parse(data);
      todosProdutos.push(...produtos);
    }

    todosProdutos.sort((a, b) => new Date(b.data) - new Date(a.data));

    res.json({ historico: todosProdutos });
  } catch (error) {
    console.error("Erro ao unificar históricos:", error);
    res.status(500).json({ error: "Erro ao carregar histórico global." });
  }
});

app.listen(3001, () => console.log("Servidor rodando em http://localhost:3001"));
