/**
 * Orchestrates the firing of a single lazer shot (lazer shot mode).
 * It uses the common bazis shot orchestrator to handle looping,
 * shot limits, and bazis presence checks, then calls `launch_bazis_single_lazer_shot`
 * for the actual projectile launch.
 *
 * @returns {Promise<void>} A promise that resolves when the burst of shots (defined by bazis_shot_repeat) has completed.
 */

async function single_lazer_shooting(){ 
    await fire_bazis_shots_orchestrator(async (bazis_rect, _i) => {                    
          
    const single_shot_width = 5; 
    const initial_left = bazis_rect.left + (bazis_rect.width / 2 - single_shot_width / 2);
    const initial_top = bazis_rect.top - 20;
    const lazer_length = bazis_rect.top;
    const animation_durations = [ 40, 100, 90];
        
    launch_bazis_single_lazer_shot( initial_left, initial_top, lazer_length, animation_durations);                
    }, 1);         
}

/**
 * Launches bazis single lazer shot from bazis_shots_pool.
 * This helper function retrieves an inactive projectile from the pool,
 * configures its visual (CSS) and game-state (damage, type) properties,`
 * sets its initial position, plays firing audio, and initiates its animation * 
 * towards the screen's top edge. Upon animation completion, the projectile
 * is returned to the pool for reuse.
 * @param {number} initial_left  CSS left coordinate of projectile according to Bazis horizontal middle.
 * @param {number} initial_top  CSS top starting coordinate of projectile according to Bazis vertical top.
 * @param {number} lazer_length initial maximum length of lazer beam derived from bazis_rect.top.
 * @param {number[]} animation_durations durations of animation stages (ms).
 * @returns {void} This function does not return a value.
 */

function launch_bazis_single_lazer_shot( initial_left, initial_top, lazer_length, animation_durations ) {
    const shot_data = get_bazis_shot_from_pool();        

    if (!shot_data) {
        console.warn("Bazis shot pool empty !!.");
        return; 
    }     

    const shot_element = shot_data.element;      

    shot_element.removeClass("lazer_lovedek hyper_lovedek");
    shot_element.addClass("lazer_lovedek");
    shot_element.rect = null;
    shot_data.damage = 10;
    shot_data.type = "single";
    
    shot_element.css({
        "left": initial_left,
        "top": initial_top,
        "height" : 0
    });
   
    shot_element.show(); 
    audio_play("#r_lazer4");  

    shot_element.animate({        
        "height": lazer_length-6,      
        "top": 0        
    },animation_durations[0])
    .animate({
        "top" : -10,
        "height" : lazer_length *0.8,        
    },animation_durations[1])
   .animate({       
        "height":0,
        "top" : -10       
    }, animation_durations[2],
        function(){
            return_bazis_shot_to_pool( shot_data );        
        }); 
}
