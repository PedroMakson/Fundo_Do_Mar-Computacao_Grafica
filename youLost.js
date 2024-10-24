import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Criar cena
const cena = new THREE.Scene();
const listener = new THREE.AudioListener();

// Criar câmera (campo de visão, aspecto, recorte próximo e distante)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Posicionar a câmera
camera.position.z = 6;
// Associar o listener de áudio à câmera
camera.add(listener);

// Música de fundo
const som = new THREE.Audio(listener);
const carregadorAudio = new THREE.AudioLoader();
carregadorAudio.load('system/sounds/SomDoMar.mp3', (buffer) => {
    som.setBuffer(buffer);
    som.setLoop(true);
    som.setVolume(0.5);
    som.play(); // Iniciar som ambiente
});

// Criar renderizador
const renderizador = new THREE.WebGLRenderer();
renderizador.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderizador.domElement);

// Criar geometria de plano para o fundo do mar (areia)
const geometriaAreia = new THREE.PlaneGeometry(25, 20);
const materialAreia = new THREE.MeshPhongMaterial({ color: 0xFFE382 }); // cor amarelado da areia
const fundoMar = new THREE.Mesh(geometriaAreia, materialAreia);
fundoMar.rotation.x = -Math.PI / 2; //-90
fundoMar.position.y = -2;
cena.add(fundoMar);

// Definir cor de fundo para a cena (simular a água)
cena.background = new THREE.Color(0x1E90FF);

// Luz ambiente
const luzAmbiente = new THREE.AmbientLight(0x404040, 7);
cena.add(luzAmbiente);

// Luz direcional (como o sol)
const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.5);
luzDirecional.position.set(-5, 3, 15);
cena.add(luzDirecional);

// Carregador
const carregador = new GLTFLoader();

// Carregar modelo do barco
let barco;
carregador.load('system/models/barco.glb', (gltf) => {
    barco = gltf.scene;
    barco.scale.set(0.4, 0.4, 0.4);
    barco.position.set(5, -2, -2.5);
    barco.rotation.z = Math.PI / 4;
    cena.add(barco);
}, undefined, (erro) => {
    console.error('Erro ao carregar o barco:', erro);
});

let barco2;
carregador.load('system/models/barco.glb', (gltf) => {
    barco2 = gltf.scene;
    barco2.scale.set(0.4, 0.4, 0.4);
    barco2.position.set(-5, -2, -8);
    barco2.rotation.y = Math.PI / -2;
    barco2.rotation.z = Math.PI / -4;

    cena.add(barco2);
}, undefined, (erro) => {
    console.error('Erro ao carregar o barco:', erro);
});

// Carregar modelo das plantas
let plantas;
carregador.load('system/models/plantas.glb', (gltf) => {
    plantas = gltf.scene;
    plantas.scale.set(90, 90, 90);
    plantas.position.set(-7, -1, 0);
    plantas.rotation.x = Math.PI / 7; // Inclinar as plantas para frente
    cena.add(plantas);
}, undefined, (erro) => {
    console.error('Erro ao carregar as plantas:', erro);
});

// Carregar modelo da pedra
carregador.load('system/models/pedra.glb', (gltf) => {
    const pedra = gltf.scene;
    pedra.scale.set(1, 1, 1);
    pedra.position.set(6, -2, -1);
    cena.add(pedra);
}, undefined, (erro) => {
    console.error('Erro ao carregar a pedra:', erro);
});

// Carregar modelo do ancora
let ancora;
carregador.load('system/models/ancora.glb', (gltf) => {
    ancora = gltf.scene;
    ancora.scale.set(0.03, 0.03, 0.03);
    ancora.position.set(-4, -3, 2);
    // ancora.rotation.x = Math.PI / 9;
    cena.add(ancora);
}, undefined, (erro) => {
    console.error('Erro ao carregar a ancora:', erro);
});


// Função para detectar colisão entre dois objetos
function detectarColisao(obj1, obj2) {
    const box1 = new THREE.Box3().setFromObject(obj1);
    const box2 = new THREE.Box3().setFromObject(obj2);
    return box1.intersectsBox(box2);
}

// Criar bolhas
const bolhas = []; // Array para armazenar as bolhas
const quantidadeBolhas = 60; // Número total de bolhas a serem criadas

// Loop para criar e posicionar cada bolha
for (let i = 0; i < quantidadeBolhas; i++) {
    // Cria a geometria da bolha como uma esfera
    const geometriaBolha = new THREE.SphereGeometry(0.1, 32, 32); // Raio da bolha e subdivisões
    // Cria o material da bolha com cor branca, transparente e com opacidade
    const materialBolha = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.6 });
    // Cria a malha da bolha combinando a geometria e o material
    const bolha = new THREE.Mesh(geometriaBolha, materialBolha);

    // Posicionar a bolha em uma posição aleatória dentro dos limites definidos
    bolha.position.set(
        (Math.random() - 0.5) * 20, // Posição X aleatória entre -10 e 10
        (Math.random() * 5) - 5,    // Posição Y aleatória entre -5 e 0 (submersa)
        (Math.random() - 0.5) * 20   // Posição Z aleatória entre -10 e 10
    );

    bolhas.push(bolha); // Adiciona a bolha ao array 'bolhas' para controle posterior
    cena.add(bolha);    // Adiciona a bolha à cena, tornando-a visível na tela
}

// Animação
function animation() {
    requestAnimationFrame(animation);

    // Animação das bolhas
    for (let i = 0; i < bolhas.length; i++) { // Loop para percorrer todas as bolhas no array
        const bolha = bolhas[i]; // Acessa a bolha atual do array

        bolha.position.y += 0.01; // Move a bolha para cima, incrementando sua posição no eixo Y

        if (bolha.position.y > 2) { // Verifica se a bolha ultrapassou o limite superior
            bolha.position.y = -5; // Reinicia a posição da bolha abaixo da cena
            bolha.position.x = (Math.random() - 0.5) * 20; // Gera uma nova posição aleatória no eixo X.
            bolha.position.z = (Math.random() - 0.5) * 20; // Gera uma nova posição aleatória no eixo Z.
        }
    }

    // Renderizar a cena
    renderizador.render(cena, camera);
}

// Ajustar o tamanho do renderizador e a câmera ao redimensionar a janela
window.addEventListener('resize', () => {
    renderizador.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Iniciar a animação
animation();