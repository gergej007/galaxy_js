/**
 * Orchestrates the firing of a dual laser shot (laser shot mode).
 * It uses the common bazis shot orchestrator to handle looping,
 * shot limits, and bazis presence checks, then calls `launch_bazis_dual_shot`
 * for the actual projectile launch.
 *
 * @returns {Promise<void>} A promise that resolves when the burst of shots (defined by bazis_shot_repeat) has completed.
 */

async function dual_lazer_shooting() {  
    
    await fire_bazis_shots_orchestrator(async (bazis_rect, _i) => { 
       
        const offset_x = bazis_rect.width * 0.24; 
        const offset_y = bazis_rect.top - 20;     
        const lazer_length = bazis_rect.top; 
        const animation_durations = [40, 100, 90]; 
       
        launch_bazis_dual_lazer_shot(bazis_rect, offset_x, offset_y, lazer_length, animation_durations);  
    }, 2);
}

/**
 * Launches bazis dual lazer shot from bazis_shots_pool.
 * This helper function retrieves two inactive projectiles from the pool,
 * configures their visual (CSS) and game-state (damage, type) properties,`
 * sets initial positions, plays firing audio, and initiates the animation 
 * towards the screen's top edge. Upon animation completion, the projectiles
 * are returned to the pool for reuse.
 * @param {object} bazis_rect - The DOMRect object of the bazis element, used for dynamic calculations
 * @param {number} offset_x  CSS left coordinate of projectile according to Bazis horizontal middle.
 * @param {number} offset_y  CSS top starting coordinate of projectile according to Bazis vertical top.
 * @param {number} lazer_length initial maximum length of lazer beam derived from bazis_rect.top.
 * @param {number[]} animation_durations durations of animation stages (ms).
 * @returns {void} This function does not return a value.
 */

function launch_bazis_dual_lazer_shot( bazis_rect, offset_x, offset_y, lazer_length, animation_durations) {
    for (let position_x = -1; position_x <= 1; position_x += 2) {         
        const shot_data = get_bazis_shot_from_pool();
        
        if (!shot_data) {           
            console.warn("Bazis shot pool empty !!");           
            continue;
        }

        const shot_element = shot_data.element;        
               
        shot_element.removeClass("lazer_lovedek hyper_lovedek");
        shot_element.addClass("lazer_lovedek");
        shot_element.rect = null;
        shot_data.damage = 10;
        shot_data.type = "dual";

        const shot_width = 5;         
        const offset_left = bazis_rect.left + (bazis_rect.width / 2) + (position_x * offset_x) - (shot_width / 2);

        shot_element.css({
            "left": offset_left ,
            "top": offset_y,
            "height" : 0
        }); 

        audio_play("#r_lazer3");
        shot_element.show();
        shot_element.animate(  
            {
            "height": lazer_length - 6,      
            "top": 0 
            }, animation_durations[0]  
            )
            .animate(
            {
            "top" : -10,
            "height" : lazer_length *0.8,
            }, animation_durations[1]
            )
            .animate({
            "height":0,
            "top" : -10 
            },animation_durations[2],
             function(){ return_bazis_shot_to_pool( shot_data ); });   
    }
}
