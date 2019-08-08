class Player {
    constructor(_name, _duration, _totalDuration) {
        this.name = _name;
        this.duration = _duration;
        this.totalDuration = _totalDuration;
    }

    toJSON(){
        return {
            'name': this.name,
            'totalDuration': this.totalDuration
            };
    }

    toString(_namepadding, _showDuration) {
        let resultS = "Nombre: ";
        _namepadding = _namepadding - this.name.length;
        resultS += `"${this.name}"`;
        for (let i = 0; i < _namepadding; i++) {
            resultS += " ";
        }
        if (_showDuration){
            return resultS + `| t: "${this.segToHms(this.duration)}" | T: "${this.segToHms(this.totalDuration)}"`;
        }else{
            return resultS + `| T: "${this.segToHms(this.totalDuration)}"`;
        }
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