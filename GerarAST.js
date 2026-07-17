import { types, tokens } from "./Modulos/DefinicoesLexico.mjs";
// globalizar para facilitar a recursão

var fila = [];
var posicao = 0;

// nos nao terminais que possuem duas variações com ', o com sem está finalizado como 1, enquanto o com está com 2
// ex: <declaracao_de_variavel>  ==  <declaracao_de_variavel1>
//     <declaracao_de_variavel'> ==  <declaracao_de_variavel2>

// terminais estao escrito em extenso
// ex: ; == ponto_e_virgula

// tudo esta sendo feito baseado na tabela sintatica na qual o orientando do celso fez

//Uso:
// const(ou qualquer outro que declare variável) ast = analisadorSintaxico(arrayTokens);
//
//Retorno:
// AST se der certo, null se der errado

//Preparar fila

function enfileirarTokens(arrayTokens){
    var fila = [];
    while(arrayTokens.length != 0){ 
        var tokenInteiroAtual = arrayTokens.shift();
        var tokenAtual = tokenInteiroAtual.token;
        var lexemaAtual = tokenInteiroAtual.lexema;
        fila.push({token: tokenAtual, lexema: lexemaAtual});
    }
    fila.push({token: "$"})
    return fila;
}

//Erro

class ErroSintaxico extends Error {}

function exibirErroSintaxico(erroString)
{
    document.getElementById("checkSintaxico").textContent = erroString;
}

function gerarErro(mensagem)
{
    exibirErroSintaxico(mensagem);
    throw new ErroSintaxico(mensagem);
}

//Terminal

function tokenAtual()
{
    return fila[posicao]?.token; // o ? faz retornar undefined, quando é nulo, em vez de dar erro
}

function valorAtual() {
    return fila[posicao]?.lexema; // ?? tokenAtual(); adicionar caso der ruim
}

function consumirToken(tokenEsperado)
{
    if (tokenAtual() !== tokenEsperado) {
        gerarErro(`ERRO sintaxico: esperado "${tokenEsperado}", encontrado "${tokenAtual()}"`); // a existência do ` para manipular strings prova que javascript é uma desgraça
    }
    posicao++;
}

function combinarEsquerda(base, lista) {
    let resultado = base;
    for (const { operador, operando } of lista) {
        resultado = { tipo: "binaria", operador, esquerda: resultado, direita: operando };
    }
    return resultado;
}

//Não terminais

function ntPrograma()
{
    consumirToken("program");
    const nome = valorAtual();
    ntIdentificador();
    consumirToken("ponto_e_virgula");
    const bloco = ntBloco();
    consumirToken("ponto");
    return { tipo: "programa", nome, bloco };
    // marca o inicio do programa
}

function ntBloco()
{
    console.log("------------------------");
    console.log("<bloco>");
    console.log(tokenAtual())
    const tokens_aceitos = ["int", "boolean"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const parte_de_declaracoes_de_variaveis = ntParte_de_declaracoes_de_variaveis();
        const parte_de_declaracoes_de_subrotinas = ntParte_de_declaracoes_de_subrotinas();
        const comando_composto1 = ntComando_composto1();
        return { tipo: "bloco", parte_de_declaracoes_de_variaveis, parte_de_declaracoes_de_subrotinas, comando_composto1 };
        // marca os blocos gerados
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: bloco invalido`);
    }
}

function ntParte_de_declaracoes_de_variaveis()
{
    console.log("------------------------");
    console.log("<parte_de_declaracoes_de_variaveis>");
    console.log(tokenAtual())
    const tokens_aceitos = ["int", "boolean"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const declaracao_de_variavel1 = ntDeclaracao_de_variavel1();
        consumirToken("ponto_e_virgula")
        const declaracao_de_variavel2 = ntDeclaracao_de_variavel2();
        return [...declaracao_de_variavel1, ...declaracao_de_variavel2];
        //... serve para abrir o array, resultando em uma lista de formato [] em vez de [[],[]]
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: parte_de_declaracoes_de_variaveis invalido`);
    }
}

function ntDeclaracao_de_variavel1()
{
    console.log("------------------------");
    console.log("<declaracao_de_variavel1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["int", "boolean"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const tipo = ntTipo();
        const lista_de_identificadores1 = ntLista_de_identificadores1();
        return lista_de_identificadores1.map((lista_de_identificadores1) => ({ lista_de_identificadores1, tipo }));
        // .map percorre cada elemento do lista_de_identificadores1
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: declaracao_de_variavel1 invalido`);
    }
}

function ntDeclaracao_de_variavel2()
{
    console.log("------------------------");
    console.log("<declaracao_de_variavel2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["int", "boolean"];
    const tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const declaracao_de_variavel1 = ntDeclaracao_de_variavel1();
        const declaracao_de_variavel2 = ntDeclaracao_de_variavel2();
        consumirToken("ponto_e_virgula");
        return [...declaracao_de_variavel1, ...declaracao_de_variavel2];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: declaracao_de_variavel2 invalido`);
    }
}

function ntIdentificador()
{
    console.log("------------------------");
    console.log("<identificador>");
    console.log(tokenAtual())
    const tokens_aceitos = ["identificador_valido", "int", "boolean"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        posicao++;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: identificador invalido`);
    }
}

function ntLista_de_identificadores1()
{
    console.log("------------------------");
    console.log("<lista_de_identificadores1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["identificador_valido"];
    const tokens_vazios = ["int", "virgula", "ponto_e_virgula", "procedure", "begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const nome = valorAtual();
        ntIdentificador();
        const lista_de_identificadores2 = ntLista_de_identificadores2();
        return [nome, ...lista_de_identificadores2];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: lista_de_identificadores1 invalido`);
    }
}

function ntLista_de_identificadores2()
{
    console.log("------------------------");
    console.log("<lista_de_identificadores2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["virgula"];
    const tokens_vazios = ["int", "ponto_e_virgula", "procedure", "begin", "dois_pontos"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("virgula");
        const nome = valorAtual();
        ntIdentificador();
        const lista_de_identificadores2 = ntLista_de_identificadores2();
        return [nome, ...lista_de_identificadores2];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: lista_de_identificadores2 invalido`);
    }
}

function ntTipo()
{
    console.log("------------------------");
    console.log("<tipo>");
    console.log(tokenAtual())
    const tokens_aceitos = ["int", "boolean"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const t = tokenAtual();
        consumirToken(tokenAtual());
        return t;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: tipo invalido`);
    }
}

function ntParte_de_declaracoes_de_subrotinas()
{
    console.log("------------------------");
    console.log("<parte_de_declaracoes_de_subrotinas>");
    console.log(tokenAtual())
    const tokens_aceitos = ["procedure"];
    const tokens_vazios = ["begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const declaracao_de_procedimento1 = ntDeclaracao_de_procedimento1();
        consumirToken("ponto_e_virgula");
        const declaracao_de_procedimento2 = ntDeclaracao_de_procedimento2();
        return [declaracao_de_procedimento1, ...declaracao_de_procedimento2]
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: parte_de_declaracoes_de_subrotinas invalido`);
    }
}

function ntDeclaracao_de_procedimento2()
{
    console.log("------------------------");
    console.log("<declaracao_de_procedimento2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["procedure"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const declaracao_de_procedimento1 = ntDeclaracao_de_procedimento1();
        const declaracao_de_procedimento2 = ntDeclaracao_de_procedimento2();
        consumirToken("ponto_e_virgula")
        return [declaracao_de_procedimento1, ...declaracao_de_procedimento2];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: declaracao_de_procedimento2 invalido`);
    }
}

function ntDeclaracao_de_procedimento1()
{
    console.log("------------------------");
    console.log("<declaracao_de_procedimento1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["procedure"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("procedure");
        const nome = valorAtual();
        ntIdentificador();
        const parametros_formais1 = ntParametros_formais1();
        consumirToken("ponto_e_virgula")
        const bloco = ntBloco();
        return { tipo: "procedimento", nome, parametros_formais1, bloco };
        // marca os procedimentos gerados (o Celso falou que n vai cobrar, mas coloquei aí)
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: declaracao_de_procedimento1 invalido`);
    }
}

function ntParametros_formais1()
{
    console.log("------------------------");
    console.log("<parametros_formais1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["abre_parenteses"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("abre_parenteses");
        const secao_de_parametros_formais = ntSecao_de_parametros_formais();
        const parametros_formais2 = ntParametros_formais2();
        consumirToken("fecha_parenteses");
        return [...secao_de_parametros_formais, ...parametros_formais2];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: parametros_formais1 invalido`);
    }
}

function ntParametros_formais2()
{
    console.log("------------------------");
    console.log("<parametros_formais2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["ponto_e_virgula"];
    const tokens_vazios = ["fecha_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("ponto_e_virgula");
        const secao_de_parametros_formais = ntSecao_de_parametros_formais();
        const parametros_formais2 = ntParametros_formais2();
        return [...secao_de_parametros_formais, ...parametros_formais2];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: parametros_formais2 invalido`);
    }
}

function ntSecao_de_parametros_formais()
{
    console.log("------------------------");
    console.log("<secao_de_parametros_formais>");
    console.log(tokenAtual())
    const tokens_aceitos = ["var"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntVar();
        const lista_de_identificadores1 = ntLista_de_identificadores1();
        consumirToken("dois_pontos");
        const tipo = tokenAtual();
        ntIdentificador();
        return lista_de_identificadores1.map((lista_de_identificadores1) => ({ lista_de_identificadores1, tipo }));
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: secaoDeParametrosFormais invalido`);
    }
}

function ntVar()
{
    console.log("------------------------");
    console.log("<var>");
    console.log(tokenAtual())
    const tokens_aceitos = ["var"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("var");
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: var invalido`);
    }
}

function ntComando_composto1()
{
    console.log("------------------------");
    console.log("<comando_composto1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["begin"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("begin");
        const comando1 = ntComando1();
        const comando_composto2 = ntComando_composto2();
        consumirToken("end");
        const comandos = [comando1, ...comando_composto2].filter((c) => c !== null);
        // tira todos os null
        return { tipo: "composto", comandos };
        // marca os comandos
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: comando_composto1 invalido`);
    }
}

function ntComando_composto2()
{
    console.log("------------------------");
    console.log("<comando_composto2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["ponto_e_virgula"];
    const tokens_vazios = ["end"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("ponto_e_virgula");
        const comando1 = ntComando1();
        const comando_composto2 = ntComando_composto2();
        return [comando1, ...comando_composto2]; // não precisa tirar o null, já que o cmd_comp1 já tira
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: comando_composto2 invalido`);
    }
}

function ntComando1()
{
    console.log("------------------------");
    console.log("<comando1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["begin", "identificador_valido", "if", "while"];
    const tokens_vazios = ["end"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == tokens_aceitos[0])
        {
            return ntComando_composto1();
        }
        else if(tokenAtual() == tokens_aceitos[1])
        {
            const nome = valorAtual();
            ntIdentificador();
            return ntComando2(nome);
        }
        else if(tokenAtual() == tokens_aceitos[2])
        {
            consumirToken("if");
            const expressao1 = ntExpressao1();
            consumirToken("then");
            const comando1 = ntComando1();
            const els = ntElse();
            return { tipo: "se", expressao1, comando1, els };
            // marca os ifs
        }
        else
        {
            consumirToken("while");
            const expressao1 = ntExpressao1();
            consumirToken("do");
            const comando1 = ntComando1();
            return { tipo: "enquanto", expressao1, comando1 };
            // marca os whiles
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return null;
    }
    else
    {
        gerarErro(`ERRO sintaxico: comando1 invalido`);
    }
}

function ntComando2(nome)
{
    console.log("------------------------");
    console.log("<comando2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["abre_parenteses", "atribuicao"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == tokens_aceitos[0])
        {
            consumirToken("abre_parenteses");
            const chamada_de_procedimento2 = ntChamada_de_procedimento2();
            return { tipo: "chamada_procedimento", nome, chamada_de_procedimento2 };
            // marca a chamada de procedimento, como dito anteriormente, o Celso n vai cobrar isso
        }
        else
        {
            consumirToken("atribuicao");
            const expressao1 = ntExpressao1();
            return { tipo: "atribuicao", alvo: { tipo: "variavel", nome }, expressao1 };
            // marca atribuição
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: comando2 invalido`);
    }
}

function ntAtribuicao() //está na tabela do TCC, mas n é usado
{
    console.log("------------------------");
    console.log("<atribuicao>");
    console.log(tokenAtual())
    const tokens_aceitos = ["identificador_valido"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntVariavel1();
        consumirToken("atribuicao");
        ntExpressao1();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: atribuicao invalido`);
    }
}

function ntChamada_de_procedimento1() //está na tabela do TCC, mas n é usado
{
    console.log("------------------------");
    console.log("<chamada_de_procedimento1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["identificador_valido"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntIdentificador();
        ntChamada_de_procedimento2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: chamada_de_procedimento1 invalido`);
    }
}

function ntChamada_de_procedimento2()
{
    console.log("------------------------");
    console.log("<chamada_de_procedimento2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["identificador_valido", "virgula", "abre_parenteses", "fecha_parenteses", "+", "-", "not", "=", "<>", ">", ">=", "<", "<="];
    const tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const lista_de_expressoes1 = ntLista_de_expressoes1();
        consumirToken("fecha_parenteses");
        return lista_de_expressoes1
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: chamada_de_procedimento2 invalido`);
    }
}

function ntComando_condicional_1() //está na tabela do TCC, mas n é usado
{
    console.log("------------------------");
    console.log("<comando_condicional_1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["if"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("if");
        ntExpressao1();
        consumirToken("then");
        ntComando1();
        ntElse();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: comando_condicional_1 invalido`);
    }
}

function ntElse()
{
    console.log("------------------------");
    console.log("<else>");
    console.log(tokenAtual())
    const tokens_aceitos = ["else"];
    const tokens_vazios = ["ponto", "ponto_e_virgula", "begin", "procedure"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("else");
        return ntComando1();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return null;
    }
    else
    {
        gerarErro(`ERRO sintaxico: else invalido`);
    }
}

function ntComando_repetitivo_1() //está na tabela do TCC, mas n é usado
{
    console.log("------------------------");
    console.log("<comando_repetitivo_1>");
    console.log(tokenAtual())
    const tokens_aceitos = [];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("while");
        ntExpressao1();
        consumirToken("do");
        ntComando1();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: comando_repetitivo_1 invalido`);
    }
}

function ntExpressao1()
{
    console.log("------------------------");
    console.log("<expressao1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["identificador_valido", "numero", "abre_parenteses", "+", "-", "not", "=", "<>", ">", ">=", "<", "<="];
    const tokens_vazios = ["then", "do", "]", "procedure", "begin", "ponto", "ponto_e_virgula", "virgula", "fecha_parenteses", "end", "else"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const expressao_simples1 = ntExpressao_simples1();
        const expressao2 = ntExpressao2();
        if (expressao2)
        { 
            return { tipo: "binaria", operador: expressao2.operador, expressao_simples1, direita: expressao2.direita };
            // marca expressões binarias
            // o .direita da expressao2 surge do termo1 e expressao_simples1
        }
        return expressao_simples1;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: expressao1 invalido`);
    }
}

function ntExpressao2()
{
    console.log("------------------------");
    console.log("<expressao2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["=", "<>", ">", ">=", "<", "<="];
    const tokens_vazios = ["then", "do", "]", "procedure", "begin", "ponto", "ponto_e_virgula", "virgula", "fecha_parenteses", "end", "else"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const relacao = ntRelacao();
        const expressao_simples1 = ntExpressao_simples1();
        return { relacao, expressao_simples1 };
        // monta a comparacao
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return null;
    }
    else
    {
        gerarErro(`ERRO sintaxico: expressao2 invalido`);
    }
}

function ntRelacao()
{
    console.log("------------------------");
    console.log("<relacao>");
    console.log(tokenAtual())
    const tokens_aceitos = ["=", "<>", ">", ">=", "<", "<="];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const operador = tokenAtual();
        consumirToken(tokenAtual()); //Acho que funciona
        return operador;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: relacao invalido`);
    }
}

function ntExpressao_simples1()
{
    console.log("------------------------");
    console.log("<expressao_simples1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["identificador_valido", "numero", "abre_parenteses", "+", "-"];
    const tokens_vazios = ["=", "<>", ">", ">=", "<", "<=", "then", "do", "]", "ponto", "ponto_e_virgula", "procedure", "begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const op = ntOp();
        const termo1 = ntTermo1();
        if (op === "-")
        {
            termo1 = { tipo: "unaria", operador: "-", operando: termo1 };
        }
        const expressao_simples2 = ntExpressao_simples2();
        return combinarEsquerda(termo1, expressao_simples2);
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: expressao_simples1 invalido`);
    }
}

function ntOp()
{
    console.log("------------------------");
    console.log("<op>");
    console.log(tokenAtual())
    const tokens_aceitos = ["+", "-"];
    const tokens_vazios = ["numero", "not", "identificador_valido", "abre_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const operador = tokenAtual();
        consumirToken(tokenAtual()); //Mesma coisa, acho que funcione
        return operador;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return null;
    }
    else
    {
        gerarErro(`ERRO sintaxico: op invalido`);
    }
}

function ntExpressao_simples2()
{
    console.log("------------------------");
    console.log("<expressao_simples2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["+", "-", "or"];
    const tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin", "virgula", "abre_parenteses", "fecha_parenteses", "end", "else", "then", "do", "]", "=", "<>", ">", ">=", "<", "<="];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const op2 = ntOp2();
        const termo1 = ntTermo1();
        const expressao_simples2 = ntExpressao_simples2();
        return [{ op2, termo1 }, ...expressao_simples2];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: expressao_simples2 invalido`);
    }
}

function ntOp2()
{
    console.log("------------------------");
    console.log("<op2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["+", "-", "or"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const operador = tokenAtual();
        consumirToken(tokenAtual());
        return operador;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: op2 invalido`);
    }
}

function ntTermo1()
{
    console.log("------------------------");
    console.log("<termo1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["identificador_valido", "numero", "abre_parenteses", "not"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const fator = ntFator();
        const termo2 = ntTermo2();
        return combinarEsquerda(fator, termo2);
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: termo1 invalido`);
    }
}

function ntTermo2()
{
    console.log("------------------------");
    console.log("<termo2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["*", "/", "and"];
    const tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin", "virgula", "fecha_parenteses", "end", "else", "then", "do", "+", "-", "]", "=", "<>", ">", ">=", "<", "<="];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const op3 = ntOp3();
        const fator = ntFator();
        const termo2 = ntTermo2();
        return [{ op3, fator }, ...termo2];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: termo2 invalido`);
    }
}

function ntOp3()
{
    console.log("------------------------");
    console.log("<op3>");
    console.log(tokenAtual())
    const tokens_aceitos = ["*", "/", "and"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const operador = tokenAtual();
        consumirToken(tokenAtual());
        return operador;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: op3 invalido`);
    }
}

function ntFator()
{
    console.log("------------------------");
    console.log("<fator>");
    console.log(tokenAtual())
    const tokens_aceitos = ["identificador_valido", "abre_parenteses", "numero", "not"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == tokens_aceitos[0])
        {
            return ntVariavel1();
        }
        else if(tokenAtual() == tokens_aceitos[1])
        {
            consumirToken("abre_parenteses");
            const expressao1 = ntExpressao1();
            consumirToken("fecha_parenteses");
            return expressao1;
        }
        else if(tokenAtual() == tokens_aceitos[2])
        {
            const numero = valorAtual()
            consumirToken("numero");
            return { tipo: "numero", valor };
            // marca numeros
        }
        else
        {
            consumirToken("not");
            const fator = ntFator();
            return { tipo: "unaria", operador: "not", fator };
            // marca operador not
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: fator invalido`);
    }
}

function ntVariavel1()
{
    console.log("------------------------");
    console.log("<variavel1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["identificador_valido"];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const nome = valorAtual();
        ntIdentificador();
        const variavel2 = ntVariavel2();
        if (variavel2?.tipo === "indice") return { tipo: "variavel_indexada", nome, indice: variavel2.expressao };
        return { tipo: "variavel", nome };
        // marca variavel
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: variavel1 invalido`);
    }
}

function ntVariavel2()
{
    console.log("------------------------");
    console.log("<variavel2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["abre_parenteses", "["];
    const tokens_vazios = ["*", "/", "and", "ponto", "ponto_e_virgula", "procedure", "begin", "virgula", "fecha_parenteses", "end", "else", "then", "do", "+", "-", "]", "=", "<>", ">", ">=", "<", "<=", "atribuicao"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == tokens_aceitos[0])
        {
            consumirToken("abre_parenteses");
            const lista_de_expressoes1 = ntLista_de_expressoes1();
            consumirToken("fecha_parenteses");
            return { tipo: "chamada", lista_de_expressoes1 };
            // marca chamada de variavel
        }
        else
        {
            consumirToken("[");
            const expressao1 = ntExpressao1();
            consumirToken("]");
            return { tipo: "indice", expressao1 };
            // marca o indice
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return null;
    }
    else
    {
        gerarErro(`ERRO sintaxico: variavel2 invalido`);
    }
}

function ntLista_de_expressoes1()
{
    console.log("------------------------");
    console.log("<lista_de_expressoes1>");
    console.log(tokenAtual())
    const tokens_aceitos = ["identificador_valido", "virgula", "abre_parenteses", "+", "-", "]", "=", "<>", ">", ">=", "<", "<="];
    const tokens_vazios = ["fecha_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const expressao1 = ntExpressao1();
        const lista_de_expressoes2 = ntLista_de_expressoes2();
        return [expressao1, ...lista_de_expressoes2];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: lista_de_expressoes1 invalido`);
    }
}

function ntLista_de_expressoes2()
{
    console.log("------------------------");
    console.log("<lista_de_expressoes2>");
    console.log(tokenAtual())
    const tokens_aceitos = ["virgula"];
    const tokens_vazios = ["fecha_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("virgula");
        const expressao1 = ntExpressao1();
        const lista_de_expressoes2 = ntLista_de_expressoes2();
        return [expressao1, ...lista_de_expressoes2];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: lista_de_expressoes2 invalido`);
    }
}

/*
function nt()
{
    console.log("------------------------");
    console.log("<>");
    console.log(tokenAtual())
    const tokens_aceitos = [];
    const tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico:  invalido`);
    }
}
*/

// principal

export function gerarAST(arrayTokens){
    fila = enfileirarTokens(arrayTokens);
    posicao = 0;

    exibirErroSintaxico("");
    
    try {
        const ast = ntPrograma();
 
        if (tokenAtual() !== "$") {
            gerarErro("ERRO sintaxico: tokens sobrando apos o fim do programa");
        }
        return ast;
    } catch (e) {
        if (!(e instanceof ErroSintaxico)) throw e; //o erro não foi sintático
        return null;
    }
    
}