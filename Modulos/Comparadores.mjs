import { symbols, math_operator, comment, spaces, line_break, relational_operator, reserved, identifiers } from "./DefinicoesLexico.mjs"

function isDigit(value) 
{
    return value >= "0" && value <= "9";
}

function isLetter(value) 
{
    return value >= "a" && value <= "z" || value >= "A" && value <= "Z" || value === "_";
}

function isType(value)
{
    return types.includes(value);
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

function isIdentifier(value)
{
    return identifiers.includes(value);
}

export { isDigit, isLetter, isSpace, isSymbol, isMathOperator, isRelationalOperator, isInAlfabet, isSeparator, isReserved, isIdentifier }