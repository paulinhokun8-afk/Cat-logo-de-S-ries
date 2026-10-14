const botaoCarregar = document.getElementById("carregar");
const pesquisa = document.getElementById("pesquisa");
const filtroGenero = document.getElementById("filtroGenero");
const filtroAno = document.getElementById("filtroAno");
const botaoOrdenar = document.getElementById("ordenar");
const botaoLimpar = document.getElementById("limpar");

const catalogo = document.getElementById("catalogo");
const mensagem = document.getElementById("mensagem");

const total = document.getElementById("total");
const antiga = document.getElementById("antiga");
const recente = document.getElementById("recente");

let series = [];
let ordemCrescente = true;
let carregado = false;


async function carregarSeries() {
    mensagem.textContent = "Carregando séries...";
    botaoCarregar.disabled = true;

    try {
        const resposta = await fetch("series.json");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar o arquivo JSON.");
        }

        const dados = await resposta.json();
        series = dados.series;

        if (!Array.isArray(series) || series.length === 0) {
            throw new Error("O arquivo JSON não possui séries cadastradas.");
        }

        carregado = true;

        preencherFiltros();
        atualizarEstatisticas();
        exibirSeries();

    } catch (erro) {
        mensagem.textContent =
            "Erro ao carregar as séries. Verifique o arquivo JSON e use um servidor local.";

        console.error(erro);
    } finally {
        botaoCarregar.disabled = false;
    }
}


function preencherFiltros() {
    const generos = [...new Set(series.map(s => s.genero))]
        .sort((a, b) => a.localeCompare(b, "pt-BR"));

    const anos = [...new Set(series.map(s => s.ano))]
        .sort((a, b) => a - b);

    filtroGenero.innerHTML =
        '<option value="">Todos os gêneros</option>';

    filtroAno.innerHTML =
        '<option value="">Todos os anos</option>';

    generos.forEach(genero => {
        const opcao = document.createElement("option");
        opcao.value = genero;
        opcao.textContent = genero;
        filtroGenero.appendChild(opcao);
    });

    anos.forEach(ano => {
        const opcao = document.createElement("option");
        opcao.value = ano;
        opcao.textContent = ano;
        filtroAno.appendChild(opcao);
    });
}


function exibirSeries() {
    if (!carregado) return;

    const termo = pesquisa.value.trim().toLowerCase();
    const generoSelecionado = filtroGenero.value;
    const anoSelecionado = filtroAno.value;

    let resultado = series.filter(serie => {
        const correspondeTitulo =
            serie.titulo.toLowerCase().includes(termo);

        const correspondeGenero =
            !generoSelecionado ||
            serie.genero === generoSelecionado;

        const correspondeAno =
            !anoSelecionado ||
            String(serie.ano) === anoSelecionado;

        return correspondeTitulo &&
            correspondeGenero &&
            correspondeAno;
    });

    resultado.sort((a, b) => {
        return ordemCrescente
            ? a.ano - b.ano
            : b.ano - a.ano;
    });

    catalogo.innerHTML = "";

    if (resultado.length === 0) {
        mensagem.textContent = "Nenhuma série encontrada.";
        return;
    }

    mensagem.textContent =
        `${resultado.length} série(s) encontrada(s).`;

    resultado.forEach(serie => {
        const card = document.createElement("article");
        card.className = "card";

        const imagem = document.createElement("img");
        imagem.src = serie.imagem;
        imagem.alt = `Capa da série ${serie.titulo}`;
        imagem.loading = "lazy";

        
        imagem.onerror = function () {
            this.onerror = null;
            this.src = "https://placehold.co/400x600/1f2937/ffffff?text=Sem+Imagem";
        };

        const conteudo = document.createElement("div");
        conteudo.className = "card-conteudo";

        const titulo = document.createElement("h2");
        titulo.textContent = serie.titulo;

        const ano = document.createElement("p");
        ano.textContent = `Ano: ${serie.ano}`;

        const genero = document.createElement("p");
        genero.textContent = `Gênero: ${serie.genero}`;

        const temporadas = document.createElement("p");
        temporadas.textContent =
            `Temporadas: ${serie.temporadas}`;

        conteudo.append(titulo, ano, genero, temporadas);
        card.append(imagem, conteudo);
        catalogo.appendChild(card);
    });
}


function atualizarEstatisticas() {
    total.textContent = series.length;

    const ordenadas = [...series].sort(
        (a, b) => a.ano - b.ano
    );

    antiga.textContent =
        `${ordenadas[0].titulo} (${ordenadas[0].ano})`;

    recente.textContent =
        `${ordenadas[ordenadas.length - 1].titulo} (${ordenadas[ordenadas.length - 1].ano})`;
}


function ordenarSeries() {
    ordemCrescente = !ordemCrescente;

    botaoOrdenar.textContent = ordemCrescente
        ? "Ordenar por Ano ↑"
        : "Ordenar por Ano ↓";

    exibirSeries();
}


function limparFiltros() {
    pesquisa.value = "";
    filtroGenero.value = "";
    filtroAno.value = "";

    ordemCrescente = true;
    botaoOrdenar.textContent = "Ordenar por Ano ↑";

    exibirSeries();
}


botaoCarregar.addEventListener("click", carregarSeries);

pesquisa.addEventListener("input", exibirSeries);

filtroGenero.addEventListener("change", exibirSeries);

filtroAno.addEventListener("change", exibirSeries);

botaoOrdenar.addEventListener("click", ordenarSeries);

botaoLimpar.addEventListener("click", limparFiltros);