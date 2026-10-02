import { Link } from 'react-router';

function Pagina({ sobretitulo, titulo, children }) {
  return (
    <>
      <div className="cabecalho-pagina faixa">
        <span className="sobretitulo">{sobretitulo}</span>
        <h1 className="titulo-m">{titulo}</h1>
      </div>
      <div className="texto-longo">{children}</div>
    </>
  );
}

export function ComoFunciona() {
  return (
    <Pagina sobretitulo="Transparência" titulo="Como funciona">
      <p>
        O EduKan tem duas partes que andam juntas: uma <strong>série de vídeos curtos</strong> nas redes, um episódio por dia, e este{' '}
        <strong>site de estudo</strong>, com uma página para cada episódio.
      </p>
      <h2>O ciclo</h2>
      <ul>
        <li>Assista ao episódio do dia (de domingo a sexta, às 19h). Ele lembra o anterior e termina com uma pista do próximo.</li>
        <li>Estude a página do tema: conceito, exemplo passo a passo, o erro mais comum e exercícios.</li>
        <li>Pratique. Quando você acerta 3 exercícios, o tema volta para revisão em 1, 3, 7 e 21 dias.</li>
        <li>Sábado é dia de revisão da semana.</li>
      </ul>
      <h2>Onde entra a IA</h2>
      <p>Usamos inteligência artificial (Gemini, do Google) para redigir roteiros e para o tutor, com três travas:</p>
      <ul>
        <li>
          <strong>Fatos só do fichário.</strong> Cada tema tem um fichário escrito e revisado por pessoas, com o conceito, as fórmulas, os exemplos e o
          erro comum. A IA só pode usar o que está nele.
        </li>
        <li>
          <strong>Contas por código.</strong> Os exercícios e as respostas saem de geradores em código. Toda conta que aparece num texto, inclusive na
          resposta do tutor, é recalculada antes de chegar até você; se estiver errada, a resposta é refeita ou descartada.
        </li>
        <li>
          <strong>O tutor não faz a lição.</strong> Ele explica a ideia, mostra o primeiro passo e devolve a pergunta para você.
        </li>
      </ul>
      <p>Os vídeos usam voz sintética e são marcados como conteúdo gerado com IA.</p>
      <p>
        Achou um erro? Escreva para nós pela página de <Link to="/ajuda">ajuda</Link>.
      </p>
    </Pagina>
  );
}

export function Ajuda() {
  return (
    <Pagina sobretitulo="Ajuda" titulo="Perguntas frequentes">
      <h2>Preciso criar conta?</h2>
      <p>Não. Tudo funciona sem cadastro, e o progresso fica salvo neste aparelho. A conta serve para levar o progresso para outros aparelhos.</p>
      <h2>Para quem é?</h2>
      <p>Para quem vai fazer o ENEM ou vestibular, a partir dos 13 anos. A Temporada 1 é de Matemática; História, Sociologia e Programação vêm depois.</p>
      <h2>De onde vêm os exercícios?</h2>
      <p>
        De geradores em código: cada questão tem uma “semente” que define os números. Por isso há questões novas a cada sessão, e a resposta certa é
        sempre calculada, nunca inventada.
      </p>
      <h2>Como funciona a revisão?</h2>
      <p>
        Quando você acerta 3 exercícios de um tema, ele entra num ciclo: volta 1, 3, 7 e 21 dias depois. Em cada revisão são 3 questões; acertando 2,
        você avança. Errando, o ciclo recomeça.
      </p>
      <h2>Onde vejo os vídeos?</h2>
      <p>
        Nas redes do EduKan (Instagram e YouTube Shorts). A página <Link to="/serie/matematica">Série</Link> mostra o que já saiu e quando sai o
        próximo.
      </p>
      <h2>Achei um erro</h2>
      <p>Obrigado! Conte para nós pelas redes do EduKan, dizendo a página e o que está errado. Corrigimos o fichário e tudo que depende dele.</p>
    </Pagina>
  );
}

export function Privacidade() {
  return (
    <Pagina sobretitulo="LGPD" titulo="Privacidade">
      <p>Coletamos o mínimo para o site funcionar, seguindo a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
      <h2>Sem conta</h2>
      <p>
        Suas respostas ficam guardadas apenas no seu navegador (armazenamento local). Não enviamos nada sobre você. Se o site der erro, registramos a
        mensagem técnica do erro e a página, sem dados pessoais.
      </p>
      <h2>Com conta</h2>
      <ul>
        <li>Guardamos seu e-mail, o nome que você escolher e suas respostas: tema, número da questão, alternativa e data.</li>
        <li>Usamos esses dados só para mostrar seu progresso e montar suas revisões. Não vendemos nem compartilhamos para publicidade.</li>
        <li>Os dados ficam no Supabase (banco de dados), com acesso restrito à sua própria conta.</li>
      </ul>
      <h2>Tutor</h2>
      <p>
        A pergunta que você escreve ao tutor é enviada ao Google (Gemini) para gerar a resposta. Não mande dados pessoais nela. Não guardamos o
        histórico da conversa.
      </p>
      <h2>Idade</h2>
      <p>O EduKan é para pessoas a partir de 13 anos. Não criamos contas de menores de 13.</p>
      <h2>Seus direitos</h2>
      <p>
        Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelas redes do EduKan. Ao excluir a conta, apagamos todas as
        suas respostas.
      </p>
    </Pagina>
  );
}

export function Termos() {
  return (
    <Pagina sobretitulo="Regras" titulo="Termos de uso">
      <ul>
        <li>O EduKan é gratuito e está em fase Beta: pode mudar e ter falhas.</li>
        <li>O conteúdo é educativo e revisado com cuidado, mas não substitui professores nem materiais oficiais.</li>
        <li>Use o tutor para aprender. Não tente usá-lo para outros fins nem para enviar conteúdo ofensivo.</li>
        <li>Os textos, exercícios e vídeos são do EduKan. Pode compartilhar o link à vontade; não republique como se fosse seu.</li>
        <li>Para usar com conta, é preciso ter 13 anos ou mais.</li>
      </ul>
    </Pagina>
  );
}
