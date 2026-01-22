// Verificar autenticação ao carregar a página
function checkAuth(){
  const loggedIn = localStorage.getItem('loggedIn')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  
  if(!loggedIn || !user){
    // Redirecionar para login se não autenticado
    if(window.location.pathname.endsWith('index.html') || window.location.pathname === '/'){
      window.location.href = 'login.html'
    }
  } else {
    // Exibir mensagem de boas-vindas com o nome do usuário
    displayWelcome(user)
  }
}

// Exibir mensagem de boas-vindas
function displayWelcome(user){
  const userInfo = document.getElementById('userInfo')
  if(userInfo && user.name){
    userInfo.innerHTML = `<span class="welcome-message">Bem-vindo, <strong>${user.name}</strong>!</span>`
  }
}

// Logout
function logout(){
  localStorage.removeItem('loggedIn')
  localStorage.removeItem('user')
  window.location.href = 'login.html'
}

// Inicializar logout button
document.addEventListener('DOMContentLoaded', function(){
  checkAuth()
  const logoutBtn = document.getElementById('logoutBtn')
  if(logoutBtn){
    logoutBtn.addEventListener('click', logout)
  }
})
