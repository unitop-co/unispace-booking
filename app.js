/* ═══════════════════════════════════════════════
   ⚠️  可修改的設定 → 請改 config.js
   ═══════════════════════════════════════════════ */

/* ─────────────────────────────────────────────── */
let BKS={};
let S={
  pg:'main',step:1,
  selDate:'',sh:null,eh:null,
  name:'',phone:'',err:'',submitting:false,
  yr:0,mo:0,
  lookPhone:'',
  equipExpanded:false
};
let spaceSlideIdx = 0;
let spaceCarouselTimer = null;

async function refreshBks(){
  try { BKS = await loadRemoteBks(); } catch(e) { BKS={}; }
  render();
}
const set=u=>{Object.assign(S,u);render();};

/** 重新渲染前先保留表單輸入（避免手機 focus／定時刷新清掉資料） */
function snapshotFormState(){
  if(S.pg!=='booking')return;
  if(S.step===3){
    const n=document.getElementById('n'), p=document.getElementById('p');
    if(n) S.name=n.value;
    if(p) S.phone=p.value;
  }
  if(S.pg==='lookup'){
    const lp=document.getElementById('lp');
    if(lp) S.lookPhone=lp.value;
  }
}

window.addEventListener('focus', refreshBks);

const WD  = ['日','一','二','三','四','五','六'];
const MN  = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const pad = n => String(n).padStart(2,'0');
const fH  = h => `${pad(h)}:00`;
const toDS= d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const esc = s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const tp=twParts();
S.yr=tp.y;
S.mo=tp.m-1;

const saveBk=async b=>{
  const id='bk_'+Date.now();
  await saveRemoteBk(id, {...b, source:'user'});
};

const dBks=ds=>Object.values(BKS).filter(b=>b.date===ds&&blocksSlot(b));
const dBlks=ds=>dayBlocks(ds);
const hourBlocked=(ds,h)=>dBlks(ds).some(b=>h>=b.sh&&h<b.eh);
const isFree=(ds,sh,eh)=>sh!==null&&eh!==null&&!slotOverlapsBlock(ds,sh,eh)&&!dBks(ds).some(b=>ovlp(sh,eh,b.sh,b.eh));
const dur=()=>(S.sh!==null&&S.eh!==null)?S.eh-S.sh:0;
const price=()=>{const d=dur();return d>=MIN_DUR?d*RATE:0;};
const canGo=()=>dur()>=MIN_DUR&&!!S.selDate&&isFree(S.selDate,S.sh,S.eh);

/* ── Nav ── */
function scrollContact(){set({pg:'main'});setTimeout(()=>{const el=document.getElementById('contact');if(el)el.scrollIntoView({behavior:'smooth'});},120);}

/* ── Actions ── */
function goBooking(){set({pg:'booking',step:1,selDate:'',sh:null,eh:null,name:'',phone:'',err:'',submitting:false});}
function goLookup() {set({pg:'lookup',lookPhone:'',err:''});}
function reset()    {set({pg:'main',step:1,selDate:'',sh:null,eh:null,name:'',phone:'',err:'',submitting:false});}
function backStep() {if(S.step>1&&S.step<4)set({step:S.step-1,err:''});}
function calPrev()  {if(S.mo===0)set({yr:S.yr-1,mo:11});else set({mo:S.mo-1});}
function calNext()  {if(S.mo===11)set({yr:S.yr+1,mo:0});else set({mo:S.mo+1});}
function pickDate(ds){set({selDate:ds,sh:null,eh:null,err:'',step:2});}
function pickSH(h)  {
  if(isTodayDS(S.selDate)&&h<minStartHour(S.selDate)){set({err:'此時段已過，請選其他時間'});return;}
  if(hourBlocked(S.selDate,h)){set({err:'此時段已關閉，請選其他時間'});return;}
  set({sh:h,eh:null,err:''});
}
function pickEH(h)  {
  if(h-S.sh<MIN_DUR){set({err:`最少需預約 ${MIN_DUR} 小時`});return;}
  if(slotOverlapsBlock(S.selDate,S.sh,h)){set({err:'此時段已關閉，請選其他時間'});return;}
  if(!isFree(S.selDate,S.sh,h)){set({err:'此時段已被預約，請選其他時間'});return;}
  set({eh:h,err:''});
}
function toStep3(){if(canGo())set({step:3,err:''});}
async function submitBk(e){
  if(e&&e.preventDefault) e.preventDefault();
  if(S.submitting)return;
  snapshotFormState();
  const name=(document.getElementById('n')?.value||S.name||'').trim();
  const phone=document.getElementById('p')?.value||S.phone||'';
  if(!name){set({err:'請填寫姓名',name,phone});return;}
  const pv=validateTWPhone(phone);
  if(!pv.ok){set({err:pv.err,name,phone});return;}
  S.name=name;S.phone=pv.phone;
  set({submitting:true,err:''});
  try{
    await saveBk({date:S.selDate,sh:S.sh,eh:S.eh,name:S.name,phone:S.phone,price:price(),status:'reserved',ts:new Date().toISOString()});
    set({step:4,err:'',submitting:false});
  }catch(err){
    console.error('預約儲存失敗',err);
    set({err:err.message||'儲存失敗，請重試',submitting:false,name:S.name,phone:S.phone});
  }
}
function doLookup(){
  const p=document.getElementById('lp')?.value||'';
  const pv=validateTWPhone(p);
  if(!pv.ok){set({err:pv.err});return;}
  set({lookPhone:pv.phone,err:''});
}

/** 關閉 LINE 內嵌預約頁，回到官方帳號聊天室 */
function closeToLine(){
  const fallback=()=>{window.location.href=lineAddUrl();};
  if(typeof liff==='undefined'){fallback();return;}
  const close=()=>{
    if(liff.isInClient()) liff.closeWindow();
    else fallback();
  };
  if(LIFF_ID){
    liff.init({liffId:LIFF_ID}).then(close).catch(fallback);
  }else if(liff.isInClient()){
    close();
  }else{
    fallback();
  }
}

/* ══════════════════════════════════════════════
   RENDER
   ══════════════════════════════════════════════ */
function render(){
  snapshotFormState();
  const el=document.getElementById('app');
  if(S.pg==='booking')el.innerHTML=renderBooking();
  else if(S.pg==='lookup')el.innerHTML=renderLookup();
  else el.innerHTML=renderMain();
  if(S.pg==='main') initSpaceCarousel();
}

/* ── MAIN ── */
const EQUIP_PREVIEW = 5;

function renderIconRows(items, mode){
  return items.map(it=>{
    const txt=mode==='eq'?`${it.name} <span class="row-qty">${it.qty}</span>`:esc(it.text);
    return`<div class="icon-row"><div class="icon-row-i">${iconHtml(it.icon,'site-icon-img')}</div><div class="icon-row-t">${txt}</div></div>`;
  }).join('');
}

function renderEquipment(){
  const expanded=S.equipExpanded;
  const visible=expanded?EQUIPMENT:EQUIPMENT.slice(0,EQUIP_PREVIEW);
  const hasMore=EQUIPMENT.length>EQUIP_PREVIEW;
  const rows=renderIconRows(visible,'eq');
  const toggle=hasMore?`<button type="button" class="list-toggle" onclick="toggleEquip()">${expanded?'收合':'顯示全部'}</button>`:'';
  return rows+toggle;
}

function renderRuleRows(items){
  return items.map(it=>`<div class="icon-row rule-row"><div class="icon-row-i">${iconHtml(it.icon,'site-icon-img')}</div><div class="icon-row-t"><div class="rule-title">${esc(it.title)}</div><div class="rule-text">${esc(it.text)}</div></div></div>`).join('');
}

function toggleEquip(){
  set({equipExpanded:!S.equipExpanded});
}

function renderBookBar(){
  return`<div class="book-bar">
    <div class="book-bar-price">
      <div class="book-bar-amt">$${RATE}<span class="book-bar-unit">/小時</span></div>
      <div class="book-bar-sub">${String(OPEN).padStart(2,'0')}:00 – ${CLOSE}:00 開放・最少 ${MIN_DUR} 小時</div>
    </div>
    <button type="button" class="book-bar-btn" onclick="goBooking()">預訂</button>
  </div>`;
}

function renderSpaceHero(){
  const photos=(SPACE_PHOTOS||[]).filter(Boolean);
  const slides=photos.length
    ? photos.map((src,i)=>`<div class="space-slide${i===0?' active':''}" data-idx="${i}"><img src="${esc(src)}" alt="${esc(SITE_NAME)}" loading="${i===0?'eager':'lazy'}"></div>`).join('')
    : `<div class="space-slide space-slide-ph"><span class="space-ph-icon">📷</span><p>請於 config.js 的 SPACE_PHOTOS<br>加入空間照片網址</p></div>`;
  const dots=photos.length>1
    ? `<div class="space-dots">${photos.map((_,i)=>`<button type="button" class="space-dot${i===0?' active':''}" aria-label="第 ${i+1} 張" onclick="goSpaceSlide(${i})"></button>`).join('')}</div>`
    : '';
  return`<div class="space-hero">
    <div class="space-gallery-wrap">
      <div class="space-gallery" id="spaceGallery">${slides}</div>
      ${dots}
    </div>
    <div class="space-hero-cap">
      <div class="space-hero-tag">${iconHtml(ICONS.location,'site-icon-img-sm')} ${SITE_TAG}</div>
      <h1 class="space-hero-title">${esc(SITE_NAME)}</h1>
      <div class="space-hero-meta">${ADDR}・建議人數 40 人內</div>
    </div>
  </div>`;
}

function goSpaceSlide(i){
  const photos=(SPACE_PHOTOS||[]).filter(Boolean);
  if(!photos.length) return;
  spaceSlideIdx=((i%photos.length)+photos.length)%photos.length;
  updateSpaceCarousel();
  resetSpaceCarouselTimer();
}

function updateSpaceCarousel(){
  const gallery=document.getElementById('spaceGallery');
  if(!gallery) return;
  gallery.style.transform=`translateX(-${spaceSlideIdx*100}%)`;
  gallery.querySelectorAll('.space-slide').forEach((el,j)=>el.classList.toggle('active',j===spaceSlideIdx));
  document.querySelectorAll('.space-dot').forEach((el,j)=>el.classList.toggle('active',j===spaceSlideIdx));
}

function resetSpaceCarouselTimer(){
  if(spaceCarouselTimer) clearInterval(spaceCarouselTimer);
  spaceCarouselTimer=null;
  const photos=(SPACE_PHOTOS||[]).filter(Boolean);
  if(photos.length<=1||S.pg!=='main') return;
  spaceCarouselTimer=setInterval(()=>goSpaceSlide(spaceSlideIdx+1),4500);
}

function initSpaceCarousel(){
  const photos=(SPACE_PHOTOS||[]).filter(Boolean);
  if(!photos.length) return;
  if(spaceSlideIdx>=photos.length) spaceSlideIdx=0;
  if(spaceCarouselTimer) clearInterval(spaceCarouselTimer);
  updateSpaceCarousel();
  resetSpaceCarouselTimer();
  const gallery=document.getElementById('spaceGallery');
  if(!gallery||gallery.dataset.bound) return;
  gallery.dataset.bound='1';
  let startX=0;
  gallery.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;},{passive:true});
  gallery.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-startX;
    if(Math.abs(dx)>40) goSpaceSlide(spaceSlideIdx+(dx<0?1:-1));
  },{passive:true});
}

function renderBookingNotice(){
  return`<div class="book-notice">
    <div class="book-notice-h">${iconHtml(ICONS.check,'site-icon-img-sm')} 預約須知</div>
    <div class="book-notice-item"><span class="bni-i">${iconHtml(ICONS.time,'site-icon-img-sm')}</span><span>預約後 <strong>${RESERVE_HOURS} 小時</strong> 內請私訊客服完成繳費，逾時將自動釋出。</span></div>
    <div class="book-notice-item"><span class="bni-i">${iconHtml(ICONS.cancel,'site-icon-img-sm')}</span><span>如需取消或變更，請提前聯繫客服。</span></div>
  </div>`;
}

function renderMain(){
  return`<div class="app">
  ${renderSpaceHero()}
  <div class="main-body">
    <div class="sec sec-notice">${renderBookingNotice()}</div>

    <div class="sec"><div class="anno"><div class="anno-t">${iconHtml(ICONS.announcement,'site-icon-img-sm')} 公告通知</div><div class="anno-b">為保護雙方使用空間權益，請勿遮擋監視器，謝謝配合！</div></div></div>

    <div class="sec"><div class="sec-h">空間介紹</div><div class="card card-plain"><p>位於台北市中山區黃金地段，交通方便。提供乾淨安靜的空間，適合<strong>課程、會議、聚會、說明會</strong>等活動。以時計價，線上預約先保留時段。</p></div></div>

    <div class="sec"><div class="sec-h">開放時段</div><div class="card card-plain"><div class="icon-row"><div class="icon-row-i">${iconHtml(ICONS.time,'site-icon-img')}</div><div class="icon-row-t">每日 ${String(OPEN).padStart(2,'0')}:00 – ${CLOSE}:00</div></div></div></div>

    <div class="sec"><div class="sec-h">提供的設備服務</div><div class="card card-list">${renderEquipment()}</div></div>

    <div class="sec"><div class="sec-h">禁止事項</div><div class="card card-list">${renderIconRows(PROHIBITED,'txt')}</div></div>

    <div class="sec"><div class="sec-h">使用規範</div><div class="card card-list">${renderRuleRows(USAGE_RULES)}</div></div>

    <div class="sec"><div class="sec-h">交通位置</div><div class="map-w"><iframe src="https://maps.google.com/maps?q=台北市中山區長春路172號&output=embed&hl=zh-TW&z=16" loading="lazy" title="地圖"></iframe></div><div class="map-a">${ADDR}</div></div>

    <div class="sec" id="contact"><div class="sec-h">聯絡方式</div>
      <div class="contact-c">
        <div class="contact-r"><div class="contact-i">${iconHtml(ICONS.phone,'site-icon-img-md')}</div><div><div class="contact-l">電話</div><div class="contact-v"><a href="tel:${PHONE}">${PHONE}</a></div></div></div>
        <div class="contact-r"><div class="contact-i">${iconHtml(ICONS.mobile,'site-icon-img-md')}</div><div><div class="contact-l">手機連絡</div><div class="contact-v"><a href="tel:${MOBILE}">${MOBILE} ${CONTACT_NM}</a></div></div></div>
        <div class="contact-r"><div class="contact-i">${iconHtml(ICONS.location,'site-icon-img-md')}</div><div><div class="contact-l">地址</div><div class="contact-v">${ADDR}</div></div></div>
      </div>
    </div>
  </div>
  <div class="sticky-bottom sticky-book">${renderBookBar()}</div>
</div>`;
}

/* ── BOOKING ── */
function renderBooking(){
  const lb=['','選擇日期','選擇時段','填寫資料','已保留'];
  const sp=dur()>=MIN_DUR&&S.selDate;
  return`<div class="app">
  <div class="page-hdr">
    <button type="button" class="back-btn" onclick="${S.step>1&&S.step<4?'backStep()':'reset()'}">&lsaquo;</button>
    <div style="flex:1"><div class="ph-title">預約時段</div><div class="ph-sub">${lb[S.step]}</div></div>
    ${S.step<4?`<div class="step-dots">${[1,2,3].map(s=>`<div class="dot on ${s===S.step?'cur':''}"></div>`).join('')}</div>`:''}
  </div>
  <div class="bk-content">
    ${S.step===1?renderCal():''}${S.step===2?renderTime():''}${S.step===3?renderCForm():''}${S.step===4?renderOK():''}
  </div>
  ${(S.step===2||S.step===3)?`<div class="sticky-bottom">
    ${sp?`<div class="price-bar"><div><div class="pb-info">${S.selDate}　${fH(S.sh)} – ${fH(S.eh)}　${dur()}小時</div><div class="pb-type">NT$${RATE}/小時</div></div><div class="pb-amt">NT$${price().toLocaleString()}</div></div>`:''}
    ${S.step===2?`<button type="button" class="btn${canGo()?'':' off'}" ${canGo()?'onclick="toStep3()"':'disabled'}>下一步：填寫資料</button>`:''}
    ${S.step===3&&S.err?`<div class="err">${S.err}</div>`:''}
    ${S.step===3?`<button type="button" class="btn${S.submitting?' off':''}" ${S.submitting?'disabled':''} onclick="submitBk(event)">${S.submitting?'⏳ 提交中…':'確認預約'}</button>`:''}
  </div>`:''}
</div>`;
}

function renderCal(){
  const first=new Date(S.yr,S.mo,1),last=new Date(S.yr,S.mo+1,0).getDate();
  const todayStr=todayDS();
  let c='';
  for(let i=0;i<first.getDay();i++)c+='<div></div>';
  for(let d=1;d<=last;d++){
    const dt=new Date(S.yr,S.mo,d),ds=toDS(dt);
    const past=isPastDateDS(ds),tod=ds===todayStr,sel=ds===S.selDate,we=isWE(ds),dot=dBks(ds).length>0||dBlks(ds).length>0;
    c+=`<button type="button" class="cal-d${past?' past':sel?' sel':tod?' tod':''}" ${past?'disabled':''} ${!past?`onclick="pickDate('${ds}')"`:''}  ${we&&!past&&!sel?'style="color:#c05030"':''}>${d}${dot&&!past?`<span class="bkdot${sel?' w':''}"></span>`:''}</button>`;
  }
  return`<div>
  <div class="cal-nav"><button type="button" class="cal-btn" onclick="calPrev()">‹</button><span class="cal-title">${S.yr}年 ${MN[S.mo]}</span><button type="button" class="cal-btn" onclick="calNext()">›</button></div>
  <div class="cal-hdr">${WD.map((d,i)=>`<div class="cal-wd${i===0||i===6?' we':''}">${d}</div>`).join('')}</div>
  <div class="cal-grid">${c}</div>
  <div class="cal-leg"><span><span class="ldot" style="background:#F4A261"></span>已有預約／關閉</span><span style="color:#c05030">紅字=假日</span></div>
</div>`;
}

function renderTime(){
  const minSH=minStartHour(S.selDate);
  const maxSH=CLOSE-MIN_DUR;
  const sHrs=minSH<=maxSH?Array.from({length:maxSH-minSH+1},(_,i)=>minSH+i):[];
  const eHrs=S.sh!==null?Array.from({length:CLOSE-S.sh},(_,i)=>S.sh+i+1):[];
  const db=dBks(S.selDate);
  const bl=dBlks(S.selDate);
  const sBlk=h=>hourBlocked(S.selDate,h)||db.some(b=>h>=b.sh&&h<b.eh);
  const eBlk=h=>h-S.sh<MIN_DUR||slotOverlapsBlock(S.selDate,S.sh,h)||db.some(b=>ovlp(S.sh,h,b.sh,b.eh));
  const wd=WD[wdIndex(S.selDate)];
  const hb=(h,ie)=>{const blk=ie?eBlk(h):sBlk(h),sel=ie?S.eh===h:S.sh===h,fn=ie?`pickEH(${h})`:`pickSH(${h})`;return`<button type="button" class="hb${sel?' sel':''}${blk?' blk':''}" ${blk?'disabled':''} onclick="${fn}">${fH(h)}</button>`;};
  return`<div>
  <div class="date-b"><span class="db-text">${S.selDate}（週${wd}）</span><span class="db-rate wd">NT$${RATE}/時</span></div>
  <div class="time-sec"><div class="time-lbl">開始時間${S.sh!==null?` <span class="h-badge">${fH(S.sh)}</span>`:''}</div>
  ${sHrs.length?`<div class="h-grid">${sHrs.map(h=>hb(h,false)).join('')}</div>`:`<div style="font-size:13px;color:#888;padding:8px 0">今日可預約時段已結束，請選其他日期</div>`}
  </div>
  ${S.sh!==null?`<div class="time-sec"><div class="time-lbl">結束時間${S.eh!==null?` <span class="h-badge">${fH(S.eh)}</span>`:''}<span class="h-hint"> 最早${fH(S.sh+MIN_DUR)}</span></div><div class="h-grid">${eHrs.map(h=>hb(h,true)).join('')}</div></div>`:''}
  ${db.length||bl.length?`<div><div class="booked-t">當日不可預約時段：</div>${db.map(b=>`<div class="booked-i">${fH(b.sh)} – ${fH(b.eh)}　已被預約</div>`).join('')}${bl.map(b=>`<div class="booked-i blocked-i">${fH(b.sh)} – ${fH(b.eh)}　時段已關閉${b.note?'（'+esc(b.note)+'）':''}</div>`).join('')}</div>`:''}
  ${S.err?`<div class="err">${S.err}</div>`:''}
</div>`;
}

function renderCForm(){
  const wd=WD[wdIndex(S.selDate)];
  return`<div>
  <div class="summary"><div class="summary-lbl">${iconHtml(ICONS.check,'site-icon-img-sm')} 預約摘要</div><div class="summary-date">${S.selDate}（週${wd}）</div><div class="summary-time">${fH(S.sh)} – ${fH(S.eh)}，共 ${dur()} 小時</div><div class="summary-price">NT$${price().toLocaleString()}</div></div>
  <div class="form-g"><label class="form-l">姓名 *</label><input id="n" class="input" type="text" placeholder="請輸入您的LINE名稱" value="${esc(S.name)}"></div>
  <div class="form-g"><label class="form-l">連絡電話 *</label><input id="p" class="input" type="tel" inputmode="numeric" maxlength="13" placeholder="0912345678" value="${esc(S.phone)}"><div class="form-hint">台灣手機：09 開頭共 10 碼（例：0912345678）</div></div>
  <div class="form-note">確認後將為您保留時段 ${RESERVE_HOURS} 小時。請私訊客服完成繳費，逾時將自動釋出。</div>
  ${S.err?`<div class="err">${S.err}</div>`:''}
</div>`;
}

function renderOK(){
  const wd=WD[wdIndex(S.selDate)];
  const infoLbl=(icon,text)=>`<span class="info-l">${iconHtml(icon,'site-icon-img-sm')} ${text}</span>`;
  return`<div class="success">
  <div class="s-icon">${iconHtml(ICONS.status,'site-icon-img-lg')}</div>
  <div class="s-title">您的預約已保留</div>
  <div class="s-sub">下一步：請點下方按鈕返回 LINE，私訊客服完成繳費</div>
  <div class="card" style="text-align:left;margin-bottom:16px">
    <div class="info-r">${infoLbl(ICONS.date,'日期')}<span class="info-v">${S.selDate}（週${wd}）</span></div>
    <div class="info-r">${infoLbl(ICONS.reserve,'時間')}<span class="info-v">${fH(S.sh)} – ${fH(S.eh)}（${dur()}小時）</span></div>
    <div class="info-r">${infoLbl(ICONS.pay,'費用')}<span class="info-v" style="color:#1597DD">NT$${price().toLocaleString()}</span></div>
    <div class="info-div"></div>
    <div class="info-r">${infoLbl(ICONS.name,'姓名')}<span class="info-v">${esc(S.name)}</span></div>
    <div class="info-r">${infoLbl(ICONS.phone,'電話')}<span class="info-v">${esc(formatTWPhone(S.phone))}</span></div>
    <div class="info-r">${infoLbl(ICONS.check,'狀態')}<span class="info-v" style="color:#E65100">已保留（待繳費）</span></div>
  </div>
  <div class="notice"><div class="notice-t">注意事項</div><div>• 時段已為您保留 ${RESERVE_HOURS} 小時，請儘快私訊客服完成繳費</div><div>• 逾時未繳費，時段將自動釋出</div><div>• 繳費完成後才算正式預約成功</div></div>
  <button type="button" class="btn btn-line" onclick="closeToLine()">${iconHtml(ICONS.chat,'site-icon-img-sm')} 私訊客服繳費</button>
</div>`;
}

/* ── LOOKUP ── */
function renderLookup(){
  const res=S.lookPhone?Object.values(BKS).filter(b=>normalizeTWPhone(b.phone)===S.lookPhone).sort((a,b)=>new Date(b.date)-new Date(a.date)):null;
  return`<div class="app">
  <div class="page-hdr"><button type="button" class="back-btn" onclick="reset()">&lsaquo;</button><div><div class="ph-title">我的預約查詢</div><div class="ph-sub">輸入電話查詢</div></div></div>
  <div class="bk-content">
    <div class="lookup-box">
      <div class="lookup-icon">${iconHtml(ICONS.search,'site-icon-img-lg')}</div>
      <div style="font-size:16px;font-weight:700;color:#1597DD;margin-bottom:4px">查詢我的預約</div>
      <div style="font-size:12px;color:#666;margin-bottom:14px">請輸入預約時填寫的電話號碼</div>
      <input id="lp" class="input" type="tel" inputmode="numeric" maxlength="13" placeholder="0912345678" value="${esc(S.lookPhone)}" style="margin-bottom:6px">
      <div class="form-hint" style="margin-bottom:10px">台灣手機：09 開頭共 10 碼</div>
      <button type="button" class="btn" onclick="doLookup()">查詢</button>
    </div>
    ${S.err?`<div class="err">${S.err}</div>`:''}
    ${res!==null?(res.length===0?`<div style="text-align:center;padding:40px 0;color:#aaa">📭<br><br>查無此電話的預約紀錄</div>`:
      res.map(b=>{
        const wd=WD[wdIndex(b.date)],past=isPastDateDS(b.date);
        const si=getStatusInfo(b);
        const stTxt=past?'已結束':(si.cls==='paid'?'預約成功':si.cls==='expired'?'保留已失效':si.label);
        return`<div class="bk-item" style="${past?'opacity:.6':''}">
          <div class="bki-top"><span class="bki-date">${b.date} 週${wd}</span><span class="bki-badge">${fH(b.sh)}–${fH(b.eh)}</span></div>
          <div class="bki-info">${b.eh-b.sh}小時・NT$${RATE}/時・${stTxt}</div>
          <div class="bki-price">NT$${(b.price||0).toLocaleString()}</div>
        </div>`;
      }).join('')):''}
  </div>
</div>`;
}

async function initApp(){
  try{
    if(typeof loadRemoteBks!=='function') throw new Error('config.js 未載入，請確認已一併上傳');
    await refreshBks();
  }catch(e){
    console.error(e);
    const el=document.getElementById('app');
    if(el) el.innerHTML=`<div style="padding:40px 20px;text-align:center;color:#d32f2f;font-size:14px;line-height:1.8">⚠️ 載入失敗<br><br>${e.message||'請重新整理頁面'}</div>`;
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
setInterval(refreshBks, 60000);
