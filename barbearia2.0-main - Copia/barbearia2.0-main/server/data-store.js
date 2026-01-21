const fs = require('fs')
const path = require('path')
const FILE = path.join(__dirname,'data.json')

function read(){
  try{const raw = fs.readFileSync(FILE,'utf8');return JSON.parse(raw)}catch(e){return {services:[],combos:[],appointments:[],favTimes:[],profile:{},feedbacks:[],promos:[],users:[]}}
}

function write(data){fs.writeFileSync(FILE,JSON.stringify(data,null,2),'utf8')}

function get(key){const d=read();return d[key]}
function set(key,val){const d=read();d[key]=val;write(d);return val}

function pushAppointment(appt){const d=read();d.appointments.unshift(appt);write(d);return appt}

function updateAppointment(id,patch){const d=read();const idx=d.appointments.findIndex(a=>a.id===id);if(idx===-1) return null;d.appointments[idx]=Object.assign({},d.appointments[idx],patch);write(d);return d.appointments[idx]}

function findUser(email){const d=read();return d.users.find(u=>u.email===email)}

function createUser(email,password,name,phone){
  const d=read()
  if(d.users.find(u=>u.email===email)) return null
  const user={id:'u'+Date.now(),email,password,name,phone,createdAt:new Date().toISOString()}
  d.users.push(user)
  write(d)
  return {id:user.id,email:user.email,name:user.name,phone:user.phone}
}

function validateUser(email,password){
  const user=findUser(email)
  if(!user || user.password!==password) return null
  return {id:user.id,email:user.email,name:user.name,phone:user.phone}
}

function deleteAppointment(id){const d=read();const idx=d.appointments.findIndex(a=>a.id===id);if(idx===-1) return null;const removed=d.appointments.splice(idx,1)[0];write(d);return removed}

module.exports = {read,write,get,set,pushAppointment,updateAppointment,deleteAppointment,findUser,createUser,validateUser}
