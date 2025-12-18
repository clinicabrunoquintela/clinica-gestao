# Configuração do .env

Atualize o arquivo `.env` ou `.env.local` na raiz do projeto com as seguintes configurações:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# NextAuth
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_SECRET="your-secret-key-here"

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=darkbdf1234@gmail.com
EMAIL_PASS=Klgndxiydzxkzeuq

# Não vamos mais enviar para um email fixo
SEND_PDF_TARGET_EMAIL=
```

## Notas Importantes:

- `EMAIL_PORT=465` é obrigatório para Gmail com senha de app
- `EMAIL_SECURE=true` é obrigatório para usar porta 465
- `EMAIL_USER` deve ser o email Gmail completo
- `EMAIL_PASS` deve ser a senha de app do Gmail (não a senha normal da conta)
- `SEND_PDF_TARGET_EMAIL` foi deixado vazio pois agora envia para o email do usuário logado
