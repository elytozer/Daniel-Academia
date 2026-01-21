# Barbearia Express - Site Estático

Projeto estático com funcionalidades rápidas para agendamento de barbearia.

Como usar
- Abra `index.html` no navegador (usar Live Server ou abrir diretamente).
- Funcionalidades implementadas localmente usando `localStorage`:
  - Agendar agora, favoritos de horário, combos e serviços rápidos
  - Pagamento via QR Code (simulado)
  - Notificações, lembretes (simulados) e cupons
  - Perfil do cliente, avaliações e recomendação/compartilhamento

Arquivos principais
- [index.html](index.html) — interface
- [styles.css](styles.css) — estilos
- [app.js](app.js) — lógica (localStorage, QR, modais)

Observações
- Implementação é um protótipo estático; para produção adicionar backend
  para autenticação, persistência e integração com gateways de pagamento.
