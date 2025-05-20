const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

puppeteer.use(StealthPlugin());

const CHATGPT_URL = 'https://chat.openai.com/';
const COOKIES_PATH = path.resolve(__dirname, 'session.json');

async function generateImageFromPromptAndFile(prompt, imagePath) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Carrega cookies
const rawCookies = JSON.parse(fs.readFileSync(COOKIES_PATH, "utf8"));

const isValidCookie = (cookie) =>
  cookie &&
  typeof cookie.name === "string" &&
  typeof cookie.value === "string" &&
  typeof cookie.domain === "string" &&
  typeof cookie.path === "string" &&
  cookie.name.trim() !== "" &&
  cookie.value.trim() !== "" &&
  cookie.domain.includes("openai.com");

// 🔍 Limpa caracteres invisíveis e filtra só os válidos
const cookies = rawCookies
  .map((cookie) => {
    return {
      name: String(cookie.name).trim().replace(/\u2024/g, "."),
      value: String(cookie.value).trim(),
      domain: String(cookie.domain).trim().replace(/\u2024/g, "."),
      path: cookie.path || "/",
      httpOnly: !!cookie.httpOnly,
      secure: !!cookie.secure,
    };
  })
  .filter(isValidCookie);

console.log("📦 Cookies filtrados e prontos para aplicar:", cookies);

try {
  await page.setCookie(...cookies);
  console.log("✅ Cookies aplicados com sucesso!");
} catch (err) {
  console.error("❌ Erro ao aplicar cookies:", err.message);
  throw err;
}


  // Acessa ChatGPT
  await page.goto(CHATGPT_URL, { waitUntil: 'networkidle2' });

  // Espera o campo de mensagem aparecer
  await page.waitForSelector('textarea');

  // Converte a imagem para PNG
  const imageBuffer = fs.readFileSync(imagePath);
  const pngBuffer = await sharp(imageBuffer).png().toBuffer();

  // Faz upload da imagem no chat (via DOM)
  await page.evaluate(async (buffer) => {
    const blob = new Blob([new Uint8Array(buffer.data)], { type: 'image/png' });
    const file = new File([blob], 'imagem.png', { type: 'image/png' });
    const dt = new DataTransfer();
    dt.items.add(file);
    const input = document.querySelector('input[type=\"file\"]');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, { data: [...pngBuffer] });

  await new Promise(res => setTimeout(res, 3000));
 // Espera o upload da imagem

  // Digita o prompt e envia
  await page.type('textarea', prompt);
  await page.keyboard.press('Enter');

  // Espera resposta com imagem
  await page.waitForSelector('img', { timeout: 60000 });
  await new Promise(res => setTimeout(res, 4000));


  // Captura a primeira imagem gerada
  const imageUrl = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const image = imgs.find((img) => img.src.includes('media'));
    return image?.src || null;
  });

  if (!imageUrl) throw new Error('Imagem não encontrada.');

  const response = await page.goto(imageUrl);
  const buffer = await response.buffer();

  await browser.close();
  return buffer;
}

// Teste opcional
if (require.main === module) {
  console.log('Script carregado com sucesso!');
}

if (require.main === module) {
  console.log("Iniciando teste manual...");
  generateImageFromPromptAndFile("Fundo branco em estúdio", "tmp/exemplo.png")
    .then(() => console.log("✅ Imagem gerada!"))
    .catch((err) => console.error("❌ ERRO:", err.message));
}

module.exports = { generateImageFromPromptAndFile };
