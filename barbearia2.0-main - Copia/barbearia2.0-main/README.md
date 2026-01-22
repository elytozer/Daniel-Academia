# Academia Express - Site Estático

Projeto estático com funcionalidades rápidas para agendamento de barbearia.

## Como Rodar o Programa

### Pré-requisitos
- Node.js e npm instalados

### Instalação e Execução

1. **Instale as dependências:**
```bash
npm install
```

2. **Inicie o servidor:**
```bash
npm start
```
ou, para desenvolvimento com auto-reload:
```bash
npm run dev
```

3. **Acesse a aplicação:**
- Abra seu navegador e acesse `http://localhost:3000`

## Como Usar

- Abra `index.html` no navegador (usar Live Server ou abrir diretamente).
- Funcionalidades implementadas localmente usando `localStorage`:
  - Agendar agora, favoritos de horário, combos e serviços rápidos
  - Pagamento via QR Code (simulado)
  - Notificações, lembretes (simulados) e cupons
  - Perfil do cliente, avaliações e recomendação/compartilhamento

## Arquivos principais
- [index.html](index.html) — interface
- [styles.css](styles.css) — estilos
- [app.js](app.js) — lógica (localStorage, QR, modais)


