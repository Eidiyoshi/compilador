import { types, tokens } from "./Modulos/DefinicoesLexico.mjs";
// globalizar para facilitar a recursão
var pilha = [];
var fila = [];

// ver como ficar dps, pode acabar virando uma constante
// talvez precise posteriormente para considerar todos os caminhos, mas no momento nao precisei
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

function declararErroSintaxico(erroString){
    document.getElementById("checkSintaxico").textContent = erroString;
}

function DeclararVariavel(){
    pilha.push("<ponto_e_virgula>")
    pilha.push("<virgula>")
    pilha.push("<identificador_valido>")
    pilha.push("<tipo>")

    window.renderStack([...pilha]);

    var erro = 0;
    var iteracoesMax = 0;
    do {
        iteracoesMax = iteracoesMax + 1;

        var tokenAtual = fila.shift();
        var topoAtual = pilha.pop();

        console.log(topoAtual)
        console.log(tokenAtual)
        console.log("-----")

        if (topoAtual == "<tipo>" && (types.includes(tokenAtual) )) continue;
        
        if (topoAtual == "<identificador_valido>" && tokenAtual == "identificador_valido" ) continue;

        if (topoAtual == "<virgula>" && tokenAtual == "virgula" ){
            pilha.push("<virgula>")
            pilha.push("<identificador_valido>")
            continue;
        } 

        if( topoAtual == "<virgula>" && tokenAtual == "ponto_e_virgula" ){ // esperando mais uma variavel, mas encontrou ponto_e_virgula, caminho normal
            topoAtual = pilha.pop();
            if( topoAtual == "<identificador_valido>" && tokenAtual == "ponto_e_virgula" ) topoAtual = pilha.pop();
        }
        

        // ERROS

        if (topoAtual == "<identificador_valido>" && tokenAtual == "virgula" ){
            declararErroSintaxico("ERRO: NUMERO EXCESSIVO DE VIRGULAS")
            console.log("ERRO: NUMERO EXCESSIVO DE VIRGULAS")
            erro = 1;
            break;
        }

        if (topoAtual == "<virgula>" && tokenAtual == "identificador_valido" ){
            declararErroSintaxico("ERRO: NUMERO EXCESSIVO DE VIRGULAS")
            console.log("ERRO: NUMERO EXCESSIVO DE VIRGULAS")
            erro = 1;
            break;
        }

        if( topoAtual != "<ponto_e_virgula>" && tokenAtual == "ponto_e_virgula"){ 
            declararErroSintaxico("ERRO: PONTO_E_VIRGULA INESPERADO")
            console.log("ERRO: PONTO_E_VIRGULA INESPERADO")
            erro = 1;
            break;
        }
        
        if( (topoAtual == "<ponto_e_virgula>" || topoAtual == "<identificador_valido>" || topoAtual == "<virgula>" ) && !tokens.includes(tokenAtual) ){ 
            declararErroSintaxico("ERRO: PONTO_E_VIRGULA NAO ENCONTRADO")
            console.log("ERRO: PONTO_E_VIRGULA NAO ENCONTRADO")
            erro = 1;
            break;
        }
        
        if (topoAtual == "<tipo>" && !tokens.includes(tokenAtual)  ){
            declararErroSintaxico("ERRO: TIPO NAO ENCONTRADO")
            console.log("ERRO: TIPO NAO ENCONTRADO")
            erro = 1;
            break;
        }
        
        if( !tokens.includes(tokenAtual)  ){ 
            declararErroSintaxico("ERRO: TOKEN NAO IDENTIFICADO")
            console.log("ERRO: TOKEN NAO IDENTIFICADO")
            erro = 1;
            break;
        }

    } while ( (tokenAtual != "ponto_e_virgula" && topoAtual != "<ponto_e_virgula>" ) && (iteracoesMax < 100));

    if(erro){
        console.log("ERRO NA DECLARACAO DE VARIAVEL");
    } 
}

export function analisadorSintaxico(arrayTokens){
    fila = enfileirarTokens(arrayTokens);

    declararErroSintaxico("");

    // eventualmente isto seria substituido por S start ou algo do tipo
    // testemos para declaracao de variavel no momento
    pilha.push("<Variavel>");
    

    while( (fila[0] != "$" ) && (fila.length > 0) ){
        var topoPilha = pilha[pilha.length - 1]; //troquei o pop por isso pq não tava exibindo a pilha

        if( topoPilha == "<Variavel>" ) DeclararVariavel();

        fila.shift()
        
    }
    
    //construirTabelaPreditiva();
}

export { pilha };