// ============================================================
// ADMIN-KY.JS — QUẢN LÝ KỲ BÁO CÁO
// Yêu cầu: admin.html đã load config.js, db.js, utils.js
// ============================================================

let _kyFilterNamBD = '', _kyFilterNamKT = '';
let _kySortCol = '', _kySortDir = 1;

async function hienKyBaoCao() {
  ADMIN_CORE.setAct('ni-ky');
  UTILS.el('topbar-t').textContent = 'Quản lý kỳ báo cáo';
  const namHienTai = new Date().getFullYear();
  if (!_kyFilterNamBD) _kyFilterNamBD = namHienTai - 1;
  if (!_kyFilterNamKT) _kyFilterNamKT = namHienTai + 1;
  await ADMIN_CORE.loadKy(_kyFilterNamBD, _kyFilterNamKT);
  _renderKyBaoCao();
}

function _renderKyBaoCao() {
  let ds = [...ADMIN_CORE.dsKy];
  if (_kySortCol) {
    ds.sort((a, b) => {
      let va = a[_kySortCol], vb = b[_kySortCol];
      if (va == null) va = ''; if (vb == null) vb = '';
      return String(va).localeCompare(String(vb), 'vi') * _kySortDir;
    });
  }
  const cols = [
    { key: 'thu_tu_hien_thi',    label: 'Thứ tự',   w: '110px' },
    { key: 'ky_bao_cao',         label: 'Mã kỳ',    w: '160px' },
    { key: 'ky_bao_cao_tieu_de', label: 'Tên kỳ',   w: '' },
    { key: 'thang_bao_cao',      label: 'Tháng',    w: '60px' },
    { key: 'nam_bao_cao',        label: 'Năm',      w: '65px' },
    { key: 'loai_so_lieu',       label: 'Loại',     w: '120px' },
    { key: 'do_rong_cot',        label: 'Rộng(px)', w: '80px' },
  ];
  const thead = cols.map(c => {
    const cls = _kySortCol === c.key ? (_kySortDir === 1 ? 'sort-asc' : 'sort-desc') : '';
    return `<th class="${cls}" style="${c.w ? 'width:' + c.w : ''}" onclick="_kySortBy('${c.key}')">${c.label}<span class="sort-icon"></span></th>`;
  }).join('') + '<th style="text-align:center">Nhập</th><th style="text-align:center">Hiện</th><th></th>';

  const tbody = ds.map(k => `<tr>
    <td style="text-align:center;padding:4px 8px">
      <input class="num-inp" type="number" min="1" value="${k.thu_tu_hien_thi || ''}" placeholder="--" style="width:90px"
        onchange="_kyCapNhat('${k.ky_bao_cao}','thu_tu_hien_thi',this.value===''?null:parseInt(this.value))">
    </td>
    <td class="mono">${k.ky_bao_cao}</td>
    <td>${k.ky_bao_cao_tieu_de || ''}</td>
    <td style="text-align:center">${k.thang_bao_cao}</td>
    <td style="text-align:center">${k.nam_bao_cao}</td>
    <td><span class="badge ${k.loai_so_lieu === 'Chính thức' || k.loai_so_lieu === 'Lũy kế chính thức' ? 'green' : 'blue'}">${k.loai_so_lieu || '--'}</span></td>
    <td style="text-align:center;padding:4px 8px">
      <input class="num-inp" type="number" min="60" max="400" value="${k.do_rong_cot || 120}" placeholder="120"
        onchange="_kyCapNhat('${k.ky_bao_cao}','do_rong_cot',parseInt(this.value)||120)">
    </td>
    <td style="text-align:center">
      <label class="sw-wrap" style="justify-content:center">
        <label class="sw"><input type="checkbox" ${!k.khoa_nhap_lieu ? 'checked' : ''}
          onchange="_kyCapNhat('${k.ky_bao_cao}','khoa_nhap_lieu',!this.checked)">
          <span class="sw-slider"></span></label>
        <span class="sw-lbl" style="font-size:10px">${!k.khoa_nhap_lieu ? '🔓' : '🔒'}</span>
      </label>
    </td>
    <td style="text-align:center">
      <label class="sw-wrap" style="justify-content:center">
        <label class="sw"><input type="checkbox" ${k.dua_vao_bieu_bao_cao ? 'checked' : ''}
          onchange="_kyCapNhat('${k.ky_bao_cao}','dua_vao_bieu_bao_cao',this.checked)">
          <span class="sw-slider"></span></label>
        <span class="sw-lbl" style="font-size:10px">${k.dua_vao_bieu_bao_cao ? '✅' : '⬜'}</span>
      </label>
    </td>
    <td style="white-space:nowrap">
      <button class="btn ghost" style="padding:4px 8px;margin-right:3px" onclick="KY_MODAL.mo('${k.ky_bao_cao}')">✏️</button>
      <button class="btn danger" style="padding:4px 8px" onclick="_kyXoa('${k.ky_bao_cao}')">🗑</button>
    </td>
  </tr>`).join('');

  UTILS.el('content').innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>📅 Kỳ báo cáo <span style="font-size:12px;font-weight:400;color:var(--g4)">(${ds.length} kỳ)</span></h3>
        <button class="btn primary" onclick="KY_MODAL.mo()">+ Thêm kỳ mới</button>
      </div>
      <div class="filter-bar">
        <label>Lọc năm:</label><label>Từ</label>
        <input type="number" id="f-nam-bd" value="${_kyFilterNamBD}" style="width:70px" oninput="_kyFilterNamBD=this.value">
        <label>đến</label>
        <input type="number" id="f-nam-kt" value="${_kyFilterNamKT}" style="width:70px" oninput="_kyFilterNamKT=this.value">
        <button class="btn ghost" onclick="hienKyBaoCao()">Lọc</button>
        <button class="btn ghost" onclick="_kyFilterNamBD='';_kyFilterNamKT='';hienKyBaoCao()">Tất cả</button>
      </div>
      <div style="overflow-x:auto">
        <table class="dt">
          <thead><tr>${thead}</tr></thead>
          <tbody>${tbody || '<tr><td colspan="10" style="text-align:center;padding:20px;color:var(--g4)">Không có kỳ báo cáo nào</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

function _kySortBy(col) {
  if (_kySortCol === col) _kySortDir *= -1;
  else { _kySortCol = col; _kySortDir = 1; }
  _renderKyBaoCao();
}

async function _kyCapNhat(ma, col, val) {
  const u = {}; u[col] = val;
  try {
    await DB.capNhatKy(ma, u);
    UTILS.toast('✅ Đã cập nhật!');
    const k = ADMIN_CORE.dsKy.find(x => x.ky_bao_cao === ma);
    if (k) k[col] = val;
  } catch (e) { UTILS.toast('Lỗi: ' + e.message, 'er'); }
}

function _kyXoa(ma) {
  UTILS.xacNhan('Xoá kỳ báo cáo', `Xoá kỳ "<strong>${ma}</strong>"?`,
    async () => {
      try { await DB.xoaKy(ma); UTILS.toast('✅ Đã xoá!'); await hienKyBaoCao(); }
      catch (e) { UTILS.toast('Lỗi: ' + e.message, 'er'); }
    });
}

// ── MODAL KỲ ──
const KY_MODAL = {
  _editId: null,
  mo(maKy = null) {
    this._editId = maKy;
    const k = maKy ? ADMIN_CORE.dsKy.find(x => x.ky_bao_cao === maKy) : null;
    UTILS.el('ky-modal-title').textContent = k ? 'Sửa kỳ báo cáo' : 'Thêm kỳ báo cáo';
    UTILS.el('ky-thang').value  = k?.thang_bao_cao || '';
    UTILS.el('ky-nam').value    = k?.nam_bao_cao   || new Date().getFullYear();
    UTILS.el('ky-loai').value   = k?.loai_so_lieu  || 'Ước thực hiện';
    UTILS.el('ky-ma').value     = k?.ky_bao_cao    || '';
    UTILS.el('ky-ten').value    = k?.ky_bao_cao_tieu_de || '';
    UTILS.el('ky-ten').dataset.auto = '0';
    UTILS.el('ky-nguon').value  = k?.nguon_so_lieu || '';
    UTILS.el('ky-thutu').value  = k?.thu_tu_hien_thi || '';
    UTILS.el('ky-dorong').value = k?.do_rong_cot  || 120;
    UTILS.el('err-ky').textContent = '';
    if (!k) sinhMaKy();
    UTILS.moModal('modal-ky');
  },
  async luu() {
    const ma    = UTILS.el('ky-ma').value.trim();
    const ten   = UTILS.el('ky-ten').value.trim();
    const thang = parseInt(UTILS.el('ky-thang').value);
    const nam   = parseInt(UTILS.el('ky-nam').value);
    const loai  = UTILS.el('ky-loai').value;
    const nguon = UTILS.el('ky-nguon').value.trim();
    const thutu = UTILS.el('ky-thutu').value;
    const dorong = parseInt(UTILS.el('ky-dorong').value) || 120;
    const err   = UTILS.el('err-ky');
    err.textContent = '';
    if (!ma || !ten || !thang || !nam) { err.textContent = 'Vui lòng điền đủ thông tin!'; return; }
    const row = {
      ky_bao_cao: ma, ky_bao_cao_tieu_de: ten,
      thang_bao_cao: thang, nam_bao_cao: nam,
      loai_so_lieu: loai, nguon_so_lieu: nguon,
      thu_tu_hien_thi: thutu ? parseInt(thutu) : null,
      do_rong_cot: dorong,
      khoa_nhap_lieu: false, dua_vao_bieu_bao_cao: true
    };
    try {
      if (this._editId) await DB.capNhatKy(this._editId, row);
      else await DB.themKy(row);
      UTILS.dongModal('modal-ky');
      UTILS.toast('✅ Đã lưu kỳ báo cáo!');
      await hienKyBaoCao();
    } catch (e) { err.textContent = 'Lỗi: ' + e.message; }
  },
};

function sinhMaKy() {
  const thang = UTILS.el('ky-thang').value;
  const nam   = UTILS.el('ky-nam').value;
  const loai  = UTILS.el('ky-loai').value;
  if (!thang || !nam) return;
  const t = String(thang).padStart(2, '0');
  const prefix = { 'Ước thực hiện': 'uoc', 'Ước lũy kế': 'uoclk', 'Chính thức': 'ct', 'Lũy kế chính thức': 'lkct', 'So cùng kỳ': 'sck' }[loai] || 'uoc';
  UTILS.el('ky-ma').value = `${prefix}_${t}/${nam}`;
  const tenLoai = {
    'Ước thực hiện': `Ước tháng ${thang} năm ${nam}`,
    'Ước lũy kế':   `Ước lũy kế đến tháng ${thang} năm ${nam}`,
    'Chính thức':   `Chính thức tháng ${thang} năm ${nam}`,
    'Lũy kế chính thức': `Lũy kế chính thức đến tháng ${thang} năm ${nam}`,
    'So cùng kỳ':   `So cùng kỳ tháng ${thang} năm ${nam}`,
  }[loai] || '';
  const tenEl = UTILS.el('ky-ten');
  if (!tenEl.value || tenEl.dataset.auto === '1') { tenEl.value = tenLoai; tenEl.dataset.auto = '1'; }
}
