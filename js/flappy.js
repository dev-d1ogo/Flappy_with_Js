function novoElemento(tagName, className){
    const elem = document.createElement(tagName)
    // Adicionando nome da classe do elemento com className
    elem.className = className;
    
    return elem
}


//Funçao construtora  de Barreiras 

function Barreira (reversa = false){
    this.elemento = novoElemento('div','barreira');
    const borda = novoElemento('div','borda');
    const corpo = novoElemento('div','corpo');

    this.elemento.appendChild(reversa ? corpo : borda);
    this.elemento.appendChild(reversa ? borda : corpo);

    this.setAltura = function(altura){
        corpo.style.height = `${altura}px`
    }
}


//Funçao Construtora ParBarreiras
    //Altura = 700 porque a altura do jogo sempre será 700px

function ParBarreiras(abertura, positionX, altura = 700){
    this.elemento = novoElemento('div','par-de-barreiras');


    this.superior = new Barreira(true);
    this.inferior = new Barreira(false);

    //Adicionando a barreira ao DOM
        //Note que ao inserir o this.superior temos que colcoar this.superior.elemento
        // Visto que o superior é uma barreira e no .elemento de uma barreira temos oq deve ser inserido no HTML o ('div','className')

    this.elemento.appendChild(this.superior.elemento);
    this.elemento.appendChild(this.inferior.elemento);

    this.gerarAberturarAleatoria = function(){
        // a altura superior é a altura do jogo menos a abertura e o Math.random() gera um float que varia de 0 a 1 fazendo com que esse espaço aumente ou diminua
        const alturaSuperior = Math.random() * (altura - abertura);

        // a altura inferior nada mais é que a altura total menos as duas outras alturas
        const alturaInferior = altura - (abertura + alturaSuperior);

        // Setando as alturasn e CRIANDO as barreiras

        this.superior.setAltura(alturaSuperior);
        this.inferior.setAltura(alturaInferior);
    
    };

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);
    
    // Oque acontece nessa função:
        // '100px'.split('px') = [100,''] = pos[0] = '100' => parseInt('100') = 100 retornando o valor em relação a x do bar de barreiras
        

    //Setando onde as barreiras irao estar posicionadas

    this.setX = positionX => this.elemento.style.left = `${positionX}px`;

    // Pegando a largura do par de barreiras

    this.getLargura = () => this.elemento.clientWidth;
    
    this.gerouPontos = () =>{
        
    }
    //Iniciando o Game

    
    this.gerarAberturarAleatoria();
    this.setX(positionX);
};




// Criando o contrutor das diversas barreiras

function Barreiras(altura, largura, abertura, espaçoEntre, notificarPonto){
    this.pares= [
        // Cada par de barreiras irá ficar posicionado fora do conteudo do jogo conforme a animação vem elas irão aparecer
        //Note que a posicao de cada uma é a largura do jogo mais n vezes o espaço entre eleas. Ex: a terceira barreira será criada 2 vezes o espaço em relação a primeira
        new ParBarreiras(abertura, largura),
        new ParBarreiras(abertura, largura + espaçoEntre),
        new ParBarreiras(abertura, largura + 2 * espaçoEntre),
        new ParBarreiras(abertura, largura + 3 * espaçoEntre)
    ]

    this.animar = () =>{
        this.pares.forEach(par =>{
            par.setX(par.getX() - deslocamento)

            //quando as barreiras sairem da tela, queremos que elas voltem para o inicio e invoque a sortearAbertura() de cada uma novamante
                // Se onde a bareira está é menor que o tamanho da tela
            
            // this.pares.length = 4, faz com que assim que a barreira ultrapasse a tela era vá para o final e fique um espaço de distancia da ultima barreira tudo isso se torna um loop
            if(par.getX()  < -par.getLargura()){
                par.setX(par.getX() + (espaçoEntre) * (this.pares.length))
                par.gerarAberturarAleatoria()
            }

            const meio = largura/2

            const cruzouMeio = (par.getX() + deslocamento >= meio) && (par.getX() < meio)
            console.log("Cruzou o meio: ", cruzouMeio);

            if(cruzouMeio){
                notificarPonto()
                console.log("Conseguiu um ponto");
            } 
        })
    }
}

// Criando o construtor passaro

function Passaro(alturaJogo){
    let voando = false;

    this.elemento = novoElemento('img','passaro')
    this.elemento.src = './imgs/passaro.png';

    // Mesma tecninca usada para pegar o x nas barreiras
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]);
    this.setY = y => this.elemento.style.bottom = `${y}px`

    //Criando a animação de voo atraves de um evento

    window.onkeydown = e => voando = true;
    window.onkeyup = e => voando = false;

    this.animar = () =>{
        // Faz com que o passaro suba 8px caso esteja pressionado e desça 5px caso nn
        const novoY = this.getY() + (voando ? 8:-5);

        // Faz com que o passaro so possa tocar o teto sem passar dele
        const alturaMaxima = alturaJogo - this.elemento.clientHeight;

        // Se o passaro tenta descer mais que o limite da div do jogo a sua altura é setada para o limite do jogo fazendo com que ele não caia pra fora do jogo, assim tambem para a borda superior do jogo
        if(novoY <= 0){
            this.setY(0)
        }else if(novoY >= alturaMaxima){
            this.setY(alturaMaxima)
        } else{
            this.setY(novoY)
        }
    }
    //Setando para o passaro começar no meio do jogo
    this.setY(alturaJogo/2)
}

function Progresso(){
    this.elemento = novoElemento('span','progresso')
    this.atualizarPonto = ponto => {
        this.elemento.innerHTML = ponto
    }
    this.atualizarPonto(0)
}



//Verificando as colisões do jogo
function colisao(passaro,barreiras){
    let colidiu = false;
    barreiras.pares.forEach(par => {
        if(!colidiu){
            //Pegando cada barreira tanto a superior quando a inferior 
            const superior = par.superior.elemento;
            const inferior = par.inferior.elemento

            colidiu = estaoSobrepostos(passaro.elemento,superior) || estaoSobrepostos(passaro.elemento,inferior)
        }
    })
    return colidiu
}

function estaoSobrepostos(elementoA, elementoB){
    // Trata-se da caixa (retangulo) relacionada ao elemento na DOM
    const a = elementoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    // Verificando sobreposição horizontal e vertical
        // a.left + a.width => exatamente o lado direito do elemento a que se for maior ou igual ao elemento b, eles estão sobrepostos
        // b.left + b.width, exatamente a msm coisa
    const ladoDireitoA = a.left + a.width;
    const ladoDireitoB = b.left + b.width;
    const ladoEsquerdoB = b.left;
    const ladoEsquerdoA = a.left;

    const baseA = a.top + a.height;
    const baseB = b.top + b.height;
    const topoA = a.top;
    const topoB = b.top;


    const horizontal = ( ladoDireitoA >= ladoEsquerdoB) &&(ladoDireitoB >= ladoEsquerdoA)
    const vertical = (baseA >= topoB) && (baseB >= topoA)

    return horizontal && vertical
}

//Inicializando o jogo
function FlappyBird(){
    let pontos = 0

    const areaJogo = document.querySelector('[wm-flappy]');
    const altura = areaJogo.clientHeight
    const largura = areaJogo.clientWidth

    const progresso = new Progresso();
    const barreiras = new Barreiras(altura,largura,280,400, () => progresso.atualizarPonto(++pontos));

    const passaro = new Passaro(altura)

    
    areaJogo.appendChild(progresso.elemento)
    areaJogo.appendChild(passaro.elemento)

    barreiras.pares.forEach(par => areaJogo.appendChild(par.elemento))

    this.start = () =>{
        const temporizador = setInterval(() =>{
            barreiras.animar()
            passaro.animar()
            if(colisao(passaro,barreiras)){
                clearInterval(temporizador)
                window.location.reload(true)
            }
        },20)
    }

    this.start();
}

    
const deslocamento = 3
const jogo = new FlappyBird()