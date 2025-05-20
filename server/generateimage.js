const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const clipboardy = require("clipboardy");
const { exec } = require("child_process");

router.post("/", async (req, res) => {
  try {
    if (!req.files || !req.files.image || !req.body.prompt) {
      return res.status(400).json({ error: "Prompt ou imagem não enviados." });
    }

    const prompt = req.body.prompt;
    const imageFile = req.files.image;
    const fileName = `${Date.now()}-${imageFile.name}`;
    const tempImagePath = path.join(__dirname, "tmp", fileName);
    await imageFile.mv(tempImagePath);

    // ✅ Copia prompt para clipboard
    clipboardy.writeSync(prompt); // ← só funciona com a versão 2.3.0

    // ✅ Copia imagem via PowerShell
    const powershellScript = `
      Add-Type -AssemblyName System.Windows.Forms
      Add-Type -AssemblyName System.Drawing
      $img = [System.Drawing.Image]::FromFile("${tempImagePath}")
      [System.Windows.Forms.Clipboard]::SetImage($img)
    `;
    exec(`powershell -command "${powershellScript}"`, (err) => {
      if (err) {
        console.error("Erro ao copiar imagem:", err);
        return res.status(500).json({ error: "Erro ao copiar imagem para o clipboard." });
      }

      // ✅ Abre ChatGPT no navegador
      exec('start chrome https://chat.openai.com');

      res.json({
        message: "Imagem e prompt copiados! Vá até o ChatGPT e pressione Ctrl+V.",
        prompt,
        imagePath: `/tmp/${fileName}`
      });
    });

  } catch (err) {
    console.error("Erro ao preparar imagem:", err);
    res.status(500).json({ error: "Erro interno ao gerar imagem." });
  }
});

module.exports = router;
