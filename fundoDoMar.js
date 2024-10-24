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

// Carregar modelo do tesouro
let tesouro;
carregador.load('system/models/tesouro.glb', (gltf) => {
    tesouro = gltf.scene;
    tesouro.scale.set(0.03, 0.03, 0.03);
    tesouro.position.set(8, -2, -2);
    tesouro.rotation.x = Math.PI / 9;
    cena.add(tesouro);
}, undefined, (erro) => {
    console.error('Erro ao carregar o tesouro:', erro);
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

// Carregar modelo do nadador
let nadador;
carregador.load('system/models/nadador.glb', (gltf) => {
    nadador = gltf.scene;
    nadador.scale.set(0.5, 0.5, 0.5);
    nadador.position.set(0, 0, 0);
    cena.add(nadador);
}, undefined, (erro) => {
    console.error('Erro ao carregar o nadador:', erro);
});

// Carregar modelo do tubarao
let tubarao;
let sharkAngle = 0; // Ângulo inicial para o movimento circular do tubarão
const sharkRadius = 6; // Raio do movimento circular

carregador.load('system/models/tubarao.glb', (gltf) => {
    tubarao = gltf.scene;
    tubarao.scale.set(0.003, 0.003, 0.003);
    tubarao.position.set(sharkRadius, 1, 0); // Começar no raio definid
    cena.add(tubarao);
}, undefined, (erro) => {
    console.error('Erro ao carregar o tubarao:', erro);
});

// Função para detectar colisão entre dois objetos
function detectarColisao(obj1, obj2) {
    const box1 = new THREE.Box3().setFromObject(obj1);
    const box2 = new THREE.Box3().setFromObject(obj2);
    return box1.intersectsBox(box2);
}

// Criar luz pontual (PointLight) amarela
const luzNadador = new THREE.PointLight(0xffff00, 10, 10);
luzNadador.position.set(0, 0, 0);
cena.add(luzNadador);

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

// Variáveis para o movimento do nadador
const velocidade = 0.1; // Velocidade do nadador
const limitesMovimento = {
    x: { min: -10, max: 10 },
    y: { min: -2, max: 2 },
    z: { min: -10, max: 3 }
};

// Evento de teclado
const teclas = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    a: false,
    s: false,
    A: false,
    S: false
};

// Adiciona um ouvinte de evento para pressionamento de teclas
window.addEventListener('keydown', (evento) => {
    // Verifica se a tecla pressionada está mapeada no objeto 'teclas'
    if (evento.key in teclas) {
        teclas[evento.key] = true; // Define o valor como 'true' (indicando que a tecla está pressionada)
    }
});

// Adiciona um ouvinte de evento para quando a tecla é solta
window.addEventListener('keyup', (evento) => {
    // Verifica se a tecla solta está mapeada no objeto 'teclas'
    if (evento.key in teclas) {
        teclas[evento.key] = false; // Define o valor como 'false' (indicando que a tecla foi liberada)
    }
});

// Animação
function animation() {
    requestAnimationFrame(animation);

    // Movimento do nadador controlado pelo usuário
    if (nadador) {
        if (teclas.ArrowDown) nadador.position.y -= velocidade; // baixo
        if (teclas.ArrowUp) nadador.position.y += velocidade; // cima
        if (teclas.ArrowLeft) nadador.position.x -= velocidade; // Mover para a esquerda
        if (teclas.ArrowRight) nadador.position.x += velocidade; // Mover para a direita
        if (teclas.a) nadador.position.z -= velocidade; // Mover para trás
        if (teclas.s) nadador.position.z += velocidade; // Mover para a frente 
        if (teclas.A) nadador.position.z -= velocidade; // Mover para trás
        if (teclas.S) nadador.position.z += velocidade; // Mover para a frente

        // Manter o nadador dentro dos limites
        nadador.position.x = THREE.MathUtils.clamp(nadador.position.x, limitesMovimento.x.min, limitesMovimento.x.max);
        nadador.position.y = THREE.MathUtils.clamp(nadador.position.y, limitesMovimento.y.min, limitesMovimento.y.max);
        nadador.position.z = THREE.MathUtils.clamp(nadador.position.z, limitesMovimento.z.min, limitesMovimento.z.max);

        luzNadador.position.copy(nadador.position); // Atualizar posição da luz com o nadador
    }

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

    // Movimento circular do tubarão
    if (tubarao) {
        sharkAngle += 0.01; // Incrementar o ângulo para o movimento
        tubarao.position.x = Math.cos(sharkAngle) * sharkRadius; // Coordenada x ao longo da circunferência
        tubarao.position.z = Math.sin(sharkAngle) * sharkRadius; // Coordenada z ao longo da circunferência
        tubarao.rotation.y = -sharkAngle; // Ajustar a rotação para olhar na direção do movimento
    }

    // Verificar colisão entre nadador e tesouro
    if (tesouro && nadador && detectarColisao(nadador, tesouro)) {
        window.location.href = 'youWin.html'; // Redireciona para a página "youWin.html"
    }

    // Verificar colisão entre nadador e tubarao
    if (tesouro && nadador && detectarColisao(nadador, tubarao)) {
        window.location.href = 'youLost.html'; // Redireciona para a página "youWin.html"
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