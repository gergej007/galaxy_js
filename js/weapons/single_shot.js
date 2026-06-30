/**
 * Orchestrates the firing of a single bazis shot (standard shot mode).
 * It uses the common bazis shot orchestrator to handle looping,
 * calculates initial position of projectile, then calls `launch_bazis_single_shot`
 * for the actual projectile launch.
 *
 * @returns {Promise<void>} A promise that resolves when the burst of shots (defined by bazis_shot_repeat) has completed.
 */
async function single_fire_shooting() { 
    const { SHOT_WIDTH, INITIAL_TOP_OFFSET, SHOTS_PER_LAUNCH } = BAZIS_SHOTS_CONFIG.SINGLE_SHOT;

    await fire_bazis_shots_orchestrator(async (bazis_rect, _i) => { 
        const { top, left, width } = bazis_rect;
        const animation_speed = parseInt(current_level_config.bazis_shot_speed * top);
        const shot_width = SHOT_WIDTH;
        const initial_top = top - INITIAL_TOP_OFFSET; 
        let initial_left = left + (width / 2 - shot_width / 2);
        // Predictive Offset Compensation
        initial_left += get_player_movement_offset();
       
        launch_bazis_single_shot({initial_left, initial_top, animation_speed});  
}, SHOTS_PER_LAUNCH);
}

/**
 * Launches standard bazis single shot from bazis_shots_pool.
 * This helper function retrieves an inactive projectile from the pool,
 * configures its visual (CSS) and game-state (damage, type) properties,`
 * sets its initial position, plays firing audio, and triggers its animation. 
 * @param {Object} options - Shooting configuration.
 * @returns {void} This function does not return a value.
 */
function launch_bazis_single_shot( {initial_left, initial_top, animation_speed}) {
    const shot_data = get_from_pool(POOL_KEYS.BAZIS_SHOT);  

    if (!shot_data) {                  
        console.warn("Bazis shot pool empty !!.");
        return; 
    }
                      
    const shot_element = shot_data.element; 
    const { CLASS, DAMAGE, TYPE, BASE_STYLE, AUDIO_KEY } = BAZIS_SHOTS_CONFIG.SINGLE_SHOT;      
   
    shot_data.damage = DAMAGE;
    shot_data.type = TYPE;  
    shot_element.attr('class', '')
    .addClass(CLASS)
    .css({
        ...BASE_STYLE,
        "left": initial_left,
        "top": initial_top
    })
    .show();

    audio_play(AUDIO_KEY); 

    animate_standard_shot_upward(shot_data, animation_speed, BAZIS_SHOTS_CONFIG.ANIMATION_EASING);   
}

/**
 * Animates a projectile upward to the top of the screen.
 * Upon animation completion, the projectiles
 * are returned to the pool for reuse.
 * @param {Object} shot_data - Pooled entity data.
 * @param {number} speed - Animation duration.
 * @param {string} easing - Easing function name.
 */
function animate_standard_shot_upward(shot_data, speed, easing) {
    shot_data.element.animate({
        "top": 0
    }, speed, easing, function () {            
        return_bazis_shot_to_pool(shot_data);
    });
}
