<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visualisasi 3D Rumah Adat Tongkonan</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif;
            background: #000;
            overflow: hidden;
        }
        canvas { display: block; }
        #loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            transition: opacity 0.5s ease;
        }
        #progress-bar {
            width: 0%;
            height: 4px;
            background: #FFD700;
            border-radius: 2px;
            transition: width 0.3s;
        }
        .progress-container {
            width: 200px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
        }
        .loading-text {
            color: #FFD700;
            margin-bottom: 20px;
            font-size: 14px;
        }
        #info-popup {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(5px);
            color: white;
            padding: 25px;
            border-radius: 12px;
            max-width: 350px;
            display: none;
            font-family: Arial, sans-serif;
            z-index: 100;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 215, 0, 0.2);
        }
        .popup-header {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #555;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        #info-icon-img {
            width: 40px;
            height: 40px;
            object-fit: contain;
            margin-right: 15px;
            display: none;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
        }
        #info-title {
            margin: 0;
            color: #FFD700;
            font-size: 18px;
        }
        #info-desc {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
            color: #ddd;
        }
        #close-btn {
            background: #FFD700;
            color: #000;
            border: none;
            padding: 8px 20px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            width: 100%;
            transition: background 0.3s;
        }
        #close-btn:hover {
            background: #FFC700;
        }
    </style>
</head>
<body>
    <div id="loading-screen">
        <div style="text-align: center;">
            <div class="loading-text">Memuat Visualisasi 3D...</div>
            <div class="progress-container">
                <div id="progress-bar"></div>
            </div>
        </div>
    </div>

    <div id="info-popup">
        <div class="popup-header">
            <img id="info-icon-img" src="">
            <h3 id="info-title">Judul Info</h3>
        </div>
        <p id="info-desc">Deskripsi.</p>
        <button id="close-btn">Tutup</button>
    </div>

    <!-- THREE.js dari CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/controls/OrbitControls.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/loaders/GLTFLoader.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/libs/lil-gui.umd.min.js"></script>

    <script>
        // --- 0. MANAGER LOADING (LOADING SCREEN) ---
        const loadingManager = new THREE.LoadingManager();
        const progressBar = document.getElementById('progress-bar');
        const loadingScreen = document.getElementById('loading-screen');

        loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
            if (progressBar) {
                const percentage = (itemsLoaded / itemsTotal) * 100;
                progressBar.style.width = percentage + '%';
            }
        };

        let params = { Jam: 12, PutarOtomatis: true };

        loadingManager.onLoad = function () {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    if (params.PutarOtomatis) controls.autoRotate = true;
                }, 500);
            }
        };

        // --- 1. SETUP UI POP-UP ---
        const popUpDiv = document.getElementById('info-popup');

        document.getElementById('close-btn').addEventListener('click', () => {
            popUpDiv.style.display = 'none';
            if (params.PutarOtomatis) controls.autoRotate = true;
        });

        // --- 2. SCENE & RENDERER ---
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        document.body.appendChild(renderer.domElement);

        // --- 3. ENVIRONMENT ---
        const textureLoader = new THREE.TextureLoader(loadingManager);

        // A. Langit
        textureLoader.load('qwantani_puresky.jpg', function(texture) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
        }, undefined, function() {
            scene.background = new THREE.Color(0x87CEEB);
        });

        // Group Lingkungan
        const environment = new THREE.Group();
        scene.add(environment);

        // B. Tanah Datar Luas
        const grassTexture = textureLoader.load('rumput.jpg');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(100, 100);

        const tanah = new THREE.Mesh(
            new THREE.PlaneGeometry(2000, 2000),
            new THREE.MeshStandardMaterial({ map: grassTexture, color: 0x4F7942, roughness: 1.0 })
        );
        tanah.rotation.x = -Math.PI / 2;
        tanah.position.y = -0.05;
        tanah.receiveShadow = true;
        scene.add(tanah);

        // --- 4. LIGHTING ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(10, 20, 10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        scene.add(sunLight);

        // Lampu Teras (Hangat & Terang)
        const frontLight = new THREE.PointLight(0xffaa00, 80, 50);
        frontLight.position.set(0, 4.5, 3.5);
        frontLight.castShadow = true;
        scene.add(frontLight);

        // Lampu Kolong (Biru & Terang)
        const bottomLight = new THREE.PointLight(0xaaccff, 30, 30);
        bottomLight.position.set(0, 0.5, 0);
        scene.add(bottomLight);

        // --- 5. ORNAMEN ALAM (BATU, JALAN, GUNUNG) ---

        // Batu Alam
        const rockGeo = new THREE.DodecahedronGeometry(1, 0);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        for (let i = 0; i < 15; i++) {
            const r = new THREE.Mesh(rockGeo, rockMat);
            const x = (Math.random() - 0.5) * 50, z = (Math.random() - 0.5) * 50;
            if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;
            r.position.set(x, 0, z);
            r.scale.setScalar(0.3 + Math.random() * 0.5);
            r.scale.y *= 0.6;
            r.castShadow = true;
            r.receiveShadow = true;
            scene.add(r);
        }

        // Pegunungan
        const mGeo = new THREE.ConeGeometry(30, 40, 4);
        const mMat = new THREE.MeshStandardMaterial({ color: 0x2F4F4F });
        for (let i = 0; i < 8; i++) {
            const m = new THREE.Mesh(mGeo, mMat);
            const a = (i / 8) * Math.PI, rad = 80;
            m.position.set(Math.cos(a) * rad * 1.5, -5, -50 - Math.sin(a) * rad * 0.5);
            m.scale.setScalar(1 + Math.random() * 1.5);
            scene.add(m);
        }

        // --- 6. INFO-SPOTS ---
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const hotspots = [];

        function createHotspot(x, y, z, title, description, iconURL = null) {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');

            // Gambar lingkaran biru sebagai background
            ctx.fillStyle = '#4A90E2';
            ctx.beginPath();
            ctx.arc(64, 64, 60, 0, Math.PI * 2);
            ctx.fill();

            // Border putih
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(64, 64, 57, 0, Math.PI * 2);
            ctx.stroke();

            // Gambar huruf "N" merah di tengah (kompas style)
            ctx.fillStyle = '#E74C3C';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('N', 64, 64);

            // Jika ada iconURL, coba load gambar
            if (iconURL) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function() {
                    ctx.clearRect(0, 0, 128, 128);
                    ctx.drawImage(img, 0, 0, 128, 128);
                    texture.needsUpdate = true;
                };
                img.src = iconURL;
            }

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthTest: true,
                depthWrite: false
            });

            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(0.6, 0.6, 1);
            sprite.position.set(x, y, z);
            sprite.userData = { title: title, description: description, initialY: y, iconURL: iconURL };

            scene.add(sprite);
            hotspots.push(sprite);
        }

        // Hotspots
        createHotspot(0, 4.8, 1.5, "Selalu Menghadap Utara", "Fakta Unik: Setiap Tongkonan WAJIB menghadap ke Utara (arah leluhur).", 'kompas.png');
        createHotspot(0, 3.1, 3.8, "Status Sosial & Kabongo'", "Fakta Unik: Kepala kerbau menandakan status sosial pemilik.", 'tanduk kerbau.png');
        createHotspot(2.5, 2.5, 0, "Teknologi Anti-Gempa", "Fakta Unik: Tanpa paku! Sistem pasak kayu tahan guncangan gempa.", 'tongkonan.png');
        createHotspot(1.5, 1.0, 2, "Pondasi Batu (Sulluk)", "Fakta Unik: Tiang tidak ditanam, ditaruh di batu agar anti rayap.", 'tiang batu.png');
        createHotspot(-2.5, 2.0, 0, "Rahasia 4 Warna", "Fakta Unik: Hanya pakai 4 warna alam: Hitam, Merah, Kuning, Putih.", 'ukiran.png');

        window.addEventListener('pointerdown', (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(hotspots);

            if (intersects.length > 0) {
                const data = intersects[0].object.userData;
                document.getElementById('info-title').innerText = data.title;
                document.getElementById('info-desc').innerText = data.description;
                const imgSlot = document.getElementById('info-icon-img');
                if (data.iconURL) {
                    imgSlot.src = data.iconURL;
                    imgSlot.style.display = 'block';
                } else {
                    imgSlot.style.display = 'none';
                }
                popUpDiv.style.display = 'block';
                controls.autoRotate = false;
            }
        });

        // --- 7. LOGIKA WAKTU & GUI ---
        function updateMatahari() {
            const jam = params.Jam;
            const sudut = (jam / 24) * (Math.PI * 2) - (Math.PI / 2);
            sunLight.position.set(Math.cos(sudut) * 40, Math.sin(sudut) * 40, Math.sin(sudut * 0.5) * 20);

            if (jam >= 6 && jam <= 18) {
                sunLight.intensity = 1.5;
                ambientLight.intensity = 0.5;
                renderer.toneMappingExposure = (jam < 7 || jam > 17) ? 0.5 : 1.2;
                sunLight.color.setHSL((jam < 8 || jam > 16) ? 0.05 : 0.1, (jam < 8 || jam > 16) ? 1.0 : 0.5, 0.9);
                frontLight.intensity = 0;
                bottomLight.intensity = 0;
                scene.fog.color.set(0x87CEEB);
            } else {
                sunLight.intensity = 0.4;
                ambientLight.intensity = 0.3;
                sunLight.color.setHSL(0.6, 0.8, 0.8);
                renderer.toneMappingExposure = 0.6;
                frontLight.intensity = 80;
                bottomLight.intensity = 30;
                scene.fog.color.set(0x111526);
            }
        }
        updateMatahari();

        const gui = new lil.GUI();
        const folder = gui.addFolder('Pengaturan Suasana');
        folder.add(params, 'Jam', 0, 24).onChange(updateMatahari).listen();
        folder.add(params, 'PutarOtomatis');

        // --- 8. LOAD MODEL ---
        const loader = new THREE.GLTFLoader(loadingManager);

        // Load Rumah Adat Tongkonan
        loader.load('tantor.glb', (gltf) => {
            const model = gltf.scene;
            model.scale.set(1, 1, 1);
            model.traverse((n) => {
                if (n.isMesh) {
                    n.castShadow = true;
                    n.receiveShadow = true;
                }
            });
            scene.add(model);
            console.log("✅ Model rumah berhasil dimuat!");
        }, undefined, (error) => {
            console.error("❌ Gagal memuat model rumah:", error);
        });

        // Load Kerbau (di depan rumah tongkonan)
        loader.load('kerbau4.glb', (gltf) => {
            const kerbau1 = gltf.scene;
            kerbau1.scale.set(1.5, 1.5, 1.5);
            kerbau1.position.set(3, 0, 6);
            kerbau1.rotation.y = Math.PI * 0.3;
            kerbau1.traverse((n) => {
                if (n.isMesh) {
                    n.castShadow = true;
                    n.receiveShadow = true;
                }
            });
            scene.add(kerbau1);

            // Kerbau kedua (kiri depan)
            const kerbau2 = kerbau1.clone();
            kerbau2.position.set(-3.5, 0, 7);
            kerbau2.rotation.y = -Math.PI * 0.4;
            scene.add(kerbau2);
            console.log("✅ Model kerbau berhasil dimuat!");
        }, undefined, (error) => {
            console.error("❌ Gagal memuat model kerbau:", error);
        });

        // Load Pohon Palm (di belakang dan sekitar rumah)
        loader.load('pohon palm.glb', (gltf) => {
            // Pohon 1 - Belakang kiri
            const pohon1 = gltf.scene;
            pohon1.scale.set(0.8, 0.8, 0.8);
            pohon1.position.set(-8, 0, -6);
            pohon1.traverse((n) => {
                if (n.isMesh) {
                    n.castShadow = true;
                    n.receiveShadow = true;
                }
            });
            scene.add(pohon1);

            // Pohon 2 - Belakang kanan
            const pohon2 = pohon1.clone();
            pohon2.position.set(7, 0, -7);
            pohon2.scale.set(0.9, 0.9, 0.9);
            scene.add(pohon2);

            // Pohon 3 - Samping kiri
            const pohon3 = pohon1.clone();
            pohon3.position.set(-10, 0, 2);
            pohon3.scale.set(0.7, 0.7, 0.7);
            scene.add(pohon3);

            // Pohon 4 - Samping kanan
            const pohon4 = pohon1.clone();
            pohon4.position.set(9, 0, 1);
            pohon4.scale.set(0.75, 0.75, 0.75);
            scene.add(pohon4);

            // Pohon 5 - Belakang tengah
            const pohon5 = pohon1.clone();
            pohon5.position.set(0, 0, -9);
            pohon5.scale.set(1.0, 1.0, 1.0);
