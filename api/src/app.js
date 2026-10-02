import express from 'express';
import helmet from 'helmet';
import { identificar } from './middleware/auth.js';
import { limitarPorIp } from './middleware/limites.js';
import { rotasConteudo } from './modules/conteudo/rotas.js';
import { rotasOps } from './modules/ops/rotas.js';
import { rotasPraticar } from './modules/praticar/rotas.js';
import { rotasProgresso } from './modules/progresso/rotas.js';
import { rotasTutor } from './modules/tutor/rotas.js';
import { ErroApi, tratarErros } from './shared/erros.js';
import { criarEscudo } from './shared/escudo.js';
import { repositorioEmMemoria } from './shared/repositorio.js';

function cors(origens) {
  return (req, res, next) => {
    const origem = req.get('origin');
    if (origem && origens.includes(origem)) {
      res.set('Access-Control-Allow-Origin', origem);
      res.set('Vary', 'Origin');
      res.set('Access-Control-Allow-Headers', 'authorization, content-type');
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Max-Age', '600');
    }
    if (req.method === 'OPTIONS') return res.status(204).end();
    next();
  };
}

export function criarApp({
  config,
  repo = repositorioEmMemoria(),
  gemini = null,
  verificarToken = null,
  agora = () => new Date(),
  escudo = criarEscudo({ orcamentoDiario: config.orcamentoIaDiario, agora }),
  registrar = console.error,
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  // Render fica na frente da app; o IP real vem do proxy (ou do Cloudflare).
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors(config.origens));
  app.use(express.json({ limit: '200kb' }));

  const deps = { repo, gemini, escudo, config, agora, registrar, inicio: agora() };
  const v1 = express.Router();
  v1.use(limitarPorIp({ nome: 'geral', max: 300, janelaMs: 60_000, confiarCloudflare: config.confiarCloudflare }));
  v1.use(identificar(verificarToken));
  v1.use(rotasOps(deps));
  v1.use(rotasConteudo(deps));
  v1.use(rotasPraticar(deps));
  v1.use(rotasProgresso(deps));
  v1.use(rotasTutor(deps));
  app.use('/api/v1', v1);

  app.get('/', (req, res) => res.json({ nome: 'EduKan API', docs: '/api/v1/saude' }));
  app.use((req, res, next) => next(new ErroApi(404, 'NAO_ENCONTRADO', 'Rota não encontrada.')));
  app.use(tratarErros(registrar));
  return app;
}
