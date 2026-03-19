// ═══════════════════════════════════════════════════
// script.js – Casa Nossa Mãe (Site Público)
// Comunicação com admin.html via localStorage
// TODO_DB: substituir getDB/setDB por fetch() à API REST
// ═══════════════════════════════════════════════════

function getDB(k, fb) {
  try { return JSON.parse(localStorage.getItem('cnm_' + k)) ?? fb; }
  catch { return fb; }
}
function setDB(k, v) { localStorage.setItem('cnm_' + k, JSON.stringify(v)); }

// ─── ESTATÍSTICAS DO HERO ───────────────────────
function carregarEstatisticas() {
  const st = getDB('stats', { familias: '280+', voluntarios: '45+', anos: '12', projetos: '8' });
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-familias',    st.familias    || '280+');
  set('stat-voluntarios', st.voluntarios || '45+');
  set('stat-anos',        st.anos        || '12');
  set('sobre-familias',   st.familias    || '280+');
  set('sobre-voluntarios',st.voluntarios || '45+');
  set('sobre-anos',       st.anos        || '12');
  set('sobre-projetos',   st.projetos    || '8');
}

// ─── EVENTOS ────────────────────────────────────
function renderEventos() {
  const todos = getDB('eventos', []);
  const list = document.getElementById('eventos-list');
  if (!list) return;
  list.innerHTML = todos.length
    ? todos.map(e => `
      <div class="evento-card" onclick="showToast('📅 ${e.titulo}')">
        <div class="evento-date-box">
          <div class="evento-day">${e.dia}</div>
          <div class="evento-month">${e.mes}</div>
        </div>
        <div class="evento-info">
          <div class="evento-titulo">${e.titulo}</div>
          <div class="evento-meta">
            <span>🕐 ${e.hora}</span>
            <span>📍 ${e.local}</span>
          </div>
        </div>
        <span class="evento-badge ${e.tipo === 'urgente' ? 'urgente' : ''}">${e.tipo === 'urgente' ? 'Destaque' : 'Aberto'}</span>
      </div>`).join('')
    : '<div style="text-align:center;padding:32px;color:var(--texto-suave);font-size:.9rem">📅 Nenhum evento agendado no momento.</div>';
}

// ─── CALENDÁRIO ─────────────────────────────────
let calDate = new Date();
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_NOMES = ['D','S','T','Q','Q','S','S'];

function renderCal() {
  const y = calDate.getFullYear(), m = calDate.getMonth();
  document.getElementById('cal-title').textContent = `${MESES[m]} ${y}`;
  const primeiro = new Date(y, m, 1).getDay();
  const totalDias = new Date(y, m + 1, 0).getDate();
  const hoje = new Date();
  const eventos = getDB('eventos', []);
  const diasEvento = eventos.filter(e => e.mesNum === m && e.ano === y).map(e => e.dia);
  let html = DIAS_NOMES.map(d => `<div class="cal-day-name">${d}</div>`).join('');
  for (let i = 0; i < primeiro; i++) html += `<div class="cal-day other-month"></div>`;
  for (let d = 1; d <= totalDias; d++) {
    const isHoje = d === hoje.getDate() && m === hoje.getMonth() && y === hoje.getFullYear();
    const temEv = diasEvento.includes(d);
    html += `<div class="cal-day${isHoje ? ' today' : ''}${temEv ? ' has-event' : ''}" onclick="showToast('📅 ${d}/${m + 1}/${y}')">${d}</div>`;
  }
  document.getElementById('cal-grid').innerHTML = html;
}
function calNav(dir) { calDate.setMonth(calDate.getMonth() + dir); renderCal(); }

// ─── CHATBOT ────────────────────────────────────
const CHAT_RESPONSES = {
  'o que é autismo': 'O Transtorno do Espectro Autista (TEA) é uma condição neurológica que afeta o desenvolvimento e a forma como a pessoa se comunica e interage com o mundo. Cada pessoa com autismo é única! 🧩',
  'autismo': 'O TEA é um espectro amplo. Nosso centro oferece apoio especializado para famílias e pessoas com autismo. Posso te ajudar com mais informações ou conectar você com nossa equipe! 💛',
  'voluntário': 'Para ser voluntário na Casa Nossa Mãe, você precisa preencher nossa ficha de inscrição, apresentar documentos básicos (RG, CPF) e assinar o Termo de Compromisso. Role a página para a seção de Voluntários e se inscreva! 🤝',
  'voluntarios': 'Temos vagas para Arte e Cultura, Educação, Saúde e Bem-estar, Administrativo e TI. Acesse a seção de Voluntários para se inscrever!',
  'eventos': 'Temos atividades toda semana! Confira nossa agenda na seção Eventos. 📅',
  'próximos eventos': 'Veja todos os eventos disponíveis na seção Eventos da página!',
  'documentos': 'Disponibilizamos: Regulamento Geral, Termo de Compromisso, Modelo de Certificado, Estatuto Social e Relatório Anual. Acesse a seção "Sobre Nós" para baixar! 📄',
  'certificados': 'Nossos voluntários recebem certificado de horas após concluir o período de voluntariado. O modelo está disponível na seção Sobre Nós! 🏅',
  'contato': 'Pode nos encontrar pelo WhatsApp, e-mail contato@casanossomae.org.br ou visitar nossa sede. Horário: Seg–Sex 8h–18h, Sáb 8h–12h. 📞',
  'default': 'Obrigado pelo contato! 💛 Para informações específicas, nossa equipe está disponível de Seg–Sex 8h–18h. Posso ajudar com: autismo, voluntariado, eventos, documentos ou contato!'
};

let chatOpen = false;
let chatInitiated = false;

function toggleChat() {
  chatOpen = !chatOpen;
  const w = document.getElementById('chatbot-window');
  if (chatOpen) {
    w.classList.add('open');
    document.getElementById('chat-tooltip').style.display = 'none';
    if (!chatInitiated) { chatInitiated = true; initChat(); }
    document.getElementById('chat-input').focus();
  } else { w.classList.remove('open'); }
}

function initChat() { addMsg('bot', 'Olá! 👋 Sou o assistente virtual da Casa Nossa Mãe. Como posso te ajudar hoje?'); }

function addMsg(type, text) {
  const c = document.getElementById('chat-messages');
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.innerHTML = `<div class="msg-bubble">${text}</div><div class="msg-time">${now}</div>`;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

function showTyping() {
  const c = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg bot'; div.id = 'typing-ind';
  div.innerHTML = '<div class="msg-bubble typing"><span></span><span></span><span></span></div>';
  c.appendChild(div); c.scrollTop = c.scrollHeight;
}
function removeTyping() { const t = document.getElementById('typing-ind'); if (t) t.remove(); }

function getBotResponse(text) {
  const lower = text.toLowerCase();
  for (const [key, resp] of Object.entries(CHAT_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return resp;
  }
  return CHAT_RESPONSES['default'];
}

function sendMsg() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  addMsg('user', text); input.value = ''; showTyping();
  setTimeout(() => { removeTyping(); addMsg('bot', getBotResponse(text)); }, 900 + Math.random() * 600);
}

function sendQuick(text) {
  if (!chatOpen) toggleChat();
  setTimeout(() => {
    addMsg('user', text); showTyping();
    setTimeout(() => { removeTyping(); addMsg('bot', getBotResponse(text)); }, 900);
  }, chatInitiated ? 0 : 500);
}

// ─── NOTIFICAÇÕES ────────────────────────────────
let notifOpen = false;

function toggleNotif() {
  notifOpen = !notifOpen;
  document.getElementById('notif-dropdown').classList.toggle('open', notifOpen);
  if (notifOpen) renderNotifs();
}

function renderNotifs() {
  const notifs = getDB('notifs', []);
  const list = document.getElementById('notif-list');
  list.innerHTML = notifs.length
    ? notifs.map(n => `
      <div class="notif-item ${n.lida ? '' : 'unread'}" onclick="markRead(${n.id})">
        <div class="notif-dot ${n.lida ? 'read' : ''}"></div>
        <div>
          <div class="notif-text">📢 ${n.titulo}: ${n.mensagem}</div>
          <div class="notif-date">${n.data}</div>
        </div>
      </div>`).join('')
    : '<div style="padding:20px;text-align:center;font-size:.85rem;color:var(--texto-suave)">Nenhuma notificação</div>';
  updateNotifBadge();
}

function markRead(id) {
  const notifs = getDB('notifs', []);
  const n = notifs.find(x => x.id === id);
  if (n) { n.lida = true; setDB('notifs', notifs); renderNotifs(); }
}

function markAllRead() {
  const notifs = getDB('notifs', []);
  notifs.forEach(n => n.lida = true);
  setDB('notifs', notifs);
  renderNotifs();
}

function updateNotifBadge() {
  const notifs = getDB('notifs', []);
  const unread = notifs.filter(n => !n.lida).length;
  const badge = document.getElementById('notif-badge');
  if (badge) badge.style.display = unread > 0 ? 'block' : 'none';
}

document.addEventListener('click', e => {
  if (notifOpen && !e.target.closest('#notif-dropdown') && !e.target.closest('.btn-notif')) {
    notifOpen = false;
    document.getElementById('notif-dropdown').classList.remove('open');
  }
});

// ─── VOLUNTÁRIO ──────────────────────────────────
function fillVolArea(area) {
  document.getElementById('vol-area').value = area;
  scrollToSection('voluntarios');
  setTimeout(() => document.getElementById('vol-nome').focus(), 500);
}

function submitVol() {
  const nome     = document.getElementById('vol-nome').value.trim();
  const email    = document.getElementById('vol-email').value.trim();
  const telefone = document.getElementById('vol-tel').value.trim();
  const area     = document.getElementById('vol-area').value;
  const motivo   = document.getElementById('vol-motivo').value.trim();
  const termo    = document.getElementById('vol-termo').checked;

  if (!nome || !email || !area) { showToast('⚠ Preencha todos os campos obrigatórios!'); return; }
  if (!termo) { showToast('⚠ Aceite os termos para continuar.'); return; }

  // TODO_DB: substituir por POST /api/voluntarios
  const vols = getDB('voluntarios', []);
  vols.unshift({
    id: Date.now(),
    nome, email,
    telefone: telefone || '—',
    area,
    motivacao: motivo || '—',
    status: 'pendente',
    data: new Date().toLocaleDateString('pt-BR')
  });
  setDB('voluntarios', vols);

  document.getElementById('modal-vol').classList.add('open');
  ['vol-nome','vol-email','vol-tel','vol-motivo'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('vol-area').value = '';
  document.getElementById('vol-termo').checked = false;
}

// ─── UTILS ───────────────────────────────────────
function scrollToSection(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function openMobileNav()  { document.getElementById('mobile-nav').classList.add('open'); }
function closeMobileNav() { document.getElementById('mobile-nav').classList.remove('open'); }

function showToast(msg) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ─── SCROLL REVEAL ────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
revealEls.forEach(el => observer.observe(el));

// ─── INICIALIZAÇÃO ────────────────────────────────
carregarEstatisticas();
renderEventos();
renderCal();
renderNotifs();

// Sumir tooltip após 5s
setTimeout(() => {
  const tt = document.getElementById('chat-tooltip');
  if (tt) { tt.style.opacity = '0'; tt.style.transition = 'opacity .5s'; }
}, 5000);

// Sincronizar quando admin.html alterar dados (aba aberta simultaneamente)
window.addEventListener('storage', e => {
  if (e.key && e.key.startsWith('cnm_')) {
    carregarEstatisticas();
    renderEventos();
    renderCal();
    renderNotifs();
  }
});

// Push notification simulada
setTimeout(() => {
  const cfg = getDB('config', { push: true });
  if (cfg.push && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(p => {
      if (p === 'granted') new Notification('Casa Nossa Mãe', { body: 'Bem-vindo! Confira nossa agenda de eventos.' });
    });
  }
  const notifs = getDB('notifs', []);
  const unread = notifs.filter(n => !n.lida);
  if (unread.length > 0) showToast(`🔔 ${unread.length} nova(s) notificação(ões). Clique no 🔔 para ver.`);
}, 3500);

