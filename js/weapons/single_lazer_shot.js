/**
 * Orchestrates the firing of a single lazer shot (lazer shot mode).
 * It uses the common bazis shot orchestrator to handle looping,
 * calculates initial position of laser beam, then calls `launch_bazis_single_lazer_shot`
 * for the actual projectile launch.
 *
 * @returns {Promise<void>} A promise that resolves when the burst of shots (defined by bazis_shot_repeat) has completed.
 */

async function single_lazer_shooting(){ 
    const { SHOT_WIDTH, INITIAL_TOP_OFFSET, SHOTS_PER_LAUNCH, MOVING_SPAWN_MULTIPLIER } = BAZIS_SHOTS_CONFIG.SINGLE_LAZER_SHOT;
    await fire_bazis_shots_orchestrator(async (bazis_rect, _i) => {                    
    const { left, top, width} = bazis_rect; 

    const single_shot_width = SHOT_WIDTH; 
    const lazer_length = top;

    const initial_top = top - INITIAL_TOP_OFFSET;
    let initial_left = left + (width / 2 - single_shot_width / 2);
    initial_left += get_player_movement_offset() * MOVING_SPAWN_MULTIPLIER;
        
    launch_bazis_single_lazer_shot( {initial_left, initial_top, lazer_length});                
    }, SHOTS_PER_LAUNCH);         
}

/**
 * Launches bazis single lazer shot from bazis_shots_pool.
 * This helper function retrieves an inactive projectile from the pool,
 * configures its visual (CSS) and game-state (damage, type) properties,`
 * sets its initial position, plays firing audio, and initiates its animation * 
 * towards the screen's top edge. Upon animation completion, the projectile
 * is returned to the pool for reuse.
 * @param {Object} options - Shooting configuration.
 * @returns {void} This function does not return a value.
 */
function launch_bazis_single_lazer_shot( {initial_left, initial_top, lazer_length} ) {
    const shot_data = get_from_pool(POOL_KEYS.BAZIS_SHOT);        

    if (!shot_data) {
        console.warn("Bazis shot pool empty !!.");
        return; 
    }     

    const shot_element = shot_data.element;
    const { CLASS, DAMAGE, TYPE, BASE_STYLE, AUDIO_KEY,
            ANIMATION_TARGET_HEIGHT_OFFSET, ANIMATION_SECOND_STAGE_TOP_OFFSET,
            ANIMATION_DURATIONS, ANIMATION_EASING,
            ANIMATION_SECOND_STAGE_HEIGHT_FACTOR } = BAZIS_SHOTS_CONFIG.SINGLE_LAZER_SHOT;      

    shot_element.attr('class','');
    shot_element.addClass(CLASS);
    shot_data.damage = DAMAGE;
    shot_data.type = TYPE;
    shot_data.enemies_hit_ids = new Set();
    
    shot_element.css({
        ...BASE_STYLE,
        "left": initial_left,
        "top": initial_top,
        "height" : 0
    });
   
    shot_element.show(); 
    audio_play(AUDIO_KEY);  

    shot_element.animate({        
        "height": lazer_length - ANIMATION_TARGET_HEIGHT_OFFSET,      
        "top": 0        
    },ANIMATION_DURATIONS[0], ANIMATION_EASING)
    .animate({
        "top" : - ANIMATION_SECOND_STAGE_TOP_OFFSET,
        "height" : lazer_length * ANIMATION_SECOND_STAGE_HEIGHT_FACTOR,        
    },ANIMATION_DURATIONS[1], ANIMATION_EASING)
   .animate({       
        "height":0,
        "top" : -ANIMATION_SECOND_STAGE_TOP_OFFSET       
    }, ANIMATION_DURATIONS[2], ANIMATION_EASING,
        function(){
            return_bazis_shot_to_pool( shot_data );        
        }); 
}
