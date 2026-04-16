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
    pilha.push("<paramentros_formais>")
    pilha.push("<identificador>")
    pilha.push("procedure")
    return true
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

function pushInt(){
    pilha.pop() // retirar <tipo>
    pilha.push("int")
}
function pushBoolean(){
    pilha.pop()
    pilha.push("boolean")
}

function construirTabelaSintaxica(){
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