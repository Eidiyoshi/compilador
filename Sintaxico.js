import { types, tokens } from "./Modulos/DefinicoesLexico.mjs";
// globalizar para facilitar a recursão

var pilha = [];
var fila = [];
var tabelaSintatica = {};
// nos nao terminais que possuem duas variações com ', o com sem está finalizado como 1, enquanto o com está com 2
// ex: <declaracao_de_variavel>  ==  <declaracao_de_variavel1>
//     <declaracao_de_variavel'> ==  <declaracao_de_variavel2>

// terminais estao escrito em extenso
// ex: ; == ponto_e_virgula

// tudo esta sendo feito baseado na tabela sintatica na qual o orientando do celso fez

// por ser pilha, cuidado na ordem de colocar nela, coloque as ultimas coisas primeiro, e as primeiras coisas por ultimo
// ex: <declaracao_de_variaveis1> <declaracao_de_variaveis2> ponto_e_virgula
//      pilha.push("ponto_e_virgula")
//      pilha.push("<declaracao_de_variaveis2>")
//      pilha.push("<declaracao_de_variaveis1>")

// lembrar de retornar as funcoes para true, para nao dar erro no while

function Programa(){
    var tokenAtual = fila.shift()
    var topoAtual = pilha.pop()
    if (topoAtual != "<programa>" && tokenAtual != "program") declararErroSintaxico("ERRO: PROGRAMA NAO ENCONTRADO");
    
    pilha.push("<bloco>")
    pilha.push("ponto_e_virgula")
    pilha.push("<identificador>")
}

function parteDeDeclaracoesDeVariaveis(){
    pilha.pop()
    pilha.push("<declaracao_de_variavel2>")
    pilha.push("ponto_e_virgula")
    pilha.push("<declaracao_de_variavel1>")
    return true
}

function declaracaoDeVariaveis2(){
    pilha.pop()
    pilha.push("ponto_e_virgula")
    pilha.push("<declaracao_de_variavel2>")
    pilha.push("<declaracao_de_variavel1>")
}

function declaracaoDeVariaveis1(){ 
    pilha.pop()
    pilha.push("<lista_de_identificadores1>")
    pilha.push("<tipo>")

    window.renderStack([...pilha]);
    return true
}

function Vazio(){
    pilha.pop() // Remover a parte
    return true
}

function RetirarAmbos(){
    pilha.pop()
    fila.shift()
}

function declararErroSintaxico(erroString){
    document.getElementById("checkSintaxico").textContent = erroString;
}

function listaDeIdentificadores2(){
    pilha.pop()
    pilha.push("<lista_de_identificadores2>")
    pilha.push("<identificador>")
    pilha.push("virgula")
    return true
}

function listaDeIdentificadores1(){
    pilha.pop()
    pilha.push("<lista_de_identificadores2>")
    pilha.push("<identificador>")
}

function Bloco(){
    pilha.pop()
    pilha.push("<comando_composto>")
    pilha.push("<parte_de_declaracoes_de_subrotinas>")
    pilha.push("<parte_de_declaracoes_de_variaveis>")
    return true
}

function ParteDeDeclaracoesDeSubrotina(){
    pilha.pop()
    pilha.push("<declaracao_de_procedimento2>")
    pilha.push("ponto_e_virgula")
    pilha.push("<declaracao_de_procedimento1>")
    return true
}

function declaracaoDeProcedimento2(){
    pilha.pop()
    pilha.push("ponto_e_virgula")
    pilha.push("<declaracao_de_procedimento2>")
    pilha.push("<declaracao_de_procedimento1>")
    return true
}

function declaracaoDeProcedimento1(){
    pilha.pop()
    pilha.push("<bloco>")
    pilha.push("ponto_e_virgula")
    pilha.push("<parametros_formais>")
    pilha.push("<identificador>")
    pilha.push("procedure")
    return true
}

function parametrosFormais(){
    pilha.pop()
    pilha.push("fecha_parenteses")
    pilha.push("<parametros_formais>")
    pilha.push("<secao_de_parametros_formais>")
    pilha.push("abre_parenteses")
}

function secaoDeParametrosFormais(){
    pilha.pop()
    pilha.push("<identificador>")
    pilha.push("dois_pontos")
    pilha.push("<lista_de_identificadores1>")
    pilha.push("<var>")
}

function comandoComposto1(){
    pilha.pop()
    pilha.push("end")
    pilha.push("<comando_composto2>")
    pilha.push("<comando1>")
    pilha.push("begin")
}

function comandoComposto2(){
    pilha.pop()
    pilha.push("<comando_composto2>")
    pilha.push("<comando1>")
    pilha.push("ponto_e_virgula")
}

function comando11(){
    pilha.pop()
    pilha.push("<comando_composto1>")
}

function comando12(){
    pilha.pop()
    pilha.push("<comando2>")
    pilha.push("<identificador>")
}

function comando21(){
    pilha.pop()
    pilha.push("<chamada_de_procedimento2>")
    pilha.push("abre_parenteses")
}

function comando22(){
    pilha.pop()
    pilha.push("<expressao>")
    pilha.push(":=")
}

function atribuicao(){
    pilha.pop()
    pilha.push("<expressao>")
    pilha.push(":=")
    pilha.push("<variavel>")
}

function chamadaDeProcedimento1(){
    pilha.pop()
    pilha.push("<chamada_de_procedimento2>")
    pilha.push("<identificador>")
}

function chamadaDeProcedimento2(){
    pilha.pop()
    pilha.push("fecha_parenteses")
    pilha.push("<lista_de_expressao>")
}

function comandoCondicional1(){
    pilha.push("<else>")
    pilha.push("<comando>")
    pilha.push("then")
    pilha.push("<expressao>")
    pilha.push("if")
    pilha.pop()
}

function else1(){
    pilha.pop()
    pilha.push("<comando>")
    pilha.push("else")
}

function comandoRepetitivo1(){
    pilha.pop()
    pilha.push("<comando1>")
    pilha.push("do")
    pilha.push("<expressao>")
    pilha.push("while")
}

function expressao(){
    pilha.pop()
    pilha.push("<expressao2>")
    pilha.push("<expressao_simples>")
}

function expressaoSimples1(){
    pilha.pop()
    pilha.push("<expressaoSimples2>")
    pilha.push("<termo>")
    pilha.push("<op>")
}
function expressaoSimples2(){
    pilha.pop()
    pilha.push("<expressaoSimples2>")
    pilha.push("<termo<")
    pilha.push("<op2>")
}

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

function pushVar(){
    pilha.pop()
    pilha.push("var")
}
function pushInt(){
    pilha.pop() // retirar <tipo>
    pilha.push("int")
}
function pushBoolean(){
    pilha.pop()
    pilha.push("boolean")
}
function pushIgual(){
    pilha.pop()
    pilha.push("=")
}
function pushMaior(){
    pilha.pop()
    pilha.push(">")
}
function pushMaiorI(){
    pilha.pop()
    pilha.push(">=")
}
function pushMenor(){
    pilha.pop()
    pilha.push("<")
}
function pushMenorI(){
    pilha.pop()
    pilha.push("<")
}
function pushDiferente(){
    pilha.pop()
    pilha.push("<>")
}
function pushAdicao(){
    pilha.pop()
    pilha.push("+")
}
function pushSubtracao(){
    pilha.pop()
    pilha.push("-")
}
function construirTabelaSintaxica(){
    {
    tabelaSintatica["<programa>"] = {}
    tabelaSintatica["<programa>"]["program"] = Programa
    
    tabelaSintatica["<bloco>"] = {}
    tabelaSintatica["<bloco>"]["int"] = Bloco
    tabelaSintatica["<bloco>"]["boolean"] = Bloco

    tabelaSintatica["<parte_de_declaracoes_de_variaveis>"] = {}
    tabelaSintatica["<parte_de_declaracoes_de_variaveis>"]["int"] = parteDeDeclaracoesDeVariaveis
    tabelaSintatica["<parte_de_declaracoes_de_variaveis>"]["boolean"] = parteDeDeclaracoesDeVariaveis

    tabelaSintatica["<declaracao_de_variavel1>"] = {}
    tabelaSintatica["<declaracao_de_variavel1>"]["int"] = declaracaoDeVariaveis1
    tabelaSintatica["<declaracao_de_variavel1>"]["boolean"] = declaracaoDeVariaveis1

    tabelaSintatica["<declaracao_de_variavel2>"] = {}
    tabelaSintatica["<declaracao_de_variavel2>"]["int"] = declaracaoDeVariaveis2
    tabelaSintatica["<declaracao_de_variavel2>"]["boolean"] = declaracaoDeVariaveis2
    tabelaSintatica["<declaracao_de_variavel2>"]["ponto"] = Vazio
    tabelaSintatica["<declaracao_de_variavel2>"]["ponto_e_virgula"] = Vazio
    tabelaSintatica["<declaracao_de_variavel2>"]["procedure"] = Vazio
    tabelaSintatica["<declaracao_de_variavel2>"]["begin"] = Vazio


    tabelaSintatica["<identificador>"] = {}
    tabelaSintatica["<identificador>"]["identificador_valido"] = RetirarAmbos
    tabelaSintatica["<identificador>"]["int"] = RetirarAmbos // foi preciso adicionar por conta do <parametros_formais>, ainda que eu não tenha ideia do porque
    tabelaSintatica["<identificador>"]["boolean"] = RetirarAmbos

    tabelaSintatica["<lista_de_identificadores1>"] = {}
    tabelaSintatica["<lista_de_identificadores1>"]["identificador_valido"] = listaDeIdentificadores1
    tabelaSintatica["<lista_de_identificadores1>"]["int"] = Vazio
    tabelaSintatica["<lista_de_identificadores1>"]["virgula"] = Vazio
    tabelaSintatica["<lista_de_identificadores1>"]["ponto_e_virgula"] = Vazio
    tabelaSintatica["<lista_de_identificadores1>"]["procedure"] = Vazio
    tabelaSintatica["<lista_de_identificadores1>"]["begin"] = Vazio

    tabelaSintatica["<lista_de_identificadores2>"] = {}
    tabelaSintatica["<lista_de_identificadores2>"]["virgula"] = listaDeIdentificadores2
    tabelaSintatica["<lista_de_identificadores2>"]["int"] = Vazio
    tabelaSintatica["<lista_de_identificadores2>"]["ponto_e_virgula"] = Vazio
    tabelaSintatica["<lista_de_identificadores2>"]["procedure"] = Vazio
    tabelaSintatica["<lista_de_identificadores2>"]["begin"] = Vazio
    tabelaSintatica["<lista_de_identificadores2>"]["dois_pontos"] = Vazio

    tabelaSintatica["<tipo>"] = {}
    tabelaSintatica["<tipo>"]["int"] = pushInt
    tabelaSintatica["<tipo>"]["boolean"] = pushBoolean

    tabelaSintatica["<parte_de_declaracoes_de_subrotinas>"] = {}
    tabelaSintatica["<parte_de_declaracoes_de_subrotinas>"]["procedure"] = ParteDeDeclaracoesDeSubrotina
    tabelaSintatica["<parte_de_declaracoes_de_subrotinas>"]["begin"] = Vazio

    tabelaSintatica["<declaracao_de_procedimento2>"] = {}
    tabelaSintatica["<declaracao_de_procedimento2>"]["procedure"] = declaracaoDeProcedimento2
    
    tabelaSintatica["<declaracao_de_procedimento1>"] = {}
    tabelaSintatica["<declaracao_de_procedimento1>"]["procedure"] = declaracaoDeProcedimento1

    tabelaSintatica["<parametros_formais>"] = {}
    tabelaSintatica["<parametros_formais>"]["abre_parenteses"] = parametrosFormais

    tabelaSintatica["<secao_de_parametros_formais>"] = {}
    tabelaSintatica["<secao_de_parametros_formais>"]["var"] = secaoDeParametrosFormais

    tabelaSintatica["<var>"] = {}
    tabelaSintatica["<var>"]["var"] = pushVar

    tabelaSintatica["<comando_composto1>"] = {}
    tabelaSintatica["<comando_composto1>"]["begin"] = comandoComposto1

    tabelaSintatica["<comando_composto2>"] = {}
    tabelaSintatica["<comando_composto2>"]["ponto_e_virgula"] = comandoComposto2

    tabelaSintatica["<comando1>"] = {}
    tabelaSintatica["<comando1>"]["begin"] = comando11
    tabelaSintatica["<comando1>"]["identificador_valido"] = comando12
    tabelaSintatica["<comando1>"]["if"] = comandoCondicional1
    tabelaSintatica["<comando1>"]["while"] = comandoRepetitivo1
    
    tabelaSintatica["<comando2>"] = {}
    tabelaSintatica["<comando2>"]["abre_parenteses"] = comando21
    tabelaSintatica["<comando2>"]["atribuicao"] = comando22
    
    tabelaSintatica["<atribuicao>"] = {}
    tabelaSintatica["<atribuicao>"]["identificador_valido"] = atribuicao

    tabelaSintatica["<chamada_de_procedimento1>"] = {}
    tabelaSintatica["<chamada_de_procedimento1>"]["identificador_valido"] = chamadaDeProcedimento1

    tabelaSintatica["<chamada_de_procedimento2>"] = {}
    tabelaSintatica["<chamada_de_procedimento2>"]["identificador_valido"] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"]["virgula"] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"]["abre_parenteses"] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"]["fecha_parenteses"] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"]["+"] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"]["-"] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"]["not"] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"]["="] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"]["<>"] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"][">"] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"][">="] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"]["<"] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"]["<="] = chamadaDeProcedimento2
    tabelaSintatica["<chamada_de_procedimento2>"]["ponto"] = Vazio
    tabelaSintatica["<chamada_de_procedimento2>"]["ponto_e_virgula"] = Vazio
    tabelaSintatica["<chamada_de_procedimento2>"]["procedure"] = Vazio
    tabelaSintatica["<chamada_de_procedimento2>"]["begin"] = Vazio

    tabelaSintatica["<comando_condicional_1"] = {}
    tabelaSintatica["<comando_condicional_1"]["if"] = comandoCondicional1
    
    tabelaSintatica["<else>"] = {}
    tabelaSintatica["<else>"]["else"] = else1
    tabelaSintatica["<else>"]["ponto"] = Vazio
    tabelaSintatica["<else>"]["ponto_e_virgula"] = Vazio
    tabelaSintatica["<else>"]["begin"] = Vazio
    tabelaSintatica["<else>"]["procedure"] = Vazio

    tabelaSintatica["<comando_repetitivo_1>"] = {}
    tabelaSintatica["<comando_repetitivo_1>"]["while"] = comandoRepetitivo1
    tabelaSintatica["<expressao1>"] = {}
    tabelaSintatica["<expressao1>"]["identificador_valido"] = expressao
    tabelaSintatica["<expressao1>"]["abre_parenteses"] = expressao
    tabelaSintatica["<expressao1>"]["+"] = expressao
    tabelaSintatica["<expressao1>"]["-"] = expressao
    tabelaSintatica["<expressao1>"]["not"] = expressao
    tabelaSintatica["<expressao1>"]["="] = expressao
    tabelaSintatica["<expressao1>"]["<>"] = expressao
    tabelaSintatica["<expressao1>"][">"] = expressao
    tabelaSintatica["<expressao1>"][">="] = expressao
    tabelaSintatica["<expressao1>"]["<"] = expressao
    tabelaSintatica["<expressao1>"]["<="] = expressao
    tabelaSintatica["<expressao1>"]["then"] = Vazio
    tabelaSintatica["<expressao1>"]["do"] = Vazio
    tabelaSintatica["<expressao1>"]["]"] = Vazio
    tabelaSintatica["<expressao1>"]["procedure"] = Vazio
    tabelaSintatica["<expressao1>"]["begin"] = Vazio
    tabelaSintatica["<expressao1>"]["ponto"] = Vazio
    tabelaSintatica["<expressao1>"]["ponto_e_virgula"] = Vazio
    tabelaSintatica["<expressao1>"]["virgula"] = Vazio
    tabelaSintatica["<expressao1>"]["fecha_parenteses"] = Vazio
    tabelaSintatica["<expressao1>"]["end"] = Vazio
    tabelaSintatica["<expressao1>"]["else"] = Vazio

    tabelaSintatica["<expressao2>"] = {}
    tabelaSintatica["<expressao2>"]["="] = expressao2
    tabelaSintatica["<expressao2>"]["<>"] = expressao2
    tabelaSintatica["<expressao2>"][">"] = expressao2
    tabelaSintatica["<expressao2>"][">="] = expressao2
    tabelaSintatica["<expressao2>"]["<"] = expressao2
    tabelaSintatica["<expressao2>"]["<="] = expressao2
    tabelaSintatica["<expressao2>"]["then"] = Vazio
    tabelaSintatica["<expressao2>"]["do"] = Vazio
    tabelaSintatica["<expressao2>"]["]"] = Vazio
    tabelaSintatica["<expressao2>"]["procedure"] = Vazio
    tabelaSintatica["<expressao2>"]["begin"] = Vazio
    tabelaSintatica["<expressao2>"]["ponto"] = Vazio
    tabelaSintatica["<expressao2>"]["ponto_e_virgula"] = Vazio
    tabelaSintatica["<expressao2>"]["virgula"] = Vazio
    tabelaSintatica["<expressao2>"]["fecha_parenteses"] = Vazio
    tabelaSintatica["<expressao2>"]["end"] = Vazio
    tabelaSintatica["<expressao2>"]["else"] = Vazio
    
    tabelaSintatica["<relacao>"] = {}
    tabelaSintatica["<relacao>"]["="] = pushIgual
    tabelaSintatica["<relacao>"]["<>"] = pushDiferente
    tabelaSintatica["<relacao>"][">"] = pushMaior
    tabelaSintatica["<relacao>"][">="] = pushMaiorI
    tabelaSintatica["<relacao>"]["<"] = pushMenor
    tabelaSintatica["<relacao>"]["<="] = pushMenorI
    
    }// apagar isso o quanto antes
    
    tabelaSintatica["<expressao_simples1>"] = {}
    tabelaSintatica["<expressao_simples1>"]["identificador_valido"] = expressaoSimples1
    tabelaSintatica["<expressao_simples1>"]["abre_parenteses"] = expressaoSimples1
    tabelaSintatica["<expressao_simples1>"]["+"] = expressaoSimples1
    tabelaSintatica["<expressao_simples1>"]["-"] = expressaoSimples1
    tabelaSintatica["<expressao_simples1>"]["="] = Vazio
    tabelaSintatica["<expressao_simples1>"]["<>"] = Vazio
    tabelaSintatica["<expressao_simples1>"]["<"] = Vazio
    tabelaSintatica["<expressao_simples1>"]["<="] = Vazio
    tabelaSintatica["<expressao_simples1>"][">"] = Vazio
    tabelaSintatica["<expressao_simples1>"][">="] = Vazio
    tabelaSintatica["<expressao_simples1>"]["then"] = Vazio
    tabelaSintatica["<expressao_simples1>"]["do"] = Vazio
    tabelaSintatica["<expressao_simples1>"]["]"] = Vazio
    tabelaSintatica["<expressao_simples1>"]["ponto"] = Vazio
    tabelaSintatica["<expressao_simples1>"]["ponto_e_virgula"] = Vazio
    tabelaSintatica["<expressao_simples1>"]["procedure"] = Vazio
    tabelaSintatica["<expressao_simples1>"]["begin"] = Vazio

    tabelaSintatica["<op>"] = {}
    tabelaSintatica["<op>"]["+"] = pushAdicao
    tabelaSintatica["<op>"]["-"] = pushSubtracao
    tabelaSintatica["<op>"]["not"] = Vazio
    tabelaSintatica["<op>"]["identificador_valido"] = Vazio
    tabelaSintatica["<op>"]["abre_parenteses"] = Vazio
    
    tabelaSintatica["<expressao_simples2>"] = {}
    tabelaSintatica["<expressao_simples2>"]["+"] = expressaoSimples2
    tabelaSintatica["<expressao_simples2>"]["-"] = expressaoSimples2
    tabelaSintatica["<expressao_simples2>"]["or"] = expressaoSimples2
    tabelaSintatica["<expressao_simples2>"]["ponto"] = Vazio
    tabelaSintatica["<expressao_simples2>"]["ponto_e_virgula"] = Vazio
    tabelaSintatica["<expressao_simples2>"]["procedure"] = Vazio
    tabelaSintatica["<expressao_simples2>"]["begin"] = Vazio
    tabelaSintatica["<expressao_simples2>"]["virgula"] = Vazio
    tabelaSintatica["<expressao_simples2>"]["abre_parenteses"] = Vazio
    tabelaSintatica["<expressao_simples2>"]["end"] = Vazio
    tabelaSintatica["<expressao_simples2>"]["else"] = Vazio
    tabelaSintatica["<expressao_simples2>"]["="] = Vazio
    tabelaSintatica["<expressao_simples2>"]["<>"] = Vazio
    tabelaSintatica["<expressao_simples2>"]["<"] = Vazio
    tabelaSintatica["<expressao_simples2>"]["<="] = Vazio
    tabelaSintatica["<expressao_simples2>"][">"] = Vazio
    tabelaSintatica["<expressao_simples2>"][">="] = Vazio
    tabelaSintatica["<expressao_simples2>"]["then"] = Vazio
    tabelaSintatica["<expressao_simples2>"]["do"] = Vazio
    tabelaSintatica["<expressao_simples2>"]["]"] = Vazio
    
}

export function analisadorSintaxico(arrayTokens){
    construirTabelaSintaxica()
    fila = enfileirarTokens(arrayTokens);

    declararErroSintaxico("");

    // Inicio do programa
    pilha.push("<programa>");
    

    while( (fila[0] != "$" ) && (fila.length > 0) ){
        var topoPilha = pilha[pilha.length - 1]; //troquei o pop por isso pq não tava exibindo a pilha
        var tokenAtual = fila[0]

        console.log("loop----")
        console.log(pilha)
        console.log(tokenAtual)
        
        if ( tokenAtual == topoPilha ){ // caso batam, sao removidos
            RetirarAmbos()
            continue
        }
        
        tabelaSintatica[topoPilha][tokenAtual]();

        //if ( tabelaSintatica[topoPilha][tokenAtual]() ) declararErroSintaxico("ERRO")
    }
    
}

export { pilha };