const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const CREDENTIALS_PATH = path.join(__dirname, "credentials_oauth.json");
const TOKEN_PATH = path.join(__dirname, "token.json");

function getDriveService() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);

  return google.drive({ version: "v3", auth: oAuth2Client });
}

async function findFolder(drive, name, parentId) {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });
  return res.data.files.length ? res.data.files[0].id : null;
}

async function createFolder(drive, name, parentId) {
  const fileMetadata = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentId],
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    fields: "id",
  });
  return res.data.id;
}

module.exports = {
  getDriveService,
  findFolder,
  createFolder,
};
