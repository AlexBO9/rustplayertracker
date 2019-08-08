const auth = require('./auth.json');
const help = require('./help.json');
const Discord = require('discord.js');
const Query = require('./query.js');
const client = new Discord.Client();
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
        console.log(msg.client.user.username+":"+args);
        switch (command) {
            case 'servidor':
                if (args.length > 1) {
                    if (args.length > 2) {
                        query = new Query(args[1], args[2]);
                    } else {
                        query = new Query(args[1], DEFAULT_PORT);
                    }
                } else {
                    sendMessage('Ayuda', 0xFF4444, "La sintaxis del comando es: ```diff\n- !servidor ip [puerto]\n```", msg.channel);
                }
                break;
            case 'list':
                if (query != null){
                    query.queryPlayers();
                }else{
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
    if (_channel == null){
        _channel = client.channels.find('name','bot');
        if (_channel == null){
            _channel = client.channels.find('name','general');
        }
    }
    _channel.send(embed);
}


module.exports.sendMsg = function(_title, _color, _desc, _channel){
    sendMessage(_title, _color, _desc, _channel);
};

client.login(auth.token);