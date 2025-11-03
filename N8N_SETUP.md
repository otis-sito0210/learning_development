# Configurando n8n Self-Hosted com API Gratuita

Como o n8n Cloud free tier não inclui acesso à API, precisamos hospedar o n8n em um serviço gratuito que suporte Docker.

## 🚀 Opção 1: Railway.app (Recomendado)

Railway oferece **$5 de crédito gratuito por mês** - mais que suficiente para rodar n8n!

### Passo a Passo:

1. **Acesse** https://railway.app/

2. **Sign up com GitHub**

3. **Criar Novo Projeto:**
   - Clique em **"New Project"**
   - Selecione **"Deploy Docker Image"**

4. **Configurar o Container:**
   - **Source Image:** `docker.n8n.io/n8nio/n8n`

5. **Adicionar Variáveis de Ambiente:**

   Vá em **Variables** e adicione:
   ```
   N8N_BASIC_AUTH_ACTIVE=true
   N8N_BASIC_AUTH_USER=admin
   N8N_BASIC_AUTH_PASSWORD=SuaSenhaSegura123
   N8N_HOST=0.0.0.0
   N8N_PORT=5678
   N8N_PROTOCOL=https
   WEBHOOK_URL=https://seu-app.up.railway.app/
   ```

6. **Deploy:**
   - Clique em **Deploy**
   - Aguarde alguns minutos
   - Railway vai gerar uma URL pública: `https://seu-app.up.railway.app`

7. **Habilitar a API:**
   - Acesse sua instância n8n: `https://seu-app.up.railway.app`
   - Login: `admin` / `SuaSenhaSegura123`
   - Vá em **Settings** (ícone engrenagem) → **API**
   - Ative a API e **crie uma API Key**
   - **Copie a API Key!**

### Suas credenciais para o .env:
```env
N8N_API_URL="https://seu-app.up.railway.app"
N8N_API_KEY="sua-api-key-aqui"
```

---

## 🔷 Opção 2: Render.com

Render também tem free tier que funciona para n8n.

### Passo a Passo:

1. **Acesse** https://render.com/

2. **Sign up com GitHub**

3. **Criar Web Service:**
   - Clique em **"New +"** → **"Web Service"**
   - Selecione **"Deploy an existing image from a registry"**

4. **Configurar:**
   - **Image URL:** `docker.n8n.io/n8nio/n8n`
   - **Name:** `n8n` (ou qualquer nome)
   - **Region:** Escolha o mais próximo
   - **Instance Type:** **Free**

5. **Environment Variables:**
   ```
   N8N_BASIC_AUTH_ACTIVE=true
   N8N_BASIC_AUTH_USER=admin
   N8N_BASIC_AUTH_PASSWORD=SuaSenhaSegura123
   N8N_HOST=0.0.0.0
   N8N_PORT=10000
   N8N_PROTOCOL=https
   WEBHOOK_URL=https://seu-app.onrender.com/
   ```

   ⚠️ **Importante:** Render usa porta `10000` no free tier!

6. **Deploy:**
   - Clique em **"Create Web Service"**
   - Aguarde o deploy (pode demorar ~10 minutos)
   - Sua URL: `https://seu-app.onrender.com`

7. **Habilitar a API:**
   - Acesse sua instância n8n
   - Login: `admin` / `SuaSenhaSegura123`
   - Settings → API → Create API Key
   - **Copie a API Key!**

### Suas credenciais para o .env:
```env
N8N_API_URL="https://seu-app.onrender.com"
N8N_API_KEY="sua-api-key-aqui"
```

---

## 🐳 Opção 3: Na Sua Máquina Local (Docker)

Se você tem Docker instalado localmente:

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

Então:
- Acesse: `http://localhost:5678`
- Configure a API: Settings → API → Create API Key

### Suas credenciais para o .env:
```env
N8N_API_URL="http://localhost:5678"
N8N_API_KEY="sua-api-key-aqui"
```

⚠️ **Atenção:** Você precisará usar um túnel como ngrok ou expor sua máquina para webhooks funcionarem.

---

## 📝 Próximos Passos

Depois de configurar n8n em qualquer uma das opções acima:

1. **Copie suas credenciais**
2. **Configure o .env:**
   ```bash
   cp .env.example .env
   code .env
   ```

3. **Cole suas credenciais:**
   ```env
   DATABASE_URL="sua-url-postgres"
   N8N_API_URL="https://seu-n8n.railway.app"
   N8N_API_KEY="sua-api-key"
   ```

4. **Inicialize o banco:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Rode a aplicação:**
   ```bash
   npm run dev
   ```

---

## 🎯 Qual Escolher?

| Serviço | Prós | Contras |
|---------|------|---------|
| **Railway** | Fácil, rápido, $5/mês grátis | Crédito limitado |
| **Render** | Totalmente grátis | Sleep após inatividade |
| **Local Docker** | Controle total, grátis | Precisa expor para webhooks |

**Recomendação:** Use **Railway** para começar rapidamente!

---

## 🐛 Troubleshooting

### Railway/Render: "Service unavailable"
- Aguarde alguns minutos após deploy
- Verifique os logs do serviço
- Certifique-se que as variáveis de ambiente estão corretas

### API não está disponível
- Verifique se você habilitou a API nas configurações
- Certifique-se que está usando n8n self-hosted (não cloud)
- Tente criar uma nova API key

### Webhooks não funcionam
- Verifique se `WEBHOOK_URL` está configurado corretamente
- Para local, use ngrok: `ngrok http 5678`

---

**Boa sorte!** 🚀
