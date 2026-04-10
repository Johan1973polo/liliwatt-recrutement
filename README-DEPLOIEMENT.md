# 📋 Guide de déploiement sur Netlify - ECOGIES Recrutement

## 🎯 Dernières modifications

### Formulaire mis à jour :
✅ **Cases à cocher pour disponibilités** : Lundi à Samedi + option "Toute la semaine"
✅ **Documents obligatoires** : Pièce d'identité, Justificatif de domicile, RIB (requis pour préparation du contrat)
✅ **Validation automatique** : Au moins un jour de disponibilité doit être sélectionné
✅ **Interface améliorée** : Checkboxes avec feedback visuel et interactions

---

# 📋 Guide de déploiement sur Netlify - ECOGIES Recrutement

## 🚀 Étapes de déploiement

### 1. Préparation
Tous les fichiers sont prêts dans ce dossier :
- ✅ `index.html` - Page principale
- ✅ `merci.html` - Page de confirmation
- ✅ `mentions-legales.html` - Mentions légales
- ✅ `netlify.toml` - Configuration Netlify
- ✅ Images (logos, vidéo, photo d'équipe)

### 2. Déployer sur Netlify

#### Option A : Via l'interface Netlify (recommandé)
1. Allez sur [https://app.netlify.com](https://app.netlify.com)
2. Connectez-vous ou créez un compte
3. Cliquez sur **"Add new site"** > **"Deploy manually"**
4. **IMPORTANT** : Sélectionnez UNIQUEMENT les fichiers suivants (ne pas prendre le dossier entier) :
   - `index.html`
   - `merci.html`
   - `mentions-legales.html`
   - `Logo-Ecogies-blanc (2).png`
   - `Logo-Ecogies-400x149-1 (13).png`
   - `photo equipe.png`
   - `video de presentation .mp4`
   - `netlify.toml`
   - `_redirects`
5. Glissez-déposez ces fichiers dans la zone de dépôt
6. Attendez le déploiement (environ 1 minute)
7. Votre site est en ligne ! 🎉

#### Option B : Via Netlify CLI
```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
cd "ecogies recrutement"
netlify deploy --prod
```

### 3. Configurer les notifications par email ⚠️ IMPORTANT

**Après le déploiement, configurez l'envoi d'email vers bo@ecogies.fr :**

1. Dans le dashboard Netlify, allez dans votre site
2. Cliquez sur **"Site settings"**
3. Dans le menu de gauche, cliquez sur **"Forms"**
4. Vous devriez voir le formulaire **"candidature-ecogies"**
5. Cliquez sur **"Form notifications"** en haut
6. Cliquez sur **"Add notification"**
7. Sélectionnez **"Email notification"**
8. Configurez :
   - **Event to listen for** : New form submission
   - **Form** : candidature-ecogies
   - **Email to notify** : `bo@ecogies.fr`
   - **Subject line** : `[RECRUTEMENT] Nouvelle candidature ECOGIES`
9. Cliquez sur **"Save"**

### 4. Personnaliser le domaine (optionnel)

1. Dans **"Site settings"** > **"Domain management"**
2. Cliquez sur **"Add custom domain"**
3. Entrez votre domaine (ex: `recrutement.ecogies.fr`)
4. Suivez les instructions pour configurer les DNS

## 📧 Que se passe-t-il quand quelqu'un soumet le formulaire ?

1. ✅ Le candidat remplit le formulaire avec ses informations et documents
2. ✅ Il clique sur "Envoyer mes documents"
3. ✅ Netlify reçoit les données et fichiers
4. ✅ Le candidat est redirigé vers la page de remerciement
5. ✅ **Vous recevez un email à bo@ecogies.fr** avec toutes les informations
6. ✅ Les données sont aussi stockées dans l'interface Netlify (Forms > Active forms)

## 🔍 Consulter les soumissions

Vous pouvez consulter toutes les soumissions de formulaire dans :
- Dashboard Netlify > Votre site > **Forms** > **candidature-ecogies**
- Vous verrez la liste de toutes les candidatures avec leurs fichiers joints

## 🛡️ Sécurité

- ✅ Protection anti-spam intégrée (honeypot)
- ✅ HTTPS automatique sur Netlify
- ✅ Politique RGPD incluse
- ✅ Fichiers uploadés stockés de manière sécurisée

## 📱 Test

Après déploiement, testez le formulaire :
1. Allez sur votre site
2. Remplissez le formulaire avec des données de test
3. Uploadez des fichiers
4. Vérifiez que vous recevez bien l'email à bo@ecogies.fr

## ⚠️ Note importante

Les fichiers uploadés via Netlify Forms ont une limite de :
- **10 MB par fichier**
- **20 MB total par soumission**

Si vous avez besoin de limites plus élevées, contactez le support Netlify.

## 🆘 Support

En cas de problème :
- Documentation Netlify Forms : [https://docs.netlify.com/forms/setup/](https://docs.netlify.com/forms/setup/)
- Support Netlify : [https://www.netlify.com/support/](https://www.netlify.com/support/)

---

✅ **Votre site de recrutement ECOGIES est prêt à être déployé !**