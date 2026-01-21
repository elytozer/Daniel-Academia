// Lógica do app: dados armazenados no servidor
let SERVICES = []
let COMBOS = []

// API helpers
const API = {
  async get(endpoint){
    try{const res = await fetch(`/api${endpoint}`);return res.ok?res.json():null}catch(e){console.error(e);return null}
  },
  async post(endpoint,body){
    try{const res = await fetch(`/api${endpoint}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return res.ok?res.json():null}catch(e){console.error(e);return null}
  },
  async put(endpoint,body){
    try{const res = await fetch(`/api${endpoint}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return res.ok?res.json():null}catch(e){console.error(e);return null}
  }
}

// Cache e sync
const DB = {
  async get(k){return API.get(`/data?key=${k}`)},
  async set(k,v){return API.post('/data',{key:k,value:v})},
  async getFavTimes(){return (await API.get('/favTimes'))||[]},
  async saveFavTimes(times){return API.post('/favTimes',{times})},
  async getAppointments(){return (await API.get('/appointments'))||[]},
  async saveAppointment(appt){return API.post('/appointments',appt)},
  async updateAppointment(id,patch){return API.put(`/appointments/${id}`,patch)},
  async getProfile(){return (await API.get('/profile'))},
  async saveProfile(prof){return API.post('/profile',prof)},
  async getFeedbacks(){return (await API.get('/feedbacks'))||[]},
  async saveFeedback(fb){return API.post('/feedbacks',fb)},
  async getPromos(){return (await API.get('/promos'))||[]}
}

function el(id){return document.getElementById(id)}

async function loadInitialData(){
  SERVICES = await API.get('/services')||[{id:'musculacao', name:'Musculação', price:40, icon:'fa-dumbbell'},{id:'personal', name:'Personal Trainer', price:120, icon:'fa-user-tie'},{id:'yoga', name:'Aula de Yoga', price:30, icon:'fa-person-running'},{id:'avaliacao', name:'Avaliação Física', price:60, icon:'fa-heart-pulse'}]
  COMBOS = await API.get('/combos')||[{id:'personal_avaliacao', name:'Personal + Avaliação', items:['personal','avaliacao'], price:160},{id:'muscu_yoga', name:'Musculação + Aula de Yoga', items:['musculacao','yoga'], price:60}]
}

async function renderServices(){
  const container = el('servicesList')
  SERVICES.forEach(s=>{
    const d = document.createElement('div')
    d.className='service'
    d.innerHTML = `<i class="fa ${s.icon}"></i><strong>${s.name}</strong><span class="small">R$ ${s.price}</span>`
    d.onclick = ()=>openBooking({serviceId:s.id})
    container.appendChild(d)
  })
}

async function renderCombos(){
  const c = el('combosList')
  COMBOS.forEach(cb=>{
    const d=document.createElement('div');d.className='combo';d.innerHTML=`<strong>${cb.name}</strong><div class="small">R$ ${cb.price}</div>`
    d.onclick = ()=>openBooking({comboId:cb.id})
    c.appendChild(d)
  })
}

function openModal(html){
  el('modalBody').innerHTML=''
  el('modalBody').appendChild(html)
  el('modal').classList.remove('hidden')
}

function closeModal(){el('modal').classList.add('hidden')}

document.addEventListener('click',e=>{if(e.target.id==='modal' || e.target.id==='modalClose') closeModal()})

async function openBooking({serviceId,comboId}={}){
  const wrapper = document.createElement('div')
  const title = document.createElement('h3')
  title.textContent = 'Agendar Serviço'
  wrapper.appendChild(title)

  const select = document.createElement('select')
  select.id='serviceSelect'
  SERVICES.forEach(s=>{
    const o=document.createElement('option');o.value=s.id;o.textContent=`${s.name} - R$ ${s.price}`;select.appendChild(o)
  })
  wrapper.appendChild(select)

  const date = document.createElement('input');date.type='datetime-local';date.id='apptDate';wrapper.appendChild(date)

  const favs = await DB.getFavTimes()||[]
  const favWrap = document.createElement('div')
  favWrap.innerHTML='<label>Favoritos</label>'
  favs.forEach(t=>{const b=document.createElement('span');b.className='fav-time';b.textContent=t;b.onclick=()=>{date.value=t};favWrap.appendChild(b)})
  wrapper.appendChild(favWrap)

  const note = document.createElement('textarea');note.placeholder='Observações (opcional)';wrapper.appendChild(note)

  const row = document.createElement('div');row.className='row'
  const bookBtn = document.createElement('button');bookBtn.textContent='Confirmar e Pagar';bookBtn.className='primary'
  bookBtn.onclick = ()=>{createAppointment({serviceId:select.value,date:date.value,note:note.value,comboId})}
  const saveFav = document.createElement('button');saveFav.textContent='Salvar horário';saveFav.onclick=()=>saveFavorite(date.value)
  row.appendChild(bookBtn);row.appendChild(saveFav)
  wrapper.appendChild(row)

  openModal(wrapper)
  if(serviceId) select.value=serviceId
}

async function saveFavorite(t){
  if(!t)return alert('Escolha um horário')
  const favs=await DB.getFavTimes()||[]
  if(!favs.includes(t))favs.unshift(t)
  await DB.saveFavTimes(favs.slice(0,6))
  alert('Horário salvo como favorito')
}

async function createAppointment({serviceId,date,note,comboId}){
  if(!date) return alert('Escolha data e hora')
  const item = {serviceId,comboId,date,note,status:'confirmado'}
  try{
    const result = await API.post('/appointments',item)
    if(result&&result.id){
      closeModal();renderAppointments();openPayment(result)
    }else if(result&&result.error){
      alert(result.error)
    }else{
      alert('Erro ao agendar')
    }
  }catch(e){
    alert('Erro ao agendar: horário pode estar indisponível')
  }
}

async function renderAppointments(){
  const list = el('appointmentsList');list.innerHTML=''
  const appts = await DB.getAppointments()||[]
  if(appts.length===0){list.innerHTML='<div class="small">Nenhum agendamento</div>';return}
  appts.forEach(a=>{
    const div=document.createElement('div');div.className='card'
    const title = a.comboId? COMBOS.find(c=>c.id===a.comboId).name : SERVICES.find(s=>s.id===a.serviceId).name
    div.innerHTML = `<strong>${title}</strong><div class="small">${new Date(a.date).toLocaleString()}</div><div class="small">${a.status}</div>`
    const btns = document.createElement('div');btns.style.marginTop='8px'
    const pay = document.createElement('button');pay.textContent='Pagar agora';pay.onclick=()=>openPayment(a);btns.appendChild(pay)
    const remind = document.createElement('button');remind.textContent='Enviar lembrete';remind.onclick=()=>sendReminder(a);btns.appendChild(remind)
    const done = document.createElement('button');done.textContent='Finalizar';done.onclick=()=>completeAppointment(a.id);btns.appendChild(done)
    const fb = document.createElement('button');fb.textContent='Avaliar';fb.onclick=()=>openFeedback(a);btns.appendChild(fb)
    div.appendChild(btns)
    list.appendChild(div)
  })
}

function openPayment(appt){
  const wrapper = document.createElement('div')
  wrapper.innerHTML = `<h3>Pagamento</h3><p class="small">Use o QR abaixo para pagar rapidamente.</p><div id="qrcode"></div><div class="small">Valor: R$ ${getPrice(appt)}</div>`
  const payNow = document.createElement('button');payNow.textContent='Simular pagamento';payNow.className='primary'
  payNow.onclick = ()=>{markPaid(appt.id);alert('Pagamento registrado (simulado)');closeModal();renderAppointments()}
  wrapper.appendChild(payNow)
  openModal(wrapper)
  // gerar QR code simples com link de pagamento simulado
  setTimeout(()=>{new QRCode(document.getElementById('qrcode'),{text:`https://pag.example.com/pay?ref=${appt.id}&v=${getPrice(appt)}`,width:160,height:160})},100)
}

function getPrice(appt){if(appt.comboId)return COMBOS.find(c=>c.id===appt.comboId).price;return SERVICES.find(s=>s.id===appt.serviceId).price}

function markPaid(id){API.put(`/appointments/${id}`,{status:'pago'})}

async function sendReminder(appt){alert(`Lembrete enviado para o agendamento em ${new Date(appt.date).toLocaleString()} (simulado)`)}

async function completeAppointment(id){
  await fetch(`/api/appointments/${id}`,{method:'DELETE'})
  renderAppointments()
  alert('Agendamento removido com sucesso')
}

async function openFeedback(appt){
  const wrapper=document.createElement('div')
  wrapper.innerHTML=`<h3>Avaliar atendimento</h3><label>Nota (1-5)</label>`
  const nota=document.createElement('input');nota.type='number';nota.min=1;nota.max=5
  const comentario=document.createElement('textarea');comentario.placeholder='Comentário'
  const send=document.createElement('button');send.textContent='Enviar';send.onclick=()=>{saveFeedback(appt.id,nota.value,comentario.value);closeModal();alert('Obrigado pelo feedback!')}
  wrapper.appendChild(nota);wrapper.appendChild(comentario);wrapper.appendChild(send)
  openModal(wrapper)
}

async function saveFeedback(apptId,score,comment){
  const fb={apptId,score,comment,date:new Date().toISOString()}
  await DB.saveFeedback(fb)
}

function initNotifications(){el('notificationsBtn').onclick=async ()=>{
  const promos = await DB.getPromos()||[{title:'10% off na seg. feira'}]
  const wrapper=document.createElement('div');wrapper.innerHTML=`<h3>Notificações</h3>`
  promos.forEach(p=>{const d=document.createElement('div');d.className='card';d.innerHTML=`<strong>${p.title}</strong>`;wrapper.appendChild(d)})
  openModal(wrapper)
}}

function initContact(){el('contactBtn').onclick=()=>{const phone='5511999999999';window.open(`https://wa.me/${phone}?text=Olá,%20gostaria%20de%20informações%20sobre%20agendamento`,'_blank')}}

function initShare(){el('shareBtn').onclick=()=>{
  const data={title:'Barbearia Express',text:'Agende seu corte de forma rápida!',url:location.href}
  if(navigator.share) navigator.share(data).catch(()=>navigator.clipboard.writeText(location.href))
  else navigator.clipboard.writeText(location.href).then(()=>alert('Link copiado'))
}}

function initQuickButtons(){el('quickBook').onclick=()=>openBooking()
  el('promoBtn').onclick=()=>openPromos()
  el('couponsBtn').onclick=()=>openPromos()
}

function openPromos(){const wrapper=document.createElement('div');wrapper.innerHTML=`<h3>Cupons & Promoções</h3><div class="card"><strong>10% OFF para novos clientes</strong></div>`;openModal(wrapper)}

function initProfile(){el('profileBtn').onclick=async ()=>{
  const user = JSON.parse(localStorage.getItem('user')||'{}')
  const prof = await DB.getProfile()||{name:'',phone:''}
  const wrapper=document.createElement('div')
  wrapper.innerHTML = `<h3>Meu Perfil</h3>`
  const name = document.createElement('input');name.value=user.name||prof.name;name.placeholder='Nome'
  const phone = document.createElement('input');phone.type='tel';phone.value=user.phone||prof.phone;phone.placeholder='(00)000000-0000';phone.maxLength='14';phone.oninput=()=>{let v=phone.value.replace(/[^0-9]/g,'').slice(0,12);if(v.length>0){if(v.length<=2)v='('+v;else if(v.length<=8)v='('+v.slice(0,2)+')'+v.slice(2);else v='('+v.slice(0,2)+')'+v.slice(2,7)+'-'+v.slice(7)}phone.value=v}
  const save = document.createElement('button');save.textContent='Salvar';save.onclick=async ()=>{const clean=phone.value.replace(/[^0-9]/g,'');if(clean.length!==12)return alert('Telefone deve ter 12 dígitos');await DB.saveProfile({name:name.value,phone:phone.value});alert('Perfil salvo');closeModal()}
  wrapper.appendChild(name);wrapper.appendChild(phone);wrapper.appendChild(save)
  openModal(wrapper)
}}

async function init(){
  await loadInitialData()
  await renderServices()
  await renderCombos()
  await renderAppointments()
  
  // Exibir nome e telefone do usuário no header
  const user = JSON.parse(localStorage.getItem('user')||'{}')
  if(user.name || user.phone) {
    const userInfo = document.getElementById('userInfo')
    if(userInfo) {
      let infoText = ''
      if(user.name) infoText += `${user.name}`
      if(user.phone) infoText += `${infoText ? ' • ' : ''}${user.phone}`
      userInfo.textContent = infoText
      userInfo.style.fontSize = '0.9em'
      userInfo.style.color = '#666'
      userInfo.style.marginRight = '20px'
    }
  }
  
  initNotifications()
  initContact()
  initShare()
  initQuickButtons()
  initProfile()
}

init()
