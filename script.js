// Seleção de elementos da interface (DOM)
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const liveCoords = document.getElementById("live-coords");
const clickedCoords = document.getElementById("clicked-coords");
let selectedPixel = null;

// Inicialização dos limites do sistema de coordenadas do mundo
let Xmax = 50;
let Xmin = 0;
let Ymax = 50;
let Ymin = 0;

// Atualização dos valores dos limites na interface
document.getElementById("xmin").textContent = Xmin;
document.getElementById("xmax").textContent = Xmax;
document.getElementById("ymin").textContent = Ymin;
document.getElementById("ymax").textContent = Ymax;

// Função para desenhar um pixel no canvas
function setPixel(x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, 1, 1); 
}

// Evento para mostrar as coordenadas em tempo real ao mover o mouse
canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left); 
    const y = Math.round(event.clientY - rect.top);

    // Calcula as conversões entre os sistemas de coordenadas
    const { ndcx, ndcy } = inpToNdc(x, y, canvas.width, canvas.height);
    const world = ndcToWd(ndcx, ndcy, Xmax, Xmin, Ymax, Ymin);
    const ndcCentral = wdToNdcCentral(world.worldX, world.worldY, Xmax, Xmin, Ymax, Ymin);
    const device = ndcCentralToDc(ndcCentral.ndccx, ndcCentral.ndccy, canvas.width, canvas.height);

    // Atualiza o painel de coordenadas ao vivo
    liveCoords.innerHTML = `
        <strong>Coordenadas de Mundo:</strong><br> (${world.worldX.toFixed(3)}, ${world.worldY.toFixed(3)})<br><br>
        <strong>Coordenadas NDC:</strong><br> (${ndcx.toFixed(3)}, ${ndcy.toFixed(3)})<br><br>
        <strong>Coordenadas NDC Centralizada:</strong><br> (${ndcCentral.ndccx.toFixed(3)}, ${ndcCentral.ndccy.toFixed(3)})<br><br>
        <strong>Coordenadas de Dispositivo:</strong><br> (${x}, ${y})
    `;
});

// Evento para mostrar e desenhar o pixel clicado
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);
    selectedPixel = { x, y };
    setPixel(x, y);

    // Calcula as conversões entre os sistemas de coordenadas
    const { ndcx, ndcy } = inpToNdc(x, y, canvas.width, canvas.height);
    const world = ndcToWd(ndcx, ndcy, Xmax, Xmin, Ymax, Ymin);
    const ndcCentral = wdToNdcCentral(world.worldX, world.worldY, Xmax, Xmin, Ymax, Ymin);

    // Atualiza o painel de coordenadas do clique
    clickedCoords.innerHTML = 
    `   <strong>Coordenadas de Mundo:</strong><br> (${world.worldX.toFixed(3)}, ${world.worldY.toFixed(3)})<br><br>
        <strong>Coordenadas NDC:</strong><br> (${ndcx.toFixed(3)}, ${ndcy.toFixed(3)})<br><br>
        <strong>Coordenadas NDC Centralizada:</strong><br> (${ndcCentral.ndccx.toFixed(3)}, ${ndcCentral.ndccy.toFixed(3)})<br><br>
        <strong>Coordenadas de Dispositivo:</strong><br> (${x}, ${y})
    `;
});

// Evento para definir um ponto do mundo e desenhar no canvas
document.getElementById("set-world-btn").addEventListener("click", () => {
    const inputX = parseFloat(document.getElementById("input-x").value);
    const inputY = parseFloat(document.getElementById("input-y").value);

    if (isNaN(inputX) || isNaN(inputY)) {
        alert("Por favor, insira coordenadas válidas.");
        return;
    }

    if (inputX < Xmin || inputX > Xmax || inputY < Ymin || inputY > Ymax) {
        alert(`As coordenadas estão fora do intervalo permitido:\nX: [${Xmin}, ${Xmax}], Y: [${Ymin}, ${Ymax}]`);
        return;
    }

    // Calcula as conversões entre os sistemas de coordenadas
    const ndcx = (inputX - Xmin) / (Xmax - Xmin);
    const ndcy = (inputY - Ymin) / (Ymax - Ymin);

    const pixelX = Math.round(ndcx * (canvas.width - 1));  
    const pixelY = Math.round((1 - ndcy) * (canvas.height - 1)); 

    const ndccx = 2 * ndcx - 1;
    const ndccy = 2 * ndcy - 1; 

    setPixel(pixelX, pixelY);

    // Atualiza o painel de coordenadas do clique
    clickedCoords.innerHTML = `
        <strong>Coordenadas de Mundo:</strong><br> (${inputX.toFixed(3)}, ${inputY.toFixed(3)})<br><br>
        <strong>Coordenadas NDC:</strong><br> (${ndcx.toFixed(3)}, ${ndcy.toFixed(3)})<br><br>
        <strong>Coordenadas NDC Centralizada:</strong><br> (${ndccx.toFixed(3)}, ${ndccy.toFixed(3)})<br><br>
        <strong>Coordenadas de Dispositivo:</strong><br> (${pixelX}, ${pixelY}) 
    `;
});

// Funções de cálculo e conversão de coordenadas

// Converte coordenadas de pixel para NDC (Normalized Device Coordinates)
function inpToNdc(x, y, width, height) {
    return { 
        ndcx: x / (width - 1),
        ndcy: 1 - (y / (height - 1)) 
    };
}


// Converte coordenadas NDC para coordenadas do mundo
function ndcToWd(ndcx, ndcy, Xmax, Xmin, Ymax, Ymin) {
    return {
        worldX: ndcx * (Xmax - Xmin) + Xmin,
        worldY: ndcy * (Ymax - Ymin) + Ymin
    };
}

// Converte coordenadas do mundo para NDC centralizada na origem
function wdToNdcCentral(x, y, Xmax, Xmin, Ymax, Ymin) {
    return {
        ndccx: 2 * ((x - Xmin) / (Xmax - Xmin)) - 1,
        ndccy: 2 * ((y - Ymin) / (Ymax - Ymin)) - 1
    };
}

// Converte NDC centralizada para coordenadas de dispositivo (pixel)
function ndcCentralToDc(ndcx, ndcy, width, height) {    
    return {
        dcx: Math.round(((ndcx + 1) / 2) * (width - 1)),
        dcy: Math.round(((ndcy + 1) / 2) * (height - 1))  
    };
}
