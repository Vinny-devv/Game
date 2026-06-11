// 1. إعدادات المشهد الأساسية
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a14);
scene.fog = new THREE.FogExp2(0x0a0a14, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// الإضاءة
const ambient = new THREE.AmbientLight(0x444444);
scene.add(ambient);
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(10, 20, 10);
scene.add(light);

// الأرضية
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x151c12 }));
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// 2. تفعيل نظام اللاعب (صحة + سلاح)
let playerHealth = 100;
const playerGroup = new THREE.Group();

// جسم السلاح المرفق بالشخصية
const weaponGeo = new THREE.BoxGeometry(0.2, 0.2, 1);
const weaponMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
const weapon = new THREE.Mesh(weaponGeo, weaponMat);
weapon.position.set(0.6, 1, 0.5); // ممسك على اليمين كبندقية فري فاير

// جسم اللاعب المهيب
const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x111111, metalness:0.8 }));
body.position.y = 0.9;
playerGroup.add(body, weapon);
scene.add(playerGroup);

// 3. نظام الأعداء (الذكاء الاصطناعي العسكري)
const enemies = [];
const enemyCountSpan = document.getElementById('enemy-count');

function createEnemy() {
    const enemy = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.8, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5 }) // لون أحمر عدائي
    );
    // توزيع عشوائي للأعداء في الساحة
    enemy.position.set((Math.random() - 0.5) * 80, 0.9, (Math.random() - 0.5) * 80);
    enemy.userData = { health: 2, speed: 0.04 }; // كل بوت يحتاج ضربتين ليموت
    scene.add(enemy);
    enemies.push(enemy);
}

// إنشاء 5 أعداء في الساحة
for(let i=0; i<5; i++) createEnemy();

// 4. نظام الحركة والتحكم (كيبرد + لمس)
const keys = { w: false, a: false, s: false, d: false };
const moveSpeed = 0.15;

window.addEventListener('keydown', (e) => { if(e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if(e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false; });

// ربط أزرار الشاشة باللمس
const setupTouch = (id, key) => {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
    btn.addEventListener('touchend', () => { keys[key] = false; });
};
setupTouch('btn-up', 'w'); setupTouch('btn-down', 's'); setupTouch('btn-left', 'a'); setupTouch('btn-right', 'd');

// دوران الكاميرا بالماوس وسحب الشاشة
window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === renderer.domElement) {
        playerGroup.rotation.y -= e.movementX * 0.004;
    }
});
renderer.domElement.addEventListener('click', () => { renderer.domElement.requestPointerLock(); });

// 5. آلية إطلاق النار وضرر الأسلحة
function shoot() {
    // 1. إنشاء رصاصة ليزر مرئية
    const laserGeo = new THREE.CylinderGeometry(0.03, 0.03, 4);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    
    laser.rotation.x = Math.PI / 2;
    laser.position.copy(playerGroup.position);
    laser.position.y = 1.2; 
    laser.rotation.y = playerGroup.rotation.y;
    scene.add(laser);

    // إزالة شعاع الليزر بعد فترة قصيرة جداً
    setTimeout(() => scene.remove(laser), 80);

    // 2. نظام حساب الإصابة (Raycasting) باستخدام اتجاه اللاعب
    const raycaster = new THREE.Raycaster();
    const targetDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerGroup.rotation.y);
    raycaster.set(playerGroup.position, targetDir);

    const intersects = raycaster.intersectObjects(enemies);

    if(intersects.length > 0 && intersects[0].distance < 30) {
        const hitEnemy = intersects[0].object;
        hitEnemy.userData.health -= 1; // إلحاق الضرر بالعدو

        // ومضة بيضاء عند إصابة العدو
        hitEnemy.material.color.setHex(0xffffff);
        setTimeout(() => hitEnemy.material.color.setHex(0xff0000), 100);

        if(hitEnemy.userData.health <= 0) {
            scene.remove(hitEnemy);
            const index = enemies.indexOf(hitEnemy);
            if(index > -1) enemies.splice(index, 1);
            enemyCountSpan.innerText = enemies.length;
            
            if(enemies.length === 0) {
                alert("كفو! انتصرت في أرض المعركة وكسرت الأعداء!");
                window.location.reload();
            }
        }
    }
}

// تفعيل زر الإطلاق للموس واللمس
window.addEventListener('click', () => { if(document.pointerLockElement === renderer.domElement) shoot(); });
document.getElementById('btn-shoot').addEventListener('touchstart', (e) => { e.preventDefault(); shoot(); });

// 6. الحلقة البرمجية المستمرة للعبة (Game Loop)
function animate() {
    requestAnimationFrame(animate);

    // حياكة حركة اللاعب
    const direction = new THREE.Vector3();
    if (keys.w) direction.z = moveSpeed;
    if (keys.s) direction.z = -moveSpeed;
    if (keys.a) direction.x = moveSpeed;
    if (keys.d) direction.x = -moveSpeed;
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerGroup.rotation.y);
    playerGroup.position.add(direction);

    // ملاحقة الأعداء (Bots) للاعب وهجومهم
    enemies.forEach(enemy => {
        const dirToPlayer = new THREE.Vector3().subVectors(playerGroup.position, enemy.position);
        dirToPlayer.y = 0; // البقاء على الأرض
        const distance = dirToPlayer.length();

        if(distance > 2) {
            dirToPlayer.normalize();
            enemy.position.add(dirToPlayer.multiplyScalar(enemy.userData.speed));
            enemy.lookAt(playerGroup.position.x, enemy.position.y, playerGroup.position.z);
        } else {
            // العدو قريب جداً -> يلحق الضرر باللاعب (شريط الموت)
            playerHealth -= 0.3;
            document.getElementById('health-bar').style.width = playerHealth + '%';
            
            if(playerHealth <= 0) {
                alert("لقد قُتلت في المعركة! حاول مجدداً.");
                window.location.reload();
            }
        }
    });

    // ضبط الكاميرا خلف اللاعب بسلاسة (Third-Person View)
    const relativeCameraOffset = new THREE.Vector3(0, 3.5, -6);
    const cameraOffset = relativeCameraOffset.applyMatrix4(playerGroup.matrixWorld);
    camera.position.copy(cameraOffset);
    camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0, 1.2, 0)));

    renderer.render(scene, camera);
}

// إعادة ضبط الأبعاد عند تدوير الشاشة
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
