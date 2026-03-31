// ============================================================
// UTILS.JS — HÀM TIỆN ÍCH DÙNG CHUNG
// ============================================================

const UTILS = {

  // ── SESSION ─────────────────────────────────────────────
  laySession() {
    try { return JSON.parse(localStorage.getItem('u')); } catch { return null; }
  },
  luuSession(user) { localStorage.setItem('u', JSON.stringify(user)); },
  xoaSession()     { localStorage.removeItem('u'); },

  // ── TOAST ───────────────────────────────────────────────
  _toastTimer: null,
  toast(msg, type = 'ok') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = `toast on ${type}`;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('on'), 3200);
  },

  // ── MODAL ───────────────────────────────────────────────
  moModal(id)   { document.getElementById(id)?.classList.add('on'); },
  dongModal(id) { document.getElementById(id)?.classList.remove('on'); },

  // ── DOM ─────────────────────────────────────────────────
  bat(id) { document.getElementById(id)?.classList.add('on'); },
  tat(id) { document.getElementById(id)?.classList.remove('on'); },
  el(id)  { return document.getElementById(id); },

  // ── XÁC NHẬN ────────────────────────────────────────────
  xacNhan(title, msg, callback) {
    UTILS.el('xn-title').textContent = title;
    UTILS.el('xn-msg').innerHTML = msg;
    UTILS.el('xn-ok').onclick = () => { UTILS.dongModal('modal-xn'); callback(); };
    UTILS.moModal('modal-xn');
  },

  // ── SỐ LIỆU ─────────────────────────────────────────────
  // Làm sạch chuỗi số: chấp nhận cả dấu phẩy và dấu chấm thập phân
  parseSo(str) {
    if (str === '' || str === null || str === undefined) return null;
    // Thay dấu phẩy thành dấu chấm (người VN hay nhập 1.000,5)
    const s = String(str).replace(/\./g, '').replace(',', '.');
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  },

  // Format số hiển thị
  formatSo(n) {
    if (n === null || n === undefined || n === '') return '';
    return Number(n).toLocaleString('vi-VN');
  },

  // ── INDENT ──────────────────────────────────────────────
  demKhoang(str) {
    const m = str.match(/^(\s+)/);
    return m ? m[1].length : 0;
  },

  // ── EXPORT EXCEL ────────────────────────────────────────
  // Xuất bảng nhập liệu ra Excel (dùng SheetJS nếu có, fallback CSV)
  xuatExcel(tenFile, headers, rows) {
    if (typeof XLSX !== 'undefined') {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bieu mau');
      // Style header
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[addr]) continue;
        ws[addr].s = { font: { bold: true }, fill: { fgColor: { rgb: '1B4332' } } };
      }
      XLSX.writeFile(wb, tenFile + '.xlsx');
    } else {
      // Fallback: xuất CSV
      const csv = [headers, ...rows]
        .map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(','))
        .join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = tenFile + '.csv';
      a.click();
    }
  },

  // ── PASTE TỪ EXCEL ──────────────────────────────────────
  // Xử lý paste dữ liệu từ Excel vào bảng
  // El: ô input đang focus, callback: fn(row, col, value)
  xuLyPaste(e, currentInput, callback) {
    const clip = (e.clipboardData || window.clipboardData).getData('text');
    if (!clip.includes('\t') && !clip.includes('\n')) return; // paste đơn, bỏ qua

    e.preventDefault();
    const rows = clip.split('\n').map(r => r.split('\t'));
    const allInputs = [...document.querySelectorAll('.o-so:not(:disabled)')];
    const startIdx  = allInputs.indexOf(currentInput);
    if (startIdx === -1) return;

    // Tìm số cột trong bảng (dựa vào dataset)
    const table  = currentInput.closest('table');
    const allCols = table ? [...table.querySelectorAll('tbody tr:not(.tr-h) .o-so:not(:disabled)')] : allInputs;

    // Tìm vị trí dòng/cột của ô bắt đầu
    const startRow = currentInput.closest('tr');
    const allRows  = table ? [...table.querySelectorAll('tbody tr:not(.tr-h)')] : [];
    const rowIdx   = allRows.indexOf(startRow);
    const colIdx   = allCols.indexOf(currentInput) - (rowIdx * /* ước tính cột */ 1);

    // Xác định số cột nhập liệu mỗi hàng
    const colsPerRow = startRow
      ? [...startRow.querySelectorAll('.o-so:not(:disabled)')].length
      : 1;
    const startColInRow = startRow
      ? [...startRow.querySelectorAll('.o-so:not(:disabled)')].indexOf(currentInput)
      : 0;

    let changed = 0;
    rows.forEach((pasteRow, ri) => {
      const targetTR = allRows[rowIdx + ri];
      if (!targetTR) return;
      const targetInputs = [...targetTR.querySelectorAll('.o-so:not(:disabled)')];
      pasteRow.forEach((val, ci) => {
        const inp = targetInputs[startColInRow + ci];
        if (!inp) return;
        const cleaned = val.trim().replace(/\./g, '').replace(',', '.');
        const num = parseFloat(cleaned);
        inp.value = isNaN(num) ? '' : num;
        inp.classList.toggle('has', inp.value !== '');
        inp.dispatchEvent(new Event('change'));
        changed++;
      });
    });
    UTILS.toast(`✅ Đã paste ${changed} ô từ Excel`);
  },
};
