const fs = require("fs");
const path = require("path");
const { getDriveService, findFolder, createFolder } = require("./driveHelper");

const drive = getDriveService();

// ID da pasta raiz do projeto no Drive
const ROOT_FOLDER_ID = "1IgCIKxWLzNv6dtQUcUKcfJlK3SJRwqNx";

async function uploadProductAssets({ marca, codigo, arquivos }) {
  try {
    // 1. Verifica/cria pasta da marca
    let marcaFolderId = await findFolder(drive, marca, ROOT_FOLDER_ID);
    if (!marcaFolderId) {
      console.log(`📁 Pasta da marca "${marca}" não encontrada. Criando...`);
      marcaFolderId = await createFolder(drive, marca, ROOT_FOLDER_ID);
    }

    // 2. Verifica/cria pasta do produto
    let produtoFolderId = await findFolder(drive, codigo, marcaFolderId);
    if (!produtoFolderId) {
      console.log(`📁 Criando pasta do produto "${codigo}"...`);
      produtoFolderId = await createFolder(drive, codigo, marcaFolderId);
    }

    // 3. Envia todos os arquivos
    for (const { caminho, nome, mimeType } of arquivos) {
      const fileMetadata = {
        name: nome,
        parents: [produtoFolderId],
      };

      const adjustedMimeType = mimeType === "text/plain" ? "application/octet-stream" : mimeType;

      const media = {
        mimeType: adjustedMimeType,
        body: fs.createReadStream(caminho),
      };

      const res = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id",
      });

      console.log(`🟢 Enviado: ${nome} (ID: ${res.data.id})`);
    }

    console.log("✅ Upload finalizado.");
  } catch (error) {
    console.error("❌ Erro durante upload:", error.message);
  }
}

module.exports = uploadProductAssets;
