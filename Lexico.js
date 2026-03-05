import {symbols, math_operator, comment, numbers, letters, spaces, line_break, alfabet, types, reserved, tokens} from "./Modulos/DefinicoesLexico.js";

function isInAlfabet(char)
{
    return alfabet.includes(char)
}

function identifyToken(char, current_token)
{
    
}

function classifyEachCharacter(event) {
    

    //nao faco ideia doq isso faz, mas aparentemente é necessario pra ler o arquivo
    reader.readAsText(files[0])
    
    return real_result;
}

//Preenche a tabela com o resultado
function fillTable(tokens) {
    const tbody = document.querySelector("#tokensTable tbody");
    tbody.innerHTML = ""; //limpa tabela antes

    tokens.forEach(t => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${t.token}</td>
            <td>${t.value}</td>
            <td>${t.line}</td>
            <td>${t.start}</td>
            <td>${t.end}</td>
        `;

        tbody.appendChild(tr);
    });
}

var input = document.querySelector("#abcdef");
input.addEventListener('change', classifyEachCharacter, false)
