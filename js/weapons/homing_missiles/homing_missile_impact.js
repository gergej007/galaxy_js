/**
 * Animates missile to its selected target, 
 * and triggers the target's destruction based on calculated impact time.
 * This function also manages the missile's visual ignition effect and its removal.
 *
 * @param {object} missile_data - The data object for the homing missile.
 * @param {object} target_enemy_data - The data object for the enemy target.
 * @returns {void}
 */                                                                   
function kill_target_obj( missile_data, target_enemy_data ) { 
    const { NO_TARGET_ANIM_TOP, NO_TARGET_ANIM_DURATION, TARGET_LOCKED_CLASS} = SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.TARGETING;
    const { ANIMATION_EASING, AUDIO_KEY, IGNITION_IMG_SRC, IGNITION_IMG_CLASS,
            VERTICAL_IMPACT_OFFSET_PX
    } = SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.IMPACT;    
    
    if (!missile_data || !missile_data.element || !target_enemy_data 
        || !target_enemy_data.element || !target_enemy_data.rect) {
        console.log("kill_target_obj called with invalid missile or target data. Missile flys off-screen.");
       
        

        if( missile_data && missile_data.element){

            $(missile_data.element).animate({
                "top": NO_TARGET_ANIM_TOP
            }, NO_TARGET_ANIM_DURATION, ANIMATION_EASING, function(){
                return_homing_missile_to_pool( missile_data); 
            });
        } 
        return;
    }

    const missile_element = missile_data.element;
    const target_element = target_enemy_data.element;

    const { left: target_left, top: target_top, height: target_height, width: target_width } = target_enemy_data.rect;
   
    audio_play(AUDIO_KEY); 
    
    unified_image_loader( IGNITION_IMG_SRC, (ignition_img)=>{
        ignition_img.addClass( IGNITION_IMG_CLASS).show()
        .appendTo(missile_element);
    });

    const targeting_values = get_missile_speed_lead_point( missile_data, target_enemy_data );
                            
    setTimeout(() => {
        
        if (target_enemy_data && target_element.length > 0 && $.contains(document.body, target_element[0])) {
            explode_spacekraft( target_enemy_data); 
            add_score_n_hit();
        }
    }, targeting_values.missile_speed_value);      

    const final_poz_x = target_left + (target_width / 2) + targeting_values.lead_point;
    const final_poz_y = target_top + target_height - VERTICAL_IMPACT_OFFSET_PX;
    
    missile_element.animate({
        "left": final_poz_x,  
        "top": final_poz_y    
    }, targeting_values.missile_speed_value, ANIMATION_EASING, 
    function () { 
        if( target_enemy_data.is_active) {
        target_element.removeClass(TARGET_LOCKED_CLASS);           
        return_homing_missile_to_pool(missile_data);
       }  
       else explode_spacekraft( missile_data);
    });  
}


/**
 * Calculates the predictive lead point and estimated missile flight duration (speed value)
 * required for a homing missile to track a moving target.
 * This calculation is based on the current positions of the missile and target,
 * and target's movement speed.
 *
 * @param {object} missile_data - The data object for the homing missile.
 * @param {object} target_data - The data object for the enemy target
 * @returns {{lead_point: number, missile_speed_value: number}} An object containing:
 *   - `lead_point`: The calculated horizontal offset (in pixels) for the missile to aim for.
 *   - `missile_speed_value`: The estimated flight duration (in milliseconds) for the missile to reach the target.
 */
function get_missile_speed_lead_point( missile_data, target_data)
{    
    if( !target_data || !target_data.rect || !missile_data || !missile_data.rect) {
        console.warn("Missile lead point and speed calculation failed due to invalid data!");
        return;
    }       
   
    const { MILLISECONDS_PER_SECOND, WINDOW_WIDTH_SPEED_FACTOR, SQUARE_EXPONENT, TARGET_DIRECTION} 
    = SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.IMPACT; 

    const { left: missile_left, top: missile_top} = missile_data.rect;
    const { left: target_left, top: target_top, height: target_height} = target_data.rect;

    const target_speed_ms =  target_data.speed;
    let pixels_per_1s;

    if (typeof target_speed_ms === 'number' && !isNaN(target_speed_ms) && target_speed_ms > 0){
       pixels_per_1s = parseInt( $(window).width() / ( target_speed_ms / MILLISECONDS_PER_SECOND)); 
    }
    else {
        console.log("Target speed is Null or undefined, applying default value");
        pixels_per_1s = parseInt( $(window).width() / WINDOW_WIDTH_SPEED_FACTOR );
    }

    const target_distance_pow = Math.pow( (missile_top - (target_top + target_height)), SQUARE_EXPONENT)
    + Math.pow( (Math.abs(missile_left - target_left)) , SQUARE_EXPONENT);
    const missile_speed_value = Math.round(Math.sqrt( target_distance_pow));    // Missile speed (px) and duration (ms) to target
   
    let current_lead_point = ( pixels_per_1s / MILLISECONDS_PER_SECOND ) * missile_speed_value;

if( target_data.moving_direction === TARGET_DIRECTION){
    current_lead_point = ( -current_lead_point); 
}
return { lead_point : current_lead_point, missile_speed_value : missile_speed_value }
}
