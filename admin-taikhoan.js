// ============================================================
// ADMIN-TAIKHOAN.JS — QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN
// ============================================================

// ── TÀI KHOẢN ──
async function hienTaiKhoan() {
  ADMIN_CORE.setAct('ni-tk');
  UTILS.el('topbar-t').textContent = 'Quản lý tài khoản';
  await ADMIN_CORE.loadTK();
  const dsTK = ADMIN_CORE.dsTK;
  UTILS.el('content').innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>👤 Tài khoản <span style="font-size:12px;font-weight:400;color:var(--g4)">(${dsTK.length})</span></h3>
        <button class="btn primary" onclick="TK_MODAL.mo()">+ Thêm tài khoản</button>
      </div>
      <div style="overflow-x:auto">
        <table class="dt">
          <thead><tr>
            <th>Đơn vị</th><th>Người phụ trách</th><th>Email</th>
            <th style="text-align:center">Vai trò</th>
            <th style="text-align:center">Trạng thái</th>
            <th style="text-align:center">Mật khẩu</th><th></th>
          </tr></thead>
          <tbody>${dsTK.map(r => `<tr>
            <td><strong>${r.don_vi}</strong></td>
            <td>${r.ho_ten}</td>
            <td class="mono" style="font-size:11px">${r.email || '--'}</td>
            <td style="text-align:center"><span class="badge ${r.vai_tro === 'admin' ? 'blue' : 'green'}">${r.vai_tro === 'admin' ? '⚙️ Admin' : '✏️ Editor'}</span></td>
            <td style="text-align:center">
              <label class="sw-wrap" style="justify-content:center">
                <label class="sw"><input type="checkbox" ${r.trang_thai ? 'checked' : ''}
                  onchange="_tkToggle(${r.id},'trang_thai',this.checked)">
                  <span class="sw-slider"></span></label>
                <span class="sw-lbl">${r.trang_thai ? 'Hoạt động' : 'Khoá'}</span>
              </label>
            </td>
            <td style="text-align:center">
              <span class="badge ${!r.mat_khau || r.mat_khau === CONFIG.MAT_KHAU_MAC_DINH ? 'gray' : 'green'}">
                ${!r.mat_khau || r.mat_khau === CONFIG.MAT_KHAU_MAC_DINH ? '🔑 Mặc định' : '✅ Đã đổi'}</span>
              ${r.id !== ADMIN_CORE.user.id ? `<button class="btn ghost" style="margin-left:4px;padding:3px 8px;font-size:11px" onclick="_tkResetPass(${r.id},'${r.don_vi}')">Reset</button>` : ''}
            </td>
            <td style="white-space:nowrap">
              <button class="btn ghost" style="margin-right:3px" onclick="TK_MODAL.mo(${r.id})">✏️</button>
              ${r.id !== ADMIN_CORE.user.id ? `<button class="btn danger" onclick="_tkXoa(${r.id},'${r.don_vi}')">🗑</button>` : ''}
            </td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
}

async function _tkToggle(id, col, val) {
  const u = {}; u[col] = val;
  await DB.suaTaiKhoan(id, u);
  UTILS.toast('✅');
  await ADMIN_CORE.loadTK();
  await hienTaiKhoan();
}
function _tkResetPass(id, dv) {
  UTILS.xacNhan('Reset mật khẩu', `Reset mật khẩu <strong>${dv}</strong> về <strong>${CONFIG.MAT_KHAU_MAC_DINH}</strong>?`,
    async () => { await DB.suaTaiKhoan(id, { mat_khau: CONFIG.MAT_KHAU_MAC_DINH }); UTILS.toast('✅ Đã reset!'); await hienTaiKhoan(); });
}
function _tkXoa(id, dv) {
  UTILS.xacNhan('Xoá tài khoản', `Xoá <strong>${dv}</strong>?`,
    async () => { await DB.xoaTaiKhoan(id); UTILS.toast('✅ Đã xoá!'); await hienTaiKhoan(); });
}

// ── MODAL TÀI KHOẢN ──
const TK_MODAL = {
  _editId: null,
  mo(id = null) {
    this._editId = id;
    const r = id ? ADMIN_CORE.dsTK.find(x => x.id === id) : null;
    UTILS.el('tk-modal-title').textContent = r ? 'Sửa tài khoản' : 'Thêm tài khoản';
    UTILS.el('tk-donvi').value  = r?.don_vi  || '';
    UTILS.el('tk-hoten').value  = r?.ho_ten  || '';
    UTILS.el('tk-email').value  = r?.email   || '';
    UTILS.el('tk-vaitro').value = r?.vai_tro || 'editor';
    UTILS.el('err-tk').textContent = '';
    UTILS.moModal('modal-tk');
  },
  async luu() {
    const dv  = UTILS.el('tk-donvi').value.trim();
    const ht  = UTILS.el('tk-hoten').value.trim();
    const em  = UTILS.el('tk-email').value.trim();
    const vt  = UTILS.el('tk-vaitro').value;
    const err = UTILS.el('err-tk');
    err.textContent = '';
    if (!dv || !ht) { err.textContent = 'Vui lòng điền đơn vị và họ tên!'; return; }
    const row = { don_vi: dv, ho_ten: ht, email: em || null, vai_tro: vt };
    try {
      if (this._editId) await DB.suaTaiKhoan(this._editId, row);
      else await DB.themTaiKhoan({ ...row, mat_khau: CONFIG.MAT_KHAU_MAC_DINH, trang_thai: true });
      UTILS.dongModal('modal-tk');
      UTILS.toast('✅ Đã lưu tài khoản!');
      await hienTaiKhoan();
    } catch (e) { err.textContent = 'Lỗi: ' + e.message; }
  },
};

// ── PHÂN QUYỀN ──
let _pqTKId = null;

async function hienPhanQuyen() {
  ADMIN_CORE.setAct('ni-pq');
  UTILS.el('topbar-t').textContent = 'Phân quyền nhập liệu';
  await Promise.all([ADMIN_CORE.loadTK(), ADMIN_CORE.loadBang()]);
  const pqAll = await DB.layTatCaPhanQuyen();
  const editors = ADMIN_CORE.dsTK.filter(r => r.vai_tro === 'editor');
  UTILS.el('content').innerHTML = `
    <div class="card">
      <div class="card-head"><h3>🔑 Phân quyền bảng nhập liệu</h3></div>
      <div style="overflow-x:auto">
        <table class="dt">
          <thead><tr><th>Đơn vị</th><th>Người phụ trách</th><th>Bảng được nhập</th><th></th></tr></thead>
          <tbody>${editors.map(r => {
            const pq = (pqAll || []).filter(p => p.tai_khoan_id === r.id).map(p => p.bang);
            const tenBangs = pq.map(mb => ADMIN_CORE.dsBang.find(b => b.bang === mb)?.ten_bang || mb);
            return `<tr>
              <td><strong>${r.don_vi}</strong></td><td>${r.ho_ten}</td>
              <td>${tenBangs.length ? tenBangs.map(t => `<span class="badge green" style="margin:2px">${t}</span>`).join('') : '<span style="color:var(--g4);font-size:12px">Chưa phân công</span>'}</td>
              <td><button class="btn ghost" onclick="_moModalPQ(${r.id},'${r.don_vi}')">✏️ Sửa</button></td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
    </div>`;
}

async function _moModalPQ(id, donVi) {
  _pqTKId = id;
  UTILS.el('pq-title').textContent = 'Phân quyền: ' + donVi;
  UTILS.el('pq-sub').textContent   = 'Chọn bảng được phép nhập liệu:';
  const pq = await DB.layPhanQuyen(id);
  UTILS.el('pq-list').innerHTML = ADMIN_CORE.dsBang.map(b => `
    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:7px 0;border-bottom:1px solid var(--g2)">
      <input type="checkbox" id="pq-${b.bang}" ${pq.includes(b.bang) ? 'checked' : ''}
        style="width:15px;height:15px;accent-color:var(--xc)">
      <span><strong>${b.ten_bang}</strong> <span style="font-size:11px;color:var(--g4)">${b.don_vi_bao_cao || ''}</span></span>
    </label>`).join('');
  UTILS.moModal('modal-pq');
}

async function _luuPQ() {
  const checked = ADMIN_CORE.dsBang.filter(b => UTILS.el('pq-' + b.bang)?.checked).map(b => b.bang);
  try {
    await DB.luuPhanQuyen(_pqTKId, checked);
    UTILS.dongModal('modal-pq');
    UTILS.toast('✅ Đã lưu phân quyền!');
    await hienPhanQuyen();
  } catch (e) { UTILS.toast('Lỗi: ' + e.message, 'er'); }
}

// ── ĐỔI MẬT KHẨU ──
function hienDoiPass() {
  UTILS.el('topbar-t').textContent = 'Đổi mật khẩu';
  const user = ADMIN_CORE.user;
  UTILS.el('content').innerHTML = `
    <div style="max-width:400px;margin:0 auto">
      <div class="card">
        <div class="card-head"><h3>🔐 Đổi mật khẩu</h3></div>
        <div class="form-grid" style="grid-template-columns:1fr">
          <div class="fg"><label>Đơn vị</label><input class="inp" value="${user.don_vi}" disabled style="background:var(--g1)"></div>
          <div class="fg"><label>Mật khẩu hiện tại</label><input class="inp" type="password" id="dp-cu" placeholder="••••••••"></div>
          <div class="fg"><label>Mật khẩu mới (≥4 ký tự)</label><input class="inp" type="password" id="dp-moi" placeholder="••••••••"></div>
          <div class="fg"><label>Nhập lại mật khẩu mới</label><input class="inp" type="password" id="dp-moi2" placeholder="••••••••"></div>
        </div>
        <div class="form-actions">
          <button class="btn primary" onclick="_luuPassAdmin()">💾 Lưu mật khẩu</button>
        </div>
        <div class="err-txt" id="err-dp" style="padding:0 16px 12px"></div>
      </div>
    </div>`;
}

async function _luuPassAdmin() {
  const cu = UTILS.el('dp-cu').value, moi = UTILS.el('dp-moi').value, moi2 = UTILS.el('dp-moi2').value;
  const err = UTILS.el('err-dp'); err.textContent = ''; err.style.color = 'var(--red)';
  const user = ADMIN_CORE.user;
  if (cu !== (user.mat_khau || CONFIG.MAT_KHAU_MAC_DINH)) { err.textContent = 'Mật khẩu hiện tại không đúng.'; return; }
  if (moi.length < 4) { err.textContent = 'Mật khẩu mới phải có ít nhất 4 ký tự.'; return; }
  if (moi !== moi2) { err.textContent = 'Mật khẩu nhập lại không khớp.'; return; }
  if (moi === CONFIG.MAT_KHAU_MAC_DINH) { err.textContent = 'Không được dùng lại mật khẩu mặc định.'; return; }
  try {
    await DB.doiMatKhau(user.id, moi);
    user.mat_khau = moi; UTILS.luuSession(user);
    err.style.color = 'var(--xc)'; err.textContent = '✅ Đổi mật khẩu thành công!';
    ['dp-cu', 'dp-moi', 'dp-moi2'].forEach(id => UTILS.el(id).value = '');
  } catch (e) { err.textContent = 'Lỗi: ' + e.message; }
}
