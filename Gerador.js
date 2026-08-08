/*
 * Algumas observações:
 *  - Foi criado um writeln para que os exemplos da aula funcionem, mas não há slides cobrindo a implementação do writeln.
 *     Então foi suposto que o writeln funciona como o write, mas com uma quebra de linha no final (comando IMPE).
 *  - Conforme o que foi dito em aula, a geração de código para procedimentos não foi implementada, apenas a análise semântica.
 *
 */

const MAPA_RELACIONAL = {
  "=": "CMIG",
  "<>": "CMDG",
  ">": "CMMA",
  ">=": "CMAG",
  "<": "CMME",
  "<=": "CMEG"
};

var fila = [];
var posicao = 0;
var escopo_atual = 0;
var tabela_simbolo = null;
var erros = [];
var avisos = [];
var notas = [];

var vetor_codigo = [];
var enderecos = {};
var dentro_de_procedimento = 0; //gambearra para não gerar código dentro de procedimentos
var emLeitura = false;
var emEscrita = false;

class TabelaSimbolos 
{
  constructor() 
  {
    this.tabela = [];
  }

  inserir({ cadeia, token, categoria, tipo = null, valor = null, escopo = 0, extra = {} })
  {
    const registro = { cadeia, token, categoria, tipo, valor, escopo, utilizada: false, ...extra };
    this.tabela.push(registro);
    console.log(`inserindo na tabela de símbolos: ${JSON.stringify(registro)}`);//DEBUG
    return registro;
  }

  buscar(cadeia, { categoria = null, escopo_atual = null } = {})
  {
    for (let i = this.tabela.length - 1; i >= 0; i--)
    {
      const r = this.tabela[i];
      if(r.cadeia !== cadeia) continue;
      if(categoria && r.categoria !== categoria) continue;
      if(escopo_atual !== null && r.escopo > escopo_atual) continue;
      return r;
    }
    return null;
  }

  existeNoEscopo(cadeia, escopo)
  {
    return this.tabela.some(r => r.cadeia === cadeia && r.escopo === escopo);
  }

  removerEscopo(escopo)
  {
    this.tabela = this.tabela.filter(r => r.escopo !== escopo);
  }
}

class ErroSintatico extends Error {}

function gerarErro(msg) {
  throw new ErroSintatico(`${msg} - encontrado "${tokenAtual()}" ("${lexemaAtual()}") na posição ${posicao}`);
}

function erroSemantico(msg)
{
  erros.push(`Erro semântico próximo de "${lexemaAtual()}": ${msg}`);
}

function gerarNota(msg)
{
  notas.push(`Nota (geração de código) próximo de "${lexemaAtual()}": ${msg}`);
}

function enfileirarTokens(array_tokens)
{
  const f = array_tokens.map(tk => ({ token: tk.token, lexema: tk.lexema ?? tk.token }));
  f.push({ token: "$", lexema: "$" });
  return f;
}

function tokenAtual()
{
  return fila[posicao] ? fila[posicao].token : "$";
}

function lexemaAtual()
{
  return fila[posicao] ? fila[posicao].lexema : "$";
}

function inicializarTabelaSimbolos()
{
  //Qualquer coisa que não seja C é tão prático
  ["int", "boolean"].forEach(t =>
    tabela_simbolo.inserir({ cadeia: t, token: t, categoria: "tipo", escopo: -1 })
  );

  ["read", "write", "writeln"].forEach(p =>
    tabela_simbolo.inserir({ cadeia: p, token: "identificador_valido", categoria: "proc", escopo: -1, extra: { parametros: null } })
  );

  tabela_simbolo.inserir({ cadeia: "true", token: "identificador_valido", categoria: "const", tipo: "boolean", valor: true, escopo: -1 });
  tabela_simbolo.inserir({ cadeia: "false", token: "identificador_valido", categoria: "const", tipo: "boolean", valor: false, escopo: -1 });
}

function emitirInstrucao(codigo, valor = null) {
  const instrucao = { codigo };

  if(valor !== null)
  { 
    instrucao.valor = valor;
  }

  vetor_codigo.push(instrucao);

  console.log(`emitindo instrução: ${JSON.stringify(instrucao)}`);//DEBUG

  return vetor_codigo.length - 1;
}

function gerarInstrucao(codigo, valor = null)
{
  if(dentro_de_procedimento > 0) return null;
  return emitirInstrucao(codigo, valor);
}

function corrigirInstrucao(posicao_instrucao, novo_valor)
{
  if(posicao_instrucao === null || posicao_instrucao === undefined) return;
  vetor_codigo[posicao_instrucao].valor = novo_valor;
}

function proximoEndereco(escopo)
{
  if(enderecos[escopo] === undefined) enderecos[escopo] = 0;
  return enderecos[escopo]++;
}

function consumirToken(tokenEsperado)
{
  console.log(`Consumindo token: Atual: ${tokenAtual()} Esperado: ${tokenEsperado}`);
  if(tokenAtual() !== tokenEsperado)
  {
    erroSintatico(`esperado "${tokenEsperado}", encontrado "${tokenAtual()}"`);
  }
  posicao++;
}

function pegarIdentificador()
{
  const lex = lexemaAtual();
  consumirToken("identificador_valido");
  return lex;
}

function validarTipo(lexemaTipo) {
  if(lexemaTipo === "int" || lexemaTipo === "boolean") return lexemaTipo;
  erroSemantico(`tipo "${lexemaTipo}" desconhecido (use "int" ou "boolean")`);
  return null;
}

function declararVariavel(nome, tipo, categoria = "var", extra = {})
{
  if(tabela_simbolo.existeNoEscopo(nome, escopo_atual))
  {
    erroSemantico(`identificador "${nome}" já declarado neste escopo`);
    return null;
  }

  const registro = tabela_simbolo.inserir({ cadeia: nome, token: "identificador_valido", categoria, tipo, escopo: escopo_atual, extra });

  if(categoria === "var" || categoria === "parametro")//WIP
  {
    registro.end_rel = proximoEndereco(escopo_atual);
    gerarInstrucao("AMEM", 1);
  }
  return registro;
}

function buscarVariavel(nome)
{
  const registro = tabela_simbolo.buscar(nome, { escopo_atual });

  if(!registro)
  {
    erroSemantico(`identificador "${nome}" não declarado`);
    return null;
  }

  if(!["var", "parametro", "const"].includes(registro.categoria))
  {
    erroSemantico(`"${nome}" não pode ser usado como variável`);
    return null;
  }
  
  registro.utilizada = true;
  return registro;
}

function verificarChamadaDeProcedimento(nome, argsTipos) {
  const registro = tabela_simbolo.buscar(nome, { categoria: "proc", escopo_atual });

  if(!registro)
  {
    erroSemantico(`procedimento "${nome}" não declarado`);
    return;
  }

  if(registro.parametros === null)
  {
    argsTipos.forEach((tipo, i) => {
      if(tipo !== "int" && tipo !== "boolean") erroSemantico(`argumento ${i + 1} de "${nome}" deve ser do tipo int ou boolean`);
    });
    return;
  }

  if(argsTipos.length !== registro.parametros.length)
  {
    erroSemantico(`número de argumentos incompatível em "${nome}" (esperado ${registro.parametros.length}, informado ${argsTipos.length})`);
    return;
  }

  registro.parametros.forEach((param, i) => {
    if(argsTipos[i] !== null && argsTipos[i] !== param.tipo)
    {
      erroSemantico(`parâmetro ${i + 1} de "${nome}" incompatível (esperado ${param.tipo}, informado ${argsTipos[i]})`);
    }
  });
}

function finalizarEscopoDeProcedimento()
{//de novo, vejo que qualquer coisa que não seja C é tão prático
  tabela_simbolo.tabela
    .filter(r => r.escopo === escopo_atual && r.categoria === "var" && !r.utilizada)
    .forEach(r => avisos.push(`Aviso: variável "${r.cadeia}" declarada e nunca utilizada`));
  tabela_simbolo.removerEscopo(escopo_atual);
  escopo_atual--;
}

function verificarNaoUtilizadasNoEscopo(escopo)
{
  tabela_simbolo.tabela
    .filter(r => r.escopo === escopo && r.categoria === "var" && !r.utilizada)
    .forEach(r => avisos.push(`Aviso: variável "${r.cadeia}" declarada e nunca utilizada`));
}

function nomeProcedimentoEhEsSaida(nome) {
  return nome === "read" || nome === "write" || nome === "writeln";
}

function ntPrograma() {
  console.log("------------------------");
  console.log("<programa>");
  console.log(tokenAtual());
  let tokens_aceitos = ["program"];
  let tokens_vazios = [];
  if (tokens_aceitos.includes(tokenAtual())) {
    consumirToken("program");
    const nomePrograma = ntIdentificador();
    tabela_simbolo.inserir({ cadeia: nomePrograma, token: "identificador_valido", categoria: "nome_prog", escopo: escopo_atual });
    consumirToken("ponto_e_virgula");
    gerarInstrucao("INPP");
    ntBloco();
    gerarInstrucao("PARA");
    verificarNaoUtilizadasNoEscopo(escopo_atual);
    consumirToken("ponto_final");
  }
  else if (tokens_vazios.includes(tokenAtual())) {
    console.log("Vazio");
  }
  else {
    gerarErro(`ERRO sintatico: programa invalido`);
  }
}

function ntBloco()
{
    console.log("------------------------");
    console.log("<bloco>");
    console.log(tokenAtual())
    let tokens_aceitos = ["int", "boolean", "procedure", "begin"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntParte_de_declaracoes_de_variaveis();
        ntParte_de_declaracoes_de_subrotinas();
        ntComando_composto1();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: bloco invalido`);
    }
}

function ntParte_de_declaracoes_de_variaveis()
{
    console.log("------------------------");
    console.log("<parte_de_declaracoes_de_variaveis>");
    console.log(tokenAtual())
    let tokens_aceitos = ["int", "boolean"];
    let tokens_vazios = ["procedure", "begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntDeclaracao_de_variavel1();
        consumirToken("ponto_e_virgula");
        ntDeclaracao_de_variavel2();   
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: parte_de_declaracoes_de_variaveis invalido`);
    }
}

function ntDeclaracao_de_variavel1()
{
    console.log("------------------------");
    console.log("<declaracao_de_variavel1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["int", "boolean"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const tipo = ntTipo();
        const nomes = ntLista_de_identificadores1();
        nomes.forEach(nome => declararVariavel(nome, tipo, "var"));
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: declaracao_de_variavel1 invalido`);
    }
}

function ntDeclaracao_de_variavel2()
{
    console.log("------------------------");
    console.log("<declaracao_de_variavel2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["int", "boolean"];
    let tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntDeclaracao_de_variavel1();
        ntDeclaracao_de_variavel2();
        consumirToken("ponto_e_virgula");
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: declaracao_de_variavel2 invalido`);
    }
}

function ntIdentificador()
{
    console.log("------------------------");
    console.log("<identificador>");
    console.log(tokenAtual())
    let tokens_aceitos = ["identificador_valido", "int", "boolean"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
      const nome_identificador = lexemaAtual();
      posicao++;
      return nome_identificador;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
      console.log("Vazio");
    }
    else
    {
      gerarErro(`ERRO sintaxico: identificador invalido`);
    }
}

function ntLista_de_identificadores1()
{
    console.log("------------------------");
    console.log("<lista_de_identificadores1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["identificador_valido"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const nome = ntIdentificador();
        const nomes = ntLista_de_identificadores2();
        if(!nomes) return [nome];
        return [nome, ...nomes];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: lista_de_identificadores1 invalido`);
    }
}

function ntLista_de_identificadores2()
{
    console.log("------------------------");
    console.log("<lista_de_identificadores2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["virgula"];
    let tokens_vazios = ["int", "boolean", "ponto","ponto_e_virgula", "procedure", "begin", "dois_pontos"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("virgula");
        const nome = ntIdentificador();
        const nomes = ntLista_de_identificadores2();
        if(!nomes) return [nome];
        return [nome, ...nomes];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: lista_de_identificadores2 invalido`);
    }
}

function ntTipo()
{
    console.log("------------------------");
    console.log("<tipo>");
    console.log(tokenAtual())
    let tokens_aceitos = ["int", "boolean"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == "int")
        {
            consumirToken("int");
            return "int";
        }
        else
        {
            consumirToken("boolean");
            return "boolean";
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: tipo invalido`);
    }
}

function ntParte_de_declaracoes_de_subrotinas()
{
    console.log("------------------------");
    console.log("<parte_de_declaracoes_de_subrotinas>");
    console.log(tokenAtual())
    let tokens_aceitos = ["procedure"];
    let tokens_vazios = ["begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntDeclaracao_de_procedimento1();
        consumirToken("ponto_e_virgula");
        ntDeclaracao_de_procedimento2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: parte_de_declaracoes_de_subrotinas invalido`);
    }
}

function ntDeclaracao_de_procedimento2()
{
    console.log("------------------------");
    console.log("<declaracao_de_procedimento2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["procedure"];
    let tokens_vazios = ["ponto_e_virgula", "begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntDeclaracao_de_procedimento1();
        ntDeclaracao_de_procedimento2();
        consumirToken("ponto_e_virgula")
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: declaracao_de_procedimento2 invalido`);
    }
}

function ntDeclaracao_de_procedimento1()
{
    console.log("------------------------");
    console.log("<declaracao_de_procedimento1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["procedure"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("procedure");

        const nome = ntIdentificador();
        nota(`geração de código para o procedimento "${nome}" não é coberta, apenas a análise semântica foi realizada.`);
        const registro = declararVariavel(nome, null, "proc", { parametros: [] });
        escopo_atual++;
        dentro_de_procedimento++;

        const parametros = ntParametros_formais1();
        if(registro)
        {
          registro.parametros = parametros;
        }

        consumirToken("ponto_e_virgula")
        ntBloco();
        
        dentro_de_procedimento--;
        finalizarEscopoDeProcedimento();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: declaracao_de_procedimento1 invalido`);
    }
}

function ntParametros_formais1()
{
    console.log("------------------------");
    console.log("<parametros_formais1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["abre_parenteses"];
    let tokens_vazios = ["ponto_e_virgula"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("abre_parenteses");
        const parametros1 = ntSecao_de_parametros_formais();
        const parametros2 = ntParametros_formais2();
        consumirToken("fecha_parenteses");
        if(!parametros2) return [...parametros1];
        return [...parametros1, ...parametros2];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: parametros_formais1 invalido`);
    }
}

function ntParametros_formais2()
{
    console.log("------------------------");
    console.log("<parametros_formais2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["ponto_e_virgula"];
    let tokens_vazios = ["fecha_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("ponto_e_virgula");
        const parametros1 = ntSecao_de_parametros_formais();
        const parametros2 = ntParametros_formais2();
        if(!parametros2) return [...parametros1];
        return [...parametros1, ...parametros2];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: parametros_formais2 invalido`);
    }
}

function ntSecaoDeParametrosFormais()
{
    console.log("------------------------");
    console.log("<secaoDeParametrosFormais>");
    console.log(tokenAtual())
    let tokens_aceitos = ["var", "identificador_valido"];
    let tokens_vazios = ["ponto_e_virgula", "fecha_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const por_referencia = ntVar();
        const nomes = ntLista_de_identificadores1();
        consumirToken("dois_pontos");
        const lexema_tipo = ntIdentificador();
        const tipo = validarTipo(lexema_tipo);

        return nomes
          .map(nome => declararVariavel(nome, tipo, "par", { porReferencia }))
          .filter(Boolean)
          .map(reg => ({ nome: reg.cadeia, tipo: reg.tipo, porReferencia: reg.porReferencia }));
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: secaoDeParametrosFormais invalido`);
    }
}

function ntVar()
{
    console.log("------------------------");
    console.log("<var>");
    console.log(tokenAtual())
    let tokens_aceitos = ["var", "identificador_valido"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if (tokenAtual() === "var")
        {
          consumirToken("var");
          return true;
        }
        else
        {
          return false;
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: var invalido`);
    }
}

function ntComando_composto1()
{
    console.log("------------------------");
    console.log("<comando_composto1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["begin"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("begin");
        ntComando1();
        ntComando_composto2();
        consumirToken("end");
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: comando_composto1 invalido`);
    }
}

function ntComando_composto2()
{
    console.log("------------------------");
    console.log("<comando_composto2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["ponto_e_virgula"];
    let tokens_vazios = ["end"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("ponto_e_virgula");
        ntComando1();
        ntComando_composto2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: comando_composto2 invalido`);
    }
}

function ntComando1()
{
    console.log("------------------------");
    console.log("<comando1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["begin", "identificador_valido", "if", "while"];
    let tokens_vazios = ["ponto_e_virgula", "end", "else"];//WIP2
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == tokens_aceitos[0])
        {
            ntComando_composto1();
        }
        else if(tokenAtual() == tokens_aceitos[1])
        { 
            const nome = ntIdentificador();
            ntComando2(nome);
        }
        else if(tokenAtual() == tokens_aceitos[2])
        {
            consumirToken("if");
            const tipo_condicao = ntExpressao1();
            if (tipo_condicao && tipo_condicao !== "boolean")
            {
              erroSemantico("a expressão do \"if\" deve ser do tipo boolean");
            }
            consumirToken("then");
            const posDSVF = gerarInstrucao("DSVF", null);
            ntComando1();
            ntElse(posDSVF);
        }
        else
        {
            consumirToken("while");
            const pos_inicio = gerarInstrucao("NADA");
            const tipo_condicao = ntExpressao1();
            if (tipo_condicao && tipo_condicao !== "boolean")
            {
              erroSemantico("a expressão do \"while\" deve ser do tipo boolean");
            }
            consumirToken("do");
            const pos_DSVF = gerarInstrucao("DSVF", null);
            ntComando1();
            gerarInstrucao("DSVS", pos_inicio);
            corrigirInstrucao(pos_DSVF, gerarInstrucao("NADA"));
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: comando1 invalido`);
    }
}

function ntComando2(nome)
{
    console.log("------------------------");
    console.log("<comando2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["abre_parenteses", "atribuicao"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == tokens_aceitos[0])
        {
            consumirToken("abre_parenteses");

            const emLeituraAnterior = emLeitura;
            const emEscritaAnterior = emEscrita;
            if (nome === "read") emLeitura = true;
            if (nome === "write" || nome === "writeln") emEscrita = true;
            const tipos_args = ntChamada_de_procedimento2();
      
            emLeitura = emLeituraAnterior;
            emEscrita = emEscritaAnterior;

            verificarChamadaDeProcedimento(nome, tipos_args);

            if (nome === "writeln") gerarInstrucao("IMPE");

            if (!nomeProcedimentoEhEsSaida(nome))
            {
              nota(`chamada ao procedimento "${nome}" não gera código.`);
            }
            return;
        }
        else if(tokenAtual() == tokens_aceitos[1])
        {
            const registro = buscarVariavel(nome);
            consumirToken("atribuicao");
            const tipoExpr = ntExpressao1();
            if(registro && tipoExpr && registro.tipo !== tipoExpr)
            {
              erroSemantico(`atribuição incompatível: "${nome}" é ${registro.tipo}, expressão é ${tipoExpr}`);
            }
            if (registro && registro.end_rel !== undefined) gerarInstrucao("ARMZ", registro.end_rel);
            return;
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
        verificarChamadaDeProcedimento(nome, []);
        if(!nomeProcedimentoEhEsSaida(nome))
        {
          nota(`chamada ao procedimento "${nome}" não gera código.`);
        }
    }
    else
    {
        gerarErro(`ERRO sintaxico: comando2 invalido`);
    }
}

function ntAtribuicao()//Está na tabela do TCC, mas não é um comando, então não sei se deveria estar aqui
{
    console.log("------------------------");
    console.log("<atribuicao>");
    console.log(tokenAtual())
    let tokens_aceitos = ["identificador_valido"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntVariavel1();
        consumirToken("atribuicao");
        ntExpressao1();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: atribuicao invalido`);
    }
}

function ntChamada_de_procedimento1()
{
    console.log("------------------------");
    console.log("<chamada_de_procedimento1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["identificador_valido"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        ntIdentificador();
        ntChamada_de_procedimento2();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: chamada_de_procedimento1 invalido`);
    }
}

function ntChamada_de_procedimento2()
{
    console.log("------------------------");
    console.log("<chamada_de_procedimento2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["identificador_valido", "numero", "virgula", "abre_parenteses", "fecha_parenteses", "+", "-", "not", "=", "<>", ">", ">=", "<", "<="];
    let tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin", "end", "else"];
    if(tokens_aceitos.includes(tokenAtual()))
    {

        const tipo = ntLista_de_expressoes1();
        consumirToken("fecha_parenteses");
        return tipo;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: chamada_de_procedimento2 invalido`);
    }
}

function ntComando_condicional_1()
{
    console.log("------------------------");
    console.log("<comando_condicional_1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["if"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("if");
        ntExpressao1();
        consumirToken("then");
        ntComando1();
        ntElse();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: comando_condicional_1 invalido`);
    }
}

function ntElse(posDSVF)
{
    console.log("------------------------");
    console.log("<else>");
    console.log(tokenAtual())
    let tokens_aceitos = ["else"];
    let tokens_vazios = ["ponto", "ponto_e_virgula", "begin", "procedure"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const posDSVS = gerarInstrucao("DSVS", null);
        corrigirInstrucao(posDSVF, gerarInstrucao("NADA"));
        consumirToken("else");
        ntComando1();
        corrigirInstrucao(posDSVS, gerarInstrucao("NADA"));
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
        corrigirInstrucao(posDSVF, gerarInstrucao("NADA"));
    }
    else
    {
        gerarErro(`ERRO sintaxico: else invalido`);
    }
}

function ntComando_repetitivo_1()
{
    console.log("------------------------");
    console.log("<comando_repetitivo_1>");
    console.log(tokenAtual())
    let tokens_aceitos = [];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("while");
        ntExpressao1();
        consumirToken("do");
        ntComando1();
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: comando_repetitivo_1 invalido`);
    }
}

function ntExpressao1()
{
    console.log("------------------------");
    console.log("<expressao1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["identificador_valido", "numero", "abre_parenteses", "+", "-", "not", "=", "<>", ">", ">=", "<", "<="];
    let tokens_vazios = ["then", "do", "]", "procedure", "begin", "ponto", "ponto_e_virgula", "virgula", "fecha_parenteses", "end", "else"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const tipoEsq = ntExpressao_simples1();
        const expressao = ntExpressao2(tipoEsq);
        return expressao;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: expressao1 invalido`);
    }
}

function ntExpressao2(tipoEsq)
{
    console.log("------------------------");
    console.log("<expressao2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["=", "<>", ">", ">=", "<", "<="];
    let tokens_vazios = ["then", "do", "]", "procedure", "begin", "ponto", "ponto_e_virgula", "virgula", "fecha_parenteses", "end", "else"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const instrucao = ntRelacao();
        const tipoDir = ntExpressao_simples1();
        if(tipoEsq && tipoDir && tipoEsq !== tipoDir)
        {
          erroSemantico(`comparação entre tipos incompatíveis (${tipoEsq} e ${tipoDir})`);
        }
        gerarInstrucao(instrucao);
        return "boolean";
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
        return tipoEsq;
    }
    else
    {
        gerarErro(`ERRO sintaxico: expressao2 invalido`);
    }
}

function ntRelacao()
{
    console.log("------------------------");
    console.log("<relacao>");
    console.log(tokenAtual())
    let tokens_aceitos = ["=", "<>", ">", ">=", "<", "<="];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const t = tokenAtual();
        consumirToken(tokenAtual()); //Acho que funciona
        return MAPA_RELACIONAL[t];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: relacao invalido`);
    }
}

function ntExpressao_simples1()
{
    console.log("------------------------");
    console.log("<expressao_simples1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["identificador_valido", "numero", "abre_parenteses", "+", "-", "not"];
    let tokens_vazios = ["=", "<>", ">", ">=", "<", "<=", "then", "do", "]", "ponto", "ponto_e_virgula", "procedure", "begin"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        let unarioNegativo = false;
        unarioNegativo = ntOp();
        let tipo = ntTermo1();

        if(unarioNegativo)
        {
          if(tipo && tipo !== "int")
          {
            erroSemantico('operador unário "-" requer operando do tipo int');
          }
          gerarInstrucao("INVR");
        }

        const expressao = ntExpressao_simples2(tipo);
        return expressao;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: expressao_simples1 invalido`);
    }
}

function ntOp()
{
    console.log("------------------------");
    console.log("<op>");
    console.log(tokenAtual())
    let tokens_aceitos = ["+", "-"];
    let tokens_vazios = ["numero", "not", "identificador_valido", "abre_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const unarioNegativo = tokenAtual() === "-";
        consumirToken(tokenAtual());
        return unarioNegativo;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: op invalido`);
    }
}

function ntExpressao_simples2(tipoAcumulado)
{
    console.log("------------------------");
    console.log("<expressao_simples2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["+", "-", "or"];
    let tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin", "virgula", "abre_parenteses", "fecha_parenteses", "end", "else", "then", "do", "]", "=", "<>", ">", ">=", "<", "<="];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const token = tokenAtual();
        ntOp2();
        const tipoDir = ntTermo1();
        const esperado = tokenAtual() === "or" ? "boolean" : "int";
        if(tipoAcumulado && tipoAcumulado !== esperado)
        {
          erroSemantico(`operador "${tokenAtual()}" requer operandos do tipo ${esperado}`);
        } 
        else if(tipoDir && tipoDir !== esperado)
        {
          erroSemantico(`operador "${tokenAtual()}" requer operandos do tipo ${esperado}`);
        }

        if (token === "+") gerarInstrucao("SOMA");
        else if (token === "-") gerarInstrucao("SUBT");
        else gerarInstrucao("DISJ");

        const expressao = ntExpressao_simples2(esperado);
        return expressao;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: expressao_simples2 invalido`);
    }
}

function ntOp2()
{
    console.log("------------------------");
    console.log("<op2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["+", "-", "or"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken(tokenAtual());
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: op2 invalido`);
    }
}

function ntTermo1()
{
    console.log("------------------------");
    console.log("<termo1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["identificador_valido", "numero", "abre_parenteses", "not"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const tipo = ntFator();
        const expressao = ntTermo2(tipo);
        return expressao;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: termo1 invalido`);
    }
}

function ntTermo2(tipoAcumulado)
{
    console.log("------------------------");
    console.log("<termo2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["*", "div", "and"];
    let tokens_vazios = ["ponto", "ponto_e_virgula", "procedure", "begin", "virgula", "fecha_parenteses", "end", "else", "then", "do", "+", "-", "]", "=", "<>", ">", ">=", "<", "<="];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const token = tokenAtual();
        ntOp3();
        const tipoDir = ntFator();
        const esperado = tokenAtual() === "and" ? "boolean" : "int";
        if(tipoAcumulado && tipoAcumulado !== esperado)
        {
          erroSemantico(`operador "${tokenAtual()}" requer operandos do tipo ${esperado}`);
        } 
        else if(tipoDir && tipoDir !== esperado)
        {
          erroSemantico(`operador "${tokenAtual()}" requer operandos do tipo ${esperado}`);
        }

        if (token === "*") gerarInstrucao("MULT");
        else if (token === "div") gerarInstrucao("DIVI");
        else gerarInstrucao("CONJ");

        const expressao = ntTermo2(esperado);
        return expressao;
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
        return tipoAcumulado;
    }
    else
    {
        gerarErro(`ERRO sintaxico: termo2 invalido`);
    }
}

function ntOp3()
{
    console.log("------------------------");
    console.log("<op3>");
    console.log(tokenAtual())
    let tokens_aceitos = ["*", "div", "and"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken(tokenAtual());
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: op3 invalido`);
    }
}

function ntFator()
{
    console.log("------------------------");
    console.log("<fator>");
    console.log(tokenAtual())
    let tokens_aceitos = ["identificador_valido", "abre_parenteses", "numero", "not"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == tokens_aceitos[0])
        {
            const tipo = ntVariavel1();
            return tipo;
        }
        else if(tokenAtual() == tokens_aceitos[1])
        {
            consumirToken("abre_parenteses");
            const tipo = ntExpressao1();
            consumirToken("fecha_parenteses");
            return tipo;
        }
        else if(tokenAtual() == tokens_aceitos[2])
        {
            const valor = lexemaAtual();
            consumirToken("numero");
            gerarInstrucao("CRCT", Number(valor));
            return "int";
        }
        else
        {
            consumirToken("not");
            const tipo = ntFator();
            if(tipo && tipo !== "boolean")
            {
              erroSemantico('operador "not" requer operando do tipo boolean');
            }
            gerarInstrucao("NEGA");
            return "boolean";
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: fator invalido`);
    }
}

function ntVariavel1()
{
    console.log("------------------------");
    console.log("<variavel1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["identificador_valido"];
    let tokens_vazios = [];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const nome = ntIdentificador();
        const registro = buscarVariavel(nome);

        if(registro)
        {
          if (emLeitura && (registro.categoria === "var" || registro.categoria === "par") && registro.end_rel !== undefined) {
            gerarInstrucao("LEIT");
            gerarInstrucao("ARMZ", registro.end_rel);
          } else if (registro.categoria === "const") {
            gerarInstrucao("CRCT", registro.valor ? 1 : 0);
          } else if (registro.categoria === "var" || registro.categoria === "par") {
            gerarInstrucao("CRVL", registro.end_rel);
          }
        }

        return ntVariavel2( registro ? registro.tipo : null);
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: variavel1 invalido`);
    }
}

function ntVariavel2(tipoBase)
{
    console.log("------------------------");
    console.log("<variavel2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["abre_parenteses", "["];
    let tokens_vazios = ["*", "div", "and", "ponto", "ponto_e_virgula", "procedure", "begin", "virgula", "fecha_parenteses", "end", "else", "then", "do", "+", "-", "]", "=", "<>", ">", ">=", "<", "<=", "atribuicao"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        if(tokenAtual() == tokens_aceitos[0])//WIP
        {
            consumirToken("abre_parenteses");
            ntLista_de_expressoes1();
            consumirToken("fecha_parenteses");
        }
        else if(tokenAtual() == tokens_aceitos[1])
        {
            consumirToken("[");
            const tipo = ntExpressao1();
            if(tipo && tipo !== "int") erroSemantico('índice de vetor deve ser do tipo "int"');
            consumirToken("]");
            nota('acesso a vetor ("[...]") não gera código, apenas a análise semântica é realizada.');
            return tipoBase;
        }
        else
        {
            ntOp3();
            ntFator();
            ntTermo2();
        }
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
    }
    else
    {
        gerarErro(`ERRO sintaxico: variavel2 invalido`);
    }
}

function ntLista_de_expressoes1()
{
    console.log("------------------------");
    console.log("<lista_de_expressoes1>");
    console.log(tokenAtual())
    let tokens_aceitos = ["identificador_valido", "numero", "virgula", "abre_parenteses", "not", "+", "-", "]", "=", "<>", ">", ">=", "<", "<="];
    let tokens_vazios = ["fecha_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        const tipo = ntExpressao1();
        if(emEscrita) gerarInstrucao("IMPR");
        const resto = ntLista_de_expressoes2();
        return [tipo, ...resto];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: lista_de_expressoes1 invalido`);
    }
}

function ntLista_de_expressoes2()
{
    console.log("------------------------");
    console.log("<lista_de_expressoes2>");
    console.log(tokenAtual())
    let tokens_aceitos = ["virgula"];
    let tokens_vazios = ["fecha_parenteses"];
    if(tokens_aceitos.includes(tokenAtual()))
    {
        consumirToken("virgula");
        const tipo = ntExpressao1();
        if(emEscrita) gerarInstrucao("IMPR");
        const resto = ntLista_de_expressoes2();
        if(!resto) return [tipo];
        return [tipo, ...resto];
    }
    else if(tokens_vazios.includes(tokenAtual()))
    {
        console.log("Vazio");
        return [];
    }
    else
    {
        gerarErro(`ERRO sintaxico: lista_de_expressoes2 invalido`);
    }
}

export function geradorDeCodigo(arrayTokens) {
  fila = enfileirarTokens(arrayTokens);
  posicao = 0;
  escopo_atual = 0;
  erros = [];
  avisos = [];
  notas = [];
  vetor_codigo = [];
  enderecos = {};
  dentro_de_procedimento = 0;
  tabela_simbolo = new TabelaSimbolos();
  inicializarTabelaSimbolos();

  try {
    ntPrograma();
    if(tokenAtual() !== "$")
    {
      erroSintatico("tokens sobrando após o fim do programa");
    }
  } catch (e) {
    if(e instanceof ErroSintatico)
    {
      erros.push(e.message);
    }
    else
    {
      throw e;
    }
  }

  return {
    codigoMEPA: vetor_codigo,
    tabelaDeSimbolos: tabela_simbolo.tabela,
    erros,
    avisos,
    notas
  };
}

export function analisadorSemantico(arrayTokens) {
  const { tabelaDeSimbolos, erros, avisos } = geradorDeCodigo(arrayTokens);
  return { tabelaDeSimbolos, erros, avisos };
}