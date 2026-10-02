/* =====================================================
   CONTENT
   Todo el contenido "real" del sitio vive acá. Para
   personalizar el sitio después, alcanza con editar
   este objeto — el resto del código no necesita tocarse.
===================================================== */
const CONTENT = {
  nombre: "Mafer",
  fotos: [
    { src: "fotos/foto1.jpg", caption: "Selfie infaltable" },
    { src: "fotos/foto2.jpg", caption: "Girl gym" },
    { src: "fotos/foto3.jpg", caption: "Un pedacito de universo" },
    { src: "fotos/foto4.jpg", caption: "Sexy" },
    { src: "fotos/foto5.jpg", caption: "Modelo" },
    { src: "fotos/foto6.jpg", caption: "Moto mami" },
    { src: "fotos/foto7.jpg", caption: "Post-entreno" },
    { src: "fotos/foto8.jpg", caption: "Te quiero" }
  ],
  quiz: {
    vf: [
      { respuesta: true },
      { respuesta: false }
    ],
    mc: [
      { correcta: "b" },
      { correcta: "a" }
    ]
  },
  carta: `Querida Mafer:

Si Snoopy nos enseñó algo, es que no hay sueño demasiado grande cuando se tiene carácter, imaginación y ganas de mirar siempre hacia adelante. Me encanta tu forma de ser, tus ganas de comerte el mundo y lo fácil que es sonreír cada vez que hablo contigo.

Que la vida venga llena de tus aventuras favoritas: rutas en moto, naturaleza pura, tu música sonando de fondo y, sobre todo, que logres cada una de las metas que me has contado.

Feliz cumpleaños. Te mando un beso inolvidable de esos que se quedan grabados. 🐾`,
  firma: "Con cariño, Snoopy 🐾"
};

// Aplicamos el nombre en el hero apenas carga la página
document.getElementById("nombre-hero").textContent = CONTENT.nombre;

/* =====================================================
   NAVEGACIÓN ENTRE SECCIONES
   Cualquier botón con data-goto="id" hace scroll suave
   a la sección con ese id.
===================================================== */
document.querySelectorAll("[data-goto]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.getElementById(btn.dataset.goto).scrollIntoView({behavior:"smooth"});
  });
});

/* =====================================================
   SECCIÓN 2: GALERÍA — se arma desde CONTENT.fotos
===================================================== */
const grid = document.getElementById("polaroid-grid");
CONTENT.fotos.forEach((foto, i)=>{
  const card = document.createElement("div");
  // reveal-delay-1..8 en ciclo: cada foto aparece un poquito después que
  // la anterior en vez de que salten las 8 juntas de golpe.
  const delayClass = "reveal-delay-" + ((i % 8) + 1);
  card.className = `polaroid reveal ${delayClass}`;
  card.innerHTML = `
    <div class="photo-slot">
      <img src="${foto.src}" alt="${foto.caption}" loading="lazy">
    </div>
    <div class="caption">${foto.caption}</div>
  `;
  grid.appendChild(card);
});

/* =====================================================
   SECCIÓN 3: QUIZ
===================================================== */
const steps = Array.from(document.querySelectorAll(".quiz-step"));
let currentStep = 1;
const totalSteps = steps.length; // incluye el paso de resultado
const answers = { vf: [null, null], mc: [null, null] };

// Insertamos los puntitos de progreso (uno por cada paso, salvo el resultado)
const progressWrap = document.getElementById("quiz-progress");
for(let i=1; i<totalSteps; i++){
  const dot = document.createElement("div");
  dot.className = "dot" + (i===1 ? " active" : "");
  dot.dataset.step = i;
  progressWrap.appendChild(dot);
}

function updateProgress(){
  progressWrap.querySelectorAll(".dot").forEach(dot=>{
    const s = parseInt(dot.dataset.step);
    dot.classList.toggle("active", s === currentStep);
    dot.classList.toggle("done", s < currentStep);
  });
}

function showStep(n){
  steps.forEach(step=> step.classList.toggle("active", parseInt(step.dataset.step) === n));
  document.getElementById("btn-atras").style.visibility = n === 1 ? "hidden" : "visible";
  const nextBtn = document.getElementById("btn-siguiente");
  const navBar = document.querySelector(".quiz-nav");
  if(n === totalSteps){
    navBar.style.display = "none";
    document.getElementById("btn-ver-carta").style.display = "inline-block";
    calcularPuntaje();
  } else {
    navBar.style.display = "flex";
    nextBtn.textContent = n === totalSteps - 1 ? "Ver resultado →" : "Siguiente →";
  }
  if(n <= totalSteps - 1) updateProgress();
}

// Selección de opciones Verdadero/Falso y Múltiple choice: funciona igual
// para ambos tipos, guardando la respuesta en el objeto `answers`.
function wireOptionGroup(containerId, groupArray, index){
  const container = document.getElementById(containerId);
  container.querySelectorAll(".option").forEach(opt=>{
    opt.addEventListener("click", ()=>{
      container.querySelectorAll(".option").forEach(o=>o.classList.remove("selected"));
      opt.classList.add("selected");
      let val = opt.dataset.value;
      if(val === "true") val = true;
      if(val === "false") val = false;
      groupArray[index] = val;
    });
  });
}
wireOptionGroup("vf1-options", answers.vf, 0);
wireOptionGroup("vf2-options", answers.vf, 1);
wireOptionGroup("mc1-options", answers.mc, 0);
wireOptionGroup("mc2-options", answers.mc, 1);

function calcularPuntaje(){
  let score = 0;
  if(answers.vf[0] === CONTENT.quiz.vf[0].respuesta) score++;
  if(answers.vf[1] === CONTENT.quiz.vf[1].respuesta) score++;
  if(answers.mc[0] === CONTENT.quiz.mc[0].correcta) score++;
  if(answers.mc[1] === CONTENT.quiz.mc[1].correcta) score++;
  document.getElementById("resultado-puntaje").textContent = score;
  const nombre = document.getElementById("input-nombre").value.trim();
  document.getElementById("resultado-nombre").textContent = nombre || "amigo/a";
}

document.getElementById("btn-siguiente").addEventListener("click", ()=>{
  if(currentStep < totalSteps){ currentStep++; showStep(currentStep); }
});
document.getElementById("btn-atras").addEventListener("click", ()=>{
  if(currentStep > 1){ currentStep--; showStep(currentStep); }
});
showStep(currentStep);

/* =====================================================
   SECCIÓN 3 (PASO 4): CANVAS DE DIBUJO
   Soporta mouse Y touch (celular) con las mismas funciones.
===================================================== */
const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 6;
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.strokeStyle = "#1A1A1A";
let drawing = false;
let currentColor = "#1A1A1A";

// Convierte la posición del mouse o del dedo a coordenadas reales dentro
// del canvas, considerando que en CSS el canvas se escala con "width:100%"
// pero su resolución interna es fija (600x360). Sin esto, en celular el
// dibujo quedaría desalineado del dedo.
function getPos(e){
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const point = e.touches ? e.touches[0] : e;
  return {
    x: (point.clientX - rect.left) * scaleX,
    y: (point.clientY - rect.top) * scaleY
  };
}

function startDraw(e){
  drawing = true;
  const p = getPos(e);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  e.preventDefault();
}
function moveDraw(e){
  if(!drawing) return;
  const p = getPos(e);
  ctx.strokeStyle = currentColor;
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  e.preventDefault();
}
function endDraw(){ drawing = false; }

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", moveDraw);
window.addEventListener("mouseup", endDraw);
canvas.addEventListener("touchstart", startDraw, { passive:false });
canvas.addEventListener("touchmove", moveDraw, { passive:false });
canvas.addEventListener("touchend", endDraw);

document.querySelectorAll(".swatch").forEach(sw=>{
  sw.addEventListener("click", ()=>{
    document.querySelectorAll(".swatch").forEach(s=>s.classList.remove("active"));
    sw.classList.add("active");
    currentColor = sw.dataset.color;
  });
});
document.getElementById("btn-clear-canvas").addEventListener("click", ()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
});

/* =====================================================
   SECCIÓN 4: SOBRE + CARTA + CONFETI
===================================================== */
const envelope = document.getElementById("envelope");
const letterPaper = document.getElementById("letter-paper");
const envelopeHint = document.getElementById("envelope-hint");
let envelopeOpened = false;

envelope.addEventListener("click", ()=>{
  if(envelopeOpened) return;
  envelopeOpened = true;
  envelope.classList.add("open");
  envelopeHint.style.display = "none";

  setTimeout(()=>{
    letterPaper.innerHTML = `${CONTENT.carta}<div class="signature">${CONTENT.firma}</div>`;
    letterPaper.classList.add("visible");
    launchConfetti();
  }, 500);
});

// Confeti simple hecho a mano en canvas, sin librerías externas.
const confettiCanvas = document.getElementById("confetti-canvas");
const cctx = confettiCanvas.getContext("2d");
function resizeConfettiCanvas(){
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeConfettiCanvas();
window.addEventListener("resize", resizeConfettiCanvas);

const confettiColors = ["#D6291F", "#F5C242", "#8FC1E3", "#4E9F5B", "#1A1A1A"];

function launchConfetti(){
  const pieces = Array.from({length: 140}, ()=>({
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * confettiCanvas.height * 0.5,
    size: 5 + Math.random() * 6,
    color: confettiColors[Math.floor(Math.random()*confettiColors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: (Math.random() - 0.5) * 2,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 10
  }));

  let frame = 0;
  const maxFrames = 260;

  function tick(){
    frame++;
    cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    pieces.forEach(p=>{
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;
      cctx.save();
      cctx.translate(p.x, p.y);
      cctx.rotate(p.rotation * Math.PI/180);
      cctx.fillStyle = p.color;
      cctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      cctx.restore();
    });
    if(frame < maxFrames){
      requestAnimationFrame(tick);
    } else {
      cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    }
  }
  requestAnimationFrame(tick);
}

/* =====================================================
   REVELADO PROGRESIVO AL HACER SCROLL
   En vez de que el contenido de la sección aparezca todo
   junto apenas se llega (algunas secciones entran enteras
   en la pantalla), cada elemento con clase .reveal arranca
   invisible y se le agrega .is-visible recién cuando entra
   en pantalla. threshold 0.15 = se dispara cuando el 15%
   del elemento ya es visible, para que no haga falta
   esperar a verlo completo. Cada elemento se revela una
   sola vez (unobserve) — no vuelve a ocultarse si el
   usuario sube y baja de nuevo.
===================================================== */
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal").forEach(el=> revealObserver.observe(el));

// La galería arma sus tarjetas después de este punto en el archivo, así
// que sus .reveal ya estaban en el DOM cuando se ejecuta lo de arriba
// (todo este script corre en orden, y la galería se arma más arriba).
// Igual, por si en el futuro se agrega contenido dinámico después de
// este bloque, este pequeño helper queda disponible para re-observar:
function observeReveals(container = document){
  container.querySelectorAll(".reveal:not(.is-visible)").forEach(el=>{
    revealObserver.observe(el);
  });
}
