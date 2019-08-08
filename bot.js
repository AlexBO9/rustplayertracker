const auth = require('./auth.json');
const help = require('./help.json');
const Discord = require('discord.js');
const Query = require('./query.js');
const client = new Discord.Client();
const fs = require('fs');
const botActivities = ['Raideando bases de madera', 'Buscando minihelicopteros', 'Perdiendo equipo'];
const DEFAULT_PORT = '28015';
let query = null;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    let rand = Math.round(Math.random() * (botActivities.length - 1));
    client.user.setActivity(botActivities[rand]);
});

client.on('message', msg => {
    if (msg.content.substr(0, 1) === '!') {
        let command = msg.content.substr(1).split(" ")[0];
        let args = msg.content.trim().replace(/\s+/g, ' ').split(" ");
        console.log(msg.member.user.tag + ": " + args.toString());
        switch (command) {
            case 'servidor':
                if (args.length > 1) {
                    if (query != null){
                        saveQueryIntoJson(query);
                    }
                    if (args.length > 2) {
                        let serverJson;
                        try {
                            serverJson = require('./servers/'+args[1]+'_'+args[2]+'.json');
                            console.log('Archivos del servidor encontrados, copiando base de datos...')
                            sendMessage('Ayuda', 0x0000FF, "Archivos del servidor encontrados, copiando base de datos...", msg.channel);
                        }
                        catch (e) {
                            serverJson = null;
                            console.log('Archivos del servidor no encontrados, creando nuevos...')
                            sendMessage('Ayuda', 0xFF4444, "Archivos del servidor no encontrados, creando nuevos...", msg.channel);
                        }
                        query = new Query(serverJson,args[1], args[2]);
                    } else {
                        let serverJson;
                        try {
                            serverJson = require('./servers/'+args[1]+'_'+DEFAULT_PORT+'.json');
                            console.log('Archivos del servidor encontrados, copiando base de datos...')
                            sendMessage('Ayuda', 0x0000FF, "Archivos del servidor encontrados, copiando base de datos...", msg.channel);
                        }
                        catch (e) {
                            serverJson = null;
                            console.log('Archivos del servidor no encontrados, creando nuevos...')
                            sendMessage('Ayuda', 0xFF4444, "Archivos del servidor no encontrados, creando nuevos...", msg.channel);
                        }
                        query = new Query(serverJson,args[1], DEFAULT_PORT);
                    }
                } else {
                    sendMessage('Ayuda', 0xFF4444, "La sintaxis del comando es: ```diff\n- !servidor ip [puerto]\n```", msg.channel);
                }
                break;
            case 'list':
                if (query != null) {
                    query.queryPlayers();
                } else {
                    sendMessage('Ayuda', 0xFF4444, "Se debe establecer primero el servidor con: ```diff\n- !servidor ip [puerto]\n```", msg.channel);
                }
                break;
            case 'listP':
                if (query != null) {
                    let maxNameLenght = 0;
                    for (let player of query.persPlayers) {
                        if (maxNameLenght < player.name.length) {
                            maxNameLenght = player.name.length;
                        }
                    }
                    let playersInfo = "```json\n";
                    for (let player of query.persPlayers) {
                        if (playersInfo.length + player.toString(maxNameLenght).length >= 1424) {
                            playersInfo += '\n```';
                            sendMessage('Info Jugadores', 0xFF4444, playersInfo, null);
                            playersInfo = "```json\n";
                        } else {
                            playersInfo += `${player.toString(maxNameLenght)}\n`;
                        }
                    }
                    playersInfo += '\n```';
                    sendMessage('Info Jugadores', 0xFF4444, playersInfo, null);
                } else {
                    sendMessage('Ayuda', 0xFF4444, "Se debe establecer primero el servidor con: ```diff\n- !servidor ip [puerto]\n```", msg.channel);
                }
                break;
            case 'save':
                if (query != null) {
                    saveQueryIntoJson(query);
                } else {
                    sendMessage('Ayuda', 0xFF4444, "Se debe establecer primero el servidor con: ```diff\n- !servidor ip [puerto]\n```", msg.channel);
                }
                break;
            case 'help':
                var desc = '';
                for (i in help) {
                    desc += '**' + i + '**: ' + help[i] + "\n";
                }
                sendMessage('Ayuda', 0xFF4444, desc, msg.channel);
                break;
            default:
                sendMessage('Ayuda', 0xFF4444, 'Comando no reconocido, usa el comando ```diff\n- !help\n```', msg.channel);
                break;
        }
    }
});

function sendMessage(_title, _color, _desc, _channel) {
    var embed = new Discord.RichEmbed()
    // Set the title of the field
        .setTitle(_title)
        // Set the color of the embed
        .setColor(_color)
        // Set the main content of the embed
        .setDescription(_desc);
    // Send the embed to the same channel as the message
    if (_channel == null) {
        _channel = client.channels.find(channel => channel.name === 'bot');
        if (_channel == null) {
            _channel = client.channels.find(channel => channel.name === 'general');
        }
    }
    _channel.send(embed);
}

function saveQueryIntoJson(_query) {
    fs.writeFileSync("./servers/" + _query.ip + "_" + _query.port + ".json", JSON.stringify(_query.persPlayers), 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("JSON file has been saved.");
    });
}


process.stdin.resume();//so the program will not close instantly

function exitHandler() {
    if (query != null){
        saveQueryIntoJson(query);
    }
    process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind());

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind());

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind());
process.on('SIGUSR2', exitHandler.bind());

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind());



module.exports.sendMsg = function (_title, _color, _desc, _channel) {
    sendMessage(_title, _color, _desc, _channel);
};

client.login(auth.token);