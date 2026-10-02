// localStorage pode não existir (aba anônima, bloqueio de cookies): nunca quebra a página.
export function ler(chave, padrao = null) {
  try {
    const v = window.localStorage.getItem(chave);
    return v === null ? padrao : JSON.parse(v);
  } catch {
    return padrao;
  }
}

export function gravar(chave, valor) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // sem armazenamento: segue sem salvar
  }
}

export function apagar(chave) {
  try {
    window.localStorage.removeItem(chave);
  } catch {
    // idem
  }
}
