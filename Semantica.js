//Uso:
// const(ou qualquer outro que declare variável) resultado = analisadorSemantico(AST);
//
//Retorno:
//{
//    ok: false se achou erros, caso contrário true,
//    erros: lista com os erros,
//    avisos: lista com os avisos,
//    tabela_de_simbolos: tabela_de_simbolos
//}

var erros = [];
var avisos = [];
var tabela_de_simbolos = [];

// auxiliar

function converterMinuscula(nome) {
    return String(nome).toLowerCase();
}

// definicoes

const OPERADORES_ARITMETICOS = new Set(["+", "-", "*", "/"]);
const OPERADORES_LOGICOS = new Set(["and", "or"]);
const OPERADORES_RELACIONAIS = new Set(["=", "<>", ">", ">=", "<", "<="]);

//ERRO

class ErroSemantico extends Error {}

function registrarErro(mensagem) 
{
    erros.push(mensagem);
}

function registrarAviso(mensagem) 
{
    avisos.push(mensagem);
}

// Adicionar

function criarEscopo(nome, nivel, pai)
{
    return { nome: nome, nivel: nivel, pai: pai, tabela: new Map() };
}

function declararSimbolo(escopo, { simbolo, tipo, categoria, passada_como = "", usada = false })
{   
    const identificador = converterMinuscula(simbolo);
    if (escopo.tabela.has(identificador))
    {
        registrarErro(`ERRO semantico: "${simbolo}" ja foi declarado no escopo "${escopo.nome}"`);
        return escopo.tabela.get(identificador);
    }
    const entrada = {
        simbolo: simbolo,
        tipo: tipo,
        categoria: categoria,
        valor: "",
        passada_como: passada_como,
        usada: usada,
        nivel_lexico: escopo.nivel,
        escopo: escopo.nome,
    };
    escopo.tabela.set(identificador, entrada);
    tabela_de_simbolos.push(entrada);
    return entrada;
}

function inserirPredefinidos(escopo_global) 
{
    declararSimbolo(escopo_global, { simbolo: "true", tipo: "boolean", categoria: "variável", usada: true });
    declararSimbolo(escopo_global, { simbolo: "false", tipo: "boolean", categoria: "variável", usada: true });
    declararSimbolo(escopo_global, { simbolo: "write", tipo: "procedure-name", categoria: "procedimento", usada: true });
    declararSimbolo(escopo_global, { simbolo: "read", tipo: "procedure-name", categoria: "procedimento", usada: true });
}

// verificacao

function verificarVisibilidade(escopo, nome) 
{
    // vai subindo a cadeia léxica
    const identificador = converterMinuscula(nome);
    let atual = escopo;
    while (atual) 
    {
        if (atual.tabela.has(identificador))
        {
            return atual.tabela.get(identificador);
        }
        atual = atual.pai;
    }
    return null;
}

function verificarSeExiste(nome) 
{
    // busca em TODOS os escopos
    // procura o simbolo que bate com o nome, caso não encontrar, volta nulo
    const identificador = converterMinuscula(nome);
    return tabela_de_simbolos.find((s) => converterMinuscula(s.simbolo) === identificador) ?? null;
}

function verificarUso(escopo, nome) 
{
    const visivel = verificarVisibilidade(escopo, nome);
    if (visivel) 
    {
        visivel.usada = true;
        return visivel;
    }
 
    const em_escopo_inacessivel = verificarSeExiste(nome);
    if (em_escopo_inacessivel)
    {
        if (escopo.nome === "global" && em_escopo_inacessivel.escopo !== "global")
        {
            registrarErro(`ERRO semantico: "${nome}" eh local ao procedimento "${em_escopo_inacessivel.escopo}" e foi usada no programa principal`);
        } 
        else 
        {
            registrarErro(`ERRO semantico: "${nome}" nao esta visivel no escopo "${escopo.nome}" (foi declarada em "${em_escopo_inacessivel.escopo}")`);
        }
        return null;
    }
 
    registrarErro(`ERRO semantico: "${nome}" nao foi declarado`);
    return null;
}

function verificarChamadaDeReadOuWrite(nome, argumentos, tipos) 
{
    const tipos_validos = tipos.filter((t) => t !== null && t !== undefined);
    if (tipos_validos.length === 0) return;
 
    const tipo_base = tipos_validos[0];
    const mistura_tipos = tipos_validos.some((t) => t !== tipo_base);
    if (mistura_tipos) 
    {
        registrarErro(`ERRO semantico: chamada a "${nome}" mistura variaveis de tipos diferentes (${tipos_validos.join(", ")})`);
    }
 
    if (converterMinuscula(nome) === "read") 
    {
        argumentos.forEach((arg) => {
            if (arg.tipo !== "variavel" && arg.tipo !== "variavel_indexada") 
            {
                registrarErro(`ERRO semantico: "read" espera uma variavel como argumento`);
            }
        });
    }
}

function verificarParametrosFormaisComReais(nome, entrada_procedimento, argumentos, tipos_dos_argumentos) 
{
    const parametros_formais = entrada_procedimento.tipos_de_parametros ?? [];
 
        if (argumentos.length !== parametros_formais.length) 
        {
            registrarErro(`ERRO semantico: "${nome}" espera ${parametros_formais.length} parametro(s), recebeu ${argumentos.length}`);
            return;
        }
 
        parametros_formais.forEach((tipo_esperado, indice) => {
            const tipo_recebido = tipos_dos_argumentos[indice];
            if (tipo_recebido && tipo_recebido !== tipo_esperado) 
            {
                registrarErro(`ERRO semantico: parametro ${indice + 1} de "${nome}" espera "${tipo_esperado}", recebeu "${tipo_recebido}"`);
            }
        });
    }

function verificarSimbolosNaoUtilizados()
{
    for (const entrada of tabela_de_simbolos)
    {
        const eh_variavel_ou_parametro = entrada.categoria === "variável" || entrada.categoria === "parâmetro-formal";
        if (eh_variavel_ou_parametro && !entrada.usada) 
        {
            registrarAviso(`AVISO semantico: "${entrada.simbolo}" foi declarada em "${entrada.escopo}" mas nunca utilizada`);
        }
    }
}

// processar

function processarBloco(bloco, escopo)
{
    // registra os identificadores do bloco
    for (const { lista_de_identificadores1: nome, tipo } of bloco.parte_de_declaracoes_de_variaveis)
    {
        declararSimbolo(escopo, { simbolo: nome, tipo, categoria: "variável" });
    }
    // processa os procedimentos
    for (const processo of bloco.parte_de_declaracoes_de_subrotinas)
    {
        processarProcedimento(processo, escopo);
    }
    //processa os comandos
    processarComando(bloco.comando_composto1, escopo);
}

function processarProcedimento(procedimento, escopoPai)
{
    const entrada_procedimento = declararSimbolo(
        escopoPai,
        {
            simbolo: procedimento.nome,
            tipo: "procedure-name",
            categoria: "procedimento",
        }
    );
 
    const escopo_procedimento = criarEscopo(procedimento.nome, escopoPai.nivel + 1, escopoPai);
 
    // parametros formais viram simbolos dentro do escopo do procedimento
    const parametros = procedimento.parametros_formais1.map(({ lista_de_identificadores1: nome, tipo }) =>
        declararSimbolo(
            escopo_procedimento, 
            {
                simbolo: nome,
                tipo: tipo,
                categoria: "parâmetro-formal",
                passada_como: "valor",
            }
        )
    );
 
    // guarda os tipos, na ordem, pra validar chamadas depois
    entrada_procedimento.tipos_de_parametros = parametros.map((p) => p?.tipo).filter(Boolean);
 
    processarBloco(procedimento.bloco, escopo_procedimento);
}

function processarComando(no, escopo) 
{
    if (no === null || no === undefined) return;
    
    if (no.tipo === "composto")
    {
        for (const comando of no.comandos) processarComando(comando, escopo);
    }
    else if (no.tipo === "atribuicao")
    {
        const alvo = verificarUso(escopo, no.alvo.nome);
        const tipoValor = processarExpressao(no.valor, escopo);
        if (alvo && alvo.categoria === "procedimento") 
        {
            registrarErro(`ERRO semantico: "${no.alvo.nome}" e um procedimento, nao pode receber atribuicao`);
        }
        else if (alvo && tipoValor && alvo.tipo !== tipoValor) 
        {
            registrarErro(`ERRO semantico: atribuicao a "${no.alvo.nome}" (tipo "${alvo.tipo}") recebe valor do tipo "${tipoValor}"`);
        }
    }
    else if (no.tipo === "chamada_procedimento")
    {
        processarChamadaDeProcedimento(no, escopo);
    }
    else if (no.tipo === "se")
    {
        const tipo_condicao = processarExpressao(no.expressao1, escopo);
        if (tipo_condicao && tipo_condicao !== "boolean")
        {
            registrarErro(`ERRO semantico: condicao do "if" deve ser boolean, encontrado "${tipo_condicao}"`);
        }
        processarComando(no.comando1, escopo);
        if (no.els) 
        {
            processarComando(no.els, escopo);
        }
    }
    else if (no.tipo === "enquanto")
    {
        const tipo_condicao = processarExpressao(no.expressao1, escopo);
        if (tipo_condicao && tipo_condicao !== "boolean")
        {
            registrarErro(`ERRO semantico: condicao do "while" deve ser boolean, encontrado "${tipo_condicao}"`);
        }
        processarComando(no.comando1, escopo);
    }
    else
    {
        registrarErro(`ERRO semantico interno: comando desconhecido na AST ("${no.tipo}")`);
    }
}

function processarChamadaDeProcedimento(no, escopo) 
{
    const identificador = converterMinuscula(no.nome);
    const entrada = verificarUso(escopo, no.nome);
    if (!entrada) return;
 
    if (entrada.categoria !== "procedimento") {
        registrarErro(`ERRO semantico: "${no.nome}" nao e um procedimento`);
        return;
    }
 
    const argumentos = no.chamada_de_procedimento2 ?? [];
    const tipos_dos_argumentos = argumentos.map((arg) => processarExpressao(arg, escopo));
 
    if (identificador === "read" || identificador === "write")
    {
        verificarChamadaDeReadOuWrite(no.nome, argumentos, tipos_dos_argumentos);
        return;
    }
 
    verificarParametrosFormaisComReais(no.nome, entrada, argumentos, tipos_dos_argumentos);
}

function processarExpressao(no, escopo) 
{
    if (no === null || no === undefined) return null;
    
    if (no.tipo === "numero")
    {
        return "int";
    }
    else if (no.tipo === "variavel")
    {
        const entrada = verificarUso(escopo, no.nome);
        if (entrada && entrada.categoria === "procedimento") 
        {
            // WIP: pq no TCC, procedimento não pode ser tratado como valor, a não ser que tenha visto errado
            registrarErro(`ERRO semantico: "${no.nome}" e um procedimento, nao pode ser usado como valor`);
            return null;
        }
        return entrada?.tipo ?? null;
    }
    else if (no.tipo === "variavel_indexada")
    {
        const entrada = verificarUso(escopo, no.nome);
        const tipo_indice = processarExpressao(no.indice, escopo);
        if (tipo_indice && tipo_indice !== "int")
        {
            registrarErro(`ERRO semantico: indice de "${no.nome}" deve ser int, encontrado "${tipo_indice}"`);
        }
        return entrada?.tipo ?? null;
    }
    else if (no.tipo === "unaria")
    {
        const tipo_operando = processarExpressao(no.operando, escopo);
        if (no.operador === "not" && tipo_operando && tipo_operando !== "boolean")
        {
            registrarErro(`ERRO semantico: "not" espera boolean, encontrado "${tipo_operando}"`);
        }
        if (no.operador === "-" && tipo_operando && tipo_operando !== "int") {
            registrarErro(`ERRO semantico: "-" unario espera int, encontrado "${tipo_operando}"`);
        }
        return tipo_operando;
    }
    else if (no.tipo === "binaria")
    {
        const tipo_esquerda = processarExpressao(no.esquerda, escopo);
        const tipo_direita = processarExpressao(no.direita, escopo);
        return verificarOperadorBinario(no.operador, tipo_esquerda, tipo_direita);
    }
    else
    {
        registrarErro(`ERRO semantico interno: expressao desconhecida na AST ("${no.tipo}")`);
        return null;
    }
}

function verificarOperadorBinario(operador, tipo_esquerda, tipo_direita)
{
    if (tipo_esquerda === null || tipo_direita === null) return null;
 
    if (OPERADORES_ARITMETICOS.has(operador))
    {
        if (tipo_esquerda !== "int" || tipo_direita !== "int")
        {
            registrarErro(`ERRO semantico: operador "${operador}" espera dois "int" (recebeu "${tipo_esquerda}" e "${tipo_direita}")`);
            return null;
        }
        return "int";
    }
    else if (OPERADORES_LOGICOS.has(operador))
    {
        if (tipo_esquerda !== "boolean" || tipo_direita !== "boolean")
        {
            registrarErro(`ERRO semantico: operador "${operador}" espera dois "boolean" (recebeu "${tipo_esquerda}" e "${tipo_direita}")`);
            return null;
        }
        return "boolean";
    }
    else if (OPERADORES_RELACIONAIS.has(operador))
    {
        if (tipo_esquerda !== tipo_direita) {
            registrarErro(`ERRO semantico: comparacao "${operador}" entre tipos diferentes ("${tipo_esquerda}" e "${tipo_direita}")`);
            return null;
        }
        return "boolean";
    }
    else
    {
        registrarErro(`ERRO semantico interno: operador desconhecido "${operador}"`);
        return null;
    }
}

export function analisarSemantica(AST)
{
    erros = [];
    avisos = [];
    tabela_de_simbolos = [];

    if (!AST) {
        return { ok: false, erros: ["AST vazia ou invalida (erro sintatico anterior)"], avisos: [], tabela_de_simbolos: [] };
    }
 
    const escopo_global = criarEscopo("global", 0, null);
    inserirPredefinidos(escopo_global);
 
    try
    {
        processarBloco(AST.bloco, escopo_global);
    } 
    catch (e) 
    {
        if (!(e instanceof ErroSemantico)) throw e;
    }
 
    verificarSimbolosNaoUtilizados();
 
    return {
        ok: erros.length == 0,
        erros: erros,
        avisos: avisos,
        tabela_de_simbolos: tabela_de_simbolos,
    };
}