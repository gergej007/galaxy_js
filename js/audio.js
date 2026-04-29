const MUSIC_CONFIG = {
    TRACKS: {
        MAIN: "#track2",
        BOSS: "#track1" 
    },
    VOLUME: {
        NORMAL: 1,
        MUTE: 0
    }
};

let current_track = null;

function play_bg_music(track_id) {
    // 1. If this track is already the current one, don't do anything
    if (current_track === track_id) return;

    // 2. Stop the previous track if it exists
    if (current_track) {
        $(current_track)[0].pause();
        $(current_track)[0].currentTime = 0;
    }

    // 3. Start the new track
    const track = $(track_id)[0];
    track.loop = true;
    track.volume = MUSIC_CONFIG.VOLUME.NORMAL;
    track.play();

    // 4. Update the state
    current_track = track_id;
}

// function main_title_track() {
//     var track2 = $("#track2");
//     if(game_data.game_states.traffic_flag){
//     track2.loop = true;
//     track2[0].play();
// }
// else { 
//     track2[0].volume=0;
//     boss_track();
// }
// }

// function boss_track(){
//     var boss_hang=$("#track1");
//     boss_hang[0].play();
// }

function robbanas_audio() {
    const idx = Math.round(Math.random() * 3) + 1;
    const sound = $("#robbanas" + idx);
    sound[0].play();
}

function impact_player(){
    const idx = Math.round(Math.random() * 3) + 1;
    const sound = $("#impact"+idx);        
    sound[0].play();
}

function lazer_audio() {
    const idx = Math.round(Math.random() * 9) + 1;
    const sound = $("#lazer" + idx);
    sound[0].play();
}

function audio_play(track_id){
    const sound = $(track_id);
    sound[0].play();
}

/**
 * Stops an audio track and resets its playback position.
 * @param {string} track_id - The jQuery selector for the audio element (e.g., "#boss_hang1").
 */
function audio_stop(track_id) {
    const sound = $(track_id);
    if (sound.length > 0 && sound[0].pause) {
        sound[0].pause();
        sound[0].currentTime = 0; // Reset to the beginning
    }
}

