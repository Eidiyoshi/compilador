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

//Preparar fila

function enfileirarTokens(arrayTokens){
    var fila = [];
    while(arrayTokens.length != 0){ 
        var tokenInteiroAtual = arrayTokens.shift();
        var tokenAtual = tokenInteiroAtual.token;
        fila.push(tokenAtual);
    }
    fila.push("$")
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
    return fila[posicao]; //tirei o .shft, pq não quero criar um parâmetro a mais para todas as funções
}

function consumirToken(tokenEsperado)
{
    if (tokenAtual() !== tokenEsperado) {
        gerarErro(`ERRO sintatico: esperado "${tokenEsperado}", encontrado "${tokenAtual()}"`); // a existência do ` para manipular strings prova que javascript é uma desgraça
    }
    posicao++;
}

//Não terminais

function ntPrograma()
{
    consumirToken("program");
    ntIdentificador();
    consumirToken("ponto_e_virgula");
    ntBloco();
    consumirToken("ponto");
}

function ntBloco()
{
    console.log("------------------------");
    console.log("<bloco>");
    console.log(tokenAtual())
    tokens_aceitos = ["int", "boolean"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntParte_de_declaracoes_de_variaveis();
        ntParte_de_declaracoes_de_subrotinas();
        ntComando_composto1();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: bloco invalido`);
    }
}

function ntParte_de_declaracoes_de_variaveis()
{
    console.log("------------------------");
    console.log("<parte_de_declaracoes_de_variaveis>");
    console.log(tokenAtual())
    tokens_aceitos = ["int", "boolean"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntDeclaracao_de_variavel1();
        consumirToken("ponto_e_virgula")
        ntDeclaracao_de_variavel2();   
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: parte_de_declaracoes_de_variaveis invalido`);
    }
}

function ntDeclaracao_de_variavel1()
{
    console.log("------------------------");
    console.log("<declaracao_de_variavel1>");
    console.log(tokenAtual())
    tokens_aceitos = ["int", "boolean"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntTipo();
        ntLista_de_identificadores1();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: declaracao_de_variavel1 invalido`);
    }
}

function ntDeclaracao_de_variavel2()
{
    console.log("------------------------");
    console.log("<declaracao_de_variavel2>");
    console.log(tokenAtual())
    tokens_aceitos = ["int", "boolean"];
    tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntDeclaracao_de_variavel1();
        ntDeclaracao_de_variavel2();
        consumirToken("ponto_e_virgula");
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: declaracao_de_variavel2 invalido`);
    }
}

function ntIdentificador()
{
    console.log("------------------------");
    console.log("<identificador>");
    console.log(tokenAtual())
    tokens_aceitos = ["identificador_valido", "int", "boolean"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        posicao++;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: identificador invalido`);
    }
}

function ntLista_de_identificadores1()
{
    console.log("------------------------");
    console.log("<lista_de_identificadores1>");
    console.log(tokenAtual())
    tokens_aceitos = ["identificador_valido"];
    tokens_vazios = ["int", "virgula", "ponto_e_virgula", "procedure", "begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntIdentificador();
        ntLista_de_identificadores2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: lista_de_identificadores1 invalido`);
    }
}

function ntLista_de_identificadores2()
{
    console.log("------------------------");
    console.log("<lista_de_identificadores2>");
    console.log(tokenAtual())
    tokens_aceitos = ["virgula"];
    tokens_vazios = ["int", "ponto_e_virgula", "procedure", "begin", "dois_pontos"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("virgula");
        ntIdentificador();
        ntLista_de_identificadores2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: lista_de_identificadores2 invalido`);
    }
}

function ntTipo()
{
    console.log("------------------------");
    console.log("<tipo>");
    console.log(tokenAtual())
    tokens_aceitos = ["int", "boolean"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == "int")
        {
            consumirToken("int");
        }
        else
        {
            consumirToken("boolean");
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: tipo invalido`);
    }
}

function ntParte_de_declaracoes_de_subrotinas()
{
    console.log("------------------------");
    console.log("<parte_de_declaracoes_de_subrotinas>");
    console.log(tokenAtual())
    tokens_aceitos = ["procedure"];
    tokens_vazios = ["begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntDeclaracao_de_procedimento1();
        consumirToken("ponto_e_virgula");
        ntDeclaracao_de_procedimento2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: parte_de_declaracoes_de_subrotinas invalido`);
    }
}

function ntDeclaracao_de_procedimento2()
{
    console.log("------------------------");
    console.log("<declaracao_de_procedimento2>");
    console.log(tokenAtual())
    tokens_aceitos = ["procedure"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntDeclaracao_de_procedimento1();
        ntDeclaracao_de_procedimento2();
        consumirToken("ponto_e_virgula")
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: declaracao_de_procedimento2 invalido`);
    }
}

function ntDeclaracao_de_procedimento1()
{
    console.log("------------------------");
    console.log("<declaracao_de_procedimento1>");
    console.log(tokenAtual())
    tokens_aceitos = ["procedure"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("procedure");
        ntIdentificador();
        ntParametros_formais1();
        consumirToken("ponto_e_virgula")
        ntBloco();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: declaracao_de_procedimento1 invalido`);
    }
}

function ntParametros_formais1()
{
    console.log("------------------------");
    console.log("<parametros_formais1>");
    console.log(tokenAtual())
    tokens_aceitos = ["abre_parenteses"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("abre_parenteses");
        ntSecao_de_parametros_formais();
        ntParametros_formais2();
        consumirToken("fecha_parenteses");
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: parametros_formais1 invalido`);
    }
}

function ntParametros_formais2()
{
    console.log("------------------------");
    console.log("<parametros_formais2>");
    console.log(tokenAtual())
    tokens_aceitos = ["ponto_e_virgula"];
    tokens_vazios = ["fecha_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("ponto_e_virgula");
        ntSecao_de_parametros_formais();
        ntParametros_formais2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: parametros_formais2 invalido`);
    }
}

function ntSecaoDeParametrosFormais()
{
    console.log("------------------------");
    console.log("<secaoDeParametrosFormais>");
    console.log(tokenAtual())
    tokens_aceitos = ["var"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntVar();
        ntLista_de_identificadores1();
        consumirToken("dois_pontos");
        ntIdentificador();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: secaoDeParametrosFormais invalido`);
    }
}

function ntVar()
{
    console.log("------------------------");
    console.log("<var>");
    console.log(tokenAtual())
    tokens_aceitos = ["var"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("var");
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: var invalido`);
    }
}

function ntComando_composto1()
{
    console.log("------------------------");
    console.log("<comando_composto1>");
    console.log(tokenAtual())
    tokens_aceitos = ["begin"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("begin");
        ntComando1();
        ntComando_composto2();
        consumirToken("end");
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: comando_composto1 invalido`);
    }
}

function ntComando_composto2()
{
    console.log("------------------------");
    console.log("<comando_composto2>");
    console.log(tokenAtual())
    tokens_aceitos = ["ponto_e_virgula"];
    tokens_vazios = ["end"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("ponto_e_virgula");
        ntComando1();
        ntComando_composto2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: comando_composto2 invalido`);
    }
}

function ntComando1()
{
    console.log("------------------------");
    console.log("<comando1>");
    console.log(tokenAtual())
    tokens_aceitos = ["begin", "identificador_valido", "if", "while"];
    tokens_vazios = ["end"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == tokens_aceitos[0])
        {
            ntComando_composto1();
        }
        else if(tokenAtual() == tokens_aceitos[1])
        {
            ntIdentificador();
            ntComando2();
        }
        else if(tokenAtual() == tokens_aceitos[2])
        {
            consumirToken("if");
            ntExpressao1();
            consumirToken("then");
            ntComando1();
            ntElse();
        }
        else
        {
            consumirToken("while");
            ntExpressao1();
            consumirToken("do");
            ntComando1();
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: comando1 invalido`);
    }
}

function ntComando2()
{
    console.log("------------------------");
    console.log("<comando2>");
    console.log(tokenAtual())
    tokens_aceitos = ["abre_parenteses", "atribuicao"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == tokens_aceitos[0])
        {
            consumirToken("abre_parenteses");
            ntChamada_de_procedimento2();
        }
        else if(tokenAtual() == tokens_aceitos[1])
        {
            consumirToken("atribuicao");
            ntExpressao1();
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: comando2 invalido`);
    }
}

function ntAtribuicao()
{
    console.log("------------------------");
    console.log("<atribuicao>");
    console.log(tokenAtual())
    tokens_aceitos = ["identificador_valido"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntVariavel1();
        consumirToken("atribuicao");
        ntExpressao1();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: atribuicao invalido`);
    }
}

function ntChamada_de_procedimento1()
{
    console.log("------------------------");
    console.log("<chamada_de_procedimento1>");
    console.log(tokenAtual())
    tokens_aceitos = ["identificador_valido"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntIdentificador();
        ntChamada_de_procedimento2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: chamada_de_procedimento1 invalido`);
    }
}

function ntChamada_de_procedimento2()
{
    console.log("------------------------");
    console.log("<chamada_de_procedimento2>");
    console.log(tokenAtual())
    tokens_aceitos = ["identificador_valido", "virgula", "abre_parenteses", "fecha_parenteses", "+", "-", "not", "=", "<>", ">", ">=", "<", "<="];
    tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntLista_de_expressoes1();
        consumirToken("fecha_parenteses");
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: chamada_de_procedimento2 invalido`);
    }
}

function ntComando_condicional_1()
{
    console.log("------------------------");
    console.log("<comando_condicional_1>");
    console.log(tokenAtual())
    tokens_aceitos = ["if"];
    tokens_vazios = [];
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
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: comando_condicional_1 invalido`);
    }
}

function ntElse()
{
    console.log("------------------------");
    console.log("<else>");
    console.log(tokenAtual())
    tokens_aceitos = ["else"];
    tokens_vazios = ["ponto", "ponto_e_virgula", "begin", "procedure"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("else");
        ntComando1();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: else invalido`);
    }
}

function ntComando_repetitivo_1()
{
    console.log("------------------------");
    console.log("<comando_repetitivo_1>");
    console.log(tokenAtual())
    tokens_aceitos = [];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("while");
        ntExpressao1();
        consumirToken("do");
        ntComando1();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: comando_repetitivo_1 invalido`);
    }
}

function ntExpressao1()
{
    console.log("------------------------");
    console.log("<expressao1>");
    console.log(tokenAtual())
    tokens_aceitos = ["identificador_valido", "numero", "abre_parenteses", "+", "-", "not", "=", "<>", ">", ">=", "<", "<="];
    tokens_vazios = ["then", "do", "]", "procedure", "begin", "ponto", "ponto_e_virgula", "virgula", "fecha_parenteses", "end", "else"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntExpressao_simples1();
        ntExpressao2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: expressao1 invalido`);
    }
}

function ntExpressao2()
{
    console.log("------------------------");
    console.log("<expressao2>");
    console.log(tokenAtual())
    tokens_aceitos = ["=", "<>", ">", ">=", "<", "<="];
    tokens_vazios = ["then", "do", "]", "procedure", "begin", "ponto", "ponto_e_virgula", "virgula", "fecha_parenteses", "end", "else"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntRelacao();
        ntExpressao_simples1();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: expressao2 invalido`);
    }
}

function ntRelacao()
{
    console.log("------------------------");
    console.log("<relacao>");
    console.log(tokenAtual())
    tokens_aceitos = ["=", "<>", ">", ">=", "<", "<="];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken(tokenAtual()); //Acho que funciona
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: relacao invalido`);
    }
}

function ntExpressao_simples1()
{
    console.log("------------------------");
    console.log("<expressao_simples1>");
    console.log(tokenAtual())
    tokens_aceitos = ["identificador_valido", "numero", "abre_parenteses", "+", "-"];
    tokens_vazios = ["=", "<>", ">", ">=", "<", "<=", "then", "do", "]", "ponto", "ponto_e_virgula", "procedure", "begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntOp();
        ntTermo1();
        ntExpressao_simples2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: expressao_simples1 invalido`);
    }
}

function ntOp()
{
    console.log("------------------------");
    console.log("<op>");
    console.log(tokenAtual())
    tokens_aceitos = ["+", "-"];
    tokens_vazios = ["numero", "not", "identificador_valido", "abre_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken(tokenAtual()); //Mesma coisa, acho que funcione
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: op invalido`);
    }
}

function ntExpressao_simples2()
{
    console.log("------------------------");
    console.log("<expressao_simples2>");
    console.log(tokenAtual())
    tokens_aceitos = ["+", "-", "or"];
    tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin", "virgula", "abre_parenteses", "fecha_parenteses", "end", "else", "then", "do", "]", "=", "<>", ">", ">=", "<", "<="];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntOp2();
        ntTermo1();
        ntExpressao_simples2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: expressao_simples2 invalido`);
    }
}

function ntOp2()
{
    console.log("------------------------");
    console.log("<op2>");
    console.log(tokenAtual())
    tokens_aceitos = ["+", "-", "or"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken(tokenAtual());
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: op2 invalido`);
    }
}

function ntTermo1()
{
    console.log("------------------------");
    console.log("<termo1>");
    console.log(tokenAtual())
    tokens_aceitos = ["identificador_valido", "numero", "abre_parenteses", "not"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntFator();
        ntTermo2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: termo1 invalido`);
    }
}

function ntTermo2()
{
    console.log("------------------------");
    console.log("<termo2>");
    console.log(tokenAtual())
    tokens_aceitos = ["*", "/", "and"];
    tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin", "virgula", "fecha_parenteses", "end", "else", "then", "do", "+", "-", "]", "=", "<>", ">", ">=", "<", "<="];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntOp3();
        ntFator();
        ntTermo2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: termo2 invalido`);
    }
}

function ntOp3()
{
    console.log("------------------------");
    console.log("<op3>");
    console.log(tokenAtual())
    tokens_aceitos = ["*", "/", "and"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken(tokenAtual()); //só para deixar marcado
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: op3 invalido`);
    }
}

function ntFator()
{
    console.log("------------------------");
    console.log("<fator>");
    console.log(tokenAtual())
    tokens_aceitos = ["identificador_valido", "abre_parenteses", "numero", "not"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == tokens_aceitos[0])
        {
            ntVariavel1();
        }
        else if(tokenAtual() == tokens_aceitos[1])
        {
            consumirToken("abre_parenteses");
            ntExpressao1();
            consumirToken("fecha_parenteses");
        }
        else if(tokenAtual() == tokens_aceitos[2])
        {
            consumirToken("numero");
        }
        else
        {
            consumirToken("not");
            ntFator();
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: fator invalido`);
    }
}

function ntVariavel1()
{
    console.log("------------------------");
    console.log("<variavel1>");
    console.log(tokenAtual())
    tokens_aceitos = ["identificador_valido"];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntIdentificador();
        ntVariavel2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: variavel1 invalido`);
    }
}

function ntVariavel2()
{
    console.log("------------------------");
    console.log("<variavel2>");
    console.log(tokenAtual())
    tokens_aceitos = ["abre_parenteses", "[", "*", "/", "and"];
    tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin", "virgula", "fecha_parenteses", "end", "else", "then", "do", "+", "-", "]", "=", "<>", ">", ">=", "<", "<=", "atribuicao"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == tokens_aceitos[0])
        {
            consumirToken("abre_parenteses");
            ntLista_de_expressoes1();
            consumirToken("fecha_parenteses");
        }
        else if(tokenAtual() == tokens_aceitos[1])
        {
            consumirToken("[");
            ntExpressao1();
            consumirToken("]");
        }
        else
        {
            ntOp3();
            ntFator();
            ntTermo2();
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: variavel2 invalido`);
    }
}

function ntLista_de_expressoes1()
{
    console.log("------------------------");
    console.log("<lista_de_expressoes1>");
    console.log(tokenAtual())
    tokens_aceitos = ["identificador_valido", "virgula", "abre_parenteses", "+", "-", "]", "=", "<>", ">", ">=", "<", "<="];
    tokens_vazios = ["fecha_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntExpressao1();
        ntLista_de_expressoes2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: lista_de_expressoes1 invalido`);
    }
}

function ntLista_de_expressoes2()
{
    console.log("------------------------");
    console.log("<lista_de_expressoes2>");
    console.log(tokenAtual())
    tokens_aceitos = ["virgula"];
    tokens_vazios = ["fecha_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("virgula");
        ntExpressao1();
        ntLista_de_expressoes2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico: lista_de_expressoes2 invalido`);
    }
}

/*
function nt()
{
    console.log("------------------------");
    console.log("<>");
    console.log(tokenAtual())
    tokens_aceitos = [];
    tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintatico:  invalido`);
    }
}
*/

// principal

export function analisadorSintaxico(arrayTokens){
    fila = enfileirarTokens(arrayTokens);
    posicao = 0;

    exibirErroSintaxico("");
    
    try {
        ntPrograma();
 
        if (tokenAtual() !== "$") {
            gerarErro("ERRO sintatico: tokens sobrando apos o fim do programa");
        }
    } catch (e) {
        if (!(e instanceof ErroSintaxico)) throw e; //o erro não foi sintático
    }
    
}