// ============================================================
// ADMIN-GSHEET.JS — QUẢN LÝ GOOGLE SHEET URL
// Thiết kế: mỗi URL 1 dòng, bên phải chọn bảng gắn với URL
// ============================================================

// Chuyển link GSheet bất kỳ → embed URL (/pub?output=html)
function gSheetToEmbed(url) {
   if (!url) return '';
  url = url.trim();

  // Nếu là link đã xuất bản (pubhtml) thì giữ nguyên
  if (url.includes('/pubhtml') || url.includes('/pub')) return url;

  // Nếu là link edit/share thông thường
  const m = url.match(/\/spreadsheets\/d\/([\w-]+)/);
  if (m) {
    const fileId = m[1];
    // Ép về dạng edit với tham số rm=minimal
    return `https://docs.google.com/spreadsheets/d/${fileId}/edit?rm=minimal`;
  }
  return url;
}

async function hienGSheet() {
  ADMIN_CORE.setAct('ni-gs');
  UTILS.el('topbar-t').textContent = 'Quản lý Google Sheet';
  await ADMIN_CORE.loadBang();
  _renderGSheet();
}

function _renderGSheet() {
  const dsBang = ADMIN_CORE.dsBang;

  // Tập hợp tất cả URL đã có trong danh_sach_bang
  // Mỗi bảng có thể có hoặc không có gsheet_url
  const bangCoUrl  = dsBang.filter(b => b.gsheet_url);
  const bangChuaUrl= dsBang.filter(b => !b.gsheet_url);

  // Tạo dropdown option cho "chọn bảng"
  const optsKhongGan = `<option value="">-- Chọn bảng --</option>` +
    bangChuaUrl.map(b => `<option value="${b.bang}">${b.bang} — ${b.ten_bang}</option>`).join('');

  // Các dòng URL đã gắn
  const rowsUrl = bangCoUrl.map(b => {
    const allOpts = `<option value="">-- Gỡ gắn --</option>` +
      dsBang.map(x => `<option value="${x.bang}" ${x.bang === b.bang ? 'selected' : ''}>${x.bang} — ${x.ten_bang}</option>`).join('');
    return `<div class="gs-row" id="gs-row-${b.bang}">
      <div class="gs-url-cell">
        <span class="gs-url-text" title="${b.gsheet_url}">${b.gsheet_url}</span>
      </div>
      <div class="gs-bang-cell">
        <select class="gs-sel" onchange="_gsGanBang('${b.bang}',this.value,'${b.gsheet_url}')">
          ${allOpts}
        </select>
      </div>
      <div class="gs-action-cell">
        <button class="btn danger" style="padding:4px 10px;font-size:12px" onclick="_gsXoaUrl('${b.bang}','${b.ten_bang}')">🗑</button>
      </div>
    </div>`;
  }).join('');

  UTILS.el('content').innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>📊 Google Sheet nhúng</h3>
        <button class="btn primary" onclick="_gsShowAddForm()">+ Thêm URL</button>
      </div>

      <!-- Form thêm URL mới — ẩn mặc định -->
      <div id="gs-add-form" style="display:none;padding:12px 16px;background:var(--g1);border-bottom:1px solid var(--g2)">
        <div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center">
          <input id="gs-new-url" class="inp" type="url" placeholder="Dán link Google Sheet vào đây... (mọi dạng link đều được)"
            style="font-family:var(--mono);font-size:12px">
          <select id="gs-new-bang" class="inp" style="min-width:200px">
            ${optsKhongGan}
          </select>
          <div style="display:flex;gap:6px">
            <button class="btn primary" onclick="_gsThemUrl()">💾 Lưu</button>
            <button class="btn ghost" onclick="UTILS.el('gs-add-form').style.display='none'">✕</button>
          </div>
        </div>
        <div style="font-size:11px;color:var(--g4);margin-top:6px">
          💡 Hệ thống tự nhận diện link dạng <em>/edit</em>, <em>/pub</em>, hay link chia sẻ — không cần chọn loại.
          GSheet phải được <strong>chia sẻ công khai</strong> (Anyone with the link → Viewer).
        </div>
        <div class="err-txt" id="err-gs" style="margin-top:4px"></div>
      </div>

      <!-- Danh sách URL -->
      <div id="gs-list">
        ${bangCoUrl.length ? `
          <div class="gs-list-header">
            <div class="gs-url-cell" style="font-size:11px;font-weight:700;color:var(--g5);text-transform:uppercase;letter-spacing:.4px">URL Google Sheet</div>
            <div class="gs-bang-cell" style="font-size:11px;font-weight:700;color:var(--g5);text-transform:uppercase;letter-spacing:.4px">Bảng gắn</div>
            <div class="gs-action-cell"></div>
          </div>
          ${rowsUrl}
        ` : `
          <div class="empty" style="padding:32px">
            <span class="i">📊</span>
            <span>Chưa có URL nào. Bấm "+ Thêm URL" để bắt đầu.</span>
          </div>
        `}
      </div>
    </div>

    <style>
      .gs-row,.gs-list-header{display:grid;grid-template-columns:1fr 240px 60px;gap:10px;align-items:center;padding:10px 16px;border-bottom:1px solid var(--g2)}
      .gs-row:hover{background:var(--g1)}
      .gs-url-cell{min-width:0}
      .gs-url-text{display:block;font-family:var(--mono);font-size:11px;color:var(--g4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .gs-sel{width:100%;padding:5px 8px;border:1.5px solid var(--g2);border-radius:5px;font-family:var(--font);font-size:12px;outline:none;background:white}
      .gs-sel:focus{border-color:var(--xc)}
      .gs-action-cell{text-align:right}
    </style>`;
}

function _gsShowAddForm() {
  UTILS.el('gs-add-form').style.display = 'block';
  UTILS.el('gs-new-url').value = '';
  UTILS.el('err-gs').textContent = '';
  setTimeout(() => UTILS.el('gs-new-url').focus(), 80);
}

async function _gsThemUrl() {
  const url   = UTILS.el('gs-new-url').value.trim();
  const bang  = UTILS.el('gs-new-bang').value;
  const err   = UTILS.el('err-gs');
  err.textContent = '';
  if (!url) { err.textContent = '❌ Vui lòng nhập URL Google Sheet.'; return; }
  if (!bang) { err.textContent = '❌ Vui lòng chọn bảng muốn gắn.'; return; }
  // Kiểm tra có phải link GSheet không
  if (!url.includes('docs.google.com/spreadsheets')) {
    err.textContent = '❌ Link không hợp lệ. Phải là link Google Sheets.'; return;
  }
  try {
    await sb.from(CONFIG.BANG.DANH_SACH_BANG).update({ gsheet_url: url }).eq('bang', bang);
    const b = ADMIN_CORE.dsBang.find(x => x.bang === bang);
    if (b) b.gsheet_url = url;
    UTILS.toast('✅ Đã lưu link Google Sheet!');
    UTILS.el('gs-add-form').style.display = 'none';
    _renderGSheet();
  } catch (e) { err.textContent = '❌ Lỗi: ' + e.message; }
}

// Gỡ URL khỏi bảng cũ, gắn sang bảng mới
async function _gsGanBang(bangCu, bangMoi, url) {
  try {
    // Xóa URL ở bảng cũ
    await sb.from(CONFIG.BANG.DANH_SACH_BANG).update({ gsheet_url: null }).eq('bang', bangCu);
    const bCu = ADMIN_CORE.dsBang.find(x => x.bang === bangCu);
    if (bCu) bCu.gsheet_url = null;

    if (bangMoi) {
      // Gắn sang bảng mới
      await sb.from(CONFIG.BANG.DANH_SACH_BANG).update({ gsheet_url: url }).eq('bang', bangMoi);
      const bMoi = ADMIN_CORE.dsBang.find(x => x.bang === bangMoi);
      if (bMoi) bMoi.gsheet_url = url;
      UTILS.toast('✅ Đã chuyển gắn sang ' + bangMoi);
    } else {
      UTILS.toast('✅ Đã gỡ gắn bảng');
    }
    _renderGSheet();
  } catch (e) { UTILS.toast('Lỗi: ' + e.message, 'er'); }
}

function _gsXoaUrl(maBang, tenBang) {
  UTILS.xacNhan(
    '🗑 Xoá link Google Sheet',
    `Xoá link GSheet của bảng <strong>${tenBang}</strong>?<br>
     <span style="font-size:12px;color:var(--g4)">(Bảng dữ liệu Supabase không bị ảnh hưởng)</span>`,
    async () => {
      try {
        await sb.from(CONFIG.BANG.DANH_SACH_BANG).update({ gsheet_url: null }).eq('bang', maBang);
        const b = ADMIN_CORE.dsBang.find(x => x.bang === maBang);
        if (b) b.gsheet_url = null;
        UTILS.toast('✅ Đã xoá link!');
        _renderGSheet();
      } catch (e) { UTILS.toast('Lỗi: ' + e.message, 'er'); }
    }
  );
}
