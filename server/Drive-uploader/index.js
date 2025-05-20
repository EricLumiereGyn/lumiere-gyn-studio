const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const uploadProductAssets = require("./upload");

const app = express();

const PORT = 3001;

app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: path.join(__dirname, 'tmp') }));

app.post("/upload", async (req, res) => {
  try {
    const { marca, codigo } = req.body;

    if (!req.files) {
      return res.status(400).send("Nenhum arquivo enviado.");
    }

    const arquivos = [];

    // Lista os campos que esperamos receber
    const camposEsperados = ["FundoBranco", "CloseUp", "Ambientado", "DesenhoTecnico", "Descricao"];

    for (const campo of camposEsperados) {
      if (req.files[campo]) {
        const file = req.files[campo];
        const tempPath = path.join(__dirname, "tmp", file.name);

        // Salva o arquivo temporariamente
        await file.mv(tempPath);

        arquivos.push({
          caminho: tempPath,
          nome: file.name,
          mimeType: file.mimetype,
        });
      }
    }

    const HISTORICO_DIR = path.join(__dirname, "historico");

app.put("/produto/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;
    const { user, ...dadosAtualizados } = req.body;

    if (!user) return res.status(400).send("Usuário não informado.");

    const caminhoArquivo = path.join(HISTORICO_DIR, `${user}.json`);

    if (!fs.existsSync(caminhoArquivo)) {
      return res.status(404).send("Histórico do usuário não encontrado.");
    }

    const conteudoAtual = JSON.parse(fs.readFileSync(caminhoArquivo, "utf-8"));
    const historico = conteudoAtual.historico || [];

    const novoHistorico = historico.map((produto) => {
      if (produto.codigo === codigo) {
        const atualizado = {
          ...produto,
          ...dadosAtualizados,
        };

        // Log de edição (opcional)
        if (!atualizado.historicoAlteracoes) atualizado.historicoAlteracoes = [];
        atualizado.historicoAlteracoes.push({
          acao: "edição",
          em: new Date().toISOString(),
          por: user,
        });

        return atualizado;
      }
      return produto;
    });

    fs.writeFileSync(caminhoArquivo, JSON.stringify({ historico: novoHistorico }, null, 2));
    res.send("Produto atualizado com sucesso.");
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).send("Erro ao atualizar produto.");
  }
});


    // Faz upload para o Google Drive
    await uploadProductAssets({ marca, codigo, arquivos });

    // Apaga arquivos temporários
    for (const file of arquivos) {
      fs.unlinkSync(file.caminho);
    }

    res.send("Upload concluído com sucesso! 🚀");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro no upload.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
