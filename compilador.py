symbols = [
    "(",")",".","+","-","*","/",
]

numbers = [
    "0","1","2","3","4","5","6","7","8","9"
]

spaces = [
    " ", "\t"
]

line_break = ["\n"]

alfabet = symbols + numbers + spaces + line_break

tokens = [
    "int","float","aP","fP","soma","sub","mult","div","erro"
]

class Token:
    def __init__(self, value, type, line, cCol, fCol):
        self.value = "".join(value)#Converter a lista de caracteres em string
        self.type = type
        self.line = line
        self.cCol = cCol
        self.fCol = fCol-1
    
    def __repr__(self):
        return f"{self.value} | {self.type} | {self.line} | {self.cCol} | {self.fCol}"

def character_is_valid(char):
    if char in alfabet:
        return True
    return False

def identify_token(character, current_token):
    if character in numbers:
        if current_token == tokens[1]:
            return tokens[1]
        else:
            return tokens[0]
        
    elif character in symbols:
        if character == "." and current_token == tokens[0]:
            return tokens[1]
        elif character == "(":
            return tokens[2]
        elif character == ")":
            return tokens[3]
        elif character == "+":
            return tokens[4]
        elif character == "-":
            return tokens[5]
        elif character == "*":
            return tokens[6]
        elif character == "/":
            return tokens[7]
    elif character in spaces:
        return "espaco"
    elif character in line_break:
        return "quebra"
    return "erro"

def list_result(result):
    print("Resultado:")
    print("Valor | Tipo | Linha | Coluna Inicial | Coluna Final")
    for token in result:
        print(token)

result = []

with open("teste.txt") as f:
    #Gerador de token para cada caractere
    text = f.read()
    past_token = ""
    for i in text:
        print(i,end=" ")
        if character_is_valid(i):
            token = identify_token(i, past_token)
            #Consertar os caracteres classificados como int antes do .
            if token == tokens[1] and past_token == tokens[0]:
                for index,fix in enumerate(list(reversed(result))):
                    if fix == tokens[0] or fix == tokens[1]: #or fix == "espaco":
                        result[len(result)-1-index] = tokens[1]
                    else:
                        break
            if token == "quebra" and past_token == tokens[1]:
                result.append(tokens[1])
            else:
                result.append(token)
            print(token)
            if token != "espaco" and token != "quebra":
                past_token = token
        else:
            result.append(tokens[8])
    
    print(f"text: {text}\nresult: {result}")

    #Agrupar os tokens
    real_result = []
    past_token = result[0]
    current_token_start = 0
    current_token_end = 0
    current_token_line = 0
    current_value = []
    for index, token in enumerate(result):
        if past_token == token and text[index] != " " and text[index] != "\n":
            current_value.append(text[index])
        else:
            if past_token != "espaco" and past_token != "quebra" and text[index] != "\n":
                new_token = Token(current_value, past_token, current_token_line, current_token_start, current_token_end)
                real_result.append(new_token)
            elif past_token == "quebra":
                current_token_line += 1
                current_token_end = 0
                current_token_start = 0
                past_token = token
                continue
            if text[index] != " " and text[index] != "\n":
                current_value = []
                current_value.append(text[index])
                current_token_start = index
        
        current_token_end += 1
        past_token = token
    
    new_token = Token(current_value, past_token, current_token_line, current_token_start, current_token_end)
    real_result.append(new_token)

    #print(f"real_result: {real_result}")
    
    list_result(real_result)