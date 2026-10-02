import { num } from '@edukan/conteudo';

function passoBonito(intervalo) {
  const bruto = intervalo / 4;
  const mag = 10 ** Math.floor(Math.log10(bruto));
  const n = bruto / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}

function Barras({ titulo, rotulos, valores, eixoMin = 0 }) {
  const L = 520;
  const A = 260;
  const m = { esq: 52, dir: 12, topo: 28, base: 34 };
  const passo = passoBonito(Math.max(...valores) - eixoMin || 1);
  const topo = Math.ceil(Math.max(...valores) / passo) * passo;
  const y = (v) => m.topo + (A - m.topo - m.base) * (1 - (v - eixoMin) / (topo - eixoMin));
  const largura = (L - m.esq - m.dir) / valores.length;
  const marcas = [];
  for (let v = eixoMin; v <= topo + 1e-9; v += passo) marcas.push(v);
  return (
    <figure className="grafico">
      <figcaption>{titulo}</figcaption>
      <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label={`${titulo}: ${rotulos.map((r, i) => `${r} ${num(valores[i])}`).join(', ')}`}>
        {marcas.map((v) => (
          <g key={v}>
            <line x1={m.esq} x2={L - m.dir} y1={y(v)} y2={y(v)} stroke="#d7d3d3" strokeWidth="1" />
            <text x={m.esq - 8} y={y(v) + 4} fontSize="14" textAnchor="end">
              {num(v)}
            </text>
          </g>
        ))}
        {valores.map((v, i) => {
          const x = m.esq + i * largura + largura * 0.18;
          const w = largura * 0.64;
          return (
            <g key={i}>
              <rect x={x} y={y(v)} width={w} height={y(eixoMin) - y(v)} fill="#201e1d" />
              <text x={x + w / 2} y={y(v) - 6} fontSize="15" fontWeight="600" textAnchor="middle">
                {num(v)}
              </text>
              <text x={x + w / 2} y={A - 8} fontSize="15" textAnchor="middle">
                {rotulos[i]}
              </text>
            </g>
          );
        })}
        <line x1={m.esq} x2={m.esq} y1={m.topo - 8} y2={y(eixoMin)} stroke="#201e1d" strokeWidth="2" />
        <line x1={m.esq} x2={L - m.dir} y1={y(eixoMin)} y2={y(eixoMin)} stroke="#201e1d" strokeWidth="2" />
      </svg>
    </figure>
  );
}

const CORES = ['#ec3013', '#201e1d', '#bab6b6', '#7d7979'];

function Setores({ titulo, rotulos, valores }) {
  const total = valores.reduce((a, b) => a + b, 0);
  const r = 90;
  const c = 110;
  let angulo = -Math.PI / 2;
  const fatias = valores.map((v, i) => {
    const a0 = angulo;
    const a1 = angulo + (v / total) * Math.PI * 2;
    angulo = a1;
    const grande = a1 - a0 > Math.PI ? 1 : 0;
    const p0 = [c + r * Math.cos(a0), c + r * Math.sin(a0)];
    const p1 = [c + r * Math.cos(a1), c + r * Math.sin(a1)];
    return <path key={i} d={`M${c},${c} L${p0[0]},${p0[1]} A${r},${r} 0 ${grande} 1 ${p1[0]},${p1[1]} Z`} fill={CORES[i % CORES.length]} stroke="#fff" strokeWidth="2" />;
  });
  return (
    <figure className="grafico">
      <figcaption>{titulo}</figcaption>
      <svg viewBox="0 0 440 220" role="img" aria-label={`${titulo}: ${rotulos.map((rt, i) => `${rt} ${num(valores[i])}%`).join(', ')}`}>
        {fatias}
        {rotulos.map((rt, i) => (
          <g key={rt} transform={`translate(240, ${60 + i * 34})`}>
            <rect width="16" height="16" fill={CORES[i % CORES.length]} />
            <text x="26" y="13" fontSize="15">
              {rt}: {num(valores[i])}%
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

export function Grafico({ grafico }) {
  if (!grafico) return null;
  return grafico.tipo === 'setores' ? <Setores {...grafico} /> : <Barras {...grafico} />;
}
