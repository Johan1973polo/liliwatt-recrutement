const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const { Readable } = require('stream');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Servir les pages HTML depuis la racine
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/mentions-legales', (req, res) => res.sendFile(path.join(__dirname, 'public', 'mentions-legales.html')));
app.get('/merci', (req, res) => res.sendFile(path.join(__dirname, 'public', 'merci.html')));

// ===== GOOGLE DRIVE =====
const RECRUTEMENT_PARENT_ID = '1eQYZqexJ67EcVPe8rsmKDf6mtASf9yjA';

function getDriveClient() {
  let creds;
  if (process.env.GOOGLE_DRIVE_CREDS_BASE64) {
    creds = JSON.parse(Buffer.from(process.env.GOOGLE_DRIVE_CREDS_BASE64, 'base64').toString());
  } else {
    creds = require('./liliwatt-drive-credentials.json');
  }
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  return google.drive({ version: 'v3', auth });
}

async function findOrCreateFolder(drive, name, parentId) {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${name.replace(/'/g, "\\'")}' and trashed=false`,
    fields: 'files(id)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  if (res.data.files.length) return res.data.files[0].id;
  const folder = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
    fields: 'id',
    supportsAllDrives: true
  });
  return folder.data.id;
}

// ===== ZOHO MAIL =====
async function getZohoToken() {
  const r = await axios.post('https://accounts.zoho.eu/oauth/v2/token', null, {
    params: {
      refresh_token: process.env.ZOHO_REFRESH_TOKEN,
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      grant_type: 'refresh_token'
    },
    timeout: 15000
  });
  return r.data.access_token;
}

async function sendMail(to, subject, htmlBody) {
  const token = await getZohoToken();
  const accountId = process.env.ZOHO_ACCOUNT_ID;
  if (!accountId) { console.warn('ZOHO_ACCOUNT_ID non configuré'); return; }
  await axios.post(
    `https://mail.zoho.eu/api/accounts/${accountId}/messages`,
    { fromAddress: 'bo@liliwatt.fr', toAddress: to, subject, content: htmlBody, mailFormat: 'html' },
    { headers: { 'Authorization': `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' }, timeout: 30000 }
  );
  console.log(`✅ Mail envoyé à ${to}`);
}

// ===== ROUTE CANDIDATURE =====
const fileFields = [
  { name: 'piece-identite-recto', maxCount: 1 },
  { name: 'piece-identite-verso', maxCount: 1 },
  { name: 'justificatif-domicile', maxCount: 1 },
  { name: 'rib', maxCount: 1 },
  { name: 'kbis-document', maxCount: 1 },
  { name: 'autre-document', maxCount: 1 }
];

app.post('/api/candidature', upload.fields(fileFields), async (req, res) => {
  try {
    const { prenom, nom, email, telephone, ville, experience, motivations } = req.body;
    const statutIndependant = req.body['statut-independant'] || '';
    const accompagnement = req.body['accompagnement'] || '';
    const disponibilites = req.body['disponibilite[]'] || req.body['disponibilite'] || '';

    console.log(`📋 Nouvelle candidature: ${prenom} ${nom} (${email})`);

    // 1. Créer dossier Drive
    const drive = getDriveClient();
    const attenteId = await findOrCreateFolder(drive, 'CANDIDATURES EN COURS', RECRUTEMENT_PARENT_ID);
    const folderName = `${prenom} ${nom.toUpperCase()}`;
    const candidatId = await findOrCreateFolder(drive, folderName, attenteId);
    console.log(`📁 Dossier créé: ${folderName} → ${candidatId}`);

    // 2. Upload fichiers
    const uploadedFiles = [];
    for (const fieldName of Object.keys(req.files || {})) {
      for (const file of req.files[fieldName]) {
        const stream = Readable.from(file.buffer);
        const driveFile = await drive.files.create({
          requestBody: { name: file.originalname, mimeType: file.mimetype, parents: [candidatId] },
          media: { mimeType: file.mimetype, body: stream },
          fields: 'id, name',
          supportsAllDrives: true
        });
        uploadedFiles.push(driveFile.data.name);
        console.log(`  📄 Upload: ${driveFile.data.name}`);
      }
    }

    // 3. Notification mail
    const dispoText = Array.isArray(disponibilites) ? disponibilites.join(', ') : disponibilites;
    const mailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
<div style="background:linear-gradient(135deg,#1e1b4b,#7c3aed);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
<h1 style="color:#fff;font-size:24px;letter-spacing:3px;margin:0;">LILIWATT</h1>
<p style="color:rgba(255,255,255,.8);font-size:12px;margin:4px 0 0;">Nouvelle candidature</p>
</div>
<div style="background:#f5f3ff;padding:28px;border-radius:0 0 12px 12px;">
<p style="font-size:16px;color:#1e1b4b;margin-bottom:20px;"><strong>${prenom} ${nom}</strong> a déposé sa candidature.</p>
<div style="background:#fff;border-radius:10px;padding:20px;border-left:4px solid #7c3aed;margin-bottom:16px;">
<table style="width:100%;font-size:13px;border-collapse:collapse;">
<tr><td style="padding:6px 0;color:#6b7280;font-weight:700;width:140px;">Email</td><td style="color:#1e1b4b;">${email}</td></tr>
<tr><td style="padding:6px 0;color:#6b7280;font-weight:700;">Téléphone</td><td style="color:#1e1b4b;">${telephone}</td></tr>
<tr><td style="padding:6px 0;color:#6b7280;font-weight:700;">Ville</td><td style="color:#1e1b4b;">${ville || '—'}</td></tr>
<tr><td style="padding:6px 0;color:#6b7280;font-weight:700;">Expérience</td><td style="color:#1e1b4b;">${experience || '—'}</td></tr>
<tr><td style="padding:6px 0;color:#6b7280;font-weight:700;">Disponibilités</td><td style="color:#1e1b4b;">${dispoText || '—'}</td></tr>
<tr><td style="padding:6px 0;color:#6b7280;font-weight:700;">Statut indépendant</td><td style="color:#1e1b4b;">${statutIndependant || '—'}</td></tr>
<tr><td style="padding:6px 0;color:#6b7280;font-weight:700;">Accompagnement</td><td style="color:#1e1b4b;">${accompagnement || '—'}</td></tr>
<tr><td style="padding:6px 0;color:#6b7280;font-weight:700;">Fichiers</td><td style="color:#1e1b4b;">${uploadedFiles.length} document(s)</td></tr>
</table>
</div>
<div style="background:#ede9fe;border-radius:10px;padding:16px;margin-bottom:16px;">
<p style="margin:0 0 6px;font-weight:700;color:#1e1b4b;font-size:13px;">💬 Motivations</p>
<p style="margin:0;font-size:13px;color:#374151;">${(motivations || '—').replace(/\n/g, '<br>')}</p>
</div>
<p style="font-size:12px;color:#6b7280;">📁 Documents dans Drive : <a href="https://drive.google.com/drive/folders/${candidatId}" style="color:#7c3aed;">Ouvrir le dossier</a></p>
</div></div>`;

    try {
      await sendMail('recrutement@liliwatt.fr', `📋 Nouvelle candidature — ${prenom} ${nom}`, mailHtml);
    } catch(mailErr) {
      console.error('⚠️ Erreur mail:', mailErr.message);
    }

    // 4. Rediriger vers merci
    res.redirect('/merci');

  } catch (err) {
    console.error('❌ Erreur candidature:', err.message, err.stack);
    res.status(500).send('Une erreur est survenue. Veuillez réessayer ou contacter recrutement@liliwatt.fr');
  }
});

app.listen(port, () => {
  console.log(`🚀 LILIWATT Recrutement démarré sur http://localhost:${port}`);
});
