export function Passos({ passos, resultado, rotuloResultado = 'Resposta' }) {
  return (
    <div className="passos">
      {passos.map((p, i) => (
        <div className="passo" key={i}>
          <span className="n">{i + 1}</span>
          <span className="texto">{p.texto}</span>
          {p.conta ? <span className="conta">{p.conta}</span> : <span />}
        </div>
      ))}
      {resultado && (
        <div className="passo resultado">
          <span className="n">=</span>
          <span className="texto">{rotuloResultado}</span>
          <span className="conta">{resultado}</span>
        </div>
      )}
    </div>
  );
}
