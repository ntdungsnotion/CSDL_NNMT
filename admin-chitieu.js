// ============================================================
// ADMIN-CHITIEU.JS — QUẢN LÝ CHỈ TIÊU
// ============================================================

async function hienChiTieu() {
  ADMIN_CORE.setAct('ni-ct');
  UTILS.el('topbar-t').textContent = 'Danh mục chỉ tiêu';
  await ADMIN_CORE.loadBang();
  const dsBang = ADMIN_CORE.dsBang;
  UTILS.el('content').innerHTML = `
    <div class="card" style="margin-bottom:12px">
      <div class="card-head">
        <h3>📑 Quản lý chỉ tiêu</h3>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <label style="font-size:12px;color:var(--g5)">Chọn bảng:</label>
          <select id="sel-bang-ct" onchange="taiChiTieu(this.value)"
            style="padding:6px 10px;border:1.5px solid var(--g2);border-radius:var(--r);font-family:var(--font);font-size:13px">
            ${dsBang.map(b => `<option value="${b.bang}">${b.ten_bang}</option>`).join('')}
          </select>
          <button class="btn primary" onclick="CT_MODAL.mo()">➕ Thêm chỉ tiêu</button>
        </div>
      </div>
    </div>
    <div id="ct-content"><div class="loading"><span class="spin"></span></div></div>`;
  if (dsBang.length) taiChiTieu(dsBang[0].bang);
}

async function taiChiTieu(maBang) {
  const el = UTILS.el('ct-content');
  el.innerHTML = '<div class="loading"><span class="spin"></span> Đang tải...</div>';
  const ct = await DB.layChiTieuTheoBang(maBang);
  const b  = ADMIN_CORE.dsBang.find(x => x.bang === maBang);

  const mkSel = (id, field, opts, cur) =>
    `<select class="ct-sel" onchange="_ctCapNhat('${id}','${field}',this.value==='__true'?true:this.value==='__false'?false:this.value)">
      ${opts.map(o => `<option value="${o.v}" ${String(cur) === String(o.v) ? 'selected' : ''}>${o.l}</option>`).join('')}
    </select>`;

  const optsKieu    = [{ v: 'number', l: 'Số' }, { v: 'text', l: 'Văn bản' }];
  const optsTanSuat = [
    { v: 'hang_thang',  l: 'Hàng tháng' }, { v: 'hang_quy', l: 'Hàng quý' },
    { v: 'nua_nam',     l: 'Nửa năm' },    { v: 'cuoi_nam', l: 'Cuối năm' },
    { v: 'nam_dac_biet',l: 'Năm đặc biệt' },
  ];
  const optsLaTD = [{ v: '__false', l: 'Không' }, { v: '__true', l: 'Tiêu đề' }];

  const cols = [
    { k: 'ma_ht',  lbl: 'Mã HT',          w: 70 },
    { k: 'ma_bo',  lbl: 'Mã Bộ',          w: 80 },
    { k: 'thu_tu', lbl: 'Thứ tự',         w: 65 },
    { k: 'stt',    lbl: 'STT hiển thị',   w: 75 },
    { k: 'ten',    lbl: 'Tên chỉ tiêu',   w: 320 },
    { k: 'dvt',    lbl: 'ĐVT',            w: 55 },
    { k: 'kieu',   lbl: 'Kiểu DL',        w: 90 },
    { k: 'nhap',   lbl: 'Cho phép nhập',  w: 105 },
    { k: 'tansuat',lbl: 'Tần suất',       w: 110 },
    { k: 'latd',   lbl: 'Là tiêu đề',    w: 90 },
    { k: 'ql',     lbl: 'Quản lý',        w: 65, noResize: true },
  ];

  const thead = cols.map(c =>
    `<th style="width:${c.w}px;min-width:${c.w}px;text-align:${c.k === 'ql' ? 'center' : 'left'}" data-col="${c.k}">
      ${c.lbl}${c.noResize ? '' : '<div class="rh" onmousedown="_ctStartResize(event,this.closest(\'th\'))"></div>'}
    </th>`
  ).join('');

  const tbody = ct.map(c => {
    const ind    = (c.chi_tieu.match(/^\s+/)?.[0]?.length || 0) * 3;
    const isTD   = c.la_tieu_de;
    const trCls  = isTD ? 'tr-td' : (c.cho_phep_nhap === false ? 'tr-locked' : '');
    const tenRut = c.chi_tieu.trim().replace(/'/g, "\\'").substring(0, 30);
    return `<tr class="${trCls}">
      <td><span class="cell-text mono" style="font-size:11px">${c.id}</span></td>
      <td><input class="ct-inp mono" value="${c.id_bo || ''}" placeholder="--"
            onchange="_ctCapNhat('${c.id}','id_bo',this.value.trim()||null)"></td>
      <td><input class="ct-inp mono" type="number" step="any" value="${c.thu_tu || ''}" placeholder="--"
            onchange="_ctCapNhat('${c.id}','thu_tu',this.value===''?null:parseFloat(this.value))"></td>
      <td><input class="ct-inp" value="${c.stt_hien_thi || ''}" placeholder="--"
            onchange="_ctCapNhat('${c.id}','stt_hien_thi',this.value||null)"></td>
      <td style="padding-left:${ind + 8}px">
        <input class="ct-inp cell-wrap" value="${c.chi_tieu.trim().replace(/"/g, '&quot;')}"
          onchange="_ctCapNhat('${c.id}','chi_tieu',this.value)">
      </td>
      <td><input class="ct-inp" value="${c.don_vi || ''}" placeholder="--"
            onchange="_ctCapNhat('${c.id}','don_vi',this.value||null)"></td>
      <td>${mkSel(c.id, 'kieu_du_lieu', optsKieu, c.kieu_du_lieu || 'number')}</td>
      <td style="text-align:center">
        <label class="sw-wrap" style="justify-content:center">
          <label class="sw"><input type="checkbox" ${c.cho_phep_nhap !== false ? 'checked' : ''}
            onchange="_ctCapNhat('${c.id}','cho_phep_nhap',this.checked)">
            <span class="sw-slider"></span></label>
          <span class="sw-lbl">${c.cho_phep_nhap !== false ? '🔓' : '🔒'}</span>
        </label>
      </td>
      <td>${mkSel(c.id, 'tan_suat', optsTanSuat, c.tan_suat || 'hang_thang')}</td>
      <td>${mkSel(c.id, 'la_tieu_de', optsLaTD, isTD ? '__true' : '__false')}</td>
      <td style="text-align:center;padding:3px 6px">
        <button onclick="CT_XOA.mo('${c.id}','${tenRut}')"
          style="padding:3px 8px;background:#fee2e2;color:var(--red);border:none;border-radius:4px;cursor:pointer;font-size:11px;font-family:var(--font)"
          title="Xóa chỉ tiêu này">🗑️</button>
      </td>
    </tr>`;
  }).join('');

  el.innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>${b?.ten_bang} <span style="font-size:11px;font-weight:400;color:var(--g4)">(${ct.length})</span></h3>
        <div style="display:flex;gap:6px">
          <button class="btn ghost" onclick="_ctBatTatTatCa('${maBang}',true)">✅ Mở tất cả</button>
          <button class="btn ghost" onclick="_ctBatTatTatCa('${maBang}',false)">🔒 Khóa tất cả</button>
        </div>
      </div>
      <div style="overflow-x:auto">
        <table class="ct-tbl" id="ct-tbl">
          <thead><tr>${thead}</tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
    </div>`;
  _ctInitResize();
}

function _ctInitResize() {
  document.querySelectorAll('#ct-tbl thead th').forEach(th => {
    th.style.width = th.style.width || th.offsetWidth + 'px';
  });
}

let _ctRzTh = null, _ctRzX = 0, _ctRzW = 0;
function _ctStartResize(e, th) {
  _ctRzTh = th; _ctRzX = e.clientX; _ctRzW = th.offsetWidth; e.preventDefault();
  document.onmousemove = ev => {
    if (!_ctRzTh) return;
    const newW = Math.max(40, _ctRzW + ev.clientX - _ctRzX);
    _ctRzTh.style.width = newW + 'px'; _ctRzTh.style.minWidth = newW + 'px';
  };
  document.onmouseup = () => { _ctRzTh = null; document.onmousemove = null; document.onmouseup = null; };
}

async function _ctCapNhat(id, col, val) {
  try { await DB.capNhatChiTieu(id, { [col]: val }); UTILS.toast('✅ Đã lưu!'); }
  catch (e) { UTILS.toast('Lỗi: ' + e.message, 'er'); }
}

async function _ctBatTatTatCa(maBang, val) {
  try {
    await sb.from(CONFIG.BANG.CHI_TIEU).update({ cho_phep_nhap: val }).eq('bang', maBang).eq('la_tieu_de', false);
    UTILS.toast(val ? '✅ Đã mở tất cả' : '🔒 Đã khóa tất cả');
    taiChiTieu(maBang);
  } catch (e) { UTILS.toast('Lỗi: ' + e.message, 'er'); }
}

// ── MODAL THÊM CHỈ TIÊU ──
const CT_MODAL = {
  mo() {
    ['ct-id', 'ct-idbo', 'ct-ten', 'ct-dvt', 'ct-thutu', 'ct-stt'].forEach(id => { const e = UTILS.el(id); if (e) e.value = ''; });
    if (UTILS.el('ct-kieu'))    UTILS.el('ct-kieu').value = 'number';
    if (UTILS.el('ct-tansuat')) UTILS.el('ct-tansuat').value = 'hang_thang';
    if (UTILS.el('ct-latd'))    UTILS.el('ct-latd').value = 'false';
    UTILS.el('err-ct').textContent = '';
    const maBang  = UTILS.el('sel-bang-ct')?.value || '';
    const tenBang = ADMIN_CORE.dsBang.find(b => b.bang === maBang)?.ten_bang || maBang;
    document.querySelector('#modal-ct h3').textContent = `➕ Thêm chỉ tiêu — ${tenBang}`;
    UTILS.moModal('modal-ct');
    setTimeout(() => UTILS.el('ct-id')?.focus(), 100);
  },
  async luu() {
    const err    = UTILS.el('err-ct'); err.textContent = '';
    const maBang = UTILS.el('sel-bang-ct')?.value;
    if (!maBang) { err.textContent = 'Chưa chọn bảng!'; return; }
    const id    = UTILS.el('ct-id').value.trim();
    const ten   = UTILS.el('ct-ten').value.trim();
    const thutu = UTILS.el('ct-thutu').value;
    if (!id)    { err.textContent = '❌ Mã hệ thống không được để trống.'; UTILS.el('ct-id').focus(); return; }
    if (!ten)   { err.textContent = '❌ Tên chỉ tiêu không được để trống.'; UTILS.el('ct-ten').focus(); return; }
    if (!thutu) { err.textContent = '❌ Thứ tự không được để trống.'; UTILS.el('ct-thutu').focus(); return; }
    const laTD = UTILS.el('ct-latd').value === 'true';
    const row = {
      id, bang: maBang,
      chi_tieu:  ten,
      don_vi:    UTILS.el('ct-dvt').value.trim() || null,
      thu_tu:    parseFloat(thutu),
      stt_hien_thi: UTILS.el('ct-stt').value.trim() || null,
      id_bo:     UTILS.el('ct-idbo').value.trim() || null,
      kieu_du_lieu: UTILS.el('ct-kieu').value,
      tan_suat:  UTILS.el('ct-tansuat').value,
      la_tieu_de:   laTD,
      cho_phep_nhap: !laTD,
    };
    try {
      const { error } = await sb.from(CONFIG.BANG.CHI_TIEU).insert(row);
      if (error) throw error;
      UTILS.toast('✅ Đã thêm chỉ tiêu mới!');
      UTILS.dongModal('modal-ct');
      taiChiTieu(maBang);
    } catch (e) {
      err.textContent = (e.message?.includes('duplicate') || e.message?.includes('unique'))
        ? `❌ Mã "${id}" đã tồn tại. Vui lòng dùng mã khác.`
        : '❌ Lỗi: ' + e.message;
    }
  },
};

// ── XÓA CHỈ TIÊU (bảo vệ mật khẩu cấp 2) ──
const CT_XOA = {
  _id: null, _bang: null,
  mo(id, ten) {
    this._id   = id;
    this._bang = UTILS.el('sel-bang-ct')?.value;
    UTILS.el('xoa-ct-info').innerHTML =
      `Chỉ tiêu: <strong>${id}</strong> — "${ten}..."<br>
       <span style="color:var(--red);font-size:11px">⚠️ Toàn bộ số liệu đã nhập của chỉ tiêu này cũng sẽ bị xóa vĩnh viễn!</span>`;
    UTILS.el('mk2-inp').value = '';
    UTILS.el('err-xoa-ct').textContent = '';
    UTILS.moModal('modal-xoa-ct');
    setTimeout(() => UTILS.el('mk2-inp')?.focus(), 100);
  },
  async xacNhan() {
    const err = UTILS.el('err-xoa-ct'); err.textContent = '';
    const mk  = UTILS.el('mk2-inp').value;
    if (!mk) { err.textContent = 'Vui lòng nhập mật khẩu cấp 2.'; return; }
    try {
      const { data, error } = await sb.from(CONFIG.BANG.TAI_KHOAN).select('mat_khau').eq('don_vi', 'mật khẩu cấp 2').single();
      if (error || !data) { err.textContent = '❌ Không tìm thấy tài khoản bảo vệ. Liên hệ quản trị.'; return; }
      if (mk !== data.mat_khau) { err.textContent = '❌ Mật khẩu cấp 2 không đúng.'; UTILS.el('mk2-inp').value = ''; UTILS.el('mk2-inp').focus(); return; }
      const { error: e2 } = await sb.from(CONFIG.BANG.CHI_TIEU).delete().eq('id', this._id);
      if (e2) throw e2;
      UTILS.toast('🗑️ Đã xóa chỉ tiêu ' + this._id);
      UTILS.dongModal('modal-xoa-ct');
      if (this._bang) taiChiTieu(this._bang);
    } catch (e) { err.textContent = '❌ Lỗi: ' + e.message; }
  },
};
