const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/', (req, res) => {
	res.render('index.html');
});

/*
let objGameCoup = {
	arrSalas: [
		{
			idSalaHash: 1, // Gerar uma codigo da sala CODIGO UNICO
			isSalaIniciada: true,
			idJogadorVez: 131321, // Pode ser o códido o socket do jogador quando ele conectou
			arrJogadores: [
				{ username: "Player 1", isAdmin: false, qtdMoedas: 2, isAtivo: true,
					arrCartas: [
						{carta: 1, isCartaAtiva: true },
						{carta: 2, isCartaAtiva: true }
					]
			   }
			]
		}
	]
}*/

// Lista que armazena
let objGameCoup = {
	arrSalas: []
};

let idJogador = null;

io.on('connection', socket => {
	console.log(`[Coup State Backend] Socket conectado: ${socket.id}`);
	idJogador = socket.id;
	socket.emit('idJogador', { idJogador });


	// Criar uma nova sala
	socket.on('criarSala', data => {
		let { arrSalas } = objGameCoup;
		const novaSala = {
			idSalaHash: socket.id,
			isSalaIniciada: false,
			idJogadorVez: null,
			arrJogadores: [
				{ id: idJogador, username: data.username, isAdmin: true, qtdMoedas: 2, isAtivo: true, arrCartas: [] }
			]
		};
		arrSalas.push(novaSala);
		console.log('Adicionando a sala:', arrSalas);
		socket.emit('salaCriada', novaSala);
	});

	// Adicionar novos jogadores
	socket.on('adicionarJogador', data => {
		let { arrSalas } = objGameCoup;

		let sala = arrSalas.find(item => item.idSalaHash == data.idSalaHash);
		const objJogadorPadrao = { id: idJogador, username: data.username, isAdmin: false, qtdMoedas: 2, isAtivo: true, arrCartas: [] };

		sala.arrJogadores.push(objJogadorPadrao);

		console.log('Sala encontrada ===>', sala);
		socket.broadcast.emit('jogadorAdicionado', sala);

	});

	// INICiAR JOGO
	socket.on('comecarJogo', data => {
		let { arrSalas } = objGameCoup;

		let sala = arrSalas.find(item => item.idSalaHash == data.idJogadorLogado);
		sala.isSalaIniciada = true;

		socket.broadcast.emit('jogoComecou', sala);

	});


});


server.listen(3000);