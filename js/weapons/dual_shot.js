/**
 * Orchestrates the firing of a dual bazis shot (standard shot mode).
 * It uses the common bazis shot orchestrator to handle looping,
 * calculates initial position of projectile, then calls `launch_bazis_dual_shot`
 * for the actual projectile launch.
 *
 * @returns {Promise<void>} A promise that resolves when the burst of shots (defined by bazis_shot_repeat) has completed.
 */
async function dual_fire_shooting() {     
    const { OFFSET_X_FACTOR, INITIAL_TOP_OFFSET, SHOTS_PER_LAUNCH } = BAZIS_SHOTS_CONFIG.DUAL_FIRE_SHOT;
    
    await fire_bazis_shots_orchestrator(async (bazis_rect, _i) => { 
        const { top, width } = bazis_rect;
        const animation_speed = parseInt(current_level_config.bazis_shot_speed * top);
        const offset_x = width *  OFFSET_X_FACTOR; 
        const offset_y = top - INITIAL_TOP_OFFSET;       
       
        launch_bazis_dual_shot({offset_x, offset_y, animation_speed, bazis_rect});  
}, SHOTS_PER_LAUNCH);
}

/**
 * Launches standard bazis dual shot from bazis_shots_pool.
 * This helper function retrieves two inactive projectiles from the pool,
 * configures their visual (CSS) and game-state (damage, type) properties,`
 * sets initial positions, plays firing audio, and triggers the animation
 * sets class hyper_lovedek on projectile if Boss enemy comes in. 
 * @param {Object} options - Shooting configuration.
 * @returns {void} This function does not return a value.
 */
function launch_bazis_dual_shot( {offset_x, offset_y, animation_speed, bazis_rect}) {
    
    for (let position_x = -1; position_x <= 1; position_x += 2) { 
        
        const dual_shot_data = get_from_pool(POOL_KEYS.BAZIS_SHOT);
        
        if (!dual_shot_data) {           
            console.warn("Bazis shot pool empty !");           
            continue;
        }
        const dual_shot_element = dual_shot_data.element;

        let shot_config;
        if (game_data.game_states.boss_flag) {
            shot_config = BAZIS_SHOTS_CONFIG.HYPER_SHOT;
        } else {
            shot_config = BAZIS_SHOTS_CONFIG.DUAL_FIRE_SHOT;
        }    
        
        let initial_left = bazis_rect.left + (bazis_rect.width / 2) + (position_x * offset_x) - (shot_config.SHOT_WIDTH / 2);
        initial_left += get_player_movement_offset(); 

        dual_shot_data.damage = shot_config.DAMAGE;
        dual_shot_data.type = shot_config.TYPE;

        dual_shot_element.attr('class','')
        .addClass(shot_config.CLASS)                
        .css({
            ...shot_config.BASE_STYLE,
            "left": initial_left,
            "top": offset_y
        }) 
        .show();                   

        audio_play(shot_config.AUDIO_KEY);
        animate_standard_shot_upward(dual_shot_data, animation_speed, shot_config.ANIMATION_EASING);      
    }
}

