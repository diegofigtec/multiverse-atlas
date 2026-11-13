'use strict';
// Referências: MDN Fetch/createElement/appendChild/append e DEVMedia Fetch.
const $ = (selector) => document.querySelector(selector);
const API = 'https://rickandmortyapi.com/api/character';
const statusLabels = { Alive: 'Vivo', Dead: 'Morto', unknown: 'Desconhecido' };
const speciesLabels = { Human: 'Humano', Alien: 'Alienígena', Humanoid: 'Humanoide', Robot: 'Robô', unknown: 'Desconhecida' };
let page = 1, pages = 0, total = 0, name = '', status = '', busy = false;
let controller, requestId = 0;
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function message(text, error = false) {
  $('#status').textContent = text;
  $('#status').classList.toggle('error', error);
}
function createImage(character, className) {
  const img = element('img', className);
  try {
    const url = new URL(character.image);
    img.src = url.protocol === 'https:' && url.hostname === 'rickandmortyapi.com' ? url.href : 'placeholder.svg';
  } catch { img.src = 'placeholder.svg'; }
  img.alt = `Imagem de ${character.name}`; img.loading = 'lazy';
  img.addEventListener('error', () => { img.src = 'placeholder.svg'; }, { once: true });
  return img;
}
function showDetails(character) {
  const content = $('#details-content'); content.replaceChildren();
  content.append(createImage(character, 'detail-image'), element('p', 'eyebrow', `ARQUIVO INTERDIMENSIONAL / ${character.id}`), element('h2', '', character.name));
  const gender = { Female: 'Feminino', Male: 'Masculino', Genderless: 'Sem gênero', unknown: 'Desconhecido' };
  const location = (value) => value === 'unknown' ? 'Desconhecida' : value || 'Não informada';
  [
    `Status: ${statusLabels[character.status] || character.status}`,
    `Espécie: ${speciesLabels[character.species] || character.species}`,
    `Gênero: ${gender[character.gender] || character.gender}`,
    `Origem: ${location(character.origin?.name)}`,
    `Última localização: ${location(character.location?.name)}`,
    `Aparições: ${character.episode?.length ?? 0} episódios no catálogo.`
  ].forEach((text) => content.appendChild(element('p', '', text)));
  $('#details').showModal();
}
function createCard(character) {
  const card = element('article', 'card');
  const body = element('div', 'card-body');
  body.appendChild(element('small', '', `ARQUIVO / ${String(character.id).padStart(3, '0')}`));
  body.appendChild(element('h3', '', character.name));
  body.appendChild(element('span', `status-pill ${String(character.status).toLowerCase()}`, `${statusLabels[character.status] || character.status} • ${speciesLabels[character.species] || character.species}`));
  body.appendChild(element('p', '', `Última localização: ${character.location?.name === 'unknown' ? 'Desconhecida' : character.location?.name || 'Não informada'}`));
  const button = element('button', '', 'Conhecer personagem ↗');
  button.type = 'button'; button.setAttribute('aria-label', `Conhecer ${character.name}`);
  button.addEventListener('click', () => showDetails(character));
  body.appendChild(button);
  card.appendChild(createImage(character, 'card-image'));
  card.appendChild(body);
  return card;
}
function updatePagination() {
  $('#prev').disabled = busy || page <= 1 || !pages;
  $('#next').disabled = busy || page >= pages;
  $('#page').textContent = pages ? `Página ${page} de ${pages}` : 'Nenhuma página carregada';
}
async function loadCharacters() {
  controller?.abort(); controller = new AbortController();
  const active = controller, current = ++requestId;
  const timer = setTimeout(() => active.abort(), 18000);
  busy = true; updatePagination(); $('#characters').setAttribute('aria-busy', 'true');
  $('#characters').replaceChildren(); $('#empty').hidden = true;
  message('Atravessando o portal… Buscando personagens na API.');
  const url = new URL(API);
  url.search = new URLSearchParams({ page: String(page), ...(name ? { name } : {}), ...(status ? { status } : {}) });
  try {
    // fetch não rejeita automaticamente respostas HTTP 404/500: valide response.ok.
    const response = await fetch(url, { signal: active.signal, headers: { Accept: 'application/json' } });
    if (current !== requestId) return;
    if (response.status === 404) {
      total = 0; pages = 0; $('#empty').hidden = false;
      $('#empty h3').textContent = 'Ninguém nesta dimensão.';
      $('#empty p').textContent = 'Tente outro nome ou remova o filtro de status.';
      message('Nenhum personagem encontrado para esta busca.');
      $('#connection').textContent = 'API conectada'; $('#connection').classList.add('connected'); return;
    }
    if (!response.ok) throw new Error(response.status === 429 ? 'Muitas requisições. Aguarde e tente novamente.' : `O serviço retornou HTTP ${response.status}. Tente novamente.`);
    const json = await response.json();
    if (current !== requestId) return;
    if (!Array.isArray(json.results) || !Number.isFinite(json.info?.count) || !Number.isFinite(json.info?.pages)) throw new Error('A API enviou uma resposta em formato inesperado.');
    total = json.info.count; pages = json.info.pages;
    const fragment = document.createDocumentFragment();
    json.results.forEach((character) => fragment.appendChild(createCard(character)));
    $('#characters').appendChild(fragment);
    $('#connection').textContent = 'API conectada'; $('#connection').classList.add('connected');
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    message(`${total.toLocaleString('pt-BR')} personagens encontrados • ${json.results.length} nesta página • Consulta às ${time}`);
  } catch (error) {
    if (current !== requestId) return;
    pages = 0; total = 0;
    $('#connection').textContent = 'Falha na conexão'; $('#connection').classList.remove('connected');
    message(error.name === 'AbortError' ? 'O portal demorou para responder. Tente novamente.' : error instanceof TypeError ? 'Não foi possível acessar a API. Verifique sua conexão e tente atualizar.' : error.message, true);
    $('#empty').hidden = false; $('#empty h3').textContent = 'Portal temporariamente fechado.';
    $('#empty p').textContent = 'A API não respondeu como esperado. Nenhum dado fictício foi exibido.';
  } finally {
    clearTimeout(timer);
    if (current === requestId) { busy = false; $('#characters').setAttribute('aria-busy', 'false'); updatePagination(); }
  }
}
$('#search-form').addEventListener('submit', (event) => { event.preventDefault(); name = $('#search').value.trim(); status = $('#status-filter').value; page = 1; loadCharacters(); });
$('#status-filter').addEventListener('change', () => { status = $('#status-filter').value; name = $('#search').value.trim(); page = 1; loadCharacters(); });
$('#refresh').addEventListener('click', loadCharacters);
$('#reset').addEventListener('click', () => { name = ''; status = ''; page = 1; $('#search').value = ''; $('#status-filter').value = ''; loadCharacters(); });
$('#prev').addEventListener('click', () => { if (!busy && page > 1) { page--; loadCharacters(); $('#catalogo').scrollIntoView(); } });
$('#next').addEventListener('click', () => { if (!busy && page < pages) { page++; loadCharacters(); $('#catalogo').scrollIntoView(); } });
$('#close-details').addEventListener('click', () => $('#details').close());
loadCharacters();
