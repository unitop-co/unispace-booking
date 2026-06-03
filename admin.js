/* ───────────────────────────────────────────── */
let BKS = {};
let authed = false;
let filter = 'all';
let view = 'list';
let calYr = 0, calMo = 0, selDate = '';
let adminErr = '';
let adminOk = '';

function refreshBks(){
  BKS = loadLocalBks();
  if(authed) render();
}

window.addEventListener('storage', e => {
  if(e.key === STORAGE_KEY || e.key === BLOCKS_KEY) refreshBks();
});
window.addEventListener('focus', refreshBks);

const WD  = ['日','一','二','三','四','五','六'];
const MN  = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const pad = n => String(n).padStart(2,'0');
const fH  = h => `${pad(h)}:00`;
const toDS = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const admIco = (icon, cls) => iconHtml(icon, cls || 'adm-ico');

function isBookingPast(b){
  if(isPastDateDS(b.date)) return true;
  if(isTodayDS(b.date)){
    const {h, min} = twParts();
    return h > b.eh || (h === b.eh && min > 0);
  }
  return false;
}
function isBookingUpcoming(b){ return !isBookingPast(b); }

function allBkList(){
  return Object.entries(BKS).map(([id,b]) => ({ id, ...b }));
}

function dayBks(ds){
  return allBkList().filter(b => b.date === ds).sort((a,b) => a.sh - b.sh);
}

/* ── Auth ── */
function checkPw(){
  const pw = document.getElementById('pw')?.value || '';
  if(pw === ADMIN_PW){
    authed = true;
    const tp = twParts();
    calYr = tp.y;
    calMo = tp.m - 1;
    refreshBks();
    render();
  }else{
    document.getElementById('pw-err').style.display = 'block';
    document.getElementById('pw').value = '';
  }
}
document.addEventListener('keydown', e => {
  if(e.key === 'Enter' && !authed) checkPw();
});
function logout(){ authed = false; view = 'list'; selDate = ''; render(); }

/* ── Actions ── */
function setFilter(f){ filter = f; render(); }
function setView(v){ view = v; render(); }
function markPaid(id){
  if(markBookingPaid(id)){ refreshBks(); }
}
function calPrev(){
  if(calMo === 0){ calYr--; calMo = 11; }
  else calMo--;
  render();
}
function calNext(){
  if(calMo === 11){ calYr++; calMo = 0; }
  else calMo++;
  render();
}
function pickCalDate(ds){
  selDate = ds;
  view = 'cal';
  adminErr = '';
  adminOk = '';
  render();
}

function hourOpts(sel, minH, maxH){
  if(minH > maxH) return `<option value="">無可用時段</option>`;
  let o = '';
  for(let h = minH; h <= maxH; h++){
    o += `<option value="${h}"${h === sel ? ' selected' : ''}>${fH(h)}</option>`;
  }
  return o;
}

function endOptsFromStart(sh, minGap){
  const minEh = sh + minGap;
  return hourOpts(minEh, minEh, CLOSE);
}

/** 依開始時間更新結束時間選單（僅顯示當日剩餘時段） */
function syncAdminEndOpts(prefix){
  const minGap = prefix === 'adb' ? MIN_DUR : 1;
  const shEl = document.getElementById(prefix + '-sh');
  const ehEl = document.getElementById(prefix + '-eh');
  if(!shEl || !ehEl) return;
  const sh = +shEl.value;
  const minEh = sh + minGap;
  const prev = +ehEl.value;
  const sel = prev >= minEh && prev <= CLOSE ? prev : minEh;
  ehEl.innerHTML = endOptsFromStart(sh, minGap);
  if(ehEl.options.length && sel >= minEh) ehEl.value = String(sel);
}

function submitBlock(){
  adminErr = '';
  adminOk = '';
  const sh = +document.getElementById('blk-sh')?.value;
  const eh = +document.getElementById('blk-eh')?.value;
  const note = document.getElementById('blk-note')?.value || '';
  try{
    addBlockEntry(selDate, sh, eh, note);
    adminOk = '已關閉時段';
    render();
  }catch(e){
    adminErr = e.message || '關閉失敗';
    render();
  }
}

function submitAdminBk(){
  adminErr = '';
  adminOk = '';
  const name = document.getElementById('adb-name')?.value || '';
  const phone = document.getElementById('adb-phone')?.value || '';
  const sh = +document.getElementById('adb-sh')?.value;
  const eh = +document.getElementById('adb-eh')?.value;
  const status = document.getElementById('adb-st')?.value || 'paid';
  try{
    addAdminBooking({ date: selDate, sh, eh, name, phone, status });
    adminOk = status === 'paid' ? '代客預約已建立（預約成功）' : '代客預約已建立（待繳費）';
    render();
  }catch(e){
    adminErr = e.message || '建立失敗';
    render();
  }
}

function removeBlock(id){
  if(removeBlockEntry(id)){
    adminOk = '已解除關閉';
    adminErr = '';
    render();
  }
}

function removeBk(id){
  if(confirm('確定刪除此筆預約紀錄？')){
    deleteBooking(id);
    adminOk = '已刪除預約';
    adminErr = '';
    refreshBks();
  }
}

/* ── Stats ── */
function getStats(){
  const all = allBkList();
  const up = all.filter(b => isBookingUpcoming(b) && blocksSlot(b));
  const past = all.filter(b => isBookingPast(b));
  const reserved = all.filter(b => (b.status||'reserved')==='reserved' && !isReserveExpired(b) && isBookingUpcoming(b));
  const paid = all.filter(b => b.status==='paid' && isBookingUpcoming(b));
  const amt = all.filter(b => blocksSlot(b) || b.status==='paid').reduce((s,b) => s + (b.price||0), 0);
  return { total: all.length, upcoming: up.length, past: past.length, reserved: reserved.length, paid: paid.length, amt };
}

/* ── Render ── */
function render(){
  document.getElementById('root').innerHTML = authed ? renderDash() : renderLogin();
  if(authed && view === 'cal' && selDate && !isPastDateDS(selDate)){
    syncAdminEndOpts('blk');
    syncAdminEndOpts('adb');
  }
}

function renderLogin(){
  return`<nav class="nav">
  <div class="logo-box">${logoHtml('logo-img')}</div>
  <div><div class="nav-name">後台管理</div><div class="nav-sub">由你分享空間</div></div>
</nav>
<div class="login-wrap">
  <div class="login-icon">${admIco(ICONS.lock,'site-icon-img-lg')}</div>
  <div class="login-title">管理員登入</div>
  <div class="login-sub">輸入密碼以進入後台</div>
  <input id="pw" class="input pw-input" type="password" placeholder="••••••••">
  <div id="pw-err" style="display:none;color:#d32f2f;font-size:12px;margin-bottom:12px;text-align:center">密碼錯誤，請重試</div>
  <button type="button" class="btn" onclick="checkPw()">登入</button>
</div>`;
}

function renderBkCard(b){
  const past = isBookingPast(b);
  const wd = WD[wdIndex(b.date)];
  const si = getStatusInfo(b);
  const canPay = (b.status||'reserved')==='reserved' && !isReserveExpired(b) && !past;
  return`<div class="bk-card${past?' past':' upcoming'}${si.cls==='reserved'&&!past?' reserved':''}${si.cls==='paid'&&!past?' paid-card':''}">
    <div class="bk-top">
      <div>
        <div class="bk-date">${b.date}<span class="bk-wd">（週${wd}）</span></div>
        <div style="font-size:11px;color:${past?'#aaa':'#4A7490'};margin-top:2px;font-weight:500">${past?'已結束':'即將到來'}・NT$${RATE}/時</div>
        <span class="bk-status ${si.cls}">${si.label}</span>
        ${si.cls==='reserved'&&!past?`<div class="bk-hold">${formatReserveRemain(b)}</div>`:''}
      </div>
      <div class="bk-time${past?' past-t':''}">${fH(b.sh)} – ${fH(b.eh)}<br><span style="font-size:10px;font-weight:400">${b.eh-b.sh}小時</span></div>
    </div>
    <div class="bk-mid">
      <div class="bk-name">${admIco(ICONS.name)} ${esc(b.name)}</div>
      <div class="bk-ph"><a href="tel:${esc(b.phone)}">${admIco(ICONS.phone)} <span>${esc(formatTWPhone(b.phone))}</span></a></div>
    </div>
    <div class="bk-foot">
      <div class="bk-meta">保留於 ${new Date(b.ts).toLocaleString('zh-TW',{timeZone:TZ,month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}${b.paidAt?`<br>收款於 ${new Date(b.paidAt).toLocaleString('zh-TW',{timeZone:TZ,month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}`:''}</div>
      <div class="bk-price${past?' past-p':''}">NT$${(b.price||0).toLocaleString()}</div>
    </div>
    ${canPay?`<button type="button" class="btn btn-sm" onclick="markPaid('${b.id}')">${admIco(ICONS.status,'adm-ico-sm')} 確認收款・預約成功</button>`:''}
    <button type="button" class="btn-o btn-sm" onclick="removeBk('${b.id}')">${admIco(ICONS.delete,'adm-ico-sm')} 刪除紀錄</button>
  </div>`;
}

function renderAdminCal(){
  const first = new Date(calYr, calMo, 1);
  const last = new Date(calYr, calMo+1, 0).getDate();
  const todayStr = todayDS();
  let c = '';
  for(let i=0;i<first.getDay();i++) c += '<div></div>';
  for(let d=1;d<=last;d++){
    const dt = new Date(calYr, calMo, d);
    const ds = toDS(dt);
    const past = isPastDateDS(ds);
    const tod = ds === todayStr;
    const sel = ds === selDate;
    const list = dayBks(ds);
    const blocks = dayBlocks(ds);
    const active = list.filter(blocksSlot).length;
    const expired = list.filter(b => isReserveExpired(b)).length;
    const hasMark = list.length || blocks.length;
    c += `<button type="button" class="cal-d${past?' past':sel?' sel':tod?' tod':''}" onclick="pickCalDate('${ds}')">${d}${hasMark?`<span class="bkdot${active?' on':''}${expired&&!active?' exp':''}"></span>`:''}</button>`;
  }
  return`<div class="cal-box">
    <div class="cal-nav"><button type="button" class="cal-btn" onclick="calPrev()">‹</button><span class="cal-title">${calYr}年 ${MN[calMo]}</span><button type="button" class="cal-btn" onclick="calNext()">›</button></div>
    <div class="cal-hdr">${WD.map((d,i)=>`<div class="cal-wd${i===0||i===6?' we':''}">${d}</div>`).join('')}</div>
    <div class="cal-grid">${c}</div>
    <div class="cal-leg"><span><span class="ldot on"></span>有效預約</span><span><span class="ldot exp"></span>僅逾時紀錄</span><span><span class="ldot blk"></span>含關閉時段</span></div>
  </div>`;
}

function renderDayPanel(){
  if(!selDate) return `<div class="day-hint">${admIco(ICONS.date,'adm-ico')} 點選日期查看當日預約狀況</div>`;
  const list = dayBks(selDate);
  const blocks = dayBlocks(selDate);
  const wd = WD[wdIndex(selDate)];
  const past = isPastDateDS(selDate);
  const minSH = minStartHour(selDate);
  const slots = [];
  for(let h=OPEN;h<CLOSE;h++){
    const hit = list.filter(b => b.sh <= h && b.eh > h);
    const blk = blocks.find(b => b.sh <= h && b.eh > h);
    const blocking = hit.find(blocksSlot);
    const expired = hit.find(b => isReserveExpired(b));
    let cls = 'slot-free', lbl = '可預約';
    if(blocking){
      const si = getStatusInfo(blocking);
      cls = si.cls==='paid'?'slot-paid':'slot-reserved';
      lbl = `${fH(blocking.sh)}–${fH(blocking.eh)} ${blocking.name}`;
    }else if(blk){
      cls = 'slot-blocked';
      lbl = `已關閉${blk.note?'・'+blk.note:''}`;
    }else if(expired){
      cls = 'slot-expired';
      lbl = `${fH(expired.sh)}–${fH(expired.eh)} 已釋出`;
    }
    slots.push(`<div class="slot-row ${cls}"><span>${fH(h)}–${fH(h+1)}</span><span>${esc(lbl)}</span></div>`);
  }

  const maxStart = Math.max(minSH, CLOSE - MIN_DUR);
  const bkStartOpts = hourOpts(minSH, minSH, maxStart);
  const bkEndOpts = endOptsFromStart(minSH, MIN_DUR);
  const blkStartOpts = hourOpts(minSH, minSH, CLOSE - 1);
  const blkEndOpts = endOptsFromStart(minSH, 1);

  const adminForms = past ? `<div class="admin-note">此日期已過，僅供查看紀錄</div>` : `
    <div class="admin-panel">
      <div class="sec-title">關閉時段</div>
      <div class="admin-form">
        <div class="form-row"><label>開始</label><select id="blk-sh" class="input input-sm" onchange="syncAdminEndOpts('blk')">${blkStartOpts}</select></div>
        <div class="form-row"><label>結束</label><select id="blk-eh" class="input input-sm">${blkEndOpts}</select></div>
        <div class="form-row full"><label>備註</label><input id="blk-note" class="input input-sm" type="text" placeholder="例：場地維護"></div>
        <button type="button" class="btn btn-sm btn-dark" onclick="submitBlock()">${admIco(ICONS.ban,'adm-ico-sm')} 關閉此時段</button>
      </div>
    </div>
    <div class="admin-panel">
      <div class="sec-title">代客預約</div>
      <div class="admin-form">
        <div class="form-row"><label>開始</label><select id="adb-sh" class="input input-sm" onchange="syncAdminEndOpts('adb')">${bkStartOpts}</select></div>
        <div class="form-row"><label>結束</label><select id="adb-eh" class="input input-sm">${bkEndOpts}</select></div>
        <div class="form-row full"><label>姓名</label><input id="adb-name" class="input input-sm" type="text" placeholder="客戶姓名"></div>
        <div class="form-row full"><label>電話</label><input id="adb-phone" class="input input-sm" type="tel" placeholder="0912345678"></div>
        <div class="form-row full"><label>狀態</label><select id="adb-st" class="input input-sm"><option value="paid">已收款・預約成功</option><option value="reserved">待繳費・保留時段</option></select></div>
        <button type="button" class="btn btn-sm" onclick="submitAdminBk()">${admIco(ICONS.reserve,'adm-ico-sm')} 建立代客預約</button>
      </div>
    </div>`;

  const blockList = blocks.length ? `<div class="sec-title" style="margin-top:16px">已關閉時段<span class="bk-count">${blocks.length} 段</span></div>
    ${blocks.map(b=>`<div class="block-item"><div><strong>${fH(b.sh)} – ${fH(b.eh)}</strong>${b.note?`<span class="block-note">${esc(b.note)}</span>`:''}</div>${past?'':`<button type="button" class="link-btn" onclick="removeBlock('${b.id}')">解除</button>`}</div>`).join('')}` : '';

  return`<div class="day-panel">
    ${adminOk?`<div class="admin-ok">${esc(adminOk)}</div>`:''}
    ${adminErr?`<div class="admin-err">${esc(adminErr)}</div>`:''}
    <div class="sec-title">${selDate}（週${wd}）<span class="bk-count">${list.length} 筆預約${blocks.length?`・${blocks.length} 段關閉`:''}</span></div>
    <div class="slot-list">${slots.join('')}</div>
    ${adminForms}
    ${blockList}
    ${list.length?`<div class="sec-title" style="margin-top:16px">詳細紀錄</div>${list.map(renderBkCard).join('')}`:`${!blocks.length?`<div class="empty" style="padding:30px 0"><div class="empty-icon">${admIco(ICONS.search,'adm-ico-lg')}</div>當日無預約紀錄</div>`:''}`}
  </div>`;
}

function renderDash(){
  const st = getStats();
  const all = allBkList();
  const sorted = all.sort((a,b) => new Date(b.date+' '+fH(b.sh)) - new Date(a.date+' '+fH(a.sh)));
  let list = sorted;
  if(filter==='upcoming') list = sorted.filter(b => isBookingUpcoming(b) && blocksSlot(b));
  else if(filter==='past') list = sorted.filter(b => isBookingPast(b));
  else if(filter==='reserved') list = sorted.filter(b => (b.status||'reserved')==='reserved' && !isReserveExpired(b));
  else if(filter==='paid') list = sorted.filter(b => b.status==='paid');

  return`<nav class="nav">
  <div class="logo-box">${logoHtml('logo-img')}</div>
  <div><div class="nav-name">後台管理</div><div class="nav-sub">由你分享空間｜長春9-2</div></div>
  <div class="nav-badge">已登入</div>
</nav>

<div class="dash">
  <div class="local-hint">${admIco(ICONS.time)}<span class="local-hint-t">待繳費保留 ${RESERVE_HOURS} 小時，逾時自動釋出。日曆檢視可<strong>關閉時段</strong>或<strong>代客預約</strong>，客戶端會同步顯示。</span></div>

  <div class="stats-row">
    <div class="stat"><div class="stat-l">待繳費</div><div class="stat-v">${st.reserved}</div></div>
    <div class="stat"><div class="stat-l">預約成功</div><div class="stat-v">${st.paid}</div></div>
  </div>
  <div class="stats-row">
    <div class="stat"><div class="stat-l">有效預約</div><div class="stat-v">${st.upcoming}</div></div>
    <div class="stat"><div class="stat-l">已結束</div><div class="stat-v" style="color:#999">${st.past}</div></div>
  </div>
  <div class="stats-row">
    <div class="stat full"><div><div class="stat-l">有效預約金額</div><div class="stat-v">NT$${st.amt.toLocaleString()}</div></div></div>
  </div>

  <div class="filter-tabs view-tabs">
    <button type="button" class="tab${view==='list'?' active':''}" onclick="setView('list')">${admIco(view==='list'?ICONS.list_click:ICONS.list,'adm-ico-sm')} 列表</button>
    <button type="button" class="tab${view==='cal'?' active':''}" onclick="setView('cal')">${admIco(view==='cal'?ICONS.date_click:ICONS.date,'adm-ico-sm')} 日曆</button>
  </div>

  ${view==='cal'?`
    ${renderAdminCal()}
    ${renderDayPanel()}
  `:`
    <div class="filter-tabs">
      <button type="button" class="tab${filter==='all'?' active':''}" onclick="setFilter('all')">全部</button>
      <button type="button" class="tab${filter==='reserved'?' active':''}" onclick="setFilter('reserved')">待繳費</button>
      <button type="button" class="tab${filter==='paid'?' active':''}" onclick="setFilter('paid')">已成功</button>
      <button type="button" class="tab${filter==='upcoming'?' active':''}" onclick="setFilter('upcoming')">有效</button>
    </div>
    <div class="sec-title">預約紀錄<span class="bk-count">共 ${list.length} 筆</span></div>
    ${list.length===0?`<div class="empty"><div class="empty-icon">${admIco(ICONS.search,'adm-ico-lg')}</div>目前沒有符合的紀錄</div>`:list.map(renderBkCard).join('')}
  `}
</div>

<div class="sticky-bottom">
  <button type="button" class="btn-o" onclick="logout()">登出後台</button>
</div>`;
}

function initAdmin(){
  BKS = loadLocalBks();
  render();
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAdmin);
else initAdmin();
setInterval(refreshBks, 60000);
