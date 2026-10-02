// Confere por código as contas escritas em texto ("200 × 0,90 = 180").
// Regra de qualidade 2 do guia: toda conta que aparece no fichário, no
// roteiro ou na resposta do tutor é recalculada antes de ir ao ar.
//
// Aceita números no formato brasileiro (1.000,50), + − × · ÷ / ^, expoentes
// sobrescritos (3⁴), parênteses, raiz (√), porcentagem (30%) e fatorial (4!).
// "=" exige igualdade; "≈" aceita meia unidade da última casa à direita.

const SOBRESCRITOS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const RE_NUMERO = /^(?:\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?)/;
const SIMBOLOS = new Set(['+', '−', '-', '×', '·', '*', '÷', '/', '^', '(', ')', '%', '!', '√', '=', '≈', '≠']);

function tokenizar(texto) {
  const tokens = [];
  let i = 0;
  while (i < texto.length) {
    const c = texto[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const m = RE_NUMERO.exec(texto.slice(i));
    if (m) {
      const bruto = m[0];
      tokens.push({ tipo: 'num', valor: Number(bruto.replace(/\./g, '').replace(',', '.')), bruto });
      i += bruto.length;
      continue;
    }
    if (SOBRESCRITOS.includes(c)) {
      let s = '';
      while (i < texto.length && SOBRESCRITOS.includes(texto[i])) s += SOBRESCRITOS.indexOf(texto[i++]);
      tokens.push({ tipo: 'sup', valor: Number(s) });
      continue;
    }
    if (SIMBOLOS.has(c)) {
      tokens.push({ tipo: 'op', valor: c === '-' ? '−' : c === '·' || c === '*' ? '×' : c === '/' ? '÷' : c });
      i++;
      continue;
    }
    throw new Error(`caractere inesperado "${c}"`);
  }
  return tokens;
}

function fatorial(n) {
  if (!Number.isInteger(n) || n < 0 || n > 170) throw new Error('fatorial inválido');
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

function avaliarTokens(tokens) {
  let pos = 0;
  const olhar = () => tokens[pos];
  const eOp = (v) => olhar()?.tipo === 'op' && olhar().valor === v;

  function expr() {
    let v = termo();
    while (eOp('+') || eOp('−')) {
      const op = tokens[pos++].valor;
      const d = termo();
      v = op === '+' ? v + d : v - d;
    }
    return v;
  }
  function termo() {
    let v = unario();
    while (eOp('×') || eOp('÷')) {
      const op = tokens[pos++].valor;
      const d = unario();
      if (op === '÷' && d === 0) throw new Error('divisão por zero');
      v = op === '×' ? v * d : v / d;
    }
    return v;
  }
  function unario() {
    if (eOp('−')) {
      pos++;
      return -unario();
    }
    return potencia();
  }
  function potencia() {
    const base = posfixo();
    if (eOp('^')) {
      pos++;
      return base ** unario();
    }
    return base;
  }
  function posfixo() {
    let v = primario();
    for (;;) {
      if (eOp('%')) {
        pos++;
        v /= 100;
      } else if (eOp('!')) {
        pos++;
        v = fatorial(v);
      } else if (olhar()?.tipo === 'sup') {
        v **= tokens[pos++].valor;
      } else return v;
    }
  }
  function primario() {
    const t = olhar();
    if (!t) throw new Error('conta incompleta');
    if (t.tipo === 'num') {
      pos++;
      return t.valor;
    }
    if (eOp('(')) {
      pos++;
      const v = expr();
      if (!eOp(')')) throw new Error('parêntese sem fechar');
      pos++;
      return v;
    }
    if (eOp('√')) {
      pos++;
      return Math.sqrt(primario());
    }
    throw new Error(`símbolo inesperado "${t.valor}"`);
  }

  const v = expr();
  if (pos !== tokens.length) throw new Error('sobrou texto depois da conta');
  return v;
}

export function avaliar(texto) {
  return avaliarTokens(tokenizar(texto));
}

function casasDecimais(tokens) {
  const ultimo = [...tokens].reverse().find((t) => t.tipo === 'num');
  if (!ultimo) return 0;
  const virgula = ultimo.bruto.indexOf(',');
  return virgula < 0 ? 0 : ultimo.bruto.length - virgula - 1;
}

function iguais(a, b) {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

// Retorna { ok, valores, erro, tipoErro }. Uma conta precisa ter ao menos
// um "=", "≈" ou "≠". tipoErro é "sintaxe" (não é uma conta legível) ou
// "valor" (é uma conta, e está errada).
export function verificarConta(conta) {
  const falha = (tipoErro, erro, valores = []) => ({ ok: false, tipoErro, erro, valores });
  let tokens;
  try {
    tokens = tokenizar(conta);
  } catch (e) {
    return falha('sintaxe', e.message);
  }
  const partes = [[]];
  const relacoes = [];
  for (const t of tokens) {
    if (t.tipo === 'op' && (t.valor === '=' || t.valor === '≈' || t.valor === '≠')) {
      relacoes.push(t.valor);
      partes.push([]);
    } else partes[partes.length - 1].push(t);
  }
  if (relacoes.length === 0) return falha('sintaxe', 'sem sinal de igual');
  let valores;
  try {
    valores = partes.map(avaliarTokens);
  } catch (e) {
    return falha('sintaxe', e.message);
  }
  for (let i = 0; i < relacoes.length; i++) {
    const [a, b] = [valores[i], valores[i + 1]];
    const rel = relacoes[i];
    let ok;
    if (rel === '=') ok = iguais(a, b);
    else if (rel === '≠') ok = !iguais(a, b);
    else ok = Math.abs(a - b) <= 0.5 * 10 ** -casasDecimais(partes[i + 1]) + 1e-12;
    if (!ok) return falha('valor', `${conta}: ${a} ${rel === '≠' ? '=' : '≠'} ${b}`, valores);
  }
  return { ok: true, valores };
}

// Acha contas dentro de um texto livre (resposta do tutor, roteiro).
// Pula pedaços de fórmulas com letras ("h(2) = 20", "3/4 = 12/x"): só
// interessa o que é conta numérica do começo ao fim.
const RE_CANDIDATO = /[0-9(√−-][0-9\s.,+\-−×·*÷/^()%!√⁰¹²³⁴⁵⁶⁷⁸⁹=≈≠]*[0-9)%!⁰¹²³⁴⁵⁶⁷⁸⁹]/g;
const RE_TEM_RELACAO = /[=≈≠]/;
const RE_LETRA = /[A-Za-zÀ-ÿ₀-₉ᵢᵥₙ]/;
const RE_OPERADOR = /[+\-−×·*÷/^(=≈≠]/;

function vizinho(texto, i, passo) {
  let j = i;
  while (j >= 0 && j < texto.length && /\s/.test(texto[j])) j += passo;
  return texto[j];
}

export function extrairContas(texto) {
  // "8% de 25" é "8% × 25".
  const limpo = texto
    .replace(/R\$\s?/g, '')
    .replace(/(\d+(?:,\d+)?)% de (\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?)/g, '($1% × $2)');
  const contas = [];
  // ", " e "; " separam itens de uma frase; não são vírgula decimal.
  for (const trecho of limpo.split(/[,;]\s+/)) {
    for (const m of trecho.matchAll(RE_CANDIDATO)) {
      const inicio = m.index;
      const fim = m.index + m[0].length;
      if (RE_LETRA.test(trecho[inicio - 1] ?? '') || RE_LETRA.test(trecho[fim] ?? '')) continue;
      const antes = vizinho(trecho, inicio - 1, -1);
      // "x = 144 ÷ 12 = 12": o lado direito vale sozinho; "… ÷ 2 = 21" não.
      if (antes && antes !== '=' && antes !== '≈' && RE_OPERADOR.test(antes)) continue;
      const depois = vizinho(trecho, fim, 1);
      if (depois && RE_OPERADOR.test(depois)) continue;
      const candidato = m[0].trim();
      if (!RE_TEM_RELACAO.test(candidato)) continue;
      if (candidato.split(/[=≈≠]/).some((l) => !l.trim())) continue;
      contas.push(candidato);
    }
  }
  return contas;
}

// Só reprova contas legíveis e erradas; trechos que não são conta são ignorados.
export function verificarTexto(texto) {
  const contas = extrairContas(texto)
    .map((conta) => {
      const r = verificarConta(conta);
      // "50 ÷ 200 × 100 = 25%": o % final às vezes é só a unidade.
      if (r.tipoErro === 'valor' && conta.endsWith('%') && verificarConta(conta.slice(0, -1)).ok) return { conta, ok: true };
      return { conta, ...r };
    })
    .filter((c) => c.tipoErro !== 'sintaxe');
  return { ok: contas.every((c) => c.ok), contas };
}
