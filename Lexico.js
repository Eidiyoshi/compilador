const symbols = [
    "(",")",".","+","-","*","/",
]

const numbers = [
    "0","1","2","3","4","5","6","7","8","9"
]

const spaces = [
    " ", "\t", "\r"
]

const line_break = ['\n', ""]

const alfabet = symbols.concat(numbers, spaces, line_break)

const tokens = [
    "int","float","aP","fP","soma","sub","mult","div","erro"
]

function isInAlfabet(char)
{
    return alfabet.includes(char)
}

function identifyToken(char, current_token)
{
    if(numbers.includes(char))
    {
        if(current_token === tokens[1])
        {
            return tokens[1];
        }
        else
        {
            return tokens[0];
        }
    }
    else if(symbols.includes(char))
    {
        if(char === "." && current_token === tokens[0])
        {
            return tokens[1];
        }
        else if(char === "(")
        {
            return tokens[2];
        }
        else if(char === ")")
        {
            return tokens[3];
        }
        else if(char === "+")
        {
            return tokens[4];
        }
        else if(char === "-")
        {
            return tokens[5];
        }
        else if(char === "*")
        {
            return tokens[6];
        }
        else if(char === "/")
        {
            return tokens[7];
        }
    }
    else if(spaces.includes(char))
    {
        return "espaco";
    }
    else if(line_break.includes(char))
    {
        return "quebra_linha";
    }

    return tokens[8];
}

function lerSemArquivo(){
        var texto = document.getElementById("campoTexto").value;
        console.log(texto)
        var real_result = []
        var character_tokens = [];
        var past_token = "";

        var contents = texto

        //console.log(contents)
        
        //Classificando cada caractere do arquivo
        //console.log("Classificando cada caractere")
        for (let i = 0; i < contents.length; i++)
        {
            const token = identifyToken(contents[i], past_token);

            //Convertendo tokens int para float
            if(token === tokens[1] && past_token === tokens[0])
            {
                for (let j = character_tokens.length - 1; j > 0; j--)
                {
                    if(character_tokens[j] === tokens[0])
                    {
                        character_tokens[j] = tokens[1];
                    }
                    else
                    {
                        break;
                    }
                }
            }
            
            character_tokens.push(token);


            past_token = token;
        }

        //console.log(character_tokens);

        //Removendo numeros com . sem numero depois ou antes
        for (let i = 0; i < character_tokens.length; i++)
        {
            if(contents[i] === ".")
            {
                if(character_tokens[i + 1] !== tokens[1])
                {
                    character_tokens[i] = tokens[8];
                    var j = i-1;
                    while(j >= 0 && character_tokens[j] === tokens[1])
                    {                    
                        character_tokens[j] = tokens[8];
                        j--;
                    }
                }
                
                if(character_tokens[i - 1] !== tokens[1])
                {
                    var j = i+1;
                    while(j < character_tokens.length && character_tokens[j] === tokens[0])
                    {                    
                        character_tokens[j] = tokens[8];
                        j++;
                    }
                }
            }
        }

        //console.log(character_tokens);

        //Agrupando tokens encontrados
        var past_token = character_tokens[0]
        //console.log(past_token)
        var current_token_start = 0
        var current_token_end = 0
        var current_token_line = 0
        var current_value = []

        for (let i = 0; i < character_tokens.length; i++)
        {
            if((character_tokens[i] === past_token || (character_tokens[i] !== past_token && (past_token === "espaco" || past_token === "quebra_linha"))) && character_tokens[i] !== "espaco" && character_tokens[i] !== "quebra_linha")
            {
                current_value.push(contents[i]);
            }
            else if(character_tokens[i] === "quebra_linha")
            {
                //console.log("2");
                current_token_line = current_token_line + 1;
                current_token_end = 0;
                current_token_start = 0;
            }
            else
            {
                //console.log("3");
                if(past_token !== "espaco" && past_token !== "quebra_linha")
                {
                    //console.log("4");
                    //console.log("Inseriu token: " + past_token);
                    real_result.push({
                        token: past_token,
                        value: current_value.join(""),
                        line: current_token_line,
                        start: current_token_start,
                        end: current_token_end - 1
                    });
                    if(character_tokens[i] === "espaco" || character_tokens[i] === "quebra_linha")
                    {
                        current_value = [];
                    }
                    else
                    {
                        current_value = [contents[i]];
                    }
                    current_token_start = i;
                    current_token_end = i;
                }
            }

            current_token_end = current_token_end + 1;
            past_token = character_tokens[i];
            //console.log("past_token: " + past_token);
        }
        if(past_token !== "espaco" && past_token !== "quebra_linha")
        {
            //console.log("4");
            //console.log("Inseriu token: " + past_token);
            real_result.push({
                token: past_token,
                value: current_value.join(""),
                line: current_token_line,
                start: current_token_start,
                end: current_token_end - 1
            });
        }

        console.log(real_result);

        fillTable(real_result);
}

function classifyEachCharacter(event) {
    var files = event.target.files
    var reader = new FileReader()
    var real_result = []
    reader.onload = function() {
        var character_tokens = [];
        var past_token = "";

        var contents = this.result

        //console.log(contents)
        
        //Classificando cada caractere do arquivo
        //console.log("Classificando cada caractere")
        for (let i = 0; i < contents.length; i++)
        {
            const token = identifyToken(contents[i], past_token);

            //Convertendo tokens int para float
            if(token === tokens[1] && past_token === tokens[0])
            {
                for (let j = character_tokens.length - 1; j > 0; j--)
                {
                    if(character_tokens[j] === tokens[0])
                    {
                        character_tokens[j] = tokens[1];
                    }
                    else
                    {
                        break;
                    }
                }
            }
            
            character_tokens.push(token);


            past_token = token;
        }

        //console.log(character_tokens);

        //Removendo numeros com . sem numero depois ou antes
        for (let i = 0; i < character_tokens.length; i++)
        {
            if(contents[i] === ".")
            {
                if(character_tokens[i + 1] !== tokens[1])
                {
                    character_tokens[i] = tokens[8];
                    var j = i-1;
                    while(j >= 0 && character_tokens[j] === tokens[1])
                    {                    
                        character_tokens[j] = tokens[8];
                        j--;
                    }
                }
                
                if(character_tokens[i - 1] !== tokens[1])
                {
                    var j = i+1;
                    while(j < character_tokens.length && character_tokens[j] === tokens[0])
                    {                    
                        character_tokens[j] = tokens[8];
                        j++;
                    }
                }
            }
        }

        //console.log(character_tokens);

        //Agrupando tokens encontrados
        var past_token = character_tokens[0]
        //console.log(past_token)
        var current_token_start = 0
        var current_token_end = 0
        var current_token_line = 0
        var current_value = []

        for (let i = 0; i < character_tokens.length; i++)
        {
            if((character_tokens[i] === past_token || (character_tokens[i] !== past_token && (past_token === "espaco" || past_token === "quebra_linha"))) && character_tokens[i] !== "espaco" && character_tokens[i] !== "quebra_linha")
            {
                current_value.push(contents[i]);
            }
            else if(character_tokens[i] === "quebra_linha")
            {
                //console.log("2");
                current_token_line = current_token_line + 1;
                current_token_end = 0;
                current_token_start = 0;
            }
            else
            {
                //console.log("3");
                if(past_token !== "espaco" && past_token !== "quebra_linha")
                {
                    //console.log("4");
                    //console.log("Inseriu token: " + past_token);
                    real_result.push({
                        token: past_token,
                        value: current_value.join(""),
                        line: current_token_line,
                        start: current_token_start,
                        end: current_token_end - 1
                    });
                    if(character_tokens[i] === "espaco" || character_tokens[i] === "quebra_linha")
                    {
                        current_value = [];
                    }
                    else
                    {
                        current_value = [contents[i]];
                    }
                    current_token_start = i;
                    current_token_end = i;
                }
            }

            current_token_end = current_token_end + 1;
            past_token = character_tokens[i];
            //console.log("past_token: " + past_token);
        }
        if(past_token !== "espaco" && past_token !== "quebra_linha")
        {
            //console.log("4");
            //console.log("Inseriu token: " + past_token);
            real_result.push({
                token: past_token,
                value: current_value.join(""),
                line: current_token_line,
                start: current_token_start,
                end: current_token_end - 1
            });
        }

        console.log(real_result);

        fillTable(real_result);
    }

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