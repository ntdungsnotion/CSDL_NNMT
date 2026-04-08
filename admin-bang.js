// ============================================================
// ADMIN-BANG.JS — QUẢN LÝ BẢNG BÁO CÁO & TIÊU ĐỀ BẢNG
// ============================================================

// ── QUẢN LÝ BẢNG ──
async function hienQuanLyBang() {
  ADMIN_CORE.setAct('ni-bang');
  UTILS.el('topbar-t').textContent = 'Quản lý bảng báo cáo';
  await ADMIN_CORE.loadBang();
  _renderQuanLyBang();
}

function _renderQuanLyBang() {
  const dsBang = ADMIN_CORE.dsBang;
  UTILS.el('content').innerHTML = `
    <div class="card" style="margin-bottom:12px">
      <div class="card-head">
        <h3>🗂️ Danh sách bảng báo cáo <span style="font-size:12px;font-weight:400;color:var(--g4)">(${dsBang.length} bảng)</span></h3>
        <button class="btn primary" onclick="_bangMoModalThem()">+ Thêm bảng mới</button>
      </div>
      <div style="overflow-x:auto">
        <table class="dt">
          <thead><tr>
            <th style="width:60px;text-align:center">Thứ tự</th>
            <th style="width:80px">Mã bảng</th>
            <th>Tên bảng</th>
            <th>Đơn vị báo cáo</th>
            <th style="text-align:center;width:80px">Rộng tên<br><span style="font-weight:400;opacity:.7">(px)</span></th>
            <th style="text-align:center;width:70px">Rộng ĐVT</th>
            <th style="text-align:center;width:80px">Rộng ghi chú</th>
            <th style="width:80px">Bảng DB</th>
            <th></th>
          </tr></thead>
          <tbody>${dsBang.map(b => `<tr>
            <td style="text-align:center;padding:4px 8px">
              <input class="num-inp" type="number" min="1" value="${b.thu_tu || ''}" placeholder="--"
                onchange="_bangLuuField('${b.bang}','thu_tu',parseInt(this.value)||null)">
            </td>
            <td class="mono" style="font-size:12px">${b.bang}</td>
            <td>
              <input type="text" value="${b.ten_bang || ''}"
                style="width:100%;padding:4px 8px;border:1.5px solid var(--g2);border-radius:5px;font-family:var(--font);font-size:13px;outline:none"
                onfocus="this.style.borderColor='var(--xc)'" onblur="this.style.borderColor='var(--g2)'"
                onchange="_bangLuuField('${b.bang}','ten_bang',this.value)">
            </td>
            <td>
              <input type="text" value="${b.don_vi_bao_cao || ''}"
                style="width:100%;padding:4px 8px;border:1.5px solid var(--g2);border-radius:5px;font-family:var(--font);font-size:12px;outline:none"
                onfocus="this.style.borderColor='var(--xc)'" onblur="this.style.borderColor='var(--g2)'"
                onchange="_bangLuuField('${b.bang}','don_vi_bao_cao',this.value)">
            </td>
            <td style="text-align:center;padding:4px 6px">
              <input class="num-inp" type="number" min="80" max="600" value="${b.do_rong_ten || 280}"
                onchange="_bangLuuField('${b.bang}','do_rong_ten',parseInt(this.value)||280)">
            </td>
            <td style="text-align:center;padding:4px 6px">
              <input class="num-inp" type="number" min="40" max="150" value="${b.do_rong_dvt || 70}"
                onchange="_bangLuuField('${b.bang}','do_rong_dvt',parseInt(this.value)||70)">
            </td>
            <td style="text-align:center;padding:4px 6px">
              <input class="num-inp" type="number" min="80" max="300" value="${b.do_rong_ghichu || 140}"
                onchange="_bangLuuField('${b.bang}','do_rong_ghichu',parseInt(this.value)||140)">
            </td>
            <td class="mono" style="font-size:10px;color:var(--g4)">${(CONFIG.BANG.CSDL_PREFIX + b.bang).toLowerCase()}</td>
            <td style="white-space:nowrap">
              <button class="btn danger" style="padding:4px 8px" onclick="_bangXoa('${b.bang}','${b.ten_bang}')">🗑 Xoá</button>
            </td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
    <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:var(--r);padding:10px 14px;font-size:12px;color:#6d4c00">
      ⚠️ <strong>Trước khi thêm bảng:</strong> chạy SQL tạo bảng dữ liệu trong Supabase trước:<br>
      <code style="background:#fef3c7;padding:2px 6px;border-radius:3px;font-size:11px">
        CREATE TABLE csdl_bang_06 (LIKE csdl_bang_01 INCLUDING ALL);
      </code>
    </div>`;
}

async function _bangLuuField(maBang, col, val) {
  const u = {}; u[col] = val;
  try { await DB.capNhatBang(maBang, u); UTILS.toast('✅ Đã lưu!'); }
  catch (e) { UTILS.toast('Lỗi: ' + e.message, 'er'); }
}

function _bangMoModalThem() {
  const soBang = ADMIN_CORE.dsBang.length + 1;
  const maMoi  = `Bang_${String(soBang).padStart(2, '0')}`;
  const thuTu  = soBang;

  UTILS.xacNhan(
    '+ Thêm bảng báo cáo mới',
    `<div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
      <div><label style="font-size:11px;font-weight:700;color:var(--g5);display:block;margin-bottom:4px">MÃ BẢNG</label>
        <input id="nb-ma" type="text" value="${maMoi}" style="width:100%;padding:8px 10px;border:1.5px solid var(--g2);border-radius:7px;font-family:monospace;font-size:13px;outline:none">
        <div style="font-size:11px;color:var(--g4);margin-top:3px">Bảng DB sẽ là: <strong id="nb-db-preview">${(CONFIG.BANG.CSDL_PREFIX + maMoi).toLowerCase()}</strong></div>
      </div>
      <div><label style="font-size:11px;font-weight:700;color:var(--g5);display:block;margin-bottom:4px">TÊN BẢNG</label>
        <input id="nb-ten" type="text" placeholder="VD: Lâm nghiệp" style="width:100%;padding:8px 10px;border:1.5px solid var(--g2);border-radius:7px;font-family:var(--font);font-size:13px;outline:none"></div>
      <div><label style="font-size:11px;font-weight:700;color:var(--g5);display:block;margin-bottom:4px">ĐƠN VỊ BÁO CÁO</label>
        <input id="nb-dv" type="text" placeholder="VD: Chi cục Kiểm lâm" style="width:100%;padding:8px 10px;border:1.5px solid var(--g2);border-radius:7px;font-family:var(--font);font-size:13px;outline:none"></div>
      <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:8px 10px;font-size:11px;color:#856404">
        ⚠️ Phải tạo bảng DB trong Supabase trước:<br>
        <code id="nb-sql-preview">CREATE TABLE ${(CONFIG.BANG.CSDL_PREFIX + maMoi).toLowerCase()} (LIKE csdl_bang_01 INCLUDING ALL);</code>
      </div>
    </div>`,
    async () => {
      const ma  = document.getElementById('nb-ma')?.value.trim();
      const ten = document.getElementById('nb-ten')?.value.trim();
      const dv  = document.getElementById('nb-dv')?.value.trim();
      if (!ma || !ten) { UTILS.toast('Vui lòng điền Mã bảng và Tên bảng!', 'er'); return; }
      try {
        await sb.from(CONFIG.BANG.DANH_SACH_BANG).insert({
          bang: ma, ten_bang: ten, don_vi_bao_cao: dv || '',
          thu_tu: thuTu, do_rong_ten: 280, do_rong_dvt: 70, do_rong_ghichu: 140
        });
        UTILS.toast('✅ Đã thêm bảng ' + ten + '!');
        await ADMIN_CORE.loadBang();
        _renderQuanLyBang();
      } catch (e) { UTILS.toast('Lỗi: ' + e.message, 'er'); }
    }
  );
  setTimeout(() => {
    const inp = document.getElementById('nb-ma');
    if (inp) inp.addEventListener('input', () => {
      const v = inp.value.trim();
      const db = (CONFIG.BANG.CSDL_PREFIX + v).toLowerCase();
      const prev = document.getElementById('nb-db-preview');
      const sql  = document.getElementById('nb-sql-preview');
      if (prev) prev.textContent = db;
      if (sql)  sql.textContent  = `CREATE TABLE ${db} (LIKE csdl_bang_01 INCLUDING ALL);`;
    });
  }, 100);
}

function _bangXoa(maBang, tenBang) {
  UTILS.xacNhan(
    '🗑 Xoá bảng báo cáo',
    `<p>Xoá bảng <strong>${tenBang}</strong> (<code>${maBang}</code>) khỏi danh sách?</p>
     <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;padding:8px 10px;font-size:12px;color:#991b1b;margin-top:10px">
       ⚠️ Thao tác này chỉ xoá khỏi danh sách — <strong>không xoá bảng dữ liệu</strong> trong Supabase và <strong>không xoá chỉ tiêu</strong>.
     </div>`,
    async () => {
      try {
        await sb.from(CONFIG.BANG.DANH_SACH_BANG).delete().eq('bang', maBang);
        UTILS.toast('✅ Đã xoá bảng ' + tenBang + ' khỏi danh sách!');
        await ADMIN_CORE.loadBang();
        _renderQuanLyBang();
      } catch (e) { UTILS.toast('Lỗi: ' + e.message, 'er'); }
    }
  );
}

// ── TIÊU ĐỀ BẢNG ──
async function hienTieuDeBang() {
  ADMIN_CORE.setAct('ni-tdb');
  UTILS.el('topbar-t').textContent = 'Tiêu đề bảng báo cáo';
  await ADMIN_CORE.loadBang();
  UTILS.el('content').innerHTML = `
    <div class="card">
      <div class="card-head"><h3>🏷️ Tiêu đề các bảng báo cáo</h3></div>
      <div style="padding:14px 16px">
        <p style="font-size:12px;color:var(--g4);margin-bottom:14px">Dòng 1: tiêu đề chính (in đậm). Dòng 2: tiêu đề phụ (số công văn).</p>
        ${ADMIN_CORE.dsBang.map(b => `
          <div style="border:1.5px solid var(--g2);border-radius:var(--r);padding:14px;margin-bottom:10px">
            <div style="font-size:13px;font-weight:700;color:var(--xd);margin-bottom:10px">📋 ${b.ten_bang}</div>
            <div style="display:grid;gap:8px">
              <div class="fg"><label>Tiêu đề chính (dòng 1)</label>
                <input id="td1-${b.bang}" class="inp" value="${b.tieu_de_chinh || b.ten_bang || ''}" placeholder="VD: BẢNG THỦY SẢN"></div>
              <div class="fg"><label>Tiêu đề phụ (dòng 2)</label>
                <input id="td2-${b.bang}" class="inp" value="${b.tieu_de_phu || ''}" placeholder="(Đính kèm Công văn số … của …)"></div>
              <div><button class="btn primary" onclick="_bangLuuTieuDe('${b.bang}')">💾 Lưu</button></div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

async function _bangLuuTieuDe(maBang) {
  const td1 = UTILS.el('td1-' + maBang)?.value.trim() || '';
  const td2 = UTILS.el('td2-' + maBang)?.value.trim() || '';
  try { await DB.capNhatBang(maBang, { tieu_de_chinh: td1, tieu_de_phu: td2 }); UTILS.toast('✅ Đã lưu tiêu đề!'); }
  catch (e) { UTILS.toast('Lỗi: ' + e.message, 'er'); }
}
