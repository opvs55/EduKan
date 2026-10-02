// Gerador pseudoaleatório com semente (mulberry32). A mesma semente gera
// sempre o mesmo exercício, então a API corrige só com `tema` + `semente`,
// sem guardar a questão.

export function criarRng(semente) {
  let a = semente >>> 0;
  const proximo = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    proximo,
    int(min, max) {
      return min + Math.floor(proximo() * (max - min + 1));
    },
    pick(lista) {
      return lista[Math.floor(proximo() * lista.length)];
    },
    embaralhar(lista) {
      const copia = [...lista];
      for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(proximo() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
      }
      return copia;
    },
  };
}

export function novaSemente() {
  return 1 + Math.floor(Math.random() * 2147483646);
}

export function sementeValida(semente) {
  return Number.isInteger(semente) && semente > 0 && semente < 2147483647;
}
