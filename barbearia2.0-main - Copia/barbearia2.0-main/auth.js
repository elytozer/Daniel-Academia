// Verificar autenticação ao carregar a página
function checkAuth(){
  const loggedIn = localStorage.getItem('loggedIn')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  
  if(!loggedIn || !user){
    // Redirecionar para login se não autenticado
    if(window.location.pathname.endsWith('index.html') || window.location.pathname === '/'){
      window.location.href = 'login.html'
    }
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
