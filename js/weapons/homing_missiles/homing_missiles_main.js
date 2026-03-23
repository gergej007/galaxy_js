let homing_missile_timeout;
let missile_prep_timeout;

// const { CONTAINER_CLASS, IMG_SRC, IMG_CLASS} = SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.IMAGE;

// function get_missile_element() {
//     return $(`<div class="${CONTAINER_CLASS}"><img src="${IMG_SRC}" class="${IMG_CLASS}"></div>`);
//        //$("<div class='homing_missile'><img src='kepek/missile1.png' class='missile_img'></div>");
// }   // EZ KELL?


/**
 * Evaluates the conditions required for homing missiles to be launched.
 * This includes checking if the homing missile weapon is active, if there's
 * traffic (enemies) on screen, if a tracking lazer is active (as a conflict),
 * and if the game is in an exit state.
 *
 * @returns {boolean} True if all conditions for launching homing missiles are met, false otherwise.
 */
function missile_launch_conditions_evaluation(){
    if(    weapons.flags.homing_missile 
        && game_data.game_states.traffic_flag 
        && !weapons.flags.tracking_lazer
        && !game_data.game_states.exit_flag){
            return true;
        }
    return false;
}

/**
 * Checks if the bazis (player's base) element is currently present in the DOM.
 * This is used to determine if the bazis is alive or active on screen.
 *
 * @returns {boolean} True if the bazis element is found in the DOM, false if it is dead or off-screen.
 */
function bazis_element_check(){
    const current_bazis_element = $(base_level_entities.bazis.element);
    if (current_bazis_element.length === 0){
        console.warn("Bazis is currently dead or off-screen");
        return false;
    }
    return true;
}

/**
 * Schedules the next attempt to launch homing missiles after a cooldown.
 * This helper function centralizes the logic for the recursive setTimeout.
 * It also acts as the primary gatekeeper for the entire missile launch cycle.
 *
 * @returns {void}
 */
function schedule_next_missile_launch_attempt() {   
    if (homing_missile_timeout) {
        clearTimeout(homing_missile_timeout);
    }
    
    homing_missile_timeout = setTimeout(() => {     
        if(!weapons.flags.homing_missile){
            homing_missile_timeout = null;            
            return; 
        }      
       
        if ( !bazis_element_check()) {            
            schedule_next_missile_launch_attempt(); 
            return; 
        }        
        launch_missile_projectiles(); 
        schedule_next_missile_launch_attempt();
    }, SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.MAIN.MISSILE_LAUNCH_INTERVAL); 
}

/**
 * Initiates the homing missile launch sequence.
 * This function checks conditions, creates and animates two homing missiles,
 * and schedules the next launch attempt.
 *
 * @returns {void}
 */
function launch_missile_projectiles(){                        

    if( ! missile_launch_conditions_evaluation() ){        
        schedule_next_missile_launch_attempt(); 
        return;
    }   
    
    missile_prep_timeout = setTimeout(() => { 
       if ( !bazis_element_check() || !missile_launch_conditions_evaluation()) {
           return;
        }       
        
        const bazis_rect = base_level_entities.bazis.rect;
        const { WIDTH, OFFSET_X_FACTOR, PRE_LAUNCH_DISTANCE_X, PRE_LAUNCH_DISTANCE_Y,
                PLACEMENT_START_VALUE, PLACEMENT_INCREMENT, PLACEMENT_END_VALUE,
                LEFT_MISSILE_SIDE, RIGHT_MISSILE_SIDE,
                ANIMATION_DURATION_1, ANIMATION_DURATION_2
         } = SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.MAIN

        const missile_width = WIDTH;    
        const offset_x = bazis_rect.width * OFFSET_X_FACTOR;  
        const distance_x = PRE_LAUNCH_DISTANCE_X;
        const distance_y = PRE_LAUNCH_DISTANCE_Y;
    
        for(let position_x = PLACEMENT_START_VALUE ; position_x <= PLACEMENT_INCREMENT; position_x += PLACEMENT_END_VALUE){
            const missile_initial_left = bazis_rect.left + (bazis_rect.width / 2) + (position_x * offset_x) - (missile_width / 2);

            const missile_data = get_homing_missile_from_pool();
            if (!missile_data) {
                console.warn("Homing Missile pool exhausted! Cannot launch all missiles.");
                continue;
            }
                const missile_element = $(missile_data.element);  

            let missile_parent_side;

            if( position_x === -1){
                missile_parent_side = LEFT_MISSILE_SIDE;
            }
            else if( position_x === 1){
                missile_parent_side = RIGHT_MISSILE_SIDE;
            }
            missile_data.parent_side = missile_parent_side;       
           
            missile_element.css({
                left : missile_initial_left,
                top  : bazis_rect.top  
            });
            missile_element.appendTo($("body"));  
            missile_element.find(`.${SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.IMAGE.IMG_CLASS}`).show();
            missile_element.show(); 
            
            missile_element.animate({
                "left" : missile_initial_left + ( position_x * distance_x )                    
            }, ANIMATION_DURATION_1)
            .animate({
                "top" : bazis_rect.top - distance_y
            }, ANIMATION_DURATION_2)
            .promise()
            .done( ()=> {
                missile_target_search( missile_data, bazis_rect);
            });
        } 
        missile_prep_timeout = null;                       
   }, SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.MAIN.LAUNCH_PREPARE_DELAY);
}