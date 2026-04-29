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
 * sets initial positions, plays firing audio, and initiates the animation 
 * towards the screen's top edge. Upon animation completion, the projectiles
 * are returned to the pool for reuse.
 * @param {Object} options - Shooting configuration.
 * @returns {void} This function does not return a value.
 */

function launch_bazis_dual_lazer_shot( {bazis_rect, offset_x, offset_y, lazer_length}) {

    const { CLASS, DAMAGE, TYPE, SHOT_WIDTH, ANIMATION_DURATIONS, ANIMATION_TARGET_HEIGHT_OFFSET,
            ANIMATION_SECOND_STAGE_TOP_OFFSET, ANIMATION_SECOND_STAGE_HEIGHT_FACTOR, ANIMATION_EASING,
            BASE_STYLE, AUDIO_KEY , MOVING_SPAWN_MULTIPLIER} = BAZIS_SHOTS_CONFIG.DUAL_LAZER_SHOT;
                                                                               
    for (let position_x = -1; position_x <= 1; position_x += 2) {      

        const shot_data = get_from_pool(POOL_KEYS.BAZIS_SHOT);
        
        if (!shot_data) {           
            console.warn("Bazis shot pool empty !!");           
            continue;
        }

        const shot_element = shot_data.element;        
               
        shot_element.attr('class', '');
        shot_element.addClass(CLASS);
        shot_data.damage = DAMAGE;
        shot_data.type = TYPE;

        const shot_width = SHOT_WIDTH;         
        let initial_left = bazis_rect.left + (bazis_rect.width / 2) + (position_x * offset_x) - (shot_width / 2);
        initial_left += get_player_movement_offset() * MOVING_SPAWN_MULTIPLIER;

        shot_element.css({
            ...BASE_STYLE,
            "left": initial_left,
            "top": offset_y,
            "height" : 0
        }); 

        audio_play(AUDIO_KEY);
        shot_element.show();
        shot_element.animate(  
            {
            "height": lazer_length - ANIMATION_TARGET_HEIGHT_OFFSET,      
            "top": 0 
            }, ANIMATION_DURATIONS[0], ANIMATION_EASING,  
            )
            .animate(
            {
            "top" : -ANIMATION_SECOND_STAGE_TOP_OFFSET,
            "height" : lazer_length * ANIMATION_SECOND_STAGE_HEIGHT_FACTOR,
            }, ANIMATION_DURATIONS[1], ANIMATION_EASING,
            )
            .animate({
            "height":0,
            "top" : - ANIMATION_SECOND_STAGE_TOP_OFFSET 
            }, ANIMATION_DURATIONS[2], ANIMATION_EASING,
             function(){ return_bazis_shot_to_pool( shot_data ); });   
    }
}
