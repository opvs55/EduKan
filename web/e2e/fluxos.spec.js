import { expect, test } from '@playwright/test';
import { gerarQuestao } from '@edukan/conteudo';
import { brasilia, semTour, vigiarConsole } from './ajuda.js';

test.describe('primeira visita', () => {
  test('mostra o tour uma vez e leva ao episódio 1', async ({ page }) => {
    const console = vigiarConsole(page);
    await page.goto('/');
    const tour = page.getByRole('dialog');
    await expect(tour).toContainText('Assista');
    await tour.getByRole('button', { name: 'Próximo →' }).click();
    await expect(tour).toContainText('Estude');
    await tour.getByRole('button', { name: 'Pular' }).click();
    await expect(tour).toBeHidden();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Toda conta esconde uma pergunta boa.');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('link', { name: 'Começar pelo episódio 1' }).click();
    await expect(page).toHaveURL(/\/tema\/porcentagem$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Porcentagem');
    await expect(page).toHaveTitle(/Porcentagem · Matemática para o ENEM/);
    await console.semErros();
  });

  test('o desafio do dia mostra a resposta', async ({ page }) => {
    await semTour(page);
    await page.goto('/');
    const desafio = page.getByRole('region', { name: 'Desafio do dia' });
    await desafio.getByRole('button', { name: 'Responder →' }).click();
    await expect(desafio.getByRole('link', { name: /Praticar/ })).toBeVisible();
  });
});

test.describe('página de tema', () => {
  test('tem conceito, exemplo com contas, erro comum, exercícios e vizinhos', async ({ page }) => {
    const console = vigiarConsole(page);
    await semTour(page);
    await page.goto('/tema/aumentos-e-descontos-sucessivos');
    await expect(page.getByRole('region', { name: 'Conceito' })).toContainText('se multiplicam');
    const exemplo = page.getByRole('region', { name: 'Exemplo' });
    await expect(exemplo).toContainText('200 × 0,90 = 180');
    await expect(exemplo).toContainText('Desconto total de 19%');
    await expect(page.getByRole('region', { name: 'Erro comum' })).toContainText('10% + 10% = 20%');
    await expect(page.getByRole('region', { name: 'Exercícios' }).getByRole('link')).toHaveCount(4);
    await expect(page.getByRole('link', { name: /Juros simples/ })).toBeVisible();
    await console.semErros();
  });

  test('o tutor responde (API simulada)', async ({ page }) => {
    await semTour(page);
    await page.route('**/api/v1/tutor', async (route) => {
      const corpo = route.request().postDataJSON();
      expect(corpo.tema).toBe('juros-simples');
      await route.fulfill({ json: { resposta: 'No juro simples, o juro de cada mês é sobre o capital inicial: 1.000 × 0,02 = 20 por mês.', conferida: true } });
    });
    await page.goto('/tema/juros-simples');
    await page.getByLabel('Sua pergunta').fill('Por que o juro não cresce?');
    await page.getByRole('button', { name: 'Perguntar →' }).click();
    await expect(page.locator('.tutor-msg.tutor')).toContainText('1.000 × 0,02 = 20');
  });

  test('o tutor fora do ar mostra o aviso', async ({ page }) => {
    await semTour(page);
    await page.route('**/api/v1/tutor', (route) =>
      route.fulfill({ status: 503, json: { erro: 'TUTOR_INDISPONIVEL', mensagem: 'O tutor ainda não está disponível.' } }),
    );
    await page.goto('/tema/escala');
    await page.getByLabel('Sua pergunta').fill('Como converto cm em km?');
    await page.getByRole('button', { name: 'Perguntar →' }).click();
    await expect(page.getByText('O tutor ainda não está disponível.')).toBeVisible();
  });
});

test.describe('praticar', () => {
  test('sessão de 5 questões com correção e progresso', async ({ page }) => {
    const console = vigiarConsole(page);
    await semTour(page);
    const q = gerarQuestao('porcentagem', 101);
    await page.goto('/praticar?tema=porcentagem&semente=101');
    await expect(page.locator('.enunciado')).toHaveText(q.enunciado);
    await page.getByRole('button', { name: new RegExp(`^Alternativa ${'ABCDE'[q.correta]}:`) }).click();
    await expect(page.locator('.retorno-titulo')).toHaveText(`Isso. ${q.resposta}.`);
    await expect(page.locator('.alternativa.certa')).toContainText(q.resposta);

    for (let i = 2; i <= 5; i++) {
      await page.getByRole('button', { name: /Próxima questão|Ver resultado/ }).click();
      await expect(page.getByText(`Questão ${i} de 5`)).toBeVisible();
      await page.keyboard.press('1');
      await expect(page.locator('.retorno-titulo')).toHaveText(/^(Isso|Quase)\./);
    }
    await page.getByRole('button', { name: 'Ver resultado →' }).click();
    await expect(page.locator('.placar')).toContainText('/ 5');

    await page.goto('/progresso');
    await expect(page.getByText('em 5 exercícios')).toBeVisible();
    await expect(page.locator('.numero.acento .valor')).toHaveText('1');
    await console.semErros();
  });

  test('a escolha de temas lista os 15', async ({ page }) => {
    await semTour(page);
    await page.goto('/praticar');
    await expect(page.locator('.tema-linha')).toHaveCount(15);
  });

  test('3 acertos viram "tema feito" e a revisão aparece no dia seguinte', async ({ page }) => {
    await semTour(page);
    await page.clock.setFixedTime(brasilia('2026-10-20', '10:00'));
    for (const s of [101, 202, 303]) {
      const q = gerarQuestao('escala', s);
      await page.goto(`/praticar?tema=escala&semente=${s}`);
      await page.getByRole('button', { name: new RegExp(`^Alternativa ${'ABCDE'[q.correta]}:`) }).click();
      await expect(page.locator('.retorno-titulo')).toHaveText(/^Isso\./);
    }
    await page.goto('/tema/escala');
    await expect(page.locator('.exercicio-linha .feito')).toHaveCount(3);
    await expect(page.locator('.ciclo div')).toHaveCount(4);

    await page.goto('/progresso');
    await expect(page.locator('.numero').nth(1)).toContainText('1');
    await expect(page.getByText('Nada para revisar hoje.')).toBeVisible();

    await page.clock.setFixedTime(brasilia('2026-10-21', '10:00'));
    await page.reload();
    await expect(page.getByText('Você tem 1 revisão para hoje.')).toBeVisible();
    await page.getByRole('link', { name: 'Revisar →' }).first().click();
    await expect(page).toHaveURL(/modo=revisao/);
    await expect(page.getByText('Questão 1 de 3')).toBeVisible();
  });
});

test.describe('série', () => {
  test('antes da estreia: trailer é o próximo e nada está no ar', async ({ page }) => {
    await semTour(page);
    await page.clock.setFixedTime(brasilia('2026-10-02'));
    await page.goto('/serie/matematica');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Temporada 1');
    await expect(page.getByText('dom, 11 out, 19h').first()).toBeVisible();
    await expect(page.locator('.status-no-ar')).toHaveCount(0);
  });

  test('no meio da temporada: lançados com título, o próximo escondido', async ({ page }) => {
    const console = vigiarConsole(page);
    await semTour(page);
    await page.clock.setFixedTime(brasilia('2026-10-14', '20:00')); // E03 saiu às 19h
    await page.goto('/serie/matematica');
    await expect(page.locator('.episodio .status-no-ar')).toHaveCount(4); // trailer + E01–E03
    await expect(page.getByRole('link', { name: /Juros simples/ })).toBeVisible();
    const destaque = page.locator('.episodio.destaque');
    await expect(destaque).toContainText('Episódio 4');
    await expect(destaque).toContainText('Amanhã, 19h');
    await expect(destaque).not.toContainText('Juros compostos');

    await page.goto('/materia/matematica');
    await expect(page.getByText('3 de 15')).toBeVisible();
    await console.semErros();
  });
});

test('SEO: cada tema tem HTML pronto, título e sitemap', async ({ request }) => {
  const r = await request.get('/tema/funcao-afim');
  const html = await r.text();
  expect(html).toContain('<title>Função afim · Matemática para o ENEM · EduKan</title>');
  expect(html).toContain('f(x) = ax + b');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap.match(/<url>/g)).toHaveLength(26);
  expect(sitemap).not.toContain('/progresso');
});
