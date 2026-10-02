// Texto com trechos **em destaque** (o fichário marca assim a palavra-chave).
export function Destaque({ texto }) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith('**') && parte.endsWith('**') ? <strong key={i}>{parte.slice(2, -2)}</strong> : parte,
  );
}
