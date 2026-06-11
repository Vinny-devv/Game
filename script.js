// 1. إعداد المشهد، الكاميرا، والمحرك
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510); // سماء ليلية غامقة
scene.fog = new THREE.FogExp2(0x050510, 0.015); // ضباب لإعطاء عمق وغموض

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 2. الإضاءة (لإعطاء هيبة للمشهد)
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(20, 40, 20);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 3. أرضية ساحة المعركة
const floorGeo = new THREE.PlaneGeometry(500, 500);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x1b2616, roughness: 0.8 }); // أخضر عسكري غامق
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 4. صناعة الشخصية المهيبة (مزيج من الأشكال الهندسية كبداية)
const playerGroup = new THREE.Group();

// جسم الدرع
const bodyGeo = new THREE.BoxGeometry(1.2, 1.8, 0.8);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.8 }); // معدن أسود فاحم
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.position.y = 0.9;
body.castShadow = true;
playerGroup.add(body);

// خوذة مضيئة مهيبة
const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const headMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
const head = new THREE.Mesh(headGeo, headMat);
head.position.y = 2.0;

// أعين نيون حمراء مشتعلة
const eyeGeo = new THREE.BoxGeometry(0.6, 0.1, 0.1);
const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0055 }); // أحمر نيون مضيء
const eyes = new THREE.Mesh(eyeGeo, eyeMat);
eyes.position.set(0, 2.1, 0.41);
playerGroup.add(head, eyes);

scene.add(playerGroup);

// ضبط موقع الكاميرا خلف اللاعب (منظور الشخص الثالث مثل فري فاير)
camera.position.set(0, 4, -7);

// 5. نظام التحكم والحركة
const keys = { w: false, a: false, s: false, d: false };
const speed = 0.15;

window.addEventListener('keydown', (e) => { if(e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if(e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false; });

// تحريك الكاميرا بالماوس للنظر حولك
let moveX = 0;
window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === renderer.domElement) {
        playerGroup.rotation.y -= e.movementX * 0.003;
    }
});

// قفل الماوس داخل اللعبة عند الضغط على الشاشة للتحكم بحرية
renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

// 6. حلقة التحديث المستمر (Game Loop)
function animate() {
    requestAnimationFrame(animate);

    // حساب اتجاه الحركة بناءً على زاوية اللاعب
    const direction = new THREE.Vector3();
    if (keys.w) {
        direction.z = speed;
    }
    if (keys.s) {
        direction.z = -speed;
    }
    if (keys.a) {
        direction.x = speed;
    }
    if (keys.d) {
        direction.x = -speed;
    }

    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerGroup.rotation.y);
    playerGroup.position.add(direction);

    // جعل الكاميرا تلحق باللاعب من الخلف بسلاسة
    const relativeCameraOffset = new THREE.Vector3(0, 3.5, -6);
    const cameraOffset = relativeCameraOffset.applyMatrix4(playerGroup.matrixWorld);
    camera.position.x = cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraOffset.z;
    camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0, 1.5, 0)));

    renderer.render(scene, camera);
}

// ضبط المقاسات عند تغيير حجم النافذة
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
