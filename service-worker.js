// ============================================================
// SERVICE WORKER — permite o app abrir mesmo SEM NENHUMA internet
// ============================================================
// Na primeira vez que você abrir o app com internet (wifi ou dados),
// ele guarda uma cópia local de tudo. Depois disso, mesmo com o
// celular em modo avião ou sem sinal nenhum, o app abre normalmente
// a partir dessa cópia guardada.
//
// IMPORTANTE: sempre que eu (Claude) atualizar o index.html/Exames.html,
// troque também o número da versão abaixo (CACHE_NOME) — isso força o
// celular a baixar a versão nova na próxima vez que tiver internet,
// em vez de continuar preso na cópia antiga guardada.
// ============================================================

const CACHE_NOME = 'registro-exames-v1';

const ARQUIVOS_PARA_GUARDAR = [
  './',
  './Final.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instala o service worker e guarda a cópia local de tudo
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS_PARA_GUARDAR))
  );
  self.skipWaiting();
});

// Remove cópias antigas de versões anteriores, quando o número da versão mudar
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes.filter((nome) => nome !== CACHE_NOME).map((nome) => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});

// Toda vez que o app pedir um arquivo:
// 1) Tenta buscar da internet primeiro (pega sempre a versão mais atual)
// 2) Se não tiver internet, usa a cópia guardada local
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((respostaDaRede) => {
        // Atualiza a cópia guardada com a versão mais nova, para uso futuro offline
        const copia = respostaDaRede.clone();
        caches.open(CACHE_NOME).then((cache) => cache.put(event.request, copia));
        return respostaDaRede;
      })
      .catch(() => caches.match(event.request))
  );
});
