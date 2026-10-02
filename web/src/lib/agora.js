import { useEffect, useState } from 'react';

// Hora atual só depois de montar: o HTML pré-renderizado não depende do
// relógio, então a hidratação não diverge. Atualiza a cada minuto.
export function useAgora(intervaloMs = 60_000) {
  const [agora, setAgora] = useState(null);
  useEffect(() => {
    setAgora(new Date());
    const id = setInterval(() => setAgora(new Date()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);
  return agora;
}

export function useMontado() {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  return montado;
}
