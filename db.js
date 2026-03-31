// ============================================================
// DB.JS — TẤT CẢ HÀM TRUY VẤN SUPABASE
// Yêu cầu: config.js phải được load trước
// ============================================================

const sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

const DB = {

  // ── TÀI KHOẢN ──────────────────────────────────────────
  async layDanhSachTaiKhoan() {
    const { data, error } = await sb
      .from(CONFIG.BANG.TAI_KHOAN)
      .select('id, ho_ten, don_vi, vai_tro, mat_khau, trang_thai')
      .eq('trang_thai', true)
      .order('vai_tro').order('don_vi');
    if (error) throw error;
    return data || [];
  },

  async layTatCaTaiKhoan() {
    const { data, error } = await sb
      .from(CONFIG.BANG.TAI_KHOAN)
      .select('*').order('vai_tro').order('don_vi');
    if (error) throw error;
    return data || [];
  },

  async layTaiKhoanDayDu(id) {
    const { data, error } = await sb
      .from(CONFIG.BANG.TAI_KHOAN)
      .select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async doiMatKhau(id, matKhauMoi) {
    const { error } = await sb
      .from(CONFIG.BANG.TAI_KHOAN)
      .update({ mat_khau: matKhauMoi }).eq('id', id);
    if (error) throw error;
  },

  async themTaiKhoan(row) {
    const { error } = await sb.from(CONFIG.BANG.TAI_KHOAN).insert(row);
    if (error) throw error;
  },

  async suaTaiKhoan(id, row) {
    const { error } = await sb.from(CONFIG.BANG.TAI_KHOAN).update(row).eq('id', id);
    if (error) throw error;
  },

  async xoaTaiKhoan(id) {
    const { error } = await sb.from(CONFIG.BANG.TAI_KHOAN).delete().eq('id', id);
    if (error) throw error;
  },

  // ── DANH SÁCH BẢNG ─────────────────────────────────────
  async layTatCaBang() {
    const { data, error } = await sb
      .from(CONFIG.BANG.DANH_SACH_BANG)
      .select('*').order('thu_tu');
    if (error) throw error;
    return data || [];
  },

  async layBangDuocPhep(taiKhoanId) {
    const { data: pq, error } = await sb
      .from(CONFIG.BANG.PHAN_QUYEN_BANG)
      .select('bang').eq('tai_khoan_id', taiKhoanId);
    if (error) throw error;
    const maBangs = (pq || []).map(r => r.bang);
    if (!maBangs.length) return [];
    const { data, error: e2 } = await sb
      .from(CONFIG.BANG.DANH_SACH_BANG)
      .select('*').in('bang', maBangs).order('thu_tu');
    if (e2) throw e2;
    return data || [];
  },

  async capNhatBang(maBang, row) {
    const { error } = await sb
      .from(CONFIG.BANG.DANH_SACH_BANG)
      .update(row).eq('bang', maBang);
    if (error) throw error;
  },

  // ── KỲ BÁO CÁO ─────────────────────────────────────────
  async layKyHienThi() {
    const { data, error } = await sb
      .from(CONFIG.BANG.KY_BAO_CAO)
      .select('*')
      .eq('dua_vao_bieu_bao_cao', true)
      .order('thu_tu_hien_thi', { ascending: true, nullsFirst: false })
      .order('nam_bao_cao', { ascending: false })
      .order('thang_bao_cao', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async layTatCaKy(namBatDau, namKetThuc) {
    let q = sb.from(CONFIG.BANG.KY_BAO_CAO).select('*');
    if (namBatDau) q = q.gte('nam_bao_cao', namBatDau);
    if (namKetThuc) q = q.lte('nam_bao_cao', namKetThuc);
    q = q.order('nam_bao_cao', { ascending: false })
         .order('thang_bao_cao', { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async themKy(row) {
    const { error } = await sb.from(CONFIG.BANG.KY_BAO_CAO).insert(row);
    if (error) throw error;
  },

  async capNhatKy(maKy, row) {
    const { error } = await sb
      .from(CONFIG.BANG.KY_BAO_CAO)
      .update(row).eq('ky_bao_cao', maKy);
    if (error) throw error;
  },

  async xoaKy(maKy) {
    const { error } = await sb
      .from(CONFIG.BANG.KY_BAO_CAO)
      .delete().eq('ky_bao_cao', maKy);
    if (error) throw error;
  },

  // ── CHỈ TIÊU ───────────────────────────────────────────
  async layChiTieuTheoBang(maBang) {
    const { data, error } = await sb
      .from(CONFIG.BANG.CHI_TIEU)
      .select('id, chi_tieu, don_vi, bang, thu_tu, la_tieu_de, cho_phep_nhap, kieu_du_lieu, stt_hien_thi, tan_suat, id_bo')
      .eq('bang', maBang)
      .order('thu_tu');
    if (error) throw error;
    return data || [];
  },

  async capNhatChiTieu(id, row) {
    const { error } = await sb
      .from(CONFIG.BANG.CHI_TIEU)
      .update(row).eq('id', id);
    if (error) throw error;
  },

  // Lưu độ rộng nhiều chỉ tiêu cùng lúc (sau khi kéo thả)
  async luuDoRongChiTieu(dsDoRong) {
    // dsDoRong = [{ id, do_rong_cot }, ...]
    const promises = dsDoRong.map(r =>
      sb.from(CONFIG.BANG.CHI_TIEU)
        .update({ do_rong_cot: r.do_rong_cot })
        .eq('id', r.id)
    );
    const results = await Promise.all(promises);
    const err = results.find(r => r.error);
    if (err) throw err.error;
  },

  // Lưu độ rộng cột kỳ báo cáo
  async luuDoRongKy(maKy, doRong) {
    const { error } = await sb
      .from(CONFIG.BANG.KY_BAO_CAO)
      .update({ do_rong_cot: doRong })
      .eq('ky_bao_cao', maKy);
    if (error) throw error;
  },

  // ── DỮ LIỆU NHẬP ───────────────────────────────────────
  // PostgreSQL tự chuyển tên bảng thành chữ thường khi tạo
  // 'csdl_' + 'Bang_01' → toLowerCase() → 'csdl_bang_01' ✅
  _tenBangCSDL(maBang) {
    return (CONFIG.BANG.CSDL_PREFIX + maBang).toLowerCase();
  },

  async layDuLieu(maBang, dsKy) {
    const { data, error } = await sb
      .from(this._tenBangCSDL(maBang))
      .select('*')
      .in('ky_bao_cao', dsKy);
    if (error) throw error;
    return data || [];
  },

  async luuDuLieu(maBang, rows) {
    const { error } = await sb
      .from(this._tenBangCSDL(maBang))
      .upsert(rows, { onConflict: 'id_chi_tieu,ky_bao_cao' });
    if (error) throw error;
  },

  // ── PHÂN QUYỀN ─────────────────────────────────────────
  async layPhanQuyen(taiKhoanId) {
    const { data, error } = await sb
      .from(CONFIG.BANG.PHAN_QUYEN_BANG)
      .select('bang').eq('tai_khoan_id', taiKhoanId);
    if (error) throw error;
    return (data || []).map(r => r.bang);
  },

  async layTatCaPhanQuyen() {
    const { data, error } = await sb
      .from(CONFIG.BANG.PHAN_QUYEN_BANG)
      .select('*');
    if (error) throw error;
    return data || [];
  },

  async luuPhanQuyen(taiKhoanId, dsBang) {
    await sb.from(CONFIG.BANG.PHAN_QUYEN_BANG)
      .delete().eq('tai_khoan_id', taiKhoanId);
    if (dsBang.length) {
      const { error } = await sb.from(CONFIG.BANG.PHAN_QUYEN_BANG)
        .insert(dsBang.map(mb => ({ tai_khoan_id: taiKhoanId, bang: mb })));
      if (error) throw error;
    }
  },
};
