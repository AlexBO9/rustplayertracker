class Player{
    constructor(_name,_duration,_score){
        this.name = _name;
        this.duration = _duration;
        this.score = _score;
    }

    toString(){
        return `Nombre: ${this.name} | TiempoEnServidor: ${this.duration}`;
    }
}
module.exports = Player;