// Seleção de elementos da interface (DOM)
const canvas = document.getElementById("canvas");
const pixel = canvas.getContext("2d");
const clickedCoords = document.getElementById("clicked-coords");

// Limites do sistema de coordenadas do mundo (User)
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
  pixel.clearRect(0, 0, canvas.width, canvas.height);
  pixel.fillStyle = "white";
  pixel.fillRect(x, y, 1, 1);
}

// FUNÇÕES DE TRANSFORMAÇÃO DE COORDENADAS (NDC de -1 a +1)

/**
 * Converte coordenadas do Usuário (X,Y) para NDC.
 * user_to_ndc
 */

function user_to_ndc(xw, yw) {
  const x_ndc = 2 * ((xw - Xmin) / (Xmax - Xmin)) - 1;
  const y_ndc = 2 * ((yw - Ymin) / (Ymax - Ymin)) - 1;
  return { x_ndc, y_ndc };
}

/**
 * Converte coordenadas NDC para coordenadas do Usuário (Mundo).
 * ndc_to_user
 */
function ndc_to_user(x_ndc, y_ndc) {
  const xw = Xmin + ((x_ndc + 1) / 2) * (Xmax - Xmin);
  const yw = Ymin + ((y_ndc + 1) / 2) * (Ymax - Ymin);
  return { xw, yw };
}

/**
 * Converte coordenadas NDC para o Dispositivo (tela/pixel).
 * ndc_to_dc
 */
function ndc_to_dc(x_ndc, y_ndc) {
  const xd = Math.round(((x_ndc + 1) / 2) * (canvas.width - 1));
  // A coordenada Y do dispositivo é invertida (0 no topo)
  const yd = Math.round(((1 - y_ndc) / 2) * (canvas.height - 1));
  return { xd, yd };
}

/**
 * Converte coordenadas do Dispositivo (tela/pixel) para NDC.
 * dc_to_ndc (Equivalente ao inp_to_ndc)
 */
function dc_to_ndc(xd, yd) {
  const x_ndc = (xd / (canvas.width - 1)) * 2 - 1;
  // A coordenada Y do dispositivo é invertida (0 no topo)
  const y_ndc = (1 - yd / (canvas.height - 1)) * 2 - 1;
  return { x_ndc, y_ndc };
}

// EVENTOS DA INTERFACE

// Evento de clique no canvas para selecionar um pixel
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const xd = Math.round(event.clientX - rect.left); // Coordenada de dispositivo X
  const yd = Math.round(event.clientY - rect.top); // Coordenada de dispositivo Y

  // 1. Converter Dispositivo -> NDC
  const { x_ndc, y_ndc } = dc_to_ndc(xd, yd);

  // 2. Converter NDC -> Usuário (Mundo)
  const { xw, yw } = ndc_to_user(x_ndc, y_ndc);

  // Desenha o pixel
  setPixel(xd, yd);

  // Atualiza o painel de informações
  clickedCoords.innerHTML = `   <strong>Coord. do Dispositivo (DC):</strong><br> (${xd}, ${yd})<br><br>
        <strong>Coord. NDC Centrada:</strong><br> (${x_ndc.toFixed(
          3
        )}, ${y_ndc.toFixed(3)})<br><br>
        <strong>Coord. do Usuário (Mundo):</strong><br> (${xw.toFixed(
          3
        )}, ${yw.toFixed(3)})
    `;
});

// Evento do botão para definir um ponto a partir das coordenadas do mundo
document.getElementById("set-world-btn").addEventListener("click", () => {
  const inputX = parseFloat(document.getElementById("input-x").value);
  const inputY = parseFloat(document.getElementById("input-y").value);

  if (isNaN(inputX) || isNaN(inputY)) {
    alert("Por favor, insira coordenadas válidas.");
    return;
  }

  if (inputX < Xmin || inputX > Xmax || inputY < Ymin || inputY > Ymax) {
    alert(
      `As coordenadas estão fora do intervalo do mundo:\nX: [${Xmin}, ${Xmax}], Y: [${Ymin}, ${Ymax}]`
    );
    return;
  }

  // 1. Converter Usuário (Mundo) -> NDC
  const { x_ndc, y_ndc } = user_to_ndc(inputX, inputY);

  // 2. Converter NDC -> Dispositivo
  const { xd, yd } = ndc_to_dc(x_ndc, y_ndc);

  // Desenha o pixel
  setPixel(xd, yd);

  // Atualiza o painel de informações
  clickedCoords.innerHTML = `
        <strong>Coord. do Usuário (Mundo):</strong><br> (${inputX.toFixed(
          3
        )}, ${inputY.toFixed(3)})<br><br>
        <strong>Coord. NDC Centrada:</strong><br> (${x_ndc.toFixed(
          3
        )}, ${y_ndc.toFixed(3)})<br><br>
        <strong>Coord. do Dispositivo (DC):</strong><br> (${xd}, ${yd})
    `;
});
