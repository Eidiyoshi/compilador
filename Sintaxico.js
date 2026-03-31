
// ver como ficar dps, pode acabar virando uma constante
function construirTabelaPreditiva(){
    let tabelaPreditiva = {};
    tabelaPreditiva["S"]["a"] = "ab";
    console.log(tabelaPreditiva["S"]["a"]);
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

function DeclararVariavel(pilha){
    pilha.push("ponto_e_virgula")
    pilha.push("identificador_valido")
    pilha.push("tipo")
    return pilha
}

export function analisadorSintaxico(arrayTokens){
    var fila = enfileirarTokens(arrayTokens);
    var pilha = [];

    // eventualmente isto seria substituido por S pra programa ou algo do tipo
    // testemos para declaracao de variavel no momento
    pilha.push("Variavel");
    

    while(fila.length != 1 && fila[0] != "$" ){
        var tokenAtual = fila.shift()
        var topoPilha = pilha.pop()

        if( topoPilha == "Variavel" ) DeclararVariavel(pilha);
    }
    construirTabelaPreditiva();
}