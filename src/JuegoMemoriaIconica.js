import React, { useState, useEffect, useRef } from "react";

// === DATOS ===
const sujetos = ["El gato", "La niña", "El perro", "El maestro", "El niño"];
const verbos = ["corre", "come", "juega", "salta", "lee", "escribe", "camina"];
const lugares = ["en el parque", "en casa", "en la escuela", "en la calle"];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function JuegoMemoriaIconica() {
  const [nombre, setNombre] = useState("");
  const [started, setStarted] = useState(false);
  const [sujeto, setSujeto] = useState("");
  const [verbo, setVerbo] = useState("");
  const [lugar, setLugar] = useState("");
  const [mostrar, setMostrar] = useState(true);
  const [pregunta, setPregunta] = useState("");
  const [opciones, setOpciones] = useState([]);
  const [correcta, setCorrecta] = useState("");
  const [puntos, setPuntos] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [nivel, setNivel] = useState(1);
  const [tiempoExpo, setTiempoExpo] = useState(2000);
  const [racha, setRacha] = useState(0);
  const [tiempoTotal, setTiempoTotal] = useState(0);

  const [ranking, setRanking] = useState(() => {
    const data = localStorage.getItem("ranking");
    return data ? JSON.parse(data) : [];
  });

  const inicioTiempoRef = useRef(0);

  function generarRonda() {
    const s = getRandom(sujetos);
    const v = getRandom(verbos);
    const l = getRandom(lugares);

    setSujeto(s);
    setVerbo(v);
    setLugar(l);
    setMostrar(true);

    setTimeout(() => {
      setMostrar(false);
      generarPregunta(s, v, l);
      inicioTiempoRef.current = Date.now();
    }, tiempoExpo);
  }

  function generarPregunta(s, v, l) {
    const tipo = Math.floor(Math.random() * 3);

    if (tipo === 0) {
      setPregunta(`¿Quién ${v}?`);
      setCorrecta(s);
      setOpciones([s, getRandom(sujetos), getRandom(sujetos)]);
    } else if (tipo === 1) {
      setPregunta(`¿Dónde ${s} ${v}?`);
      setCorrecta(l);
      setOpciones([l, getRandom(lugares), getRandom(lugares)]);
    } else {
      setPregunta(`¿Qué hace ${s}?`);
      setCorrecta(v);
      setOpciones([v, getRandom(verbos), getRandom(verbos)]);
    }
  }

  function responder(op) {
    const tiempoRespuesta = Date.now() - inicioTiempoRef.current;
    setTiempoTotal((t) => t + tiempoRespuesta);

    if (op === correcta) {
      setPuntos((p) => p + 3);

      setRacha((r) => {
        const nueva = r + 1;
        if (nueva === 5) {
          setVidas((v) => v + 1);
          return 0;
        }
        return nueva;
      });

      setTiempoExpo((t) => Math.max(800, t - 200));

      if (nivel === 1 && puntos > 15) setNivel(2);
      if (nivel === 2 && puntos > 30) setNivel(3);
    } else {
      setVidas((v) => v - 1);
      setRacha(0);
      setTiempoExpo((t) => t + 200);
    }

    generarRonda();
  }

  function finalizarJuego() {
    const pf = Math.pow(puntos, 4) / (tiempoTotal || 1);
    const nuevo = [...ranking, { nombre, puntos, tiempoTotal, pf }];
    localStorage.setItem("ranking", JSON.stringify(nuevo));
    setRanking(nuevo);
  }

  useEffect(() => {
    if (started) generarRonda();
  }, [started]);

  useEffect(() => {
    if (vidas <= 0) finalizarJuego();
  }, [vidas]);

  if (!started) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h1>Maestría / Curso Neurociencias Cognoscitivas</h1>
        <h2>Alumno: Yasmani Huaman</h2>
        <h2>Juego de Memoria Icónica</h2>

        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <br />

        <button onClick={() => setStarted(true)}>Iniciar</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>{nombre}</div>
        <div>Puntos: {puntos}</div>
        <div>Vidas: {vidas}</div>
        <div>Nivel: {nivel}</div>
        <div>Tiempo: {(tiempoTotal / 1000).toFixed(2)}s</div>
      </div>

      {vidas > 0 && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {mostrar ? (
            <h2>{`${sujeto} ${verbo} ${lugar}`}</h2>
          ) : (
            <div>
              <p>{pregunta}</p>

              {nivel === 1 &&
                opciones.map((op, i) => (
                  <button key={i} onClick={() => responder(op)}>
                    {op}
                  </button>
                ))}

              {nivel >= 2 &&
                opciones.map((_, i) => (
                  <button key={i} onClick={() => responder(opciones[i])}>
                    {i + 1}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {vidas <= 0 && (
        <div style={{ textAlign: "center" }}>
          <h2>Juego terminado</h2>
          <p>Tiempo total: {(tiempoTotal / 1000).toFixed(2)}s</p>

          <h3>Ranking:</h3>
          {ranking
            .sort((a, b) => b.pf - a.pf)
            .map((r, i) => (
              <p key={i}>
                {i + 1}. {r.nombre} - {r.pf.toFixed(2)}
              </p>
            ))}

          <button onClick={() => window.location.reload()}>
            Intentar nuevamente
          </button>

          <button onClick={() => setStarted(false)}>Finalizar</button>
        </div>
      )}
    </div>
  );
}
