import { useEffect, useState } from 'react';
import './App.css';

const idiomas = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'Inglés' },
  { code: 'fr', name: 'Francés' },
  { code: 'pt', name: 'Portugués' },
  { code: 'it', name: 'Italiano' }
];

function App() {
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState('');
  const [origen, setOrigen] = useState('es');
  const [destino, setDestino] = useState('en');
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const data =
      JSON.parse(localStorage.getItem('historialTraducciones')) || [];

    setHistorial(data);
  }, []);

  const guardarHistorial = (nuevo) => {
    const actualizado = [nuevo, ...historial].slice(0, 5);

    setHistorial(actualizado);

    localStorage.setItem(
      'historialTraducciones',
      JSON.stringify(actualizado)
    );
  };

  const traducirTexto = async () => {
    if (!texto.trim()) {
      alert('Escribe un texto para traducir');
      return;
    }

    try {
      setCargando(true);

      const url =
        `https://translate.googleapis.com/translate_a/single?client=gtx` +
        `&sl=${origen}` +
        `&tl=${destino}` +
        `&dt=t&q=${encodeURIComponent(texto)}`;

      const respuesta = await fetch(url);

      const datos = await respuesta.json();

      const traduccion = datos[0]
        .map((item) => item[0])
        .join('');

      setResultado(traduccion);

      guardarHistorial({
        original: texto,
        traducido: traduccion,
        origen,
        destino,
        fecha: new Date().toLocaleString()
      });

    } catch (error) {
      console.error(error);

      alert('Error al traducir. Revisa tu conexión.');
    } finally {
      setCargando(false);
    }
  };

  const escucharTraduccion = () => {
    if (!resultado) return;

    speechSynthesis.cancel();

    const voz = new SpeechSynthesisUtterance(resultado);

    voz.lang =
      destino === 'en'
        ? 'en-US'
        : destino === 'fr'
        ? 'fr-FR'
        : destino === 'pt'
        ? 'pt-PT'
        : destino === 'it'
        ? 'it-IT'
        : 'es-ES';

    voz.rate = 1;
    voz.pitch = 1;

    speechSynthesis.speak(voz);
  };

  const reconocerVoz = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    const reconocimiento = new SpeechRecognition();

    reconocimiento.lang =
      origen === 'en'
        ? 'en-US'
        : origen === 'fr'
        ? 'fr-FR'
        : origen === 'pt'
        ? 'pt-PT'
        : origen === 'it'
        ? 'it-IT'
        : 'es-ES';

    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;

    reconocimiento.start();

    reconocimiento.onstart = () => {
      console.log('Micrófono activado');
    };

    reconocimiento.onresult = (event) => {
      const textoDetectado =
        event.results[0][0].transcript;

      setTexto(textoDetectado);
    };

    reconocimiento.onerror = (event) => {
      console.error(event.error);

      if (event.error === 'not-allowed') {
        alert('Debes permitir el acceso al micrófono');
      } else {
        alert('No se pudo reconocer la voz');
      }
    };
  };

  const limpiar = () => {
    setTexto('');
    setResultado('');
  };

  return (
    <div className="app">
      <div className="card">

        <h1>Traductor IA</h1>

        <p className="subtitulo">
          Aplicación PWA de traducción inteligente
        </p>

        <div className="idiomas">

          <select
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
          >
            {idiomas.map((idioma) => (
              <option
                key={idioma.code}
                value={idioma.code}
              >
                {idioma.name}
              </option>
            ))}
          </select>

          <button
            className="btn-cambiar"
            onClick={() => {
              setOrigen(destino);
              setDestino(origen);

              setTexto(resultado);
              setResultado(texto);
            }}
          >
            ⇄
          </button>

          <select
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
          >
            {idiomas.map((idioma) => (
              <option
                key={idioma.code}
                value={idioma.code}
              >
                {idioma.name}
              </option>
            ))}
          </select>

        </div>

        <textarea
          placeholder="Escribe el texto a traducir..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />

        <div className="acciones">

          <button
            onClick={traducirTexto}
            disabled={cargando}
          >
            {cargando
              ? 'Traduciendo...'
              : 'Traducir'}
          </button>

          <button
            className="secundario"
            onClick={reconocerVoz}
          >
            🎙️ Voz
          </button>

          <button
            className="limpiar"
            onClick={limpiar}
          >
            Limpiar
          </button>

        </div>

        <div className="resultado">

          <span>Resultado</span>

          <p>
            {resultado ||
              'La traducción aparecerá aquí'}
          </p>

          <button
            onClick={escucharTraduccion}
            disabled={!resultado}
          >
            🔊 Escuchar traducción
          </button>

        </div>

        <div className="historial">

          <h3>Últimas traducciones</h3>

          {historial.length === 0 ? (
            <p className="vacio">
              Aún no hay historial
            </p>
          ) : (
            historial.map((item, index) => (
              <div
                className="item"
                key={index}
              >
                <strong>
                  {item.original}
                </strong>

                <span>
                  {item.traducido}
                </span>
              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
}

export default App;