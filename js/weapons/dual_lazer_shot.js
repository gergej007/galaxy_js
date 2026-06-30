/**
 * Orchestrates the firing of a dual laser shot (laser shot mode).
 * It uses the common bazis shot orchestrator to handle looping,
 * calculates initial position of laser beam, then calls `launch_bazis_dual_shot`
 * for the actual projectile launch.
 *
 * @returns {Promise<void>} A promise that resolves when the burst of shots (defined by bazis_shot_repeat) has completed.
 */

async function dual_lazer_shooting() {  
    const{ OFFSET_X_FACTOR, INITIAL_TOP_OFFSET, SHOTS_PER_LAUNCH } = BAZIS_SHOTS_CONFIG.DUAL_LAZER_SHOT;
    await fire_bazis_shots_orchestrator(async (bazis_rect, _i) => { 
       
        const { top, width} = bazis_rect;
        const offset_x = width * OFFSET_X_FACTOR;             
        const offset_y = top - INITIAL_TOP_OFFSET;     
        const lazer_length = top; 
               
        launch_bazis_dual_lazer_shot({bazis_rect, offset_x, offset_y, lazer_length});   
    }, SHOTS_PER_LAUNCH);
}

/**
 * Launches bazis dual lazer shot from bazis_shots_pool.
 * This helper function retrieves two inactive projectiles from the pool,
 * configures their visual (CSS) and game-state (damage, type) properties,`
 * sets initial positions, plays firing audio, and triggers the animation  
 * @param {Object} options - Shooting configuration.
 * @returns {void} This function does not return a value.
 */

function launch_bazis_dual_lazer_shot( {bazis_rect, offset_x, offset_y, lazer_length}) {

    const { CLASS, DAMAGE, TYPE, SHOT_WIDTH, 
            BASE_STYLE, AUDIO_KEY , MOVING_SPAWN_MULTIPLIER} = BAZIS_SHOTS_CONFIG.DUAL_LAZER_SHOT;
                                                                               
    for (let position_x = -1; position_x <= 1; position_x += 2) {      

        const shot_data = get_from_pool(POOL_KEYS.BAZIS_SHOT);
        
        if (!shot_data) {           
            console.warn("Bazis shot pool empty !!");           
            continue;
        }

        const shot_element = shot_data.element;    
        let initial_left = bazis_rect.left + (bazis_rect.width / 2) + (position_x * offset_x) - (SHOT_WIDTH / 2);
        initial_left += get_player_movement_offset() * MOVING_SPAWN_MULTIPLIER;   
               
        shot_data.damage = DAMAGE;
        shot_data.type = TYPE;
        shot_element.attr('class', '')
        .addClass(CLASS)
        .css({
            ...BASE_STYLE,
            "left": initial_left,
            "top": offset_y,
            "height" : 0
        })
        .show();        

        audio_play(AUDIO_KEY);
        animate_lazer_sequence(shot_data, lazer_length, BAZIS_SHOTS_CONFIG.DUAL_LAZER_SHOT);       
    }
}

