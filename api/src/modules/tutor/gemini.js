// Cliente mínimo da API do Gemini (REST), sempre com resposta em JSON validado.

import { z } from 'zod';

const esquemaResposta = z.object({ resposta: z.string().min(1).max(2000) });

export function criarGemini({ chave, modelo, orcamentoPensamento = 0, fetch: f = fetch, timeoutMs = 20_000 }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`;
  return {
    modelo,
    // mensagens: [{ papel: 'user' | 'model', texto }]
    async responder({ sistema, mensagens }) {
      const generationConfig = {
        temperature: 0.4,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
        responseSchema: { type: 'OBJECT', properties: { resposta: { type: 'STRING' } }, required: ['resposta'] },
      };
      if (orcamentoPensamento !== null) generationConfig.thinkingConfig = { thinkingBudget: orcamentoPensamento };
      const corpo = {
        systemInstruction: { parts: [{ text: sistema }] },
        contents: mensagens.map((m) => ({ role: m.papel, parts: [{ text: m.texto }] })),
        generationConfig,
      };
      const res = await f(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': chave },
        body: JSON.stringify(corpo),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) {
        const texto = await res.text().catch(() => '');
        const erro = new Error(`Gemini ${res.status}: ${texto.slice(0, 300)}`);
        erro.status = res.status;
        throw erro;
      }
      const dados = await res.json();
      const texto = dados?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
      let json;
      try {
        json = JSON.parse(texto);
      } catch {
        throw new Error('Gemini devolveu algo que não é JSON');
      }
      return esquemaResposta.parse(json).resposta.trim();
    },
  };
}
