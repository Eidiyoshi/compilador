var test = [];

function func(asd)
{
    asd.push({
        token: "token",
        lexema: "poi",
        linha: 1,
        comeco: 1,
        fim: 1
    });
}

func(test);

console.log(test);