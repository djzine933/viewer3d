import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("viewer");
const popup = document.getElementById("popup");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

scene.add(new THREE.AmbientLight(0xffffff, 1));

/* Chargement modèle */
const loader = new GLTFLoader();
let france;

loader.load("france.glb", (gltf) => {
    france = gltf.scene;
    scene.add(france);
});

/* Chargement données labo */
let labData = {};
fetch("data.json")
.then(res => res.json())
.then(data => labData = data);

/* Interaction souris */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let targetRotationX = 0;
let targetRotationY = 0;
let zoom = 5;

window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    targetRotationY = mouse.x * 0.5;
    targetRotationX = mouse.y * 0.2;
});

/* Zoom molette */
window.addEventListener("wheel", (e) => {
    zoom += e.deltaY * 0.01;
    zoom = Math.max(2, Math.min(10, zoom));
    camera.position.z = zoom;
});

/* Popup */
function showPopup(data, x, y) {
    document.getElementById("labNom").textContent = data.nom;
    document.getElementById("labAdresse").textContent = data.adresse;
    document.getElementById("labTel").textContent = data.tel;

    popup.style.left = x + "px";
    popup.style.top = y + "px";
    popup.classList.remove("hidden");
}

/* Animation */
function animate() {
    requestAnimationFrame(animate);

    if (france) {
        france.rotation.y += (targetRotationY - france.rotation.y) * 0.05;
        france.rotation.x += (targetRotationX - france.rotation.x) * 0.05;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(france.children, true);

        if (intersects.length > 0) {
            const name = intersects[0].object.name;
            if (labData[name]) {
                showPopup(labData[name], event.clientX, event.clientY);
            }
        } else {
            popup.classList.add("hidden");
        }
    }

    renderer.render(scene, camera);
}

animate();

/* Responsive */
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
