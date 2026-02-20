const LS_KEY = 'montda_forum_v1'
let state = {users:[], posts:[], currentUser:null}

function load(){
  const raw = localStorage.getItem(LS_KEY)
  if(raw) state = JSON.parse(raw)
}

function save(){
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

function $(sel){return document.querySelector(sel)}

function showModal(type){
  $('#modal').classList.remove('hidden')
  $('#modal-title').textContent = type==='login' ? 'تسجيل الدخول' : 'تسجيل حساب'
  $('#auth-form').dataset.mode = type
  $('#username').value = ''
  $('#password').value = ''
}

function hideModal(){
  $('#modal').classList.add('hidden')
}

function renderUser(){
  const nameEl = $('#user-name')
  const statusEl = $('#user-status')
  if(state.currentUser){
    nameEl.textContent = state.currentUser
    statusEl.textContent = 'مسجل كمستخدم'
    $('#btn-login').classList.add('hidden')
    $('#btn-register').classList.add('hidden')
    $('#btn-logout').classList.remove('hidden')
  } else {
    nameEl.textContent = 'زائر'
    statusEl.textContent = 'لم تقم بتسجيل الدخول'
    $('#btn-login').classList.remove('hidden')
    $('#btn-register').classList.remove('hidden')
    $('#btn-logout').classList.add('hidden')
  }
}

function renderPosts(){
  const feed = $('#feed')
  feed.innerHTML = ''
  const posts = [...state.posts].sort((a,b)=>b.createdAt-a.createdAt)
  if(posts.length===0){
    const c = document.createElement('div'); c.className='card'; c.textContent='لا توجد مشاركات بعد'; feed.appendChild(c); return
  }
  posts.forEach(p=>{
    const el = document.createElement('div'); el.className='card post';
    const h = document.createElement('h4'); h.textContent = p.title || (p.content.slice(0,40) + (p.content.length>40?'...':''))
    const meta = document.createElement('div'); meta.className='meta'; meta.textContent = `${p.author} • ${new Date(p.createdAt).toLocaleString()}`
    const content = document.createElement('div'); content.className='content'; content.textContent = p.content
    el.appendChild(h); el.appendChild(meta); el.appendChild(content)
    const actions = document.createElement('div'); actions.className='post-actions'
    if(state.currentUser===p.author){
      const btnEdit = document.createElement('button'); btnEdit.textContent='تعديل'; btnEdit.onclick=()=>editPost(p.id)
      const btnDel = document.createElement('button'); btnDel.textContent='حذف'; btnDel.onclick=()=>deletePost(p.id)
      actions.appendChild(btnEdit); actions.appendChild(btnDel)
    }
    el.appendChild(actions)
    feed.appendChild(el)
  })
}

function registerUser(username, password){
  username = username.trim()
  if(!username || !password) return {ok:false,msg:'املأ الحقول'}
  if(state.users.find(u=>u.name===username)) return {ok:false,msg:'اسم المستخدم موجود'}
  state.users.push({name:username,pass:btoa(password)})
  save()
  return {ok:true}
}

function loginUser(username,password){
  const user = state.users.find(u=>u.name===username)
  if(!user) return {ok:false,msg:'المستخدم غير موجود'}
  if(user.pass!==btoa(password)) return {ok:false,msg:'كلمة المرور خاطئة'}
  state.currentUser = username
  save()
  return {ok:true}
}

function logout(){
  state.currentUser = null
  save(); renderUser(); renderPosts();
}

function createPost(content){
  if(!state.currentUser) { alert('سجل الدخول أولاً'); return }
  content = content.trim(); if(!content) return
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2,7)
  state.posts.push({id,author:state.currentUser,content,createdAt:Date.now()})
  save(); renderPosts(); $('#post-content').value = ''
}

function editPost(id){
  const post = state.posts.find(p=>p.id===id)
  if(!post) return
  const newContent = prompt('عدّل المشاركة:', post.content)
  if(newContent===null) return
  post.content = newContent.trim()
  save(); renderPosts()
}

function deletePost(id){
  if(!confirm('هل تريد حذف المشاركة؟')) return
  state.posts = state.posts.filter(p=>p.id!==id)
  save(); renderPosts()
}

function init(){
  load(); renderUser(); renderPosts()

  $('#btn-register').onclick = ()=> showModal('register')
  $('#btn-login').onclick = ()=> showModal('login')
  $('#modal-cancel').onclick = hideModal
  $('#btn-logout').onclick = ()=>{ logout() }

  $('#auth-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const mode = e.target.dataset.mode
    const username = $('#username').value.trim()
    const password = $('#password').value
    if(mode==='register'){
      const r = registerUser(username,password)
      if(!r.ok) return alert(r.msg)
      alert('تم التسجيل! يمكنك الآن الدخول')
      hideModal()
    } else {
      const r = loginUser(username,password)
      if(!r.ok) return alert(r.msg)
      hideModal(); renderUser(); renderPosts()
    }
  })

  $('#btn-post').onclick = ()=> createPost($('#post-content').value)

  window.addEventListener('storage', ()=>{ load(); renderUser(); renderPosts() })
}

init()
