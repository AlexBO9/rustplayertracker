class Player {
    constructor(_name, _duration, _score) {
        this.name = _name;
        this.duration = _duration;
        this.score = _score;
    }

    toString(_namepadding) {
        let resultS = "Nombre: ";
        _namepadding = _namepadding - this.name.length;
        resultS += `"${this.name}"`;
        for (let i = 0; i < _namepadding; i++) {
            resultS += " ";
        }
        return resultS + `| t: "${this.segToHms(this.duration)}"`;
    }

    segToHms(segs) {
        var minutes = 0;
        var hours = 0;
        if (segs >= 60) {
            minutes = Math.floor(segs / 60);
            segs %= 60;
        }
        if (minutes >= 60) {
            hours = Math.floor(minutes / 60);
            minutes %= 60;
        }
        return hours + "h " + minutes + "m " + Math.round(segs) + "s";
    }
}

module.exports = Player;