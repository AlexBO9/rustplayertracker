const dgram = require('dgram');
const {StringDecoder} = require('string_decoder');
const decoder = new StringDecoder('utf8');
const Player = require('./player.js');
const bot = require('./bot.js');
const PACKET_HEADER_NOSPLIT = -1;
const PAYLOAD_REQUEST_CHALLENGE = -1;
const HEADER_PLAYERS = 0x55;
const HEADER_PLAYERS_CHALLENGE_RESPONSE = 0x41;
const HEADER_PLAYERS_RESPONSE = 0x44;

class Query {
    constructor(_persPlayers, _ip, _port) {
        if (_persPlayers === null) {
            this.conn = dgram.createSocket('udp4');
            this.port = _port;
            this.ip = _ip;
            this.challengeNum = PAYLOAD_REQUEST_CHALLENGE;

            this.persPlayers = [];
        } else {
            this.conn = dgram.createSocket('udp4');
            this.port = _port;
            this.ip = _ip;
            this.challengeNum = PAYLOAD_REQUEST_CHALLENGE;

            this.persPlayers = [];
            for (let player of _persPlayers){
                this.persPlayers.push(new Player(player.name,0,player.totalDuration));
            }
        }

        this.lastMsg = "";
        this.lastPlayers = [];

        this.queryPlayers();

        this.interval = setInterval(() => this.refreshPlayers(), 300000);

        this.queryFromCommand = true;


        this.conn.on('listening', () => {

        });

        this.conn.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
            this.conn.close();
        });

        this.conn.on('message', (msg, rinfo) => {
            this.lastMsg = msg;
            if (msg.length === 9 && Buffer.isBuffer(msg)) {
                console.log(`Recibido: ${this.toHexString(msg)} from ${rinfo.address}:${rinfo.port}`);
            } else {
                console.log(`Recibido: ${msg.length} from ${rinfo.address}:${rinfo.port}`);
            }
            if (Buffer.isBuffer(this.lastMsg) && this.lastMsg.readUInt8(4) === HEADER_PLAYERS_CHALLENGE_RESPONSE) {
                this.challengeNum = this.lastMsg.readInt32LE(5);
                console.log(`Servidor conectat correctament`);
                bot.sendMsg('Info Conexion', 0x00FF00, "Conectado correctamente/ Clave:"+this.challengeNum, null);
            } else if (Buffer.isBuffer(this.lastMsg) && this.lastMsg.readUInt8(4) === HEADER_PLAYERS_RESPONSE) {
                let players = [];
                let pointerPos = 5;
                let playerNum = msg.readUInt8(pointerPos);
                console.log("Player number:" + playerNum);
                pointerPos++;

                //Query players and parse info into objects
                if (playerNum > 0) {
                    while (pointerPos < msg.length) {
                        let utf8bytes = [];
                        //Index del jugador no soportat per tant ens passem un byte
                        pointerPos++;
                        while (true) {
                            let char = msg.readUInt8(pointerPos);
                            pointerPos++;
                            if (char === 0x00) {
                                break;
                            } else {
                                utf8bytes.push(char);
                            }
                        }
                        let playerName = decoder.write(Buffer.from(utf8bytes));
                        let score = msg.readInt32LE(pointerPos);
                        pointerPos += 4;
                        let duration = msg.readFloatLE(pointerPos);
                        pointerPos += 4;
                        players.push(new Player(playerName, duration, 0));
                    }

                    //Refresh player persistency
                    if (this.persPlayers.length === 0) {
                        for (let player of players) {
                            this.persPlayers.push(Object.create(player));
                            player.totalDuration = player.duration;
                        }
                    } else {
                        for (let player of players) {
                            let found = false;
                            for (let persPlayer of this.persPlayers) {
                                if (persPlayer.name === player.name) {
                                    found = true;
                                    if (persPlayer.totalDuration === 0 || persPlayer.totalDuration < player.duration) {
                                        persPlayer.totalDuration = player.duration;
                                        player.totalDuration = persPlayer.totalDuration;
                                    } else {
                                        for (let lastPlayer of this.lastPlayers) {
                                            if (lastPlayer.name === player.name) {
                                                persPlayer.totalDuration += player.duration - lastPlayer.duration;
                                                player.totalDuration = persPlayer.totalDuration;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if (found === false) {
                                player.totalDuration = player.duration;
                                this.persPlayers.push(player);
                            }
                        }
                    }

                    //Save info about last queried players
                    this.lastPlayers = players;

                    if (this.queryFromCommand) {
                        //Print info on discord about players
                        let playersInfo = "```json\n";
                        let playersJoining = Math.abs(playerNum - players.length);
                        //+playerNum-players.length+")"
                        bot.sendMsg('Info Numero Jugadores', 0xFF00FF, players.length + "(Entrando: " + playersJoining + ")", null);
                        let maxNameLenght = 0;
                        for (let player of players) {
                            if (maxNameLenght < player.name.length) {
                                maxNameLenght = player.name.length;
                            }
                        }
                        for (let player of players) {
                            if (playersInfo.length + player.toString(maxNameLenght, true).length >= 1424) {
                                playersInfo += '\n```';
                                bot.sendMsg('Info Jugadores', 0xFF4444, playersInfo, null);
                                playersInfo = "```json\n";
                            } else {
                                playersInfo += `${player.toString(maxNameLenght, true)}\n`;
                            }
                        }
                        playersInfo += '\n```';
                        bot.sendMsg('Info Jugadores', 0xFF4444, playersInfo, null);
                    }
                } else {
                    if (this.queryFromCommand)
                        bot.sendMsg('Info Numero Jugadores', 0xFF4444, 0, null);
                }
                this.queryFromCommand = true;
            }
        });
    }

    queryPlayers() {
        const self = this;
        let bufferS = Buffer.alloc(4 * 2 + 1);
        bufferS.writeInt32LE(PACKET_HEADER_NOSPLIT, 0);
        bufferS.writeUInt8(HEADER_PLAYERS, 4);
        bufferS.writeInt32LE(self.challengeNum, 5);
        self.conn.send(bufferS, 0, bufferS.length, self.port, self.ip, (err) => {
            if (err) {
                console.log(err.stack);
            } else {
                console.log("Enviado: " + self.toHexString(bufferS));
            }
        });
    }

    refreshPlayers() {
        console.log("Refrescando informacion de jugadores persistentes:");
        this.queryFromCommand = false;
        this.queryPlayers();
    }

    toHexString(bytes) {
        return bytes.map(function (byte) {
            return (byte & 0xFF).toString(16);
        }).join('')
    }
}

module.exports = Query;