const AUDIO_CONFIG = {
    EXPLOSIONS: {
        PREFIX: "#robbanas",
        EXPLOSION_COUNT: 4  
    },
    IMPACTS: {
        PREFIX: "#impact",
        IMPACT_COUNT: 4
    },
    LAZERS: {
      PREFIX: "#lazer",
      LAZER_COUNT: 9  
    },
    TRACKS: {
        MAIN: "#track2",
        BOSS: "#track1",
        DEATH: "#death" 
    },
    VOLUME: {
        NORMAL: 1,
        MUTE: 0
    }
};

let current_track = null;

function play_bg_music(track_id) {
    //  If this track is already the current one, don't do anything
    if (current_track === track_id) return;

    //  Stop the previous track if it exists
    if (current_track) {
        $(current_track)[0].pause();
        $(current_track)[0].currentTime = 0;
    }

    //  Start the new track
    const track = $(track_id)[0];
    track.loop = true;
    track.volume = AUDIO_CONFIG.VOLUME.NORMAL;
    track.play();

    //  Update the state
    current_track = track_id;
}

/**
 * Plays a random explosion sound effect from the pre-configured pool.
 */
function robbanas_audio() {
    const { PREFIX, EXPLOSION_COUNT } = AUDIO_CONFIG.EXPLOSIONS;

    play_random_from_pool(PREFIX, EXPLOSION_COUNT);
}

/**
 * Plays a random impact sound effect when the player takes damage.
 */
function impact_player(){
    const { PREFIX, IMPACT_COUNT } = AUDIO_CONFIG.IMPACTS;
    
    play_random_from_pool(PREFIX, IMPACT_COUNT);
}

/**
 * Plays a random lazer beam sound effect for enemy shooting.
 */
function lazer_audio() {
    const { PREFIX, LAZER_COUNT } = AUDIO_CONFIG.LAZERS;
   
    play_random_from_pool(PREFIX, LAZER_COUNT);
}

/**
 * Triggers playback of a specific audio element.
 * @param {string} track_id - The jQuery selector (e.g., "#track2").
 */
function audio_play(track_id) {
   
    _execute_playback(track_id);
}

/**
 * Plays a random sound from a configured pool.
 * @param {string} prefix - The ID prefix (e.g., "#robbanas").
 * @param {number} count - Total number of variations in the pool.
 */
function play_random_from_pool(prefix, count) {
    const idx = Math.floor(Math.random() * count) + 1;
    _execute_playback(`${prefix}${idx}`);
}

/**
 * Internal helper to execute audio playback with safety guards.
 * @param {string} selector - jQuery selector for the audio element.
 */
function _execute_playback(selector) {
    const $sound = $(selector);
    if ($sound.length > 0 && typeof $sound[0].play === 'function') {
        // $sound[0].currentTime = 0;
        $sound[0].play().catch(e => console.warn(`Audio blocked: ${selector}`));
    } else {
        console.error(`Audio element not found: ${selector}`);
    }
}

/**
 * Stops an audio track and resets its playback position.
 * @param {string} track_id - The jQuery selector for the audio element.
 */
function audio_stop(track_id) {
    const sound = $(track_id);
    if (sound.length > 0 && sound[0].pause) {
        sound[0].pause();
        sound[0].currentTime = 0; // Reset to the beginning
    }
}

