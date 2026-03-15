function main_title_track() {
    var track2 = $("#track2");
    if(game_data.game_states.traffic_flag){
    track2.loop = true;
    track2[0].play();
}
else { 
    track2[0].volume=0;
    boss_track();
}
}

function boss_track(){
    var boss_hang=$("#track1");
    boss_hang[0].play();
}

function robbanas_audio() {
    var idx = Math.round(Math.random() * 3) + 1;
    var hang = $("#robbanas" + idx);
    hang[0].play();
}

function impact_player(){
    var idx = Math.round(Math.random() * 3) + 1;
    var hang = $("#impact"+idx);        
    hang[0].play();
}

function lazer_audio() {
    var idx = Math.round(Math.random() * 9) + 1;
    var hang = $("#lazer" + idx);
    hang[0].play();
}

function audio_play(trek){
    var hang=$(trek);
    hang[0].play();
}

