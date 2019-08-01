const dgram = require('dgram');
const conn = dgram.createSocket('udp4');

function Query(_ip,_port){
    conn.connect(_port,_ip);
}

function listPlayers(){

}