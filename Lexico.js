//Definicoes
const symbols = [
    "(",")",".",";","<",">","=",":",","
];

const math_operator = [
    "+","-","*","/"
]

const comment = [
    "/","{","}"
];

const numbers = [
    "0","1","2","3","4","5","6","7","8","9"
];

const letters = [
    "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
    "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
    "_"
];

const spaces = [
    " ", "\t", "\r"
];

const line_break = ["\n"];

const alfabet = symbols.concat(numbers, letters, spaces, line_break, comment, math_operator);

const types = [
    "int", "boolean", "var"
];

const temp_reserved = [
    "program","procedure","read","write","true","false","begin","end","if","then","else","while","do"
];

const relational_operator = [
    "<", ">", "=", "<=", ">=", "<>"
]

const reserved = temp_reserved.concat(types);

const tokens = [
    "identificador_valido","ponto_e_virgula","numero","valor_booleano","abre_parenteses",
    "fecha_parenteses","atribuicao","operacao_matematica","operacao_relacional","identificador_muito_longo",
    "ponto_final","virgula","dois_pontos","identificador_invalido"
];



//Comparadores
function isDigit(value) 
{
    return value >= "0" && value <= "9";
}

function isLetter(value) 
{
    return value >= "a" && value <= "z" || value >= "A" && value <= "Z" || value === "_";
}

function isSpace(value) 
{
    return spaces.includes(value);
}

function isSymbol(value) 
{
    return symbols.includes(value);
}

function isMathOperator(value) 
{
    return math_operator.includes(value);
}

function isRelationalOperator(value)
{
    return relational_operator.includes(value);
}

function isInAlfabet(value)
{
    return symbols.includes(value) || spaces.includes(value) || isDigit(value) || isLetter(value) || isMathOperator(value) || comment.includes(value) || line_break.includes(value);
}

function isSeparator(value)
{
    return symbols.includes(value) || spaces.includes(value) || line_break.includes(value) || math_operator.includes(value);
}

function isReserved(value)
{
    return reserved.includes(value);
}



//Principal
function identifyToken(event) {

    var files = event.target.files
    var reader = new FileReader()
    var real_result = []
    var errors = []
    reader.onload = function() {
        var current_string = "";
        var current_token = "";

        var contents = this.result

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
                current_line++;
                line_position = -1;
            }
            else if(current_char === "{")
            {
                
                if(current_token !== "")
                {
                    if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
                    {
                        console.log("salvando " + tokens[9] + " " + current_string);
                        errors.push({
                            token: tokens[9],//erro
                            lexema: current_string,
                            linha: current_line,
                            comeco: beginning_of_token,
                            fim: line_position
                        });
                    }
                    else
                    {
                        console.log("salvando " + current_token + " " + current_string);
                        real_result.push({
                            token: current_token,
                            lexema: current_string,
                            linha: current_line,
                            comeco: beginning_of_token,
                            fim: line_position
                        });
                    }
                }
                current_token = "";
                current_string = "";
                console.log("Comentario encontrado na linha " + current_line + " na posicao " + line_position);
                var aux = current_char;
                while(aux !== "}" && current_position <= contents.length)
                {
                    aux = contents[current_position];
                    if(aux === "\n") 
                    {
                        current_line++;
                        line_position = 1;
                    }
                    current_position++;
                    line_position++;
                }
                console.log("Comentario encerrado na linha " + current_line + " na posicao " + line_position-1);
            }
            if(isInAlfabet(current_char))
            {
                if(!isSeparator(current_char))
                {
                    if(current_token === tokens[8]) // operacao_relacional
                    {
                        console.log("salvando " + current_token + " " + current_string);
                        real_result.push({
                            token: current_token,
                            lexema: current_string,
                            linha: current_line,
                            comeco: beginning_of_token,
                            fim: line_position
                        });
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
                            console.log("salvando " + current_token + " " + current_string);
                            real_result.push({
                                token: tokens[2],
                                lexema: current_string,
                                linha: current_line,
                                comeco: beginning_of_token,
                                fim: line_position
                            });
                            current_token = "";
                            current_string = "";
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
                                    console.log("salvando " + current_token + " " + current_string);
                                    real_result.push({
                                        token: current_token,
                                        lexema: current_string,
                                        linha: current_line,
                                        comeco: beginning_of_token,
                                        fim: line_position + 1
                                    });
                                    current_token = "";
                                    current_string = "";
                                }
                                else
                                {
                                    console.log("salvando " + current_string + " " + current_string);
                                    real_result.push({
                                        token: current_string,
                                        lexema: current_string,
                                        linha: current_line,
                                        comeco: beginning_of_token,
                                        fim: line_position+1
                                    });
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
                            if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
                            {
                                console.log("salvando " + tokens[9] + " " + current_string);
                                errors.push({
                                    token: tokens[9],//erro
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            else
                            {
                                console.log("salvando " + current_token + " " + current_string);
                                real_result.push({
                                    token: current_token,
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                        }
                        current_token = "";
                        current_string = "";
                    }
                    else if(current_char === ";")
                    {
                        if(current_token !== "")
                        {
                            if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
                            {
                                console.log("salvando " + tokens[9] + " " + current_string);
                                errors.push({
                                    token: tokens[9],//erro
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            else
                            {
                                console.log("salvando " + current_token + " " + current_string);
                                real_result.push({
                                    token: current_token,
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        real_result.push({
                            token: tokens[1],//ponto_e_virgula
                            lexema: ";",
                            linha: current_line,
                            comeco: line_position,
                            fim: line_position + 1
                        });
                        current_token = "";
                        current_string = "";
                    }
                    else if(current_char === "(")
                    {
                        if(current_token !== "")
                        {
                            if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
                            {
                                console.log("salvando " + tokens[9] + " " + current_string);
                                errors.push({
                                    token: tokens[9],//erro
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            else
                            {
                                console.log("salvando " + current_token + " " + current_string);
                                real_result.push({
                                    token: current_token,
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        real_result.push({
                            token: tokens[4],//abre_parenteses
                            lexema: "(",
                            linha: current_line,
                            comeco: line_position,
                            fim: line_position + 1
                        });
                        current_token = "";
                        current_string = "";
                    }
                    else if(current_char === ",")
                    {
                        if(current_token !== "")
                        {
                            if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
                            {
                                console.log("salvando " + tokens[9] + " " + current_string);
                                errors.push({
                                    token: tokens[9],//erro
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            else
                            {
                                console.log("salvando " + current_token + " " + current_string);
                                real_result.push({
                                    token: current_token,
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        real_result.push({
                            token: tokens[11],//virgula
                            lexema: ",",
                            linha: current_line,
                            comeco: line_position,
                            fim: line_position + 1
                        });
                        current_token = "";
                        current_string = "";
                    }
                    else if(current_char === ".")
                    {
                        if(current_token !== "")
                        {
                            if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
                            {
                                console.log("salvando " + tokens[9] + " " + current_string);
                                errors.push({
                                    token: tokens[9],//erro
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            else
                            {
                                console.log("salvando " + current_token + " " + current_string);
                                real_result.push({
                                    token: current_token,
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        real_result.push({
                            token: tokens[10],//ponto_final
                            lexema: ".",
                            linha: current_line,
                            comeco: line_position,
                            fim: line_position + 1
                        });
                        current_token = "";
                        current_string = "";
                    }
                    else if(current_char === ":")
                    {
                        if(current_token !== "")
                        {
                            if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
                            {
                                console.log("salvando " + tokens[9] + " " + current_string);
                                errors.push({
                                    token: tokens[9],//erro
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            else
                            {
                                console.log("salvando " + current_token + " " + current_string);
                                real_result.push({
                                    token: current_token,
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                                current_token = "";
                                current_string = ""; 
                            }
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        if(contents[current_position + 1] === "=")
                        {
                            console.log("salvando " + tokens[6] + " " + current_string);
                            real_result.push({
                                token: tokens[6],//atribuicao
                                lexema: ":=",
                                linha: current_line,
                                comeco: line_position,
                                fim: line_position + 2
                            });
                            current_position++;
                            line_position++;
                            current_token = "";
                            current_string = "";
                        }
                        else
                        {
                            console.log("salvando " + tokens[12] + " " + current_string);
                            real_result.push({
                                token: tokens[12],//dois_pontos
                                lexema: ":",
                                linha: current_line,
                                comeco: line_position,
                                fim: line_position + 1
                            });
                            current_token = "";
                            current_string = "";
                        }
                    }
                    else if(current_char === ")")
                    {
                        if(current_token !== "")
                        {
                            if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
                            {
                                console.log("salvando " + tokens[9] + " " + current_string);
                                errors.push({
                                    token: tokens[9],//erro
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            else
                            {
                                console.log("salvando " + current_token + " " + current_string);
                                real_result.push({
                                    token: current_token,
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            current_token = "";
                            current_string = "";
                            //line_position++;
                        }
                        real_result.push({
                            token: tokens[5],//fecha_parenteses
                            lexema: ")",
                            linha: current_line,
                            comeco: line_position,
                            fim: line_position + 1
                        });
                        current_token = "";
                        current_string = "";
                    }
                    else if(isMathOperator(current_char))
                    {
                        console.log("Operador matematico encontrado: " + current_char);
                        if(current_token !== "")
                        {
                            if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
                            {
                                console.log("salvando " + tokens[9] + " " + current_string);
                                errors.push({
                                    token: tokens[9],//erro
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            else
                            {
                                console.log("salvando " + current_token + " " + current_string);
                                real_result.push({
                                    token: current_token,
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
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
                            console.log("salvando " + current_token + " " + current_string);
                            real_result.push({
                                token: current_token,
                                lexema: current_string,
                                linha: current_line,
                                comeco: line_position,
                                fim: line_position + 1
                            });
                            current_token = "";
                            current_string = "";
                            current_position--;
                            //line_position--;
                        }
                    }
                    else if(isRelationalOperator(current_char))
                    {
                        console.log("Operador relacional encontrado: " + current_char);
                        if(current_token !== "" && current_token !== tokens[8]) // operacao_relacional                      
                        {
                            if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
                            {
                                console.log("salvando " + tokens[9] + " " + current_string);
                                errors.push({
                                    token: tokens[9],//erro
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            else
                            {
                                console.log("salvando " + current_token + " " + current_string);
                                real_result.push({
                                    token: current_token,
                                    lexema: current_string,
                                    linha: current_line,
                                    comeco: beginning_of_token,
                                    fim: line_position
                                });
                            }
                            //line_position++;
                            //current_position++;
                            current_token = "";
                            current_string = "";
                        }
                        current_string += current_char;
                        current_token = tokens[8]; // operacao_relacional
                        beginning_of_token = line_position;
                        if(current_string === "<=" || current_string === ">=" || current_string === "<>")
                        {
                            console.log("salvando operador relacional composto: " + current_string);
                            real_result.push({
                                token: current_string,
                                lexema: current_string,
                                linha: current_line,
                                comeco: beginning_of_token-1,
                                fim: line_position+1
                            });
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
                    if((current_token === tokens[2] || current_token === tokens[0]) && current_string.length > max_length)//numero e identificador
                    {
                        console.log("salvando " + tokens[9] + " " + current_string);
                        errors.push({
                            token: tokens[9],//erro
                            lexema: current_string,
                            linha: current_line,
                            comeco: beginning_of_token,
                            fim: line_position
                        });
                    }
                    else
                    {
                        console.log("salvando " + current_token + " " + current_string);
                        real_result.push({
                            token: current_token,
                            lexema: current_string,
                            linha: current_line,
                            comeco: beginning_of_token,
                            fim: line_position
                        });
                    }
                    //line_position++;
                    //current_position++;
                    current_token = "";
                    current_string = "";
                }
                console.log("salvando " + tokens[13] + " " + current_string);
                errors.push({
                    token: tokens[13],//identificador invalido
                    lexema: current_char,
                    linha: current_line,
                    comeco: line_position,
                    fim: line_position + 1
                });
                current_token = "";
                current_string = "";
            }
            current_position++;
            line_position++;
        }
        //errors;
        errors.pop();
        //real_result
        fillTable(real_result);
        //usar o errors para ver os erros
    }
    //nao faco ideia doq isso faz, mas aparentemente é necessario pra ler o arquivo
    reader.readAsText(files[0])
    
    console.log(real_result);

    console.log(real_result.join(" "))

    //return real_result;
}

//Preenche a tabela com o resultado
function fillTable(tokens) {
    const tbody = document.querySelector("#tokensTable tbody");
    tbody.innerHTML = ""; //limpa tabela antes

    tokens.forEach(t => {
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

var input = document.querySelector("#abcdef");
input.addEventListener('change', identifyToken, false)
