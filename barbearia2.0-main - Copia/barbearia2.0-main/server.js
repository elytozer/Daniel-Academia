const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const ds = require('./server/data-store')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname)))

// API - Autenticação
app.post('/api/register', (req,res)=>{
  const {email,password,name,phone} = req.body
  if(!email || !password || !name || !phone) return res.status(400).json({error:'Missing fields'})
  if(!email.endsWith('@gmail.com')) return res.status(400).json({error:'Email deve ser @gmail.com'})
  const user = ds.createUser(email,password,name,phone)
  if(!user) return res.status(409).json({error:'Email already registered'})
  return res.status(201).json({success:true,user})
})

app.post('/api/login', (req,res)=>{
  const {email,password} = req.body
  if(!email || !password) return res.status(400).json({error:'Missing fields'})
  if(!email.endsWith('@gmail.com')) return res.status(400).json({error:'Email deve ser @gmail.com'})
  const user = ds.validateUser(email,password)
  if(!user) return res.status(401).json({error:'Invalid credentials'})
  return res.json({success:true,user})
})

// API - Serviços e Combos
app.get('/api/services', (req,res)=>{res.json(ds.get('services')||[])})
app.get('/api/combos', (req,res)=>{res.json(ds.get('combos')||[])})

// API - Horários Favoritos
app.get('/api/favTimes', (req,res)=>{res.json(ds.get('favTimes')||[])})
app.post('/api/favTimes', (req,res)=>{
  const {times} = req.body
  ds.set('favTimes',times)
  res.json(times)
})

// API - Agendamentos
app.get('/api/appointments', (req,res)=>{res.json(ds.get('appointments')||[])})
app.post('/api/appointments', (req,res)=>{
  const body = req.body
  if(!body.date) return res.status(400).json({error:'date required'})
  const appointments = ds.get('appointments')||[]
  const dateExists = appointments.some(a=>a.date===body.date)
  if(dateExists) return res.status(409).json({error:'Horário já ocupado'})
  const id = 'a'+Date.now()
  const appt = {id,serviceId:body.serviceId||null,comboId:body.comboId||null,date:body.date,note:body.note||'',status:'confirmado'}
  ds.pushAppointment(appt)
  return res.status(201).json(appt)
})

app.put('/api/appointments/:id', (req,res)=>{
  const id = req.params.id
  const updated = ds.updateAppointment(id,req.body)
  if(!updated) return res.status(404).json({error:'not found'})
  return res.json(updated)
})

app.delete('/api/appointments/:id', (req,res)=>{
  const id = req.params.id
  const deleted = ds.deleteAppointment(id)
  if(!deleted) return res.status(404).json({error:'not found'})
  return res.json({success:true,deleted})
})

// API - Perfil
app.get('/api/profile', (req,res)=>{res.json(ds.get('profile')||{})})
app.post('/api/profile', (req,res)=>{
  ds.set('profile',req.body)
  res.json(req.body)
})

// API - Feedbacks
app.get('/api/feedbacks', (req,res)=>{res.json(ds.get('feedbacks')||[])})
app.post('/api/feedbacks', (req,res)=>{
  const fb = req.body
  const feedbacks = ds.get('feedbacks')||[]
  feedbacks.unshift(fb)
  ds.set('feedbacks',feedbacks)
  res.json(fb)
})

// API - Promoções
app.get('/api/promos', (req,res)=>{res.json(ds.get('promos')||[])})

// API - Dados genéricos
app.get('/api/data', (req,res)=>{
  const key = req.query.key
  if(key) res.json(ds.get(key))
  else res.json(ds.read())
})

app.post('/api/data', (req,res)=>{
  const {key,value} = req.body
  ds.set(key,value)
  res.json(value)
})

// API - Pagamentos (stub)
app.post('/api/payments/:id', (req,res)=>{
  const id = req.params.id
  const updated = ds.updateAppointment(id,{status:'pago'})
  if(!updated) return res.status(404).json({error:'not found'})
  return res.json(updated)
})

// API - Lembrete (stub)
app.post('/api/reminder', (req,res)=>{
  console.log('reminder requested',req.body)
  return res.json({ok:true})
})

// API - WhatsApp (stub)
app.post('/api/whatsapp', (req,res)=>{
  console.log('whatsapp send',req.body)
  return res.json({ok:true})
})

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>console.log('Server running on port',PORT))
