/**
 * Orchestrates the firing of a dual bazis shot (standard shot mode).
 * It uses the common bazis shot orchestrator to handle looping,
 * shot limits, and bazis presence checks, then calls `launch_bazis_dual_shot`
 * for the actual projectile launch.
 *
 * @returns {Promise<void>} A promise that resolves when the burst of shots (defined by bazis_shot_repeat) has completed.
 */
async function dual_fire_shooting() { 
    await fire_bazis_shots_orchestrator(async (bazis_rect, _i) => { 

        const animation_speed = parseInt(bazis_shot_speed * bazis_rect.top);
        const offset_x = bazis_rect.width * 0.24; 
        const offset_y = bazis_rect.top - 10;       
       
        launch_bazis_dual_shot(offset_x, offset_y, animation_speed, bazis_rect);  
}, 2);
}

const HYPER_LOVEDEK_DAMAGE = 6;
/**
 * Launches standard bazis dual shot from bazis_shots_pool.
 * This helper function retrieves two inactive projectiles from the pool,
 * configures their visual (CSS) and game-state (damage, type) properties,`
 * sets initial positions, plays firing audio, and initiates the animation
 * sets class hyper_lovedek on projectile if Boss enemy comes in.
 * towards the screen's top edge. Upon animation completion, the projectiles
 * are returned to the pool for reuse.
 * @param {number} initial_left  CSS left coordinate of projectile according to Bazis horizontal middle.
 * @param {number} initial_top  CSS top starting coordinate of projectile according to Bazis vertical top.
 * @param {number} animation_speed Duration of projectile animation. From start point to screen top edge.
 * @param {object} bazis_rect - The DOMRect object of the bazis element, used for dynamic calculations
 * @returns {void} This function does not return a value.
 */

function launch_bazis_dual_shot( offset_x, offset_y, animation_speed, bazis_rect) {
    for (let position_x = -1; position_x <= 1; position_x += 2) { 
        
        const dual_shot_data = get_bazis_shot_from_pool();
        
        if (!dual_shot_data) {           
            console.warn("Bazis shot pool empty !");           
            continue;
        }
        const dual_shot_element = dual_shot_data.element;
        
        dual_shot_element.removeClass("lazer_lovedek hyper_lovedek"); 
        if( game_data.game_states.boss_flag ) {
            dual_shot_element.addClass("hyper_lovedek");
            dual_shot_data.damage = HYPER_LOVEDEK_DAMAGE;
            dual_shot_data.type = "Hyper Shot";
        }  
        
        
        dual_shot_data.damage = 10;
        dual_shot_data.type = "dual";

        const shot_width = 6;         
        const offset_left = bazis_rect.left + (bazis_rect.width / 2) + (position_x * offset_x) - (shot_width / 2);
       
        dual_shot_element.css({
            "left": offset_left,
            "top": offset_y
        });  
                                        
        dual_shot_element.show();                    

        audio_play("#loves1");
      
        dual_shot_element.animate({
            "top": 0
        }, animation_speed, "linear",
        function () {            
            return_bazis_shot_to_pool( dual_shot_data );
        });
    }
}