
# PG Reality — Portfólio de Pedro Gavazzi

### Beyond the Reality // Developer Portfolio

**Um portfólio interativo inspirado na experiência dos videogames, desenvolvido para apresentar meus projetos, habilidades e trajetória na tecnologia.**

[![Acessar Portfólio](https://img.shields.io/badge/ACESSAR_PORTFÓLIO-78CFFF?style=for-the-badge&logo=github&logoColor=black)](https://g4vazzi.github.io/portfolio-pedro-gavazzi/portfolio-v2.html)

---

## Sobre o projeto

O **PG Reality** é meu portfólio pessoal, criado com o objetivo de ir além de uma página tradicional de apresentação.

Inspirado em interfaces de videogames e experiências cinematográficas, o projeto reúne animações, navegação interativa, visualizações de projetos e integrações com serviços externos.

A ideia é apresentar não apenas as tecnologias que utilizo, mas também minha forma de desenvolver soluções e explorar novas possibilidades com programação.

O portfólio foi desenvolvido com **HTML, CSS e JavaScript**, sem a utilização de frameworks de interface.

## Funcionalidades

### Introdução cinematográfica
- Abertura interativa com efeitos visuais.
- Transição entre a introdução e a interface principal.
- Opções para pular ou reiniciar a experiência.
- Suporte a preferências de movimento reduzido.

### Sistema de navegação
- Menu inspirado em interfaces de jogos.
- Transições entre as seções.
- Navegação por mouse e teclado.
- Layout adaptado para diferentes tamanhos de tela.

### Projetos — Mission Database
Apresentação interativa de projetos desenvolvidos durante minha trajetória.

**Spaço Contábil**
- Site institucional desenvolvido com Python e Flask.
- Ferramentas e calculadoras financeiras e contábeis.
- Integrações com APIs.
- Interfaces responsivas.

**LanchoneteWeb**
- Sistema web para gerenciamento de pedidos.
- Cardápio interativo e carrinho de compras.
- Checkout e painel administrativo.
- Backend com Flask e banco de dados SQLite.

Os projetos possuem descrições, tecnologias utilizadas e prévias visuais de suas interfaces.

### Habilidades — Skill Tree
Árvore de habilidades inspirada em sistemas de progressão de jogos.

As competências estão organizadas em áreas como:

- **Desenvolvimento:** Python, Flask, JavaScript, HTML e CSS.
- **Dados:** SQL, SQLite, Excel, Power Query e Power Pivot.
- **Automação e ferramentas:** VBA, Git e GitHub.

Cada habilidade possui uma descrição e exemplos de aplicação prática.

### Minha História — Story Mode
Uma apresentação interativa da minha trajetória acadêmica e profissional, desde minhas experiências anteriores na Engenharia Civil até minha transição para a área da computação.

### Além do Código — Player Profile
Espaço dedicado a alguns dos meus interesses fora da programação.

**Games**
- Biblioteca de jogos da PlayStation.
- Biblioteca de jogos da Steam.
- Carrosséis dinâmicos com capas e informações dos títulos.

**Platinas**
- Integração com a PlayStation Network.
- Total de platinas conquistadas.
- Exibição das conquistas recentes.
- Atualização automatizada dos dados.

**Futebol**
- Espaço dedicado ao Corinthians.
- Galeria de fotografias de experiências no estádio.
- Imagens hospedadas externamente.

### Contato
Links para meu GitHub e LinkedIn, facilitando o contato profissional e a apresentação dos meus projetos.

---

## Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| HTML5 | Estrutura e semântica da interface |
| CSS3 | Estilização, responsividade e animações |
| JavaScript | Navegação e funcionalidades interativas |
| Node.js | Scripts de integração e sincronização |
| PlayStation API | Consulta de jogos e informações de troféus |
| Steam Web API | Consulta da biblioteca de jogos |
| GitHub Actions | Automação e publicação |
| GitHub Pages | Hospedagem do portfólio |
| Cloudinary | Hospedagem e entrega de fotografias |

---

## Integrações automatizadas

O projeto utiliza scripts Node.js para consultar serviços externos e gerar arquivos JSON consumidos pelo site.

### PlayStation Network

A integração utiliza a biblioteca `psn-api` para consultar informações associadas à conta PlayStation, incluindo:

- Histórico de jogos com troféus.
- Biblioteca digital disponível pela API.
- Platinas e conquistas recentes.
- Capas e informações dos jogos.

Os dados são tratados e organizados antes de serem utilizados no portfólio.

### Steam

A integração utiliza a Steam Web API, por meio do método `GetOwnedGames`.

Os dados obtidos incluem:

- Identificadores dos jogos.
- Nomes dos títulos.
- Tempo de jogo registrado.
- Imagens para apresentação no carrossel.

### GitHub Actions

As rotinas de automação permitem atualizar os dados consultados e publicar novas versões do portfólio.

As credenciais de acesso são armazenadas por meio dos **GitHub Actions Secrets**, evitando sua inclusão direta no código-fonte.

**Observação:** os dados enviados ao navegador para exibição no site são públicos, mesmo quando os arquivos JSON são gerados apenas durante o processo de publicação.

---

## Estrutura do projeto

```text
portfolio-pedro-gavazzi/
│
├── portfolio-v2.html
│
├── css/
│   └── portfolio-v2.css
│
├── js/
│   ├── portfolio-v2.js
│   ├── psn-trophies.js
│   └── game-libraries.js
│
├── scripts/
│   ├── sync-psn.mjs
│   ├── sync-psn-library.mjs
│   └── sync-steam-library.mjs
│
├── data/
│   └── [JSONs gerados pelas integrações]
│
├── .github/
│   └── workflows/
│
├── package.json
├── package-lock.json
└── README.md
```

A estrutura acima destaca os principais arquivos do projeto. Recursos visuais e outros arquivos de apoio podem estar organizados em diretórios adicionais.

---

## Executando localmente

### Pré-requisitos

- Git
- Visual Studio Code ou outro editor
- Navegador atualizado

Node.js é necessário para executar os scripts de integração, mas não para visualizar a interface estática já gerada.

### 1. Clonar o repositório

```bash
git clone https://github.com/G4vazzi/portfolio-pedro-gavazzi.git
```

### 2. Entrar na pasta

```bash
cd portfolio-pedro-gavazzi
```

### 3. Abrir o projeto

Abra a pasta no Visual Studio Code.

### 4. Iniciar um servidor local

Utilize a extensão **Live Server** ou outro servidor HTTP estático.

Abra o arquivo:

```text
portfolio-v2.html
```

O servidor local é importante porque o navegador utiliza `fetch()` para carregar os arquivos JSON das integrações.

### 5. Integrações opcionais

Para executar os scripts Node.js:

```bash
npm ci
```

As integrações externas exigem credenciais próprias configuradas por variáveis de ambiente.

Nunca inclua chaves privadas ou tokens diretamente no código-fonte.

---

## Segurança e privacidade

O projeto separa o código público das credenciais utilizadas nas integrações.

Boas práticas adotadas:

- Credenciais armazenadas em GitHub Actions Secrets.
- Fotografias pessoais hospedadas externamente.
- Arquivos JSON gerados sem necessidade de versionar dados pessoais no repositório.
- Chaves de acesso não incluídas no frontend.
- URLs externas abertas com atributos de segurança adequados.

Como o portfólio é público, informações exibidas nas bibliotecas e fotografias também podem ser visualizadas pelos visitantes.

---

## Objetivo profissional

Sou estudante de **Ciência da Computação**, com interesse em desenvolvimento de sistemas, automação e análise de dados.

O PG Reality representa a aplicação prática dos conhecimentos adquiridos durante minha formação e evolução como desenvolvedor.

Por meio deste projeto, pude trabalhar com interfaces interativas, organização de código, consumo de APIs, automações e publicação de aplicações web.

Meu objetivo é continuar aprendendo, aprimorando minhas competências e desenvolvendo soluções que resolvam problemas reais.

---

## Autor

**Pedro Gavazzi**

Desenvolvedor em formação | Ciência da Computação

- **Portfólio:** [PG Reality](https://g4vazzi.github.io/portfolio-pedro-gavazzi/portfolio-v2.html)
- **GitHub:** [github.com/G4vazzi](https://github.com/G4vazzi)

---

<p align="center">
  <strong>PG REALITY // BEYOND THE REALITY</strong>
</p>

<p align="center">
  Desenvolvido por Pedro Gavazzi © 2026
</p>
