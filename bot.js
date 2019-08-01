const auth = require('./auth.json');
const help = require('./help.json');
const Discord = require('discord.js');
const client = new Discord.Client();
const botActivities = ['Raideando bases de madera', 'Buscando minihelicopteros', 'Perdiendo equipo'];
const DEFAULT_PORT = 28015;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    var rand = Math.round(Math.random() * (botActivities.length-1));
    console.log(rand);
    client.user.setActivity(botActivities[rand]);
});

client.on('message', msg => {
    if (msg.content.substr(0, 1) === '!') {
        var command = msg.content.substr(1).split(" ")[0];
        var args = msg.content.substr(1+command.length).trim().split(" ");
        switch (command) {
            case 'servidor':
                if (args.length > 0){
                    if (args.length > 1){

                    }else{

                    }
                }else{
                    sendMessage('Ayuda', 0xFF4444, "La sintaxis del comando es \"!servidor ip [puerto]\"", msg.channel)
                }
                break;
            case 'help':
                var desc = '';
                for (i in help) {
                    desc += '**' + i + '**: ' + help[i] + "\n";
                }
                sendMessage('Ayuda', 0xFF4444, desc, msg.channel)
                break;
            default:
                sendMessage('Ayuda', 0xFF4444, 'Comando no reconocido, usa el comando !help', msg.channel)
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
    _channel.send(embed);
}

client.login(auth.token);