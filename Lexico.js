import { tokens, identifiers } from "./Modulos/DefinicoesLexico.mjs"
import { isDigit, isLetter, isSpace, isMathOperator, isRelationalOperator, isInAlfabet, isSeparator, isReserved, isIdentifier } from "./Modulos/Comparadores.mjs"

// deletar eventualmente
import { iniciarAnalise, proximoPasso, analisadorSintaxico, pilha, fila, ultimoPasso } from "./Sintaxico.js";

import { analisadorSemantico, geradorDeCodigo } from "./Gerador.js"
import { interpretador } from "./Interpretador.js";

//Funcoes
function pushToken(array, token, current_string, current_line, beginning_of_token, line_position)
{
    array.push({
        token: token,
        lexema: current_string,
        linha: current_line,
        comeco: beginning_of_token,
        fim: line_position
    });
}

function checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
{
    if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
    {
        console.log("salvando " + tokens[9] + " " + current_string);
        pushToken(errors, tokens[9], current_string, current_line, beginning_of_token, line_position);
    }
    else
    {
        console.log("salvando " + current_token + " " + current_string);
        pushToken(real_result, current_token, current_string, current_line, beginning_of_token, line_position);
    }
}
//Principal
function identifyToken(text) {

    var real_result = []
    var errors = []
        var current_string = "";
        var current_token = "";

        var contents = text

        var current_line = 1;

        //console.log(contents)
        
        //Classificando cada caractere do arquivo
        //console.log("Classificando cada caractere")

        var current_position = 0;
        var beginning_of_token = 0;
        var line_position = 0;

        const max_length = 20; // +1 para o caractere nulo

        while(current_position < contents.length) 
        {
            var current_char = contents[current_position];

            if(current_char === "\n") 
            {
                if(current_token !== "")
                {
                    checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                }
                current_token = "";
                current_string = "";
                current_line++;
                line_position = -1;
            }
            else if(current_char === "{")
            {
                beginning_of_comment_position = line_position;
                beginning_of_comment_line = current_line;
                if(current_token !== "")
                {
                    checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                }
                current_token = "";
                current_string = "";
                console.log("Comentario encontrado na linha " + current_line + " na posicao " + line_position);
                var aux = current_char;
                while(aux !== "}")
                {
                    aux = contents[current_position];
                    if(aux === "\n") 
                    {
                        current_line++;
                        line_position = 1;
                    }
                    current_position++;
                    line_position++;
                    if(current_position > contents.length)
                    {
                        console.log("salvando " + tokens[9] + " " + current_string);
                        pushToken(errors, tokens[14], "Nan", beginning_of_comment_line, beginning_of_comment_position, line_position);
                        break;
                    }
                }
                console.log("Comentario encerrado na linha " + current_line + " na posicao " + line_position-1);
            }
            if(isInAlfabet(current_char))
            {
                if(!isSeparator(current_char))
                {
                    if(isRelationalOperator(current_token)) // operacao_relacional
                    {
                        pushToken(real_result, current_token, current_string, current_line, beginning_of_token, line_position);
                        current_token = "";
                        current_string = "";
                    }
                    if(current_token === "")
                    {
                        beginning_of_token = line_position;
                        if(isDigit(current_char))
                        {
                            current_token = tokens[2];
                            current_string += current_char;
                        }
                        else if(isLetter(current_char))
                        {
                            current_token = tokens[0]; // Identificador
                            current_string += current_char;
                        }
                    }
                    else if(current_token === tokens[2])//numero
                    {
                        if(!isDigit(current_char))
                        {
                            while(!isSeparator(contents[current_position]))
                            {
                                current_char = contents[current_position];
                                current_string += current_char;
                                current_position++;
                                line_position++;
                            }
                            pushToken(errors, tokens[13], current_string, current_line, beginning_of_token, line_position);
                            current_token = "";
                            current_string = "";
                            current_position--;
                            line_position--;
                        }
                        else
                        {
                            current_string += current_char;
                        }
                    }
                    else if(current_token === tokens[0])//identificador
                    {
                        if(isLetter(current_char) || isDigit(current_char))
                        {
                            current_string += current_char;
                            if(isReserved(current_string) && !isLetter(contents[current_position + 1]) && !isDigit(contents[current_position + 1]))
                            {
                                if(current_string === "true" || current_string === "false")
                                {
                                    current_token = tokens[3]; // Literal booleano
                                    pushToken(real_result, tokens[0], current_string, current_line, beginning_of_token, line_position);
                                    current_token = "";
                                    current_string = "";
                                }
                                else if(current_string == "read" || current_string == "write")
                                {
                                    pushToken(real_result, current_token, current_string, current_line, beginning_of_token, line_position);
                                    current_token = "";
                                    current_string = "";
                                }
                                else
                                {
                                    pushToken(real_result, current_string, current_string, current_line, beginning_of_token, line_position);
                                    current_token = "";
                                    current_string = "";
                                }
                            }
                        }
                    }
                    
                }
                else
                {
                    if(isSpace(current_char))
                    {
                        if(current_token !== "")
                        {
                            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                        }
                        current_token = "";
                        current_string = "";
                    }
                    else if(current_char === ";")
                    {
                        if(current_token !== "")
                        {
                            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        pushToken(real_result, tokens[1], ";", current_line, line_position, line_position+1);
                        current_token = "";
                        current_string = "";
                    }
                    else if(current_char === "&")
                    {
                        if(current_token !== "")
                        {
                            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        pushToken(real_result, tokens[15], "&", current_line, line_position, line_position+1);
                        current_token = "";
                        current_string = "";
                    }
                    else if(current_char === "(")
                    {
                        if(current_token !== "")
                        {
                            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        pushToken(real_result, tokens[4], "(", current_line, line_position, line_position+1);
                        current_token = "";
                        current_string = "";
                    }
                    else if(current_char === ",")
                    {
                        if(current_token !== "")
                        {
                            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        pushToken(real_result, tokens[11], ",", current_line, line_position, line_position+1);
                        current_token = "";
                        current_string = "";
                    }
                    else if(current_char === ".")
                    {
                        if(current_token !== "")
                        {
                            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        pushToken(real_result, tokens[10], ".", current_line, line_position, line_position+1);
                        current_token = "";
                        current_string = "";
                    }
                    else if(current_char === ":")
                    {
                        if(current_token !== "")
                        {
                            if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
                            {
                                pushToken(errors, tokens[9], current_string, current_line, beginning_of_token, line_position);
                            }
                            else
                            {
                                pushToken(real_result, current_token, current_string, current_line, beginning_of_token, line_position);
                                current_token = "";
                                current_string = ""; 
                            }
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        if(contents[current_position + 1] === "=")
                        {
                            pushToken(real_result, tokens[6], ":=", current_line, line_position, line_position+2);
                            current_position++;
                            line_position++;
                            current_token = "";
                            current_string = "";
                        }
                        else
                        {
                            pushToken(real_result, tokens[12], ":", current_line, line_position, line_position+1);
                            current_token = "";
                            current_string = "";
                        }
                    }
                    else if(current_char === ")")
                    {
                        if(current_token !== "")
                        {
                            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        pushToken(real_result, tokens[5], ")", current_line, line_position, line_position+1);
                        current_token = "";
                        current_string = "";
                    }
                    else if(current_char === "/")
                    {
                        if(current_token !== "")
                        {
                            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                            current_token = "";
                            current_string = "";
                        }
                        if(contents[current_position + 1] === "/")
                        {
                            console.log("Comentario encontrado na linha " + current_line + " na posicao " + line_position);
                            current_position += 2;
                            line_position += 2;
                            while(current_position < contents.length && contents[current_position] !== "\n")
                            {
                                current_position++;
                                line_position++;
                            }
                            current_position--;
                            line_position--;
                        }
                        else
                        {
                            pushToken(errors, tokens[13], "/", current_line, line_position, line_position+1);
                        }
                    }
                    else if(isMathOperator(current_char))
                    {
                        console.log("Operador matematico encontrado: " + current_char);
                        if(current_token !== "")
                        {
                            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                            current_token = tokens[7]; // operacao_matematica
                            current_string = "";
                        }
                        current_string += current_char;
                        pushToken(real_result, current_string, current_string, current_line, beginning_of_token, line_position+1);
                        current_token = "";
                        current_string = "";
                    }
                    else if(isRelationalOperator(current_char))
                    {
                        console.log("Operador relacional encontrado: " + current_char);
                        if(current_token !== "" && !isRelationalOperator(current_token)) // operacao_relacional                      
                        {
                            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                            //line_position++;
                            //current_position++;
                            current_token = "";
                            current_string = "";
                        }

                        if(current_string === "")
                        {
                            beginning_of_token = line_position;
                        }

                        current_string += current_char;
                        current_token = current_string; // operacao_relacional
                        
                        if(current_string === "<=" || current_string === ">=" || current_string === "<>")
                        {
                            pushToken(real_result, current_string, current_string, current_line, beginning_of_token-1, line_position+1);
                            current_token = "";
                            current_string = "";
                        }
                    }
                }
            }
            else
            {
                console.log("Caractere invalido encontrado: " + current_char);
                if(current_token !== "") // operacao_relacional                      
                {
                    //line_position++;
                    //current_position++;
                    current_token = "";
                    current_string = "";
                }
                pushToken(errors, tokens[13], current_char, current_line, line_position, line_position+1);
                current_token = "";
                current_string = "";
            }
            current_position++;
            line_position++;
        }

        if(current_token !== "")
        {
            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length);
        }
        //errors;
        //errors.pop();
        //real_result
        fillErrors(errors);
        fillTable(real_result);
        //usar o errors para ver os erros
    
    //nao faco ideia doq isso faz, mas aparentemente é necessario pra ler o arquivo
    
    console.log("Erros léxicos")
    console.log(errors);
    
    console.log("Resultado léxico")
    console.log(real_result);

    //analisadorSintaxico(real_result)
    //renderStack([...pilha]);

    //console.log(real_result.join(" "))
    
    const copia = structuredClone(real_result);

    iniciarAnalise(real_result);
    atualizarParser();
    
    //O gerador já retorna as coisas da semântica
    const resultado_semantico = analisadorSemantico(copia);

    //não exibe a aba de geração de código se tiver erro semântico
    const tab4 = document.getElementById("Tab4");
    const botaoTab4 = document.querySelector('.tab-btn[onclick*="Tab4"]');
    if(resultado_semantico.erros.length > 0) {
        tab4.style.display = "none";
        botaoTab4.style.display = "none";
    } else {
        tab4.style.display = "";
        botaoTab4.style.display = "";
    }

    fillTableSemantico(resultado_semantico.copia_tabela_de_simbolos);
    //Tava usando isso aqui só pra testar mesmo
    //resultado_semantico.erros.push("erro teste");
    //resultado_semantico.avisos.push("aviso teste");
    //resultado_semantico.notas.push("nota teste");
    declararErroSemantico(resultado_semantico.erros);
    declararAvisoSemantico(resultado_semantico.avisos);
    declararNotaSemantica(resultado_semantico.notas);

    console.log("Gerando código\n\n\n");
    const resultado = geradorDeCodigo(copia);
    console.log(resultado.codigoMEPA);
    exibirCodigoMEPA(resultado.codigoMEPA);

    interpretador(resultado.codigoMEPA, escreverTerminal, lerTerminal);
    //return real_result;
}

// ler o arquivo colocado
function readTextFile(event){ 
    var file = document.getElementById("inputFile").files[0];
    var reader = new FileReader()

    reader.onload = function(event){
        const text = event.target.result;
        document.getElementById("inputField").value = text;
        updateLines();
    };

    reader.readAsText(file, "UTF-8");
}


// funcao generica para ler o texto no inputField
document.querySelector('#startButton').addEventListener('click', () => {
    //limpa o terminal do interpretador
    terminalMEPA.value = "";
    aguardandoEntrada = false;
    resolverEntrada = null;
    inicioEntrada = 0;

    var textInput = document.getElementById("inputField").value
    document.querySelector(".tabs").classList.remove("hidden");
    document.getElementById("Tab1").classList.remove("initial-hidden");
    identifyToken(textInput)
});

//Preenche a tabela com o resultado
function fillTable(real_result) {
    const tbody = document.querySelector("#tokensTable tbody");

    real_result.forEach(t => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${t.token}</td>
            <td>${t.lexema}</td>
            <td>${t.linha}</td>
            <td>${t.comeco}</td>
            <td>${t.fim}</td>
        `;

        tbody.appendChild(tr);
    });
}

//Faz a mesma coisa que fillTable mas só com os erros encontrados
//(se for melhor dá pra juntar tudo em uma função só depois)
function fillErrors(errors) {
    const tbody = document.querySelector("#tokensTable tbody");
    tbody.innerHTML = ""; //limpa tabela antes

    errors.forEach(t => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="error">${t.token}</td>
            <td class="error">${t.lexema}</td>
            <td class="error">${t.linha}</td>
            <td class="error">${t.comeco}</td>
            <td class="error">${t.fim}</td>
        `;

        tbody.appendChild(tr);
    });
}

//fillTable para a análise semântica
function fillTableSemantico(real_result) {
    const tbody = document.querySelector("#tokensTableSemantico tbody");

    real_result.forEach(t => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${t.cadeia}</td>
            <td>${t.token}</td>
            <td>${t.categoria}</td>
            <td>${t.tipo}</td>
            <td>${t.valor}</td>
            <td>${t.escopo}</td>
            <td>${t.utilizada}</td>
            <td>${t.end_rel}</td>
            <td>${t.parametros}</td>
            <td>${t.porReferencia}</td>
        `;

        tbody.appendChild(tr);
    });
}

function declararErroSemantico(erroArray){
    const erroSemantico = document.getElementById("erroSemantico");
    if (erroArray.length > 0) {
        erroSemantico.innerHTML = erroArray.map(e => `<div>${e}</div>`).join("");
        erroSemantico.classList.add("ativo");
        erroSemanticoContainer.style.display = "block";
    } else {
        erroSemanticoContainer.style.display = "none";
    }
}

function declararAvisoSemantico(avisoArray){
    const avisoSemantico = document.getElementById("avisoSemantico");
    if(avisoArray.length > 0) {
        avisoSemantico.innerHTML = avisoArray.map(a => `<div>${a}</div>`).join("");
        avisoSemantico.classList.add("ativo");
        avisoSemanticoContainer.style.display = "block";
    } else {
        avisoSemanticoContainer.style.display = "none";
    }
}

function declararNotaSemantica(notaArray){
    const notaSemantica = document.getElementById("notaSemantica");
    if(notaArray.length > 0) {
        notaSemantica.innerHTML = notaArray.map(n => `<div>${n}</div>`).join("");
        notaSemantica.classList.add("ativo");
        notaSemanticaContainer.style.display = "block";
    } else {
        notaSemanticaContainer.style.display = "none";
    }
}

//Essa parte aqui tem as funções de exibição da análise sintática
function renderStack(){
    const stack = document.getElementById("stackView");
    stack.innerHTML="";

    [...pilha].reverse().forEach(simbolo=>{
        const div=document.createElement("div");

        div.className="stack-item";
        div.textContent=simbolo;

        stack.appendChild(div);
    });
}

function renderQueue(){
    const queue = document.getElementById("queueView");
    queue.innerHTML="";

    fila.forEach((token,index)=>{
        const div=document.createElement("div");

        div.className="queue-item";

        if(index==0)
            div.style.background="#1f8a3b";

        div.textContent=token;

        queue.appendChild(div);
    });

}

function atualizarParser(){
    renderStack();
    renderQueue();
    document.getElementById("stepDescription").innerText=ultimoPasso;
}

document.getElementById("nextStepButton").addEventListener("click",()=>{
    proximoPasso();
    atualizarParser();
});

document.getElementById("runAllButton").addEventListener("click",()=>{
    while(proximoPasso());
    atualizarParser();
});


//exibe o código num textarea como o do editor
function exibirCodigoMEPA(vetor_codigo) {
    const codigoMEPA = document.getElementById("codigoMEPA");
    const linesMEPA = document.getElementById("linesMEPA");

    codigoMEPA.value = vetor_codigo.map(instrucao => {
        if(instrucao.valor !== undefined) {
            return `${instrucao.codigo} ${instrucao.valor}`;
        }
        return instrucao.codigo;
    }).join("\n");
    codigoMEPA.readOnly = true;

    const totalLines = vetor_codigo.length;;
    let html = "";

    for(let i = 1; i <= totalLines; i++) {
        html += `<div>${i}</div>`;
    }

    linesMEPA.innerHTML = html;
}


//terminal com input e output do interpretador
const terminalMEPA = document.getElementById("terminalMEPA");

let aguardandoEntrada = false;
let resolverEntrada = null;
let inicioEntrada = 0;

function escreverTerminal(texto) {
    terminalMEPA.value += String(texto);
    terminalMEPA.scrollTop = terminalMEPA.scrollHeight;
    //cursor sempre no final quando o programa escreve
    terminalMEPA.setSelectionRange(
        terminalMEPA.value.length,
        terminalMEPA.value.length
    );
}

function lerTerminal() {
    aguardandoEntrada = true;
    //a partir daqui começa a região que o usuário pode editar
    inicioEntrada = terminalMEPA.value.length;
    terminalMEPA.focus();
    terminalMEPA.setSelectionRange(
        inicioEntrada,
        inicioEntrada
    );
    return new Promise(resolve => { resolverEntrada = resolve; });
}

//impede o usuário de colocar o cursor antes da região de entrada
terminalMEPA.addEventListener("select", () => {
    if(!aguardandoEntrada) {
        terminalMEPA.setSelectionRange(
            terminalMEPA.value.length,
            terminalMEPA.value.length
        );
        return;
    }
    if(terminalMEPA.selectionStart < inicioEntrada) {
        terminalMEPA.setSelectionRange(
            inicioEntrada,
            inicioEntrada
        );
    }
});

//impede seleção/posicionamento fora da região editável
terminalMEPA.addEventListener("mouseup", () => {
    if(!aguardandoEntrada) {
        terminalMEPA.setSelectionRange(
            terminalMEPA.value.length,
            terminalMEPA.value.length
        );
        return;
    }
    if(terminalMEPA.selectionStart < inicioEntrada) {
        terminalMEPA.setSelectionRange(
            inicioEntrada,
            inicioEntrada
        );
    }
});


//controla teclado
terminalMEPA.addEventListener("keydown", event => {
    if(!aguardandoEntrada) {
        event.preventDefault();
        return;
    }
    //não pode subir para linhas anteriores
    if(event.key === "ArrowUp") {
        event.preventDefault();
        return;
    }
    //não pode descer para outras linhas
    if(event.key === "ArrowDown") {
        event.preventDefault();
        return;
    }
    //não pode voltar para o texto do programa
    if(event.key === "ArrowLeft" && terminalMEPA.selectionStart <= inicioEntrada) {
        event.preventDefault();
        terminalMEPA.setSelectionRange(
            inicioEntrada,
            inicioEntrada
        );
        return;
    }
    // Não pode apagar o texto do programa
    if(event.key === "Backspace" && terminalMEPA.selectionStart <= inicioEntrada) {
        event.preventDefault();
        return;
    }
    if(event.key === "Delete" && terminalMEPA.selectionStart < inicioEntrada) {
        event.preventDefault();
        return;
    }
    //home não pode levar para o começo do textarea
    if(event.key === "Home") {
        event.preventDefault();
        terminalMEPA.setSelectionRange(
            inicioEntrada,
            inicioEntrada
        );
        return;
    }
    // enter confirma a entrada
    if(event.key === "Enter") {
        event.preventDefault();
        const entrada = terminalMEPA.value.substring(inicioEntrada).trim();
        aguardandoEntrada = false;
        terminalMEPA.value += "\n";
        if(resolverEntrada !== null) {
            resolverEntrada(entrada);
            resolverEntrada = null;
        }
        inicioEntrada = terminalMEPA.value.length;
        terminalMEPA.scrollTop = terminalMEPA.scrollHeight;
    }
});


window.openTab = function(evt, tabName) {
    let tabcontent = document.getElementsByClassName("tab-content");
    let tablinks = document.getElementsByClassName("tab-btn");

    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }

    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

var input = document.querySelector("#inputFile");


//Atualiza os números das linhas de código
const textarea = document.getElementById("inputField");
const lines = document.getElementById("lines");

function updateLines() {
    const totalLines = textarea.value.split("\n").length;
    let html = "";

    for(let i = 1; i <= totalLines; i++) {
        html += `<div>${i}</div>`;
    }

    lines.innerHTML = html;
}

textarea.addEventListener("input", updateLines);
textarea.addEventListener("scroll", () => {
    lines.style.transform =`translateY(-${textarea.scrollTop}px)`;
});
updateLines();


input.addEventListener('change', readTextFile, false)

