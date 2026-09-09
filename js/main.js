document.addEventListener('DOMContentLoaded', function () {
    // 1. NAVBAR TOGGLE & SCROLL BEHAVIOR
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navToggle.classList.toggle('is-active');
            navMenu.classList.toggle('is-open');
        });

        const navbarLinks = navMenu.querySelectorAll('.navbar__link');
        navbarLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.classList.remove('is-active');
                navMenu.classList.remove('is-open');
            });
        });
    }

    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function () {
        if (navbar) {
            if (window.scrollY > 10) {
                navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.26)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        }
    });

    loadImagesFromAPI();
    setupFormKontak();
});

async function loadImagesFromAPI() {
    const API_URL = 'http://localhost:5000/api/gallery';

    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.status !== 'success' || !Array.isArray(result.data)) {
            console.warn('Data galeri tidak sesuai format.');
            return;
        }

        const rawData = result.data;

        // A. LOGO SEKOLAH (Navbar & Sambutan)
        const dataLogo = rawData.find(i => i.kategori.toLowerCase().trim() === 'logo');
        if (dataLogo) {
            const logoNav = document.getElementById('logoSekolah');
            const logoSambutan = document.getElementById('sambutanLogo');
            if (logoNav) logoNav.src = dataLogo.image_url;
            if (logoSambutan) logoSambutan.src = dataLogo.image_url;
        }

        // B. HERO / GEDUNG SEKOLAH
        const dataGedung = rawData.find(i => i.kategori.toLowerCase().trim() === 'gedung sekolah');
        if (dataGedung) {
            const heroBg = document.getElementById('heroBg');
            if (heroBg) heroBg.src = dataGedung.image_url;
        }

        // C. KEPALA SEKOLAH
        const dataKepsek = rawData.find(i => i.kategori.toLowerCase().trim() === 'kepala sekolah');
        if (dataKepsek) {
            const fotoKepsek = document.getElementById('fotoKepsek');
            const namaKepsek = document.getElementById('namaKepsek');
            const jabatanKepsek = document.getElementById('jabatanKepsek');

            if (fotoKepsek) fotoKepsek.src = dataKepsek.image_url;
            if (namaKepsek && dataKepsek.judul) namaKepsek.innerText = dataKepsek.judul;
            if (jabatanKepsek && dataKepsek.subjudul) jabatanKepsek.innerText = dataKepsek.subjudul;
        }

        // D. KEGIATAN SISWA
        const dataKegiatan = rawData.find(i => i.kategori.toLowerCase().trim() === 'kegiatan');
        if (dataKegiatan) {
            const fotoKegiatan = document.getElementById('fotoKegiatan');
            if (fotoKegiatan) fotoKegiatan.src = dataKegiatan.image_url;
        }

        // E. PENGHARGAAN (Mengganti gambar item jika ada dari API)
        const listPenghargaan = rawData.filter(i => i.kategori.toLowerCase().trim() === 'penghargaan');
        const containerPenghargaan = document.getElementById('penghargaanGrid');
        if (containerPenghargaan && listPenghargaan.length > 0) {
            containerPenghargaan.innerHTML = listPenghargaan.map(p => `
                <div class="penghargaan__item">
                    <img src="${p.image_url}" alt="${p.judul || 'Penghargaan sekolah'}">
                </div>
            `).join('');
        }

        // F. GAMBAR JURUSAN
        const listJurusan = rawData.filter(i => {
            const kat = i.kategori.toLowerCase().trim();
            return kat === 'kejuruan' || kat === 'jurusan';
        });

        listJurusan.forEach(j => {
            const judul = (j.judul || '').toLowerCase();
            const imgUrl = j.image_url;

            if (judul.includes('rekayasa') || judul.includes('rpl')) {
                const img = document.getElementById('imgRpl');
                if (img) img.src = imgUrl;
            } else if (judul.includes('komputer') || judul.includes('tkj')) {
                const img = document.getElementById('imgTkj');
                if (img) img.src = imgUrl;
            } else if (judul.includes('animasi')) {
                const img = document.getElementById('imgAnimasi');
                if (img) img.src = imgUrl;
            } else if (judul.includes('desain') || judul.includes('dkv')) {
                const img = document.getElementById('imgDkv');
                if (img) img.src = imgUrl;
            } else if (judul.includes('broadcasting') || judul.includes('pspt')) {
                const img = document.getElementById('imgBroadcast');
                if (img) img.src = imgUrl;
            } else if (judul.includes('elektronika') || judul.includes('te')) {
                const img = document.getElementById('imgElektronika');
                if (img) img.src = imgUrl;
            }
        });

    } catch (error) {
        console.error('Gagal memuat galeri dari backend API:', error);
    }
}

function setupFormKontak() {
    const form = document.getElementById('formKontak');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nama = document.getElementById('namaPesan').value;
        const email = document.getElementById('emailPesan').value;
        const pesan = document.getElementById('isiPesan').value;

        try {
            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nama: nama,   // Jika backend butuh 'name', ganti 'nama' jadi 'name'
                    email: email, 
                    pesan: pesan  // Jika backend butuh 'message', ganti 'pesan' jadi 'message'
                })
            });

            const result = await response.json().catch(() => ({}));

            if (response.ok) {
                alert('Pesan berhasil dikirim!');
                form.reset();
            } else {
                console.error('Detail error backend:', result);
                // Menampilkan detail error dari backend jika ada
                alert(result.message || result.error || 'Gagal mengirim pesan.');
            }
        } catch (error) {
            console.error('Error saat kirim pesan:', error);
            alert('Terjadi kesalahan koneksi ke server.');
        }
    });
}