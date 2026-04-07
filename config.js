// ============================================================
// CONFIG.JS — CẤU HÌNH HỆ THỐNG
// ⚠️  FILE NHẠY CẢM — không chia sẻ công khai
// Khi deploy: đặt file này ngoài thư mục public hoặc
// dùng biến môi trường nếu có server
// ============================================================

const CONFIG = {
  // Supabase
  SUPABASE_URL: 'https://tztigowjdbfzalcsyoqj.supabase.co',
  SUPABASE_KEY: 'sb_publishable_jarPut6H_Di8m8M7HNiCpQ_EDBTLXOk',

  // Hệ thống
  TEN_HE_THONG:  'Báo cáo số liệu định kỳ tháng, quý, năm',
  TEN_CO_QUAN:   'hoạt động ngành Nông nghiệp và Môi trường',
  MAT_KHAU_MAC_DINH: 'snnmt',

  // Tên bảng DB
  BANG: {
    DANH_SACH_BANG:  'danh_sach_bang',
    CHI_TIEU:        'chi_tieu',
    KY_BAO_CAO:      'ky_bao_cao',
    TAI_KHOAN:       'tai_khoan',
    PHAN_QUYEN_BANG: 'phan_quyen_bang',
    CSDL_PREFIX:     'csdl_',   // + maBang.toLowerCase() → csdl_bang_01, csdl_bang_02...
    GSHEET:          'danh_sach_gsheet',
  },
};

/* ============================================================
   SQL tạo bảng danh_sach_gsheet (chạy 1 lần trong Supabase):
   ============================================================
   CREATE TABLE danh_sach_gsheet (
     id          SERIAL PRIMARY KEY,
     ten_sheet   TEXT NOT NULL,
     mo_ta       TEXT,
     embed_url   TEXT NOT NULL,
     thu_tu      INTEGER DEFAULT 1,
     hien_thi    BOOLEAN DEFAULT TRUE,
     tao_luc     TIMESTAMPTZ DEFAULT NOW()
   );
   -- Phân quyền RLS (nếu bật): cho phép anon đọc
   ALTER TABLE danh_sach_gsheet ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "allow_read" ON danh_sach_gsheet FOR SELECT USING (true);
   CREATE POLICY "allow_all"  ON danh_sach_gsheet USING (true) WITH CHECK (true);
   ============================================================ */
