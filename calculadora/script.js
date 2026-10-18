
const listaNotas = document.getElementById("listaNotas");
const agregarNotaBtn = document.getElementById("agregarNota");
const calcularBtn = document.getElementById("calcular");

const totalPorcentaje = document.getElementById("totalPorcentaje");
const mensaje = document.getElementById("mensaje");
const resultado = document.getElementById("resultado");

const promedioEl = document.getElementById("promedio");
const notaExamenEl = document.getElementById("notaExamen");
const detalleResultado = document.getElementById("detalleResultado");

let contador = 0;

// Agregar una nota nueva
function agregarNota(nota = "", valor = "") {
    contador++;

    const item = document.createElement("div");
    item.className = "nota-item";

    const cabecera = document.createElement("div");
    cabecera.className = "nota-cabecera";

    const titulo = document.createElement("strong");
    titulo.textContent = `Nota ${contador}`;

    const eliminar = document.createElement("button");
    eliminar.type = "button";
    eliminar.className = "btn-eliminar";
    eliminar.textContent = "Eliminar";
    eliminar.setAttribute("aria-label", `Eliminar nota ${contador}`);

    cabecera.append(titulo, eliminar);

    const campos = document.createElement("div");
    campos.className = "campos-nota";

    const campoNota = crearCampo(
        "Calificación",
        "Ej. 5.2",
        nota,
        "nota"
    );

    const campoValor = crearCampo(
        "Ponderación (%)",
        "Ej. 30",
        valor,
        "valor"
    );

    campos.append(campoNota, campoValor);
    item.append(cabecera, campos);
    listaNotas.appendChild(item);

    eliminar.addEventListener("click", () => {
        item.remove();
        actualizarTotal();
        limpiarResultado();
        renumerarNotas();
    });

    item.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", () => {
            actualizarTotal();
            limpiarResultado();
        });
    });

    actualizarTotal();
}

// Crear campos de entrada
function crearCampo(etiqueta, placeholder, valor, clase) {
    const contenedor = document.createElement("div");
    contenedor.className = "campo";

    const label = document.createElement("label");
    label.textContent = etiqueta;

    const input = document.createElement("input");
    input.type = "number";
    input.step = "any";
    input.placeholder = placeholder;
    input.value = valor;
    input.className = clase;
    input.required = true;

    if (clase === "nota") {
        input.min = "1";
        input.max = "7";
    } else {
        input.min = "0";
        input.max = "100";
    }

    label.htmlFor = `campo-${clase}-${contador}`;
    input.id = label.htmlFor;

    contenedor.append(label, input);
    return contenedor;
}

// Actualizar la suma de los porcentajes
function actualizarTotal() {
    let total = 0;

    document.querySelectorAll(".valor").forEach(input => {
        const valor = input.value.trim();

        if (valor !== "" && Number.isFinite(Number(valor))) {
            total += Number(valor);
        }
    });

    totalPorcentaje.textContent = `${total.toLocaleString("es-CL", {
        maximumFractionDigits: 2
    })}%`;

    totalPorcentaje.style.color =
        Math.abs(total - 100) < 0.001
            ? "var(--verde)"
            : "var(--morado-claro)";
}

// Renumerar las notas al eliminar alguna
function renumerarNotas() {
    document.querySelectorAll(".nota-item").forEach((item, index) => {
        item.querySelector(".nota-cabecera strong").textContent =
            `Nota ${index + 1}`;

        item.querySelector(".btn-eliminar").setAttribute(
            "aria-label",
            `Eliminar nota ${index + 1}`
        );
    });

    contador = document.querySelectorAll(".nota-item").length;
}

// Limpiar resultados antiguos
function limpiarResultado() {
    resultado.hidden = true;
    mensaje.textContent = "";
}

// Botón para agregar notas
agregarNotaBtn.addEventListener("click", () => {
    agregarNota();
});

// Calcular la nota necesaria
calcularBtn.addEventListener("click", () => {
    limpiarResultado();

    const notaMinima = Number(
        document.getElementById("notaMinima").value
    );

    const pesoPresentacion = Number(
        document.getElementById("pesoPresentacion").value
    );

    const pesoExamen = Number(
        document.getElementById("pesoExamen").value
    );

    const items = [...document.querySelectorAll(".nota-item")];

    if (items.length === 0) {
        mensaje.textContent = "Agrega al menos una nota.";
        return;
    }

    if (
        !Number.isFinite(notaMinima) ||
        notaMinima < 1 || notaMinima > 7
    ) {
        mensaje.textContent = "La nota mínima debe estar entre 1.0 y 7.0.";
        return;
    }

    if (
        !Number.isFinite(pesoPresentacion) ||
        !Number.isFinite(pesoExamen) ||
        pesoPresentacion <= 0 ||
        pesoExamen <= 0 ||
        Math.abs(pesoPresentacion + pesoExamen - 100) > 0.001
    ) {
        mensaje.textContent =
            "La presentación y el examen deben sumar 100%.";
        return;
    }

    let presentacion = 0;
    let sumaValores = 0;

    for (let i = 0; i < items.length; i++) {
        const notaInput = items[i].querySelector(".nota");
        const valorInput = items[i].querySelector(".valor");

        if (notaInput.value.trim() === "" ||
            valorInput.value.trim() === "") {
            mensaje.textContent =
                `Completa la nota y ponderación de la nota ${i + 1}.`;
            return;
        }

        const nota = Number(notaInput.value);
        const valor = Number(valorInput.value);

        if (!Number.isFinite(nota) || nota < 1 || nota > 7) {
            mensaje.textContent =
                `La nota ${i + 1} debe estar entre 1.0 y 7.0.`;
            return;
        }

        if (!Number.isFinite(valor) || valor < 0 || valor > 100) {
            mensaje.textContent =
                `La ponderación de la nota ${i + 1} debe estar entre 0 y 100%.`;
            return;
        }

        presentacion += nota * (valor / 100);
        sumaValores += valor;
    }

    if (Math.abs(sumaValores - 100) > 0.001) {
        mensaje.textContent =
            `Las ponderaciones de tus notas suman ${sumaValores}%. Deben sumar 100%.`;
        return;
    }

    // La misma fórmula de tu código Python
    const notaNecesaria =
        (notaMinima - presentacion * (pesoPresentacion / 100)) /
        (pesoExamen / 100);

    // Redondear hacia arriba al décimo
    const examen = Math.ceil((notaNecesaria - 1e-10) * 10) / 10;

    promedioEl.textContent = presentacion.toFixed(2);
    notaExamenEl.textContent = examen.toFixed(1);

    if (examen > 7) {
        notaExamenEl.style.color = "var(--rojo)";
        detalleResultado.textContent =
            "Necesitarías más de un 7.0 para alcanzar la nota mínima.";
    } else if (examen <= 1) {
        notaExamenEl.style.color = "var(--verde)";
        detalleResultado.textContent =
            "Ya tienes suficiente promedio para alcanzar la nota mínima, incluso con la nota mínima del examen.";
    } else {
        notaExamenEl.style.color = "var(--verde)";
        detalleResultado.textContent =
            `Tu objetivo es obtener al menos un ${examen.toFixed(1)} en el examen.`;
    }

    resultado.hidden = false;
});

// Configuración inicial
agregarNota(5.2, 50);
agregarNota(4.8, 50);

// Actualizar si cambia la configuración
["notaMinima", "pesoPresentacion", "pesoExamen"].forEach(id => {
    document.getElementById(id).addEventListener("input", limpiarResultado);
});
