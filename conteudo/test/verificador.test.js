import { describe, expect, it } from 'vitest';
import { avaliar, extrairContas, verificarConta, verificarTexto } from '../src/verificador.js';

describe('avaliar', () => {
  it('entende números brasileiros e operadores', () => {
    expect(avaliar('200 × 0,90')).toBeCloseTo(180);
    expect(avaliar('1.400.000 ÷ 100.000')).toBe(14);
    expect(avaliar('3 × 3⁴')).toBe(243);
    expect(avaliar('−5 × 2² + 20 × 2')).toBe(20);
    expect(avaliar('−20 ÷ (2 × (−5))')).toBe(2);
    expect(avaliar('30% × 50')).toBe(15);
    expect(avaliar('4!')).toBe(24);
    expect(avaliar('(7 + √9) ÷ 2')).toBe(5);
    expect(avaliar('(1/2)⁴')).toBe(1 / 16);
    expect(avaliar('2 ^ 10')).toBe(1024);
  });

  it('rejeita texto que não é conta', () => {
    expect(() => avaliar('2 + x')).toThrow();
    expect(() => avaliar('(2 + 3')).toThrow();
    expect(() => avaliar('2 +')).toThrow();
  });
});

describe('verificarConta', () => {
  it('aceita contas certas, inclusive encadeadas', () => {
    expect(verificarConta('0,90 × 0,90 = 0,81').ok).toBe(true);
    expect(verificarConta('6 ÷ 36 = 1/6').ok).toBe(true);
    expect(verificarConta('5! = 5 × 4 × 3 × 2 × 1 = 120').ok).toBe(true);
    expect(verificarConta('1 ÷ 6 ≈ 0,167').ok).toBe(true);
  });

  it('reprova contas erradas', () => {
    expect(verificarConta('200 × 0,90 = 190').ok).toBe(false);
    expect(verificarConta('1 ÷ 6 ≈ 0,18').ok).toBe(false);
    expect(verificarConta('2 + 2').ok).toBe(false);
  });
});

describe('extrairContas / verificarTexto', () => {
  it('acha contas no meio de frases', () => {
    const texto = 'O juro é 1.000 × 0,02 × 5 = 100, e o montante é 1.000 + 100 = 1.100. Em 2024, a taxa caiu.';
    expect(extrairContas(texto)).toEqual(['1.000 × 0,02 × 5 = 100', '1.000 + 100 = 1.100']);
    expect(verificarTexto(texto).ok).toBe(true);
  });

  it('pega conta errada escrita pelo tutor', () => {
    const r = verificarTexto('Veja: R$ 80 × 1,25 = R$ 110. Depois, 110 × 0,80 = 88.');
    expect(r.ok).toBe(false);
    expect(r.contas.find((c) => !c.ok).conta).toBe('80 × 1,25 = 110');
  });

  it('ignora fórmulas com letras', () => {
    expect(extrairContas('Use h(2) = 20 e a₁₂ = 65.')).toEqual([]);
  });
});

describe('textos com porcentagem', () => {
  it('lê "x% de y" como multiplicação', () => {
    expect(verificarTexto('8% de 25 = 25% de 8 = 2').ok).toBe(true);
    expect(verificarTexto('8% de 25 = 3').ok).toBe(false);
  });

  it('aceita o % final como unidade', () => {
    expect(verificarTexto('50 ÷ 200 × 100 = 25%').ok).toBe(true);
    expect(verificarTexto('50 ÷ 200 × 100 = 30%').ok).toBe(false);
  });
});
