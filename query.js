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
    constructor(_ip, _port) {
        this.conn = dgram.createSocket('udp4');
        this.port = _port;
        this.ip = _ip;
        this.challengeNum = PAYLOAD_REQUEST_CHALLENGE;
        this.lastMsg = "";

        this.queryPlayers()

        this.lastUpdPlayers = [];

        this.conn.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
            this.conn.close();
        });

        this.conn.on('message', (msg, rinfo) => {
            console.log(`Recibido: ${msg.length} from ${rinfo.address}:${rinfo.port}`);
            this.lastMsg = msg;
            if (Buffer.isBuffer(this.lastMsg) && this.lastMsg.readUInt8(4) === HEADER_PLAYERS_CHALLENGE_RESPONSE) {
                this.challengeNum = this.lastMsg.readInt32LE(5);
            } else if (Buffer.isBuffer(this.lastMsg) && this.lastMsg.readUInt8(4) === HEADER_PLAYERS_RESPONSE) {
                let players = [];
                let pointerPos = 5;
                let playerNum = msg.readUInt8(pointerPos);
                console.log("Player number:" + playerNum);
                pointerPos++;
                while (pointerPos < msg.length) {
                    let utf8bytes = [];
                    //Index del jugador no soportat
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
                    players.push(new Player(playerName, duration, score));
                }
                this.lastUpdPlayers = players;
                let playersInfo = "";
                let playersJoining = playerNum-players.length;
                //+playerNum-players.length+")"
                bot.sendMsg('Info Numero Jugadores',0xFF00FF,players.length+"(Entrando: "+playersJoining+")",null);
                for (let player of players) {
                    if (playersInfo.length+player.toString().length >= 2048){
                        bot.sendMsg('Info Jugadores',0xFF4444,playersInfo,null);
                        playersInfo="";
                    }else {
                        playersInfo += `${player.toString()}\n`;
                    }
                }
                bot.sendMsg('Info Jugadores',0xFF4444,playersInfo,null);
            }
        });
    }

    queryPlayers() {
        let bufferS = Buffer.alloc(4 * 2 + 1);
        bufferS.writeInt32LE(PACKET_HEADER_NOSPLIT, 0);
        bufferS.writeUInt8(HEADER_PLAYERS, 4);
        bufferS.writeInt32LE(this.challengeNum, 5);
        this.conn.send(bufferS, 0, bufferS.length, this.port, this.ip, (err) => {
            if (err) {
                console.log(err.stack);
            } else {
                console.log("Enviado: " + toHexString(bufferS));
            }
        });
    }
}

function toHexString(bytes) {
    return bytes.map(function (byte) {
        return (byte & 0xFF).toString(16)
    }).join('')
}

module.exports = Query;