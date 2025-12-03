// ====== ELEMENTOS ======
const mensaje = document.getElementById('mensaje');
const charCount = document.querySelector('.char-count');
const matrizMensaje = document.getElementById('matrizMensaje');
const k11 = document.getElementById('k11');
const k12 = document.getElementById('k12');
const k21 = document.getElementById('k21');
const k22 = document.getElementById('k22');
const btnEnc = document.getElementById('encriptar');
const btnDec = document.getElementById('desencriptar');
const resultado = document.getElementById('resultado');
const particlesContainer = document.getElementById('particles');

let lastPadAdded = false; // seguirá siendo usado para el caso "local"
const STORAGE_KEY = 'hill_last_encrypted'; // sessionStorage key

// ----------------- Helpers -----------------
function limpiarTexto(t){
  return t.toUpperCase().replace(/[^A-Z]/g,'');
}

function contarLetras(texto){
  return texto.replace(/[^A-Za-z]/g,'').length;
}

function modInverse(a, m){
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++){
    if ((a * x) % m === 1) return x;
  }
  return null;
}

function leerClave(){
  const a = parseInt(k11.value,10);
  const b = parseInt(k12.value,10);
  const c = parseInt(k21.value,10);
  const d = parseInt(k22.value,10);
  if ([a,b,c,d].some(v => Number.isNaN(v))) throw new Error('Introduce los 4 valores numéricos de la matriz clave.');
  return [[a,b],[c,d]];
}

function obtenerMatrizInversa(key){
  let det = key[0][0]*key[1][1] - key[0][1]*key[1][0];
  det = ((det % 26) + 26) % 26;
  const invDet = modInverse(det, 26);
  if (invDet === null) throw new Error(`Determinante = ${det} no invertible módulo 26.`);

  const adj = [[key[1][1], -key[0][1]], [-key[1][0], key[0][0]]];
  const inv = [
    [ (adj[0][0]*invDet) % 26, (adj[0][1]*invDet) % 26 ],
    [ (adj[1][0]*invDet) % 26, (adj[1][1]*invDet) % 26 ]
  ];
  for (let i=0;i<2;i++) for (let j=0;j<2;j++) inv[i][j] = ((inv[i][j] % 26) + 26) % 26;
  return inv;
}

// ----------------- Formato (extraer letras y mapa) -----------------
function extraerLetrasConFormato(texto){
  const letrasArr = [];
  const mapa = [];
  for (let i=0;i<texto.length;i++){
    const ch = texto[i];
    if (/[A-Za-z]/.test(ch)){
      letrasArr.push(ch.toUpperCase());
      mapa.push({index: i, upper: (ch === ch.toUpperCase())});
    }
  }
  return {letras: letrasArr.join(''), mapa};
}

function reconstruirTexto(original, mapa, letrasDes){
  const arr = original.split('');
  for (let i=0;i<mapa.length;i++){
    if (i >= letrasDes.length) break;
    let ch = letrasDes[i];
    if (!mapa[i].upper) ch = ch.toLowerCase();
    arr[mapa[i].index] = ch;
  }
  return arr.join('');
}

// ----------------- Mostrar matriz del mensaje -----------------
function mostrarMatrizMensaje(){
  if (!matrizMensaje) return;
  const textoOriginal = mensaje.value || '';
  const {letras} = extraerLetrasConFormato(textoOriginal);
  if (letras.length === 0){
    matrizMensaje.textContent = 'Escribe un mensaje primero...';
    return;
  }

  const cantidadLetras = contarLetras(textoOriginal);
  const necesitaPadding = (cantidadLetras % 2 !== 0);
  const letrasConPadding = necesitaPadding ? letras + 'X' : letras;
  const valores = letrasConPadding.split('').map(c => c.charCodeAt(0) - 65);

  let s = '[';
  for (let i=0;i<valores.length;i+=2){
    if (i>0) s += ' ';
    s += '[' + valores[i] + ', ' + valores[i+1] + ']';
  }
  s += ']';
  if (necesitaPadding) s += ' (con padding X)';
  matrizMensaje.textContent = s;
}

// ----------------- Contador -----------------
if (mensaje && charCount){
  mensaje.addEventListener('input', () => {
    charCount.textContent = `${mensaje.value.length}/30`;
    mostrarMatrizMensaje();
  });
  mostrarMatrizMensaje();
}

// ----------------- UTIL para inyectar toggle (opcional) -----------------
function asegurarTogglePadding(){
  // Si ya existe, no la duplicamos
  if (document.getElementById('padding-toggle')) return;
  const div = document.createElement('div');
  div.className = 'padding-toggle';
  div.id = 'padding-toggle';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'force-remove-x';
  checkbox.style.width = '18px';
  checkbox.style.height = '18px';

  const label = document.createElement('label');
  label.htmlFor = 'force-remove-x';
  label.style.userSelect = 'none';
  label.textContent = 'Quitar padding final (X)';

  div.appendChild(checkbox);
  div.appendChild(label);

  // Insert near los botones (si están)
  const btnGroup = document.querySelector('.button-group');
  if (btnGroup) btnGroup.appendChild(div);
  else document.body.appendChild(div); // fallback
}

// ----------------- Encriptar -----------------
if (btnEnc){
  btnEnc.addEventListener('click', () => {
    try {
      const key = leerClave();
      let det = key[0][0]*key[1][1] - key[0][1]*key[1][0];
      det = ((det % 26) + 26) % 26;
      if (modInverse(det,26) === null) throw new Error(`Determinante = ${det} no invertible en módulo 26.`);

      const texto = mensaje.value || '';
      if (!texto.trim()) throw new Error('Escribe un mensaje a encriptar.');

      const {letras, mapa} = extraerLetrasConFormato(texto);
      if (letras.length === 0) throw new Error('No hay letras para cifrar.');

      const cantidadLetras = contarLetras(texto);
      lastPadAdded = (cantidadLetras % 2 !== 0);
      const letrasConPadding = lastPadAdded ? letras + 'X' : letras;
      const nums = letrasConPadding.split('').map(c => c.charCodeAt(0)-65);

      let cifradoLetras = '';
      for (let i=0;i<nums.length;i+=2){
        const x1 = nums[i], x2 = nums[i+1];
        let y1 = key[0][0]*x1 + key[0][1]*x2;
        let y2 = key[1][0]*x1 + key[1][1]*x2;
        y1 = ((y1%26)+26)%26;
        y2 = ((y2%26)+26)%26;
        cifradoLetras += String.fromCharCode(65+y1) + String.fromCharCode(65+y2);
      }

      const final = reconstruirTexto(texto, mapa, cifradoLetras);
      resultado.classList.remove('error'); resultado.classList.add('success');
      resultado.textContent = final;

      // Guardamos en sessionStorage para permitir desencriptar localmente
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ cipher: final, padded: lastPadAdded }));
      } catch(e){ /* ignore storage errors */ }

      // actualizar vista
      mostrarMatrizMensaje();
      asegurarTogglePadding();
    } catch (err){
      resultado.classList.remove('success'); resultado.classList.add('error');
      resultado.textContent = 'Error: ' + err.message;
    }
  });
}

// ----------------- Desencriptar -----------------
if (btnDec){
  btnDec.addEventListener('click', () => {
    try {
      const key = leerClave();
      let det = key[0][0]*key[1][1] - key[0][1]*key[1][0];
      det = ((det % 26) + 26) % 26;
      if (modInverse(det,26) === null) throw new Error(`Determinante = ${det} no invertible en módulo 26.`);

      const inv = obtenerMatrizInversa(key);
      const texto = mensaje.value || '';
      if (!texto.trim()) throw new Error('Escribe el texto encriptado en el campo mensaje para desencriptar.');

      const {letras, mapa} = extraerLetrasConFormato(texto);
      if (letras.length === 0) throw new Error('No hay letras para desencriptar.');
      if (letras.length % 2 !== 0) throw new Error('El texto encriptado debe contener un número par de letras.');

      const nums = letras.split('').map(c => c.charCodeAt(0)-65);
      let descLetras = '';
      for (let i=0;i<nums.length;i+=2){
        const y1 = nums[i], y2 = nums[i+1];
        let x1 = inv[0][0]*y1 + inv[0][1]*y2;
        let x2 = inv[1][0]*y1 + inv[1][1]*y2;
        x1 = ((x1%26)+26)%26;
        x2 = ((x2%26)+26)%26;
        descLetras += String.fromCharCode(65+x1) + String.fromCharCode(65+x2);
      }

      // Lógica segura para quitar padding:
      let removeX = false;
      try {
        const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
        if (stored && stored.cipher && stored.cipher === texto) {
          // Si el texto coincide con el último cifrado que generamos, respetamos su flag
          if (stored.padded && descLetras.endsWith('X')) removeX = true;
        } else {
          // No coincide: ofrecemos la opción visual y usamos la casilla si el usuario la marcó
          asegurarTogglePadding();
          const chk = document.getElementById('force-remove-x');
          if (chk && chk.checked && descLetras.endsWith('X')) removeX = true;
        }
      } catch(e){ /* ignore storage/parse errors */ }

      if (removeX) descLetras = descLetras.slice(0, -1);

      // reconstruir con mayúsculas/minúsculas y caracteres no alfa
      const final = reconstruirTexto(texto, mapa, descLetras);
      resultado.classList.remove('error'); resultado.classList.add('success');
      resultado.textContent = final;

      // limpiamos indicador temporal (la eliminación posterior debería ser explícita por el usuario si lo desea)
      lastPadAdded = false;
      mostrarMatrizMensaje();
    } catch (err) {
      resultado.classList.remove('success'); resultado.classList.add('error');
      resultado.textContent = 'Error: ' + err.message;
    }
  });
}

// ----------------- Partículas (efecto visual) -----------------
function crearParticulas(){
  const container = particlesContainer;
  if (!container) return;
  const particleCount = 16;
  for (let i = 0; i < particleCount; i++){
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random()*56 + 18;
    const posX = Math.random()*100;
    const posY = Math.random()*100;
    const delay = Math.random()*6;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${posX}%`;
    p.style.top = `${posY}%`;
    p.style.opacity = (Math.random()*0.12 + 0.02).toString();
    p.style.animationDelay = `${delay}s`;
    container.appendChild(p);
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', crearParticulas);
else crearParticulas();
