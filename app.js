const TOTAL_POBLACION = 1000;
const TIPOS = ["naranja", "azul", "rosa", "verde", "morado"];
const COLORES = ["#e34a33", "#1f78b4", "#f781bf", "#33a02c", "#6a3d9a"];
const CONTEOS_POBLACION = [200, 100, 200, 300, 200];

let graficoPoblacion;
let graficoMuestra;

function crearPoolPoblacion() {
  const pool = [];

  CONTEOS_POBLACION.forEach((conteo, indiceTipo) => {
    for (let i = 0; i < conteo; i += 1) {
      pool.push(indiceTipo);
    }
  });

  return pool;
}

const poolPoblacion = crearPoolPoblacion();

function muestrearSinReemplazo(n) {
  const copia = poolPoblacion.slice();

  for (let i = copia.length - 1; i > copia.length - 1 - n; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia.slice(copia.length - n);
}

function contarTipos(muestra) {
  const conteos = new Array(TIPOS.length).fill(0);

  muestra.forEach((tipo) => {
    conteos[tipo] += 1;
  });

  return conteos;
}

function maximoY(total) {
  return Math.max(total / 3 + 0.15 * total, 10);
}

const pluginEtiquetas = {
  id: "etiquetasBarras",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const valores = chart.data.datasets[0].data;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#111111";
    ctx.font = "bold 12px Arial";

    valores.forEach((valor, indice) => {
      const barra = meta.data[indice];
      if (!barra || valor <= 0) return;
      ctx.fillText(String(valor), barra.x, barra.y - 4);
    });

    ctx.restore();
  }
};

function crearConfig(conteos, yMax) {
  return {
    type: "bar",
    data: {
      labels: TIPOS,
      datasets: [
        {
          data: conteos,
          backgroundColor: COLORES,
          borderColor: "#ffffff",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.parsed.y} individuos`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: "#333333"
          }
        },
        y: {
          beginAtZero: true,
          max: yMax,
          ticks: {
            color: "#333333"
          },
          title: {
            display: true,
            text: "conteo",
            color: "#333333"
          },
          grid: {
            color: "#dddddd"
          }
        }
      }
    },
    plugins: [pluginEtiquetas]
  };
}

function actualizarMuestra() {
  const slider = document.getElementById("sample-size");
  const n = Number(slider.value);

  document.getElementById("sample-size-value").textContent = String(n);
  document.getElementById("sample-n").textContent = `n = ${n}`;

  const muestra = muestrearSinReemplazo(n);
  const conteosMuestra = contarTipos(muestra);

  graficoMuestra.data.datasets[0].data = conteosMuestra;
  graficoMuestra.options.scales.y.max = maximoY(n);
  graficoMuestra.update();
}

function iniciarGraficos() {
  const ctxPoblacion = document.getElementById("population-chart");
  const ctxMuestra = document.getElementById("sample-chart");

  graficoPoblacion = new Chart(ctxPoblacion, crearConfig(CONTEOS_POBLACION, maximoY(TOTAL_POBLACION)));

  const nInicial = Number(document.getElementById("sample-size").value);
  const muestraInicial = muestrearSinReemplazo(nInicial);
  const conteosIniciales = contarTipos(muestraInicial);
  graficoMuestra = new Chart(ctxMuestra, crearConfig(conteosIniciales, maximoY(nInicial)));
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarGraficos();
  actualizarMuestra();

  const slider = document.getElementById("sample-size");
  const botonNuevaMuestra = document.getElementById("resample-btn");
  slider.addEventListener("input", actualizarMuestra);
  botonNuevaMuestra.addEventListener("click", actualizarMuestra);
});
