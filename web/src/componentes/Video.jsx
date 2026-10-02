// Espaço do vídeo 9:16. Com post publicado vira link para ele.
export function Video({ rotulo, href, altura }) {
  const estilo = altura ? { minHeight: altura } : undefined;
  if (href) {
    return (
      <a className="video" href={href} target="_blank" rel="noopener noreferrer" style={estilo}>
        ▶ {rotulo}
      </a>
    );
  }
  return (
    <div className="video" style={estilo} role="img" aria-label={rotulo}>
      {rotulo}
    </div>
  );
}
