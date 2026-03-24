const symbols = [
    "(",")",".",";","<",">","=",":",",","&"
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
    "ponto_final","virgula","dois_pontos","identificador_invalido","comentario_nao_encerrado","e_comercial"
];

var identifiers = [];

export { symbols, math_operator, comment, numbers, letters, spaces, alfabet, types, temp_reserved, relational_operator, reserved, tokens, identifiers }