/* =====================================================
   app.js – Ứng dụng Vue 3 (CDN): giỏ hàng mini
   Vue được nạp bằng thẻ <script> TRƯỚC file này nên có biến toàn cục `Vue`.

   SO SÁNH VỚI VANILLA JS:
   Nếu dùng Vanilla JS, mỗi lần thêm/xoá giỏ hàng phải tự querySelector
   + cập nhật DOM thủ công (số lượng ở header, danh sách, tổng tiền...).
   Vue tự động làm điều này nhờ reactivity: ta chỉ đổi dữ liệu (cart),
   giao diện phụ thuộc vào cart tự cập nhật theo ("UI = function của data").
   ===================================================== */

// Hàm phụ: bỏ dấu tiếng Việt + đưa về chữ thường để tìm kiếm không phân biệt hoa/thường, có/không dấu.
// Ví dụ: "Ốp lưng" -> "op lung"
function chuanHoa(chuoi) {
    return chuoi
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase();
}

Vue.createApp({

    // ---------- DỮ LIỆU (state) ----------
    // Mọi thứ khai báo ở đây đều là "reactive": thay đổi -> giao diện tự cập nhật.
    data() {
        return {
            // Danh sách sản phẩm (nguồn dữ liệu cho v-for)
            products: [
                { id: 1, ten: 'Ốp lưng Electric Blue',  anh: '../images/op-lung-xanh.svg',       gia: 150000, moTa: 'Ốp dẻo chống sốc, viền camera nổi.' },
                { id: 2, ten: 'Ốp lưng Midnight Black', anh: '../images/op-lung-den.svg',        gia: 150000, moTa: 'Mặt nhám chống bám vân tay.' },
                { id: 3, ten: 'Đế sạc không dây 15W',   anh: '../images/de-sac-khong-day.svg',   gia: 250000, moTa: 'Sạc nhanh, có đèn báo trạng thái.' },
                { id: 4, ten: 'Tai nghe Active TWS',    anh: '../images/tai-nghe-tws.svg',       gia: 490000, moTa: 'Bluetooth 5.3, pin 24 giờ cùng hộp sạc.' },
                { id: 5, ten: 'Cáp sạc USB-C 1m',       anh: '../images/cap-usb-c.svg',          gia: 99000,  moTa: 'Bọc dù bền, hỗ trợ sạc nhanh 60W.' },
                { id: 6, ten: 'Củ sạc nhanh 20W',       anh: '../images/cu-sac-nhanh-20w.svg',   gia: 180000, moTa: 'Nhỏ gọn, tự ngắt khi sạc đầy.' },
                { id: 7, ten: 'Pin dự phòng 10.000mAh', anh: '../images/pin-du-phong.svg',       gia: 350000, moTa: 'Màn hình hiển thị phần trăm pin.' },
                { id: 8, ten: 'Giá đỡ điện thoại gấp',  anh: '../images/gia-do-dien-thoai.svg',  gia: 120000, moTa: 'Gấp gọn, chỉnh được nhiều góc nhìn.' }
            ],
            cart: [],        // Giỏ hàng: mảng các sản phẩm đã thêm
            tuKhoa: '',      // Từ khoá tìm kiếm, liên kết 2 chiều với ô input qua v-model
            nextUid: 1       // Bộ đếm tạo khoá riêng (uid) cho từng dòng trong giỏ để v-for hoạt động đúng
        };
    },

    // ---------- COMPUTED: giá trị tính toán từ data ----------
    // Tự tính lại khi dữ liệu nó phụ thuộc thay đổi, và được lưu đệm (cache).
    computed: {

        // Số lượng sản phẩm trong giỏ -> hiển thị ở header: Giỏ hàng ({{ cartCount }})
        cartCount() {
            return this.cart.length;
        },

        // Tổng tiền giỏ hàng = cộng giá của tất cả sản phẩm trong cart
        tongTien() {
            return this.cart.reduce((tong, sp) => tong + sp.gia, 0);
        },

        // Danh sách sản phẩm đã lọc theo tuKhoa (không phân biệt hoa thường, có/không dấu).
        // Template dùng danhSachLoc thay vì products nên gõ tới đâu danh sách đổi tới đó.
        danhSachLoc() {
            const tuKhoa = chuanHoa(this.tuKhoa.trim());
            if (tuKhoa === '') return this.products;
            return this.products.filter(sp =>
                chuanHoa(sp.ten).includes(tuKhoa) || chuanHoa(sp.moTa).includes(tuKhoa)
            );
        }
    },

    // ---------- METHODS: các hành động của người dùng ----------
    methods: {

        // Thêm 1 sản phẩm vào giỏ (gọi từ nút "Thêm" bằng @click).
        // Chỉ cần push vào mảng cart: số lượng ở header, danh sách và tổng tiền ở aside TỰ cập nhật.
        // Dùng bản sao + uid để thêm cùng 1 sản phẩm nhiều lần vẫn xoá được từng dòng riêng.
        themVaoGio(sanPham) {
            this.cart.push({ ...sanPham, uid: this.nextUid++ });
        },

        // Xoá 1 dòng khỏi giỏ theo vị trí (index) – gọi từ nút × trong aside bằng @click.
        xoaKhoiGio(index) {
            this.cart.splice(index, 1);
        },

        // Định dạng số tiền kiểu Việt Nam: 150000 -> "150.000 đ"
        dinhDangGia(so) {
            return so.toLocaleString('vi-VN') + ' đ';
        },

        // Thanh toán (mô phỏng): báo tổng tiền rồi làm trống giỏ.
        thanhToan() {
            if (this.cart.length === 0) return;
            alert('Cảm ơn bạn! Đơn hàng ' + this.cartCount + ' sản phẩm, tổng ' + this.dinhDangGia(this.tongTien) + '.');
            this.cart = [];
        }
    }

}).mount('#app');
