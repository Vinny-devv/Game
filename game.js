import { db } from './config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

async function loadScene(sceneId) {
    const docRef = doc(db, "scenes", sceneId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('display-img').src = data.imageUrl;
        document.getElementById('display-text').innerText = data.text;
        // هنا تضيف منطق عرض الأزرار...
    }
}
