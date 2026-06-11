// 1. إعداد المشهد والكاميرا والمحرك
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ec0ee); // سماء زرقاء صافية (وقت النهار لترى كل شيء)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. إضاءة شمسية قوية جداً (لإنهاء مشكلة الظلام التام)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // إضاءة محيطة عامة
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.2); // ضوء شمس مباشر
sunLight.position.set(50, 200, 50);
scene.add(sunLight);

// 3. أرضية ساحة المعركة (عشب أخضر واضح)
const floorGeo = new THREE.PlaneGeometry(500, 500);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.9 }); // لون عشب أخضر
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// 4. صناعة البيئة (المنازل والأشجار) لكي تلاحظ الحركة
// إضافة منازل (صناديق ضخمة ملونة)
const houses = [];
function createHouse(x, z) {
    const houseGeo = new THREE.BoxGeometry(10, 12, 10);
    const houseMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // لون بني للمنازل
    const house = new THREE.Mesh(houseGeo, houseMat);
    house.position.set(x, 6, z); // رفع المنزل ليكون فوق الأرض
    scene.add(house);
    houses.push(house);
}

// إضافة أشجار
function createTree(x, z) {
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 5);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 }); // جذع الشجرة
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 2.5, z);

    const leavesGeo = new THREE.ConeGeometry(4, 6, 8);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x006400 }); // أوراق الشجرة
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.set(x, 6, z);

    scene.add(trunk, leaves);
}

// توزيع المنازل والأشجار عشوائياً في الخريطة لتبدو كقرية قتالية
for(let i = 0; i < 15; i++) {
    createHouse((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300);
    createTree((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300);
}

// 5. صناعة الشخصية المهيبة (اللاعب)
const playerGroup = new THREE.Group();
const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2, 1), new THREE.MeshStandardMaterial({ color: 0x111111 })); // درع أسود
body.position.y = 1;

const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x333333 }));
head.position.y = 2.4;

// أعين نيون حمراء مضيئة واضحة
const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.1), eyeMat);
eyes.position.set(0, 2.5, 0.41);

playerGroup.add(body, head, eyes);
scene.add(playerGroup);

// ضبط مكان البدء للاعب فوق الأرض
playerGroup.position.set(0, 0, 0);

// 6. نظام الأعداء (Bots) - يظهرون باللون البرتقالي الناري لتمييزهم فوراً
const enemies = [];
const enemyCountSpan = document.getElementById('enemy-count');

function createEnemy() {
    const enemy = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 2, 1.5),
        new THREE.MeshStandardMaterial({ color: 0xff4500 }) // برتقالي ناري واضح جداً
    );
    // جعل الأعداء يرسون قريبين منك في البداية لتراهم فوراً
    enemy.position.set((Math.random() - 0.5) * 60 + 20, 1, (Math.random() - 0.5) * 60 + 20);
    enemy.userData = { health: 2, speed: 0.03 };
    scene.add(enemy);
    enemies.push(enemy);
}

// توليد 5 أعداء عند بدء اللعبة
for(let i = 0; i < 5; i++) createEnemy();

// 7. نظام التحكم بالحركة (لوحة المفاتيح واللمس)
const keys = { w: false, a: false, s: false, d: false };
const moveSpeed = 0.2; // زيادة السرعة لتشعر بالتحرك سريعاً

window.addEventListener('keydown', (e) => { 
    let k = e.key.toLowerCase();
    if(k === 'arrowup') keys.w = true;
    if(k === 'arrowdown') keys.s = true;
    if(k === 'arrowleft') keys.a = true;
    if(k === 'arrowright') keys.d = true;
    if(k in keys) keys[k] = true; 
});

window.addEventListener('keyup', (e) => { 
    let k = e.key.toLowerCase();
    if(k === 'arrowup') keys.w = false;
    if(k === 'arrowdown') keys.s = false;
    if(k === 'arrowleft') keys.a = false;
    if(k === 'arrowright') keys.d = false;
    if(k in keys) keys[k] = false; 
});

// ربط أزرار الشاشة للموبايل واللمس
const setupTouch = (id, key) => {
    const btn = document.getElementById(id);
    if(btn) {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
        btn.addEventListener('touchend', () => { keys[key] = false; });
    }
};
setupTouch('btn-up', 'w'); setupTouch('btn-down', 's'); setupTouch('btn-left', 'a'); setupTouch('btn-right', 'd');

// تحريك الماوس للالتفات حول اللاعب
window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === renderer.domElement) {
        playerGroup.rotation.y -= e.movementX * 0.005;
    }
});
renderer.domElement.addEventListener('click', () => { renderer.domElement.requestPointerLock(); });

// 8. نظام إطلاق النار
let playerHealth = 100;
function shoot() {
    // شعاع ليزر ساطع عند الإطلاق
    const laserGeo = new THREE.CylinderGeometry(0.05, 0.05, 10);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // ليزر أصفر ناري
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.x = Math.PI / 2;
    laser.position.copy(playerGroup.position);
    laser.position.y = 1.5;
    laser.rotation.y = playerGroup.rotation.y;
    scene.add(laser);
    setTimeout(() => scene.remove(laser), 100);

    // حساب الإصابة
    const raycaster = new THREE.Raycaster();
    const targetDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerGroup.rotation.y);
    raycaster.set(playerGroup.position, targetDir);

    const intersects = raycaster.intersectObjects(enemies);
    if(intersects.length > 0 && intersects[0].distance < 50) {
        const hitEnemy = intersects[0].object;
        hitEnemy.userData.health -= 1;
        
        hitEnemy.material.color.setHex(0xffffff); // ومضة بيضاء عند الإصابة
        setTimeout(() => hitEnemy.material.color.setHex(0xff4500), 100);

        if(hitEnemy.userData.health <= 0) {
            scene.remove(hitEnemy);
            const index = enemies.indexOf(hitEnemy);
            if(index > -1) enemies.splice(index, 1);
            if(enemyCountSpan) enemyCountSpan.innerText = enemies.length;
            
            if(enemies.length === 0) {
                alert("مبروك! لقد قضيت على جميع الأعداء بنجاح!");
                window.location.reload();
            }
        }
    }
}

window.addEventListener('click', () => { if(document.pointerLockElement === renderer.domElement) shoot(); });
const shootBtn = document.getElementById('btn-shoot');
if(shootBtn) shootBtn.addEventListener('touchstart', (e) => { e.preventDefault(); shoot(); });

// 9. حلقة التحديث المستمر للعبة (Game Loop)
function animate() {
    requestAnimationFrame(animate);

    // حركة اللاعب
    const direction = new THREE.Vector3();
    if (keys.w) direction.z = moveSpeed;
    if (keys.s) direction.z = -moveSpeed;
    if (keys.a) direction.x = moveSpeed;
    if (keys.d) direction.x = -moveSpeed;
    
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerGroup.rotation.y);
    playerGroup.position.add(direction);

    // ذكاء الأعداء وملاحقتهم لك
    enemies.forEach(enemy => {
        const dirToPlayer = new THREE.Vector3().subVectors(playerGroup.position, enemy.position);
        dirToPlayer.y = 0;
        const distance = dirToPlayer.length();

        if(distance > 3) {
            dirToPlayer.normalize();
            enemy.position.add(dirToPlayer.multiplyScalar(enemy.userData.speed));
            enemy.lookAt(playerGroup.position.x, enemy.position.y, playerGroup.position.z);
        } else {
            // هجوم العدو عند الاقتراب
            playerHealth -= 0.2;
            const healthBar = document.getElementById('health-bar');
            if(healthBar) healthBar.style.width = playerHealth + '%';
            
            if(playerHealth <= 0) {
                alert("انتهت اللعبة! الأعداء تمكنوا منك.");
                window.location.reload();
            }
        }
    });

    // ضبط الكاميرا خلف اللاعب لترى الأشجار والبيوت بوضوح وثبات
    const relativeCameraOffset = new THREE.Vector3(0, 5, -10); // كاميرا مرتفعة قليلاً لتكشف الخريطة
    const cameraOffset = relativeCameraOffset.applyMatrix4(playerGroup.matrixWorld);
    camera.position.copy(cameraOffset);
    camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0, 1.5, 0)));

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
