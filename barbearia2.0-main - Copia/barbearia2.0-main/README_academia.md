# Academia FitExpress - Protótipo

Projeto convertido para o tema de academia — frontend estático com backend mínimo.

Como usar
- Rodar sem backend: abra `index.html` no navegador (Live Server recomendado).
- Rodar com backend (recomendado): inicie o servidor Node/Express descrito abaixo.

Funcionalidades implementadas (protótipo)
- Agendar aulas e serviços, favoritos de horário, combos e serviços rápidos
- Pagamento via QR Code (simulado)
- Notificações e lembretes (simulados) e cupons
- Perfil do cliente, avaliações rápidas e compartilhamento

Arquivos principais
- [index.html](index.html) — interface
- [styles.css](styles.css) — estilos
- [app.js](app.js) — lógica frontend (localStorage, QR, modais)
- [server.js](server.js) — servidor Express pequeno (dev)
- [server/data.json](server/data.json) — persistência JSON (protótipo)

Como rodar localmente (Node.js)

1. Instale dependências:

```bash
npm install
```

2. Inicie o servidor:

```bash
npm start
```

Abra http://localhost:3000 para acessar o frontend; a API está em http://localhost:3000/api.

