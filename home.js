import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Criar cena
const scene = new THREE.Scene();

// Criar câmera (campo de visão, aspecto, recorte próximo e distante)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Criar renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Posicionar a câmera
camera.position.z = 6;

// Criar geometria de plano para o fundo do mar (areia)
const geometry = new THREE.PlaneGeometry(25, 20);
const material = new THREE.MeshPhongMaterial({ color: 0xFFE382 });
const seaFloor = new THREE.Mesh(geometry, material);
seaFloor.rotation.x = -Math.PI / 2;
seaFloor.position.y = -2;
scene.add(seaFloor);

// Definir cor de fundo para a cena (simular a água)
scene.background = new THREE.Color(0x1E90FF);

// Luz ambiente
const ambientLight = new THREE.AmbientLight(0x404040, 7);
scene.add(ambientLight);

// Luz direcional (como o sol)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(-5, 3, 15);
scene.add(directionalLight);

// Carregar modelo da pedra
const loader = new GLTFLoader();
loader.load('system/models/pedra.glb', (gltf) => {
    const stone = gltf.scene;
    stone.scale.set(1, 1, 1);
    stone.position.set(7, -2, -1);
    scene.add(stone);
}, undefined, (error) => {
    console.error('Erro ao carregar a pedra:', error);
});

// Carregar modelo do barco
let boat;
loader.load('system/models/barco.glb', (gltf) => {
    boat = gltf.scene;
    boat.scale.set(0.4, 0.4, 0.4);
    boat.position.set(5, -2, -2.5);
    boat.rotation.z = Math.PI / -5;
    scene.add(boat);
}, undefined, (error) => {
    console.error('Erro ao carregar o barco:', error);
});

// Carregar modelo das flores
let flores;
loader.load('system/models/flores.glb', (gltf) => {
    flores = gltf.scene;
    flores.scale.set(90, 90, 90);
    flores.position.set(-7, -1, 0);
    flores.rotation.x = Math.PI / 7; // Inclinar as flores para frente (45 graus, ajuste conforme necessário)
    scene.add(flores);
}, undefined, (error) => {
    console.error('Erro ao carregar as flores:', error);
});

// Carregar modelo do tesouro
let tesouro;
loader.load('system/models/tesouro.glb', (gltf) => {
    tesouro = gltf.scene;
    tesouro.scale.set(0.03, 0.03, 0.03);
    tesouro.position.set(-6, -2, 0);
    tesouro.rotation.x = Math.PI / 9;
    scene.add(tesouro);
}, undefined, (error) => {
    console.error('Erro ao carregar o tesouro:', error);
});

// Criar bolhas
const bubbles = [];
const bubbleCount = 50; // Número de bolhas

for (let i = 0; i < bubbleCount; i++) {
    const bubbleGeometry = new THREE.SphereGeometry(0.1, 32, 32); // Geometria da bolha
    const bubbleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.6 });
    const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);

    // Posicionar a bolha em uma posição aleatória dentro dos limites
    bubble.position.set(
        (Math.random() - 0.5) * 20, // X
        (Math.random() * 5) - 5,    // Y (para que as bolhas fiquem submersas)
        (Math.random() - 0.5) * 20   // Z
    );

    bubbles.push(bubble); // Adiciona a bolha ao array
    scene.add(bubble);    // Adiciona a bolha à cena
}

// Animação
function animate() {
    requestAnimationFrame(animate);

    // Animação das bolhas
    bubbles.forEach(bubble => {
        bubble.position.y += 0.01; // Bolha sobe
        if (bubble.position.y > 2) { // Reiniciar bolha se sair do limite
            bubble.position.y = -5;
            bubble.position.x = (Math.random() - 0.5) * 20;
            bubble.position.z = (Math.random() - 0.5) * 20;
        }
    });

    // Renderizar a cena
    renderer.render(scene, camera);
}

// Ajustar o tamanho do renderizador e a câmera ao redimensionar a janela
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Iniciar a animação
animate();
