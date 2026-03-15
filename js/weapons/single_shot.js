/**
 * Orchestrates the firing of a single bazis shot (standard shot mode).
 * It uses the common bazis shot orchestrator to handle looping,
 * shot limits, and bazis presence checks, then calls `launch_bazis_single_shot`
 * for the actual projectile launch.
 *
 * @returns {Promise<void>} A promise that resolves when the burst of shots (defined by bazis_shot_repeat) has completed.
 */

async function single_fire_shooting() { 
    await fire_bazis_shots_orchestrator(async (bazis_rect, _i) => { 

        const animation_speed = parseInt(bazis_shot_speed * bazis_rect.top);
        const shot_width = 6;
        const initial_left = bazis_rect.left + (bazis_rect.width / 2 - shot_width / 2);
        const initial_top = bazis_rect.top - 10; 
       
        launch_bazis_single_shot(initial_left, initial_top, animation_speed);  
}, 1);
}


/**
 * Launches standard bazis single shot from bazis_shots_pool.
 * This helper function retrieves an inactive projectile from the pool,
 * configures its visual (CSS) and game-state (damage, type) properties,`
 * sets its initial position, plays firing audio, and initiates its animation
 * towards the screen's top edge. Upon animation completion, the projectile
 * is returned to the pool for reuse.
 * @param {number} initial_left  CSS left coordinate of projectile according to Bazis horizontal middle.
 * @param {number} initial_top  CSS top starting coordinate of projectile according to Bazis vertical top.
 * @param {number} animation_speed Duration of projectile animation. From start point to screen top edge.
 * @returns {void} This function does not return a value.
 */

function launch_bazis_single_shot( initial_left, initial_top, animation_speed) {
    const shot_data = get_bazis_shot_from_pool();  

    if (!shot_data) {                  
        console.warn("Bazis shot pool empty !!.");
        return; 
    }
                      
    const shot_element = shot_data.element;       

    shot_element.removeClass("lazer_lovedek hyper_lovedek");
   
    shot_element.rect = null;
    shot_data.damage = 10;
    shot_data.type = "single";
    
    shot_element.css({
        "left": initial_left,
        "top": initial_top
    });
   
    shot_element.show(); 

    audio_play("#loves1"); 

    shot_element.animate({
        "top": 0 
    }, animation_speed, "linear",
    function () {
        return_bazis_shot_to_pool( shot_data );        
    });
}


