# Multiverse Atlas

Projeto acadêmico de catálogo de personagens de Rick and Morty. HTML, CSS e JavaScript puro, sem frameworks e sem chave de API.

## Executar

Abra `index.html` com Live Server no VS Code ou execute `python -m http.server 8000` nesta pasta e acesse `http://localhost:8000`. É necessário acesso à internet para a API e imagens; fontes externas têm substitutas locais. Não é necessário instalar dependências do site.

## Recursos e código

- `index.html`: estrutura semântica, filtros e contêiner vazio `#characters`.
- `styles.css`: tema de multiverso e grade responsiva de 4, 3 ou 2 colunas.
- `app.js`: `loadCharacters()` usa `fetch`, valida HTTP e JSON; `createCard()` usa `createElement` e `appendChild`; `showDetails()` usa também `append`.
- Busca por nome e status no servidor; paginação baseada em `info.pages`, com até 20 resultados por página.
- Estados de carregamento, busca sem resultados (404), falha, timeout e imagem indisponível. Uma nova busca cancela a anterior e impede respostas antigas de sobrescrever a tela.
- Dados de API são inseridos via `textContent`, sem injetar HTML remoto.
- Diálogo de detalhes, rótulos acessíveis, navegação por teclado, região de status e respeito à preferência de movimento reduzido.

## API e limites

Endpoint: https://rickandmortyapi.com/api/character

GET HTTPS, resposta JSON com `info` e `results`. Consultas públicas não exigem token. O projeto consulta dados ao abrir, buscar, filtrar, paginar ou clicar em Atualizar. Não há streaming nem garantia de atualização contínua da base. Não presumimos uma cota numérica de requisições: ela não foi confirmada na documentação consultada. Evitamos polling e buscas a cada tecla. O serviço pode impor limites, mudar ou ficar indisponível.

## Conferência do trabalho

Implementado: HTML/CSS puro; Fetch; cards construídos pelo JavaScript com nome, imagem, status e espécie; layout responsivo; busca; paginação; referências exigidas.


## Fontes de pesquisa

- MDN. Usando Fetch: https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API/Using_Fetch
- DEVMedia. JavaScript: Fetch API: https://www.devmedia.com.br/javascript-fetch/41206
- MDN. createElement: https://developer.mozilla.org/pt-BR/docs/Web/API/Document/createElement
- MDN. appendChild: https://developer.mozilla.org/pt-BR/docs/Web/API/Node/appendChild
- MDN. append: https://developer.mozilla.org/en-US/docs/Web/API/Document/append
- Rick and Morty API. Documentação oficial: https://rickandmortyapi.com/documentation
- Disciplina no AVA: indicada no enunciado, ainda não consultada; referência bibliográfica deve ser completada pelo aluno após acesso.

Esta API é um projeto independente. Personagens e imagens pertencem aos respectivos titulares. Projeto acadêmico não oficial.
