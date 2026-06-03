/* ═══════════════════════════════════════════════
   ⚠️  網站設定
   ═══════════════════════════════════════════════ */
const STORAGE_KEY = 'youni_bookings';
const BLOCKS_KEY  = 'youni_blocks';
const ADMIN_PW    = '54662771';

const RATE     = 600;   // 每小時（平假日同價）
const OPEN     = 9;     // 09:00 開始
const CLOSE    = 22;    // 22:00 結束
const MIN_DUR  = 2;
const RESERVE_HOURS = 3;  // 已保留（待繳費）時段保留時間（小時）
const LINE_ID  = '@587kkhwv';   // LINE 官方帳號 Basic ID（含 @）
const LIFF_ID  = '';            // LIFF ID（圖文選單須用 LIFF 網址開啟，關閉按鈕才有效；見 LINE Developers Console）

const PHONE    = '02-2517-6991';
const MOBILE   = '0936455155';
const CONTACT_NM = '蔡小姐';
const ADDR     = '台北市中山區長春路172號 9樓';
const SITE_NAME = '由你分享空間';
const SITE_TAG  = '台北市中山區・捷運松江南京站步行4分鐘';

/** 圖示路徑（image 資料夾） */
const ICONS = {
  site:         'image/分享空間logo.png',
  chair:        'image/chair.png',
  desk:         'image/desk.png',
  wifi:         'image/wifi.png',
  board:        'image/board.png',
  projector:    'image/projector.png',
  screen:       'image/screen.png',
  audio:        'image/audio.png',
  computer:     'image/computer.png',
  fridge:       'image/fridge.png',
  smokingban:   'image/smokingban.png',
  fire:         'image/fire.png',
  ban:          'image/ban.png',
  nopet:        'image/nopet.png',
  monitor:      'image/monitor.png',
  quiet:        'image/quietarea.png',
  clean:        'image/clean.png',
  tidy:         'image/tidy.png',
  time:         'image/time.png',
  leave:        'image/leave.png',
  phone:        'image/phone.png',
  mobile:       'image/mobile.png',
  location:     'image/location.png',
  check:        'image/point.png',
  status:       'image/status.png',
  date:         'image/date.png',
  date_click:   'image/date_click.png',
  list:         'image/list.png',
  list_click:   'image/list_click.png',
  reserve:      'image/reserve.png',
  pay:          'image/pay.png',
  name:         'image/name.png',
  chat:         'image/chat.png',
  search:       'image/search.png',
  lock:         'image/lock.png',
  confirm:      'image/check.png',
  cancel:       'image/cancel.png',
  delete:       'image/delete.png',
  announcement: 'image/announcement.png'
};
const SITE_ICON = ICONS.site;

/** 首頁空間照片（可放 1～5 張；路徑相對於 index.html，或填完整網址） */
const SPACE_PHOTOS = [
  'image/空間圖片.jpg',
  'image/空間圖片2.jpg',
  'image/空間圖片3.jpg',
  'image/空間圖片4.jpg',
];

/** 提供設備（條列） */
const EQUIPMENT = [
  { icon:ICONS.chair,     name:'椅子', qty:'24 張' },
  { icon:ICONS.desk,      name:'長桌', qty:'8 張' },
  { icon:ICONS.wifi,      name:'WiFi', qty:'免費' },
  { icon:ICONS.board,     name:'白板', qty:'1 式' },
  { icon:ICONS.projector, name:'無線投影', qty:'1 式' },
  { icon:ICONS.screen,    name:'90 吋布幕', qty:'1 式' },
  { icon:ICONS.audio,     name:'擴音設備', qty:'1 式' },
  { icon:ICONS.computer,  name:'電腦', qty:'1 式' },
  { icon:ICONS.fridge,    name:'冰箱', qty:'1 式' },
  { icon:ICONS.site,      name:'沙發區', qty:'1 區' }
];

/** 禁止事項（條列） */
const PROHIBITED = [
  { icon:ICONS.smokingban, text:'禁止吸菸' },
  { icon:ICONS.fire,       text:'禁止烹飪或使用明火之加熱設備' },
  { icon:ICONS.ban,        text:'禁止將空間內家具搬離空間' },
  { icon:ICONS.nopet,     text:'禁止攜帶寵物入內（導盲犬不在此限）' },
  { icon:ICONS.ban,        text:'禁止毒品、性愛、危險物品、賭博等違法行為' },
  { icon:ICONS.monitor,   text:'禁止遮擋監視器' }
];

/** 使用規範（條列） */
const USAGE_RULES = [
  { icon:ICONS.quiet,  title:'維護公共環境品質', text:'請共同維護公共區域的整潔與安靜，避免大聲喧嘩，影響其他住客。' },
  { icon:ICONS.clean,  title:'保持空間清潔', text:'請自行清理使用過的空間與設備。Happ. 小樹屋不額外收取清潔費與水電費；若因使用不當造成環境髒亂、家具損壞，或丟棄違規垃圾，將依使用者條款收取罰款及清潔費用。' },
  { icon:ICONS.chair,  title:'家具移動與復原', text:'如有場佈需求需移動家具，請留意不要影響他人或住戶，並避免刮傷地板或造成損壞。使用完畢後，請將家具恢復原位。若造成家具、裝潢損傷，或未確實復原，需另行負擔維修費用。' },
  { icon:ICONS.ban,    title:'勿佔用公共空間', text:'室內休憩區及所有備品、器材設備，請勿放置或佔用於公共區域。' },
  { icon:ICONS.time,   title:'遵守進出時間', text:'請依照預約時間準時離場，不得提早進入或逾時使用，也請勿在公共空間逗留或進行活動。' },
  { icon:ICONS.leave,  title:'離場請勿久留', text:'離場時請勿在公共區域群聚。若打擾到公共安寧，相關責任需自行承擔。' }
];

/** 加入 LINE 官方帳號（聯絡方式區塊用） */
function lineAddUrl(){
  const id = LINE_ID.replace(/^@/, '');
  return 'https://line.me/R/ti/p/@' + id;
}

/** 輸出 icon 圖片 HTML */
function iconHtml(icon, cls){
  const src = String(icon || SITE_ICON).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  return `<img src="${src}" alt="" class="${cls||'site-icon-img'}">`;
}

function logoHtml(cls){
  return iconHtml(SITE_ICON, cls || 'logo-img');
}

/** 正規化台灣手機：09 開頭共 10 碼 */
function normalizeTWPhone(raw){
  if(!raw) return null;
  let s = String(raw).trim().replace(/[\s\-()]/g, '');
  if(s.startsWith('+886')) s = '0' + s.slice(4);
  else if(s.startsWith('886')) s = '0' + s.slice(3);
  return /^09\d{8}$/.test(s) ? s : null;
}

function validateTWPhone(raw){
  const phone = normalizeTWPhone(raw);
  if(phone) return { ok:true, phone };
  return { ok:false, err:'請輸入正確的台灣手機號碼（09 開頭，共 10 碼）' };
}

function formatTWPhone(p){
  const n = normalizeTWPhone(p);
  return n ? `${n.slice(0,4)}-${n.slice(4,7)}-${n.slice(7)}` : p;
}

const ovlp = (s1,e1,s2,e2) => s1<e2 && e1>s2;

function calcPrice(sh, eh){
  const d = eh - sh;
  return d >= MIN_DUR ? d * RATE : 0;
}

/* ── 關閉時段 ── */
function loadBlocks(){
  try{return JSON.parse(localStorage.getItem(BLOCKS_KEY)||'{}');}
  catch{return{};}
}

function saveBlocks(all){
  try{
    localStorage.setItem(BLOCKS_KEY, JSON.stringify(all));
  }catch(e){
    throw new Error('無法儲存關閉時段設定');
  }
}

function allBlocksList(){
  return Object.entries(loadBlocks()).map(([id,b])=>({id,...b}));
}

function dayBlocks(ds){
  return allBlocksList().filter(b=>b.date===ds).sort((a,b)=>a.sh-b.sh);
}

function slotOverlapsBlock(ds, sh, eh){
  return dayBlocks(ds).some(b=>ovlp(sh,eh,b.sh,b.eh));
}

function isRangeAvailable(ds, sh, eh){
  if(sh>=eh) return false;
  if(sh<OPEN||eh>CLOSE) return false;
  if(slotOverlapsBlock(ds,sh,eh)) return false;
  return !Object.values(loadLocalBks()).some(b=>b.date===ds&&blocksSlot(b)&&ovlp(sh,eh,b.sh,b.eh));
}

function addBlockEntry(date, sh, eh, note){
  if(isPastDateDS(date)) throw new Error('無法關閉已過去的日期');
  if(sh>=eh) throw new Error('結束時間需晚於開始時間');
  if(sh<OPEN||eh>CLOSE) throw new Error(`時段需在 ${String(OPEN).padStart(2,'0')}:00–${String(CLOSE).padStart(2,'0')}:00 內`);
  if(!isRangeAvailable(date,sh,eh)) throw new Error('與現有預約或關閉時段重疊');
  const all=loadBlocks();
  const id='blk_'+Date.now();
  all[id]={date,sh,eh,note:(note||'').trim(),ts:new Date().toISOString()};
  saveBlocks(all);
  return id;
}

function removeBlockEntry(id){
  const all=loadBlocks();
  if(!all[id]) return false;
  delete all[id];
  saveBlocks(all);
  return true;
}

function addAdminBooking({date,sh,eh,name,phone,status}){
  if(isPastDateDS(date)) throw new Error('無法預約已過去的日期');
  if(sh>=eh) throw new Error('結束時間需晚於開始時間');
  if(eh-sh<MIN_DUR) throw new Error(`最少需預約 ${MIN_DUR} 小時`);
  if(!name||!name.trim()) throw new Error('請填寫姓名');
  const pv=validateTWPhone(phone);
  if(!pv.ok) throw new Error(pv.err);
  if(!isRangeAvailable(date,sh,eh)) throw new Error('此時段已被預約或關閉');
  const st=status==='paid'?'paid':'reserved';
  const all=loadLocalBks();
  const id='bk_'+Date.now();
  const bk={
    date,sh,eh,
    name:name.trim(),
    phone:pv.phone,
    price:calcPrice(sh,eh),
    status:st,
    source:'admin',
    ts:new Date().toISOString()
  };
  if(st==='paid') bk.paidAt=new Date().toISOString();
  all[id]=bk;
  saveLocalBks(all);
  return id;
}

function deleteBooking(id){
  const all=loadLocalBks();
  if(!all[id]) return false;
  delete all[id];
  saveLocalBks(all);
  return true;
}

/* ── 預約狀態 ── */
function reserveExpiresAt(b){
  return new Date(b.ts).getTime() + RESERVE_HOURS * 3600000;
}

function isReserveExpired(b){
  return (b.status||'reserved')==='reserved' && Date.now() > reserveExpiresAt(b);
}

/** 是否佔用時段（已繳費，或待繳費且未逾時） */
function blocksSlot(b){
  const st = b.status || 'reserved';
  if(st==='paid') return true;
  if(st==='reserved') return !isReserveExpired(b);
  return false;
}

function getStatusInfo(b){
  const st = b.status || 'reserved';
  if(st==='paid') return { label: b.source==='admin'?'代客・預約成功':'預約成功', cls:'paid' };
  if(st==='reserved' && isReserveExpired(b)) return { label:'已釋出（逾時未繳）', cls:'expired' };
  if(st==='reserved') return { label: b.source==='admin'?'代客・待繳費':'已保留（待繳費）', cls:'reserved' };
  return { label:'已保留（待繳費）', cls:'reserved' };
}

function formatReserveRemain(b){
  const ms = reserveExpiresAt(b) - Date.now();
  if(ms <= 0) return '已逾時';
  const min = Math.ceil(ms / 60000);
  if(min >= 60) return `剩 ${Math.floor(min/60)} 小時 ${min % 60} 分`;
  return `剩 ${min} 分鐘`;
}

function updateBooking(id, patch){
  const all = loadLocalBks();
  if(!all[id]) return false;
  Object.assign(all[id], patch);
  saveLocalBks(all);
  return true;
}

function markBookingPaid(id){
  return updateBooking(id, { status:'paid', paidAt: new Date().toISOString() });
}

function loadLocalBks(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}
  catch{return{};}
}

function saveLocalBks(all){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }catch(e){
    throw new Error('無法儲存預約（瀏覽器可能封鎖本地儲存），請改用 Safari／Chrome 開啟');
  }
}

/* ── 台北時區 UTC+8 ── */
const TZ = 'Asia/Taipei';

function twParts(date){
  const d = date || new Date();
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false
  }).formatToParts(d);
  const g = t => p.find(x => x.type === t).value;
  return { y:+g('year'), m:+g('month'), d:+g('day'), h:+g('hour'), min:+g('minute') };
}

function todayDS(){
  const {y,m,d} = twParts();
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function isTodayDS(ds){ return ds === todayDS(); }
function isPastDateDS(ds){ return ds < todayDS(); }

function wdIndex(ds){
  const [y,m,d] = ds.split('-').map(Number);
  return new Date(y, m-1, d).getDay();
}

function isWE(ds){
  const w = wdIndex(ds);
  return w === 0 || w === 6;
}

/** 當日最早可選的開始小時（已過時段不顯示） */
function minStartHour(ds){
  if(!isTodayDS(ds)) return OPEN;
  const {h, min} = twParts();
  const cur = min > 0 ? h + 1 : h;
  return Math.max(OPEN, cur);
}
