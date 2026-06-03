/* ═══════════════════════════════════════════════
   ⚠️  網站設定
   ═══════════════════════════════════════════════ */

const API_URL = 'https://script.google.com/macros/s/AKfycbwqsWzwOoUeWfWPOR3NXMUcR5BnZ4nzR672IRie9cmz3aBKM410rV8G7_jM_5Do4X7frA/exec';

const BLOCKS_KEY  = 'youni_blocks';
const ADMIN_PW    = '54662771';

const RATE     = 600;
const OPEN     = 9;
const CLOSE    = 22;
const MIN_DUR  = 2;
const RESERVE_HOURS = 3;
const LINE_ID  = '@587kkhwv';
const LIFF_ID  = '';

const PHONE      = '02-2517-6991';
const MOBILE     = '0936455155';
const CONTACT_NM = '蔡小姐';
const ADDR       = '台北市中山區長春路172號 9樓';
const SITE_NAME  = '由你分享空間';
const SITE_TAG   = '台北市中山區・捷運松江南京站步行4分鐘';

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

const SPACE_PHOTOS = [
  'image/空間圖片.jpg',
  'image/空間圖片2.jpg',
  'image/空間圖片3.jpg',
  'image/空間圖片4.jpg',
];

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

const PROHIBITED = [
  { icon:ICONS.smokingban, text:'禁止吸菸' },
  { icon:ICONS.fire,       text:'禁止烹飪或使用明火之加熱設備' },
  { icon:ICONS.ban,        text:'禁止將空間內家具搬離空間' },
  { icon:ICONS.nopet,      text:'禁止攜帶寵物入內（導盲犬不在此限）' },
  { icon:ICONS.ban,        text:'禁止毒品、性愛、危險物品、賭博等違法行為' },
  { icon:ICONS.monitor,    text:'禁止遮擋監視器' }
];

const USAGE_RULES = [
  { icon:ICONS.quiet,  title:'維護公共環境品質', text:'請共同維護公共區域的整潔與安靜，避免大聲喧嘩，影響其他住客。' },
  { icon:ICONS.clean,  title:'保持空間清潔', text:'請自行清理使用過的空間與設備。若因使用不當造成環境髒亂、家具損壞，或丟棄違規垃圾，將依使用者條款收取罰款及清潔費用。' },
  { icon:ICONS.chair,  title:'家具移動與復原', text:'如有場佈需求需移動家具，請留意不要影響他人或住戶，並避免刮傷地板或造成損壞。使用完畢後，請將家具恢復原位。' },
  { icon:ICONS.ban,    title:'勿佔用公共空間', text:'室內休憩區及所有備品、器材設備，請勿放置或佔用於公共區域。' },
  { icon:ICONS.time,   title:'遵守進出時間', text:'請依照預約時間準時離場，不得提早進入或逾時使用，也請勿在公共空間逗留或進行活動。' },
  { icon:ICONS.leave,  title:'離場請勿久留', text:'離場時請勿在公共區域群聚。若打擾到公共安寧，相關責任需自行承擔。' }
];

/* ══ 讀取 + 寫入：Apps Script ══ */
let _bksCache = {};

async function loadRemoteBks() {
  try {
    const res = await fetch(API_URL + '?action=getAll&t=' + Date.now(), { redirect: 'follow' });
    const data = await res.json();
    const result = {};
    if (Array.isArray(data)) {
      data.forEach(b => {
        if (!b.id) return;
        const parseHour = v => {
          if (!v) return 0;
          if (String(v).includes(':')) return Number(String(v).split(':')[0]);
          return Number(v);
        };
        // 過濾掉已刪除或資料不完整的紀錄
        if (b.status === 'deleted' || !b.date || !b.sh || !b.eh) return;
        // 修正日期格式：若是 ISO 格式（2026-06-01T16:00:00.000Z）轉成台北時間日期字串
        let dateStr = String(b.date);
        if (dateStr.includes('T')) {
          const d = new Date(dateStr);
          const tw = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
          dateStr = tw; // 格式 YYYY-MM-DD
        }
        result[b.id] = {
          ...b,
          date: dateStr,
          sh: parseHour(b.sh),
          eh: parseHour(b.eh),
          price: Number(String(b.price).replace(/[^0-9.]/g, '')) || 0
        };
      });
    }
    _bksCache = result;
  } catch(e) {
    console.error('讀取預約失敗', e);
    // 若 Apps Script 失敗，回傳空物件不擋畫面
    _bksCache = {};
  }
  return _bksCache;
}

function loadLocalBks() { return _bksCache; }

/* ══ 寫入：Apps Script ══ */
async function apiCall(params) {
  const url = API_URL + '?' + new URLSearchParams(params);
  const res = await fetch(url, { redirect: 'follow' });
  const text = await res.text();
  try { return JSON.parse(text); } catch(e) { return { error: text }; }
}

async function saveRemoteBk(id, bk) {
  await apiCall({ action:'add', id, ...bk });
  _bksCache[id] = { id, ...bk };
}

async function updateRemoteBk(id, patch) {
  await apiCall({ action:'update', id, ...patch });
  if (_bksCache[id]) Object.assign(_bksCache[id], patch);
}

async function deleteRemoteBk(id) {
  await apiCall({ action:'delete', id });
  delete _bksCache[id];
}

/* ══ 關閉時段（localStorage） ══ */
function loadBlocks() {
  try { return JSON.parse(localStorage.getItem(BLOCKS_KEY) || '{}'); } catch { return {}; }
}
function saveBlocks(all) {
  try { localStorage.setItem(BLOCKS_KEY, JSON.stringify(all)); }
  catch(e) { throw new Error('無法儲存關閉時段設定'); }
}
function allBlocksList() {
  return Object.entries(loadBlocks()).map(([id,b]) => ({id,...b}));
}
function dayBlocks(ds) {
  return allBlocksList().filter(b => b.date === ds).sort((a,b) => a.sh - b.sh);
}
function slotOverlapsBlock(ds, sh, eh) {
  return dayBlocks(ds).some(b => ovlp(sh, eh, b.sh, b.eh));
}
function isRangeAvailable(ds, sh, eh) {
  if (sh >= eh) return false;
  if (sh < OPEN || eh > CLOSE) return false;
  if (slotOverlapsBlock(ds, sh, eh)) return false;
  return !Object.values(loadLocalBks()).some(b => b.date===ds && blocksSlot(b) && ovlp(sh,eh,b.sh,b.eh));
}
function addBlockEntry(date, sh, eh, note) {
  if (isPastDateDS(date)) throw new Error('無法關閉已過去的日期');
  if (sh >= eh) throw new Error('結束時間需晚於開始時間');
  if (sh < OPEN || eh > CLOSE) throw new Error(`時段需在 ${String(OPEN).padStart(2,'0')}:00–${String(CLOSE).padStart(2,'0')}:00 內`);
  if (!isRangeAvailable(date, sh, eh)) throw new Error('與現有預約或關閉時段重疊');
  const all = loadBlocks();
  const id = 'blk_' + Date.now();
  all[id] = { date, sh, eh, note:(note||'').trim(), ts:new Date().toISOString() };
  saveBlocks(all);
  return id;
}
function removeBlockEntry(id) {
  const all = loadBlocks();
  if (!all[id]) return false;
  delete all[id]; saveBlocks(all); return true;
}

/* ══ 預約狀態 ══ */
function reserveExpiresAt(b) { return new Date(b.ts).getTime() + RESERVE_HOURS * 3600000; }
function isReserveExpired(b) { return (b.status||'reserved')==='reserved' && Date.now() > reserveExpiresAt(b); }
function blocksSlot(b) {
  const st = b.status || 'reserved';
  if (st==='paid') return true;
  if (st==='reserved') return !isReserveExpired(b);
  return false;
}
function getStatusInfo(b) {
  const st = b.status || 'reserved';
  if (st==='paid') return { label: b.source==='admin'?'代客・預約成功':'預約成功', cls:'paid' };
  if (st==='reserved' && isReserveExpired(b)) return { label:'已釋出（逾時未繳）', cls:'expired' };
  if (st==='reserved') return { label: b.source==='admin'?'代客・待繳費':'已保留（待繳費）', cls:'reserved' };
  return { label:'已保留（待繳費）', cls:'reserved' };
}
function formatReserveRemain(b) {
  const ms = reserveExpiresAt(b) - Date.now();
  if (ms <= 0) return '已逾時';
  const min = Math.ceil(ms / 60000);
  if (min >= 60) return `剩 ${Math.floor(min/60)} 小時 ${min%60} 分`;
  return `剩 ${min} 分鐘`;
}
async function markBookingPaid(id) {
  await updateRemoteBk(id, { status:'paid', paidAt: new Date().toISOString() });
}
async function deleteBooking(id) { await deleteRemoteBk(id); }
async function addAdminBooking({date,sh,eh,name,phone,status}) {
  if (isPastDateDS(date)) throw new Error('無法預約已過去的日期');
  if (sh >= eh) throw new Error('結束時間需晚於開始時間');
  if (eh-sh < MIN_DUR) throw new Error(`最少需預約 ${MIN_DUR} 小時`);
  if (!name||!name.trim()) throw new Error('請填寫姓名');
  const pv = validateTWPhone(phone);
  if (!pv.ok) throw new Error(pv.err);
  if (!isRangeAvailable(date, sh, eh)) throw new Error('此時段已被預約或關閉');
  const st = status==='paid'?'paid':'reserved';
  const id = 'bk_' + Date.now();
  const bk = { date, sh, eh, name:name.trim(), phone:pv.phone, price:calcPrice(sh,eh), status:st, source:'admin', ts:new Date().toISOString(), paidAt:st==='paid'?new Date().toISOString():'' };
  await saveRemoteBk(id, bk);
  return id;
}

/* ══ 工具 ══ */
function lineAddUrl() { return 'https://line.me/R/ti/p/@' + LINE_ID.replace(/^@/,''); }
function iconHtml(icon, cls) {
  const src = String(icon||SITE_ICON).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  return `<img src="${src}" alt="" class="${cls||'site-icon-img'}">`;
}
function logoHtml(cls) { return iconHtml(SITE_ICON, cls||'logo-img'); }
function normalizeTWPhone(raw) {
  if (!raw) return null;
  let s = String(raw).trim().replace(/[\s\-()]/g,'');
  if (s.startsWith('+886')) s = '0'+s.slice(4);
  else if (s.startsWith('886')) s = '0'+s.slice(3);
  return /^09\d{8}$/.test(s) ? s : null;
}
function validateTWPhone(raw) {
  const phone = normalizeTWPhone(raw);
  if (phone) return { ok:true, phone };
  return { ok:false, err:'請輸入正確的台灣手機號碼（09 開頭，共 10 碼）' };
}
function formatTWPhone(p) {
  const n = normalizeTWPhone(p);
  return n ? `${n.slice(0,4)}-${n.slice(4,7)}-${n.slice(7)}` : p;
}
const ovlp = (s1,e1,s2,e2) => s1<e2 && e1>s2;
function calcPrice(sh,eh) { const d=eh-sh; return d>=MIN_DUR?d*RATE:0; }
const TZ = 'Asia/Taipei';
function twParts(date) {
  const d = date||new Date();
  const p = new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d);
  const g = t => p.find(x=>x.type===t).value;
  return { y:+g('year'), m:+g('month'), d:+g('day'), h:+g('hour'), min:+g('minute') };
}
function todayDS() { const {y,m,d}=twParts(); return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
function isTodayDS(ds) { return ds===todayDS(); }
function isPastDateDS(ds) { if(!ds) return true; return ds<todayDS(); }
function wdIndex(ds) { if(!ds||typeof ds!=='string'||!ds.includes('-')) return 0; const [y,m,d]=ds.split('-').map(Number); return new Date(y,m-1,d).getDay(); }
function isWE(ds) { const w=wdIndex(ds); return w===0||w===6; }
function minStartHour(ds) {
  if (!isTodayDS(ds)) return OPEN;
  const {h,min}=twParts(); const cur=min>0?h+1:h; return Math.max(OPEN,cur);
}
