const limite_de_passos = 100000;

export function interpretador(codigoMEPA) {

    const D = [];
    let s;
    let i = 0;

    while (i < codigoMEPA.length && i >= 0)
    {
        if(i > limite_de_passos)
        {
            console.log("Limite de passos excedido. O programa pode estar em loop infinito.");
            break;
        }

        const instrucao = codigoMEPA[i];
        
        if(instrucao.codigo === "CRCT")
        {
            s++;
            D[s] = instrucao.valor;
            i++;
        }
        else if(instrucao.codigo === "CRVL")
        {
            s++;
            D[s] = D[instrucao.valor];
            i++;
        }
        else if(instrucao.codigo === "ARMZ")
        {
            D[instrucao.valor] = D[s];
            s--;
            i++;
        }
        else if(instrucao.codigo === "SOMA")
        {
            D[s-1] = D[s-1] + D[s];
            s--;
            i++;
        }
        else if(instrucao.codigo === "SUBT")
        {
            D[s-1] = D[s-1] - D[s];
            s--;
            i++;
        }
        else if(instrucao.codigo === "MULT")
        {
            D[s-1] = D[s-1] * D[s];
            s--;
            i++;
        }
        else if(instrucao.codigo === "DIVI")
        {
            D[s-1] = parseInt(D[s-1] / D[s]);
            s--;
            i++;
        }
        else if(instrucao.codigo === "MODI")//não tem no LALG (baseado no TCC), mas está no slide
        {
            D[s-1] = D[s-1] % D[s];
            s--;
            i++;
        }
        else if(instrucao.codigo === "INVR")
        {
            D[s] = -D[s];
            i++;
        }
        else if(instrucao.codigo === "CONJ")
        {
            if(D[s-1] == 1 && D[s] == 1)
            {
                D[s-1] = 1;
            }
            else
            {
                D[s-1] = 0;
            }
            s--;
            i++;
        }
        else if(instrucao.codigo === "DISJ")
        {
            if(D[s-1] == 1 || D[s] == 1)
            {
                D[s-1] = 1;
            }
            else
            {
                D[s-1] = 0;
            }
            s--;
            i++;
        }
        else if(instrucao.codigo === "NEGA")
        {
            D[s] = 1 - D[s];
            i++;
        }
        else if(instrucao.codigo === "CMME")
        {
            if(D[s-1] < D[s])
            {
                D[s-1] = 1;
            }
            else
            {
                D[s-1] = 0;
            }
            s--;
            i++;
        }
        else if(instrucao.codigo === "CMMA")
        {
            if(D[s-1] > D[s])
            {
                D[s-1] = 1;
            }
            else
            {
                D[s-1] = 0;
            }
            s--;
            i++;
        }
        else if(instrucao.codigo === "CMIG")
        {
            if(D[s-1] === D[s])
            {
                D[s-1] = 1;
            }
            else
            {
                D[s-1] = 0;
            }
            s--;
            i++;
        }
        else if(instrucao.codigo === "CMDG")
        {
            if(D[s-1] !== D[s])
            {
                D[s-1] = 1;
            }
            else
            {
                D[s-1] = 0;
            }
            s--;
            i++;
        }
        else if(instrucao.codigo === "CMAG")
        {
            if(D[s-1] >= D[s])
            {
                D[s-1] = 1;
            }
            else
            {
                D[s-1] = 0;
            }
            s--;
            i++;
        }
        else if(instrucao.codigo === "CMEG")
        {
            if(D[s-1] <= D[s])
            {
                D[s-1] = 1;
            }
            else
            {
                D[s-1] = 0;
            }
            s--;
            i++;
        }
        else if(instrucao.codigo === "DSVS")
        {
            i = instrucao.valor;
        }
        else if(instrucao.codigo === "DSVF")
        {
            if(D[s] === 0)
            {
                i = instrucao.valor;
            }
            else
            {
                i++;
            }
            s--;
        }
        else if(instrucao.codigo === "NADA")
        {
            i++;
        }
        else if(instrucao.codigo === "LEIT")//WIP falta fazer a entrada do usuário
        {
            console.log("Entre com um inteiro:");
            s++;
            D[s] = parseInt(prompt("Digite um valor: "));
            i++;
        }
        else if(instrucao.codigo === "LECH")//também não tem no LALG (baseado no TCC), mas está no slide
        {
            console.log("Entre com um caractere:");
            s++;
            D[s] = prompt("Digite um valor: ");
            i++;
        }
        else if(instrucao.codigo === "IMPR")//WIP falta fazer a saída
        {
            console.log(D[s]);
            s--;
            i++;
        }
        else if(instrucao.codigo === "IMPC")//também não tem no LALG (baseado no TCC), mas está no slide
        {
            console.log(D[s]);
            s--;
            i++;
        }
        else if(instrucao.codigo === "IMPE")//não bate com o slide na parte da geração de código, mas bate com o que foi especificado na parte teorica
        {
            console.log("\n");
            s--;
            i++;
        }
        else if(instrucao.codigo === "INPP")
        {
            s = -1;
            i++;
        }
        else if(instrucao.codigo === "AMEM")
        {
            s = s + instrucao.valor;
            i++;
        }
        else if(instrucao.codigo === "DMEM")
        {
            s = s - instrucao.valor;
            i++;
        }
        else if(instrucao.codigo === "PARA")
        {
            console.log("Execução encerrada com sucesso");
            break;
        }
    }
}