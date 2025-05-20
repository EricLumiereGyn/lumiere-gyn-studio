const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { generateImageFromPromptAndFile } = require("./gpt4o-automator/index");

const router = express.Router();
const upload = multer({ dest: "tmp/" });

router.post("/generate-gpt4o-image", upload.single("image"), async (req, res) => {
  try {
    const { prompt } = req.body;
    const filePath = req.file.path;

    console.log("▶️ Geração iniciada com prompt:", prompt);

    const buffer = await generateImageFromPromptAndFile(prompt, filePath);

    fs.unlinkSync(filePath); // limpa imagem temporária

    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error("❌ Erro ao gerar imagem:", err.message);
    res.status(500).json({ error: "Erro na geração de imagem." });
  }
});

module.exports = router;
