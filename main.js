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

// Criar material com cor areia
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
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(0, 5, 10);
scene.add(directionalLight);

// Carregar modelo da pedra
const loader = new GLTFLoader();
loader.load('system/models/pedra.glb', (gltf) => {
    const stone = gltf.scene;
    stone.scale.set(1, 1, 1);
    stone.position.set(7, -2, -1);
    scene.add(stone);
}, undefined, (error) => {
    console.error(error);
});

// Carregar modelo do barco
let boat;
loader.load('system/models/barco.glb', (gltf) => {
    boat = gltf.scene;
    boat.scale.set(0.3, 0.3, 0.3);
    boat.position.set(0, -1, -2);
    scene.add(boat);
}, undefined, (error) => {
    console.error(error);
});

// Carregar modelo do nadador
let swimmer;
loader.load('system/models/nadador.glb', (gltf) => {
    swimmer = gltf.scene;
    swimmer.scale.set(0.5, 0.5, 0.5);
    swimmer.position.set(0, -1, 0);
    scene.add(swimmer);
}, undefined, (error) => {
    console.error(error);
});

// Criar luz pontual (PointLight) amarela
const swimmerLight = new THREE.PointLight(0xffff00, 1, 10);
swimmerLight.position.set(0, 0, 0);
scene.add(swimmerLight);

// Variáveis para o movimento do nadador
let direction = new THREE.Vector3();
let speed = 0.02;

// Limites do movimento do nadador
const movementLimits = {
    x: { min: -10, max: 10 },
    z: { min: -3, max: 0 }
};

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

    // Movimento aleatório do nadador
    if (swimmer) {
        if (direction.length() === 0) {
            direction.set((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2).normalize();
        }

        swimmer.position.add(direction.clone().multiplyScalar(speed));
        swimmerLight.position.copy(swimmer.position);

        // Verificar limites da tela
        if (swimmer.position.x < movementLimits.x.min || swimmer.position.x > movementLimits.x.max ||
            swimmer.position.z < movementLimits.z.min || swimmer.position.z > movementLimits.z.max) {
            direction.set((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2).normalize();
        }
    }

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

animate();
