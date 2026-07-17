import { tokens, identifiers } from "./Modulos/DefinicoesLexico.mjs"
import { isDigit, isLetter, isSpace, isMathOperator, isRelationalOperator, isInAlfabet, isSeparator, isReserved, isIdentifier } from "./Modulos/Comparadores.mjs"

// deletar eventualmente
import { iniciarAnalise, proximoPasso, analisadorSintaxico, pilha, fila, ultimoPasso } from "./Sintaxico.js";

// teste
import { gerarAST } from "./GerarAST.js"
import { analisarSemantica } from "./Semantica.js"

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

        const max_length = 10; // +1 para o caractere nulo

        while(current_position <= contents.length) 
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
                    if(current_token === tokens[8]) // operacao_relacional
                    {
                        pushToken(real_result, current_token, current_string, current_line, beginning_of_token, line_position);
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
                            if(isReserved(current_string))
                            {
                                if(current_string === "true" || current_string === "false")
                                {
                                    current_token = tokens[3]; // Literal booleano
                                    pushToken(real_result, current_token, current_string, current_line, beginning_of_token, line_position);
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
                    else if(isMathOperator(current_char))
                    {
                        console.log("Operador matematico encontrado: " + current_char);
                        if(current_token !== "")
                        {
                            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                            //line_position++;
                            current_position++;
                            current_token = tokens[7]; // operacao_matematica
                            current_string = "";
                        }
                        current_string += current_char;
                        if(current_string === "//")
                        {
                            current_string = "";
                            current_token = "";
                            console.log("Comentario encontrado na linha " + current_line + " na posicao " + line_position);
                            var aux = current_char;
                            while(aux !== "\n" && current_position < contents.length)
                            {
                                aux = contents[current_position];
                                if(aux === "\n") 
                                {
                                    current_line++;
                                    line_position = 0;
                                }
                                current_position++;
                                line_position++;
                            }
                        }
                        else if(current_char !== "/")
                        {
                            pushToken(real_result, current_string, current_string, current_line, beginning_of_token, line_position+1);
                            current_token = "";
                            current_string = "";
                            if(!isSpace(contents[current_position+1]))
                            {
                                current_position--;
                                line_position--;
                            }
                        }
                    }
                    else if(isRelationalOperator(current_char))
                    {
                        console.log("Operador relacional encontrado: " + current_char);
                        if(current_token !== "" && current_token !== tokens[8]) // operacao_relacional                      
                        {
                            checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
                            //line_position++;
                            //current_position++;
                            current_token = "";
                            current_string = "";
                        }
                        current_string += current_char;
                        current_token = current_string; // operacao_relacional
                        beginning_of_token = line_position;
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
                    checkIfEnded(current_token, current_string, real_result, errors, current_line, beginning_of_token, line_position, max_length)
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
        //errors;
        errors.pop();
        //real_result
        fillErrors(errors);
        fillTable(real_result);
        //usar o errors para ver os erros
    
    //nao faco ideia doq isso faz, mas aparentemente é necessario pra ler o arquivo
    
    console.log(errors);

    console.log(real_result);

    // ------------------------------------------------------------------------------
    // eventualmente retirar isso aq, pq o sintaxico esta sendo chamado pelo lexico
    // o que nao deveria acontecer por excesso de funcao
    // ------------------------------------------------------------------------------
    const tokensParaAST = [...real_result]; 
    iniciarAnalise(real_result);
    atualizarParser();
    console.log("\n\n\n\n");
    const AST = gerarAST(tokensParaAST);
    console.log(AST);
    const resultado1235 = analisarSemantica(AST);
    console.log(resultado1235)
    //analisadorSintaxico(real_result)
    //renderStack([...pilha]);

    //console.log(real_result.join(" "))

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
    var textInput = document.getElementById("inputField").value
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
