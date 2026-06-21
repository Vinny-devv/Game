import { db } from './config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

window.saveToFirebase = async function() {
    const sceneId = document.getElementById('sceneId').value;
    const choices = [];
    document.querySelectorAll('.choice-group').forEach(group => {
        choices.push({
            text: group.querySelector('.c-text').value,
            nextScene: group.querySelector('.c-next').value
        });
    });

    try {
        await setDoc(doc(db, "scenes", sceneId), {
            characterName: document.getElementById('charName').value,
            imageUrl: document.getElementById('charImg').value,
            text: document.getElementById('dialogueText').value,
            choices: choices
        });
        alert("تم الحفظ بنجاح!");
    } catch (e) {
        console.error("خطأ:", e);
    }
};
