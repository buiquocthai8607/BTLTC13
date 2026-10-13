/* =====================================================
   script.js – JavaScript thuần cho trang Bếp Bánh (Tailwind)
   Tailwind chỉ cung cấp class CSS, KHÔNG có sẵn hành vi JS
   như Bootstrap, nên các tương tác bên dưới phải tự viết.
   ===================================================== */
(function () {
    'use strict';

    /* ---------- 1. Bật/tắt menu di động (yêu cầu chính của bài) ---------- */
    var btn = document.getElementById('menu-btn');
    var menu = document.getElementById('mobile-menu');
    var iconOpen = document.getElementById('icon-open');
    var iconClose = document.getElementById('icon-close');

    // open = true: hiện menu (xoá hidden, thêm flex); open = false: ẩn menu (thêm hidden, xoá flex)
    function setMenu(open) {
        menu.classList.toggle('hidden', !open);
        menu.classList.toggle('flex', open);
        iconOpen.classList.toggle('hidden', open);
        iconClose.classList.toggle('hidden', !open);
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    }

    btn.addEventListener('click', function () {
        setMenu(menu.classList.contains('hidden'));
    });

    // Bấm vào một mục trong menu di động thì đóng menu lại
    menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setMenu(false); });
    });

    // Nhấn Esc để đóng menu
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
            setMenu(false);
            btn.focus();
        }
    });

    // Khi phóng to màn hình lên mức md (>= 768px), đưa menu di động về trạng thái đóng
    var mq = window.matchMedia('(min-width: 768px)');
    function onResize(e) { if (e.matches) setMenu(false); }
    if (mq.addEventListener) { mq.addEventListener('change', onResize); }
    else { mq.addListener(onResize); }

    /* ---------- 2. Đánh dấu link menu theo mục đang xem khi cuộn ---------- */
    var links = document.querySelectorAll('.nav-link');
    var targets = ['top', 'menu-banh', 'cau-chuyen', 'dat-banh', 'lien-he']
        .map(function (id) { return document.getElementById(id); })
        .filter(Boolean);

    function markActive(id) {
        links.forEach(function (a) {
            if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
        });
    }

    function onScroll() {
        var y = window.scrollY + 140;
        var current = 'top';
        targets.forEach(function (el) {
            if (el.id !== 'top' && el.offsetTop <= y) current = el.id;
        });
        // Chạm đáy trang thì coi như đang ở mục cuối (Liên hệ)
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = 'lien-he';
        markActive(current);
        document.querySelector('header').classList.toggle('is-scrolled', window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- 3. Form đặt bánh: kiểm tra dữ liệu và báo kết quả ---------- */
    var form = document.getElementById('order-form');
    var msg = document.getElementById('form-msg');

    function showMsg(text, ok) {
        msg.textContent = text;
        msg.className = 'rounded-lg px-3 py-2 text-sm ' +
            (ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ten = form.elements['ten'].value.trim();
        var sdt = form.elements['sdt'].value.replace(/[\s.\-]/g, '');
        var loai = form.elements['loai-banh'].value.trim();

        if (!ten) { showMsg('Vui lòng nhập tên của bạn.', false); form.elements['ten'].focus(); return; }
        if (!/^(0|\+84)\d{9}$/.test(sdt)) { showMsg('Số điện thoại chưa đúng. Ví dụ: 0901 234 567.', false); form.elements['sdt'].focus(); return; }
        if (!loai) { showMsg('Vui lòng chọn hoặc nhập loại bánh bạn muốn.', false); form.elements['loai-banh'].focus(); return; }

        showMsg('Đã gửi! Bếp Bánh sẽ gọi cho ' + ten + ' qua số ' + sdt + ' trong vòng 2 giờ.', true);
        form.reset();
    });

    /* ---------- 4. Năm hiện tại ở footer ---------- */
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
})();
