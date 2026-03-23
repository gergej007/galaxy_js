/**
 * Returns a bazis shot data object to the pool, resets its state.
 * @param {object} bazis_shot_data - The bazis shot data object to return to the pool.
 */
function return_bazis_shot_to_pool(shot_data) { 
    if (shot_data) {
        shot_data.is_active = false; 
        const shot_element = $(shot_data.element);
        
        shot_element.stop(true, true); 
        shot_element.hide();
        shot_data.rect = null;
        shot_element.css({         
            "left" : 0, 
            "top" : 0,
            "opacity" : 1 
        });
        
        shot_element.removeClass("hyper_lovedek lazer_lovedek_var0 lazer_lovedek_var1"); 
    } else {
        // This case should ideally not happen if all shots come from the pool
        console.warn("Attempted to return a bazis shot not found in the pool!");
        shot_element.remove(); // Just remove it if it's an unexpected element
    }
}

/**
 * Returns an enemy data object to the pool, resets its state.
 * @param {object} enemy_data - The enemy data object to return to the pool.
 */
function return_enemy_to_pool(enemy_data) {
    if (enemy_data) {
        enemy_data.is_active = false;
        // Reset properties
        enemy_element = $(enemy_data.element);
        enemy_element.hide();
        enemy_element.css({
            "left": 0,
            "top": 0,
            "opacity": 1,
            "transform": "none",
            "filter" : "none" 
        });
        if (enemy_data.img_element && enemy_data.img_element.length > 0) {
            enemy_data.img_element.remove();
            enemy_data.img_element = null;
        }
        enemy_element.removeClass("locked");       
        enemy_data.hp = 0; 
        enemy_data.speed = 0;
        enemy_data.moving_direction = null;
        enemy_data.rect = null;
        enemy_data.id = 0;        
    }
}

/**
 * Returns an enemy shot data object to the pool, resets its state.
 * @param {object} enemy_shot_data - The enemy shot data object to return to the pool.
 */
function return_enemy_shot_to_pool(enemy_shot_data) {
   
    if (enemy_shot_data) {
        enemy_shot_data.is_active = false; 
        
        const enemy_shot_element = $(enemy_shot_data.element);
        enemy_shot_element.stop(true, false); 
        enemy_shot_element.hide();
        enemy_shot_data.rect = null;
        enemy_shot_element.css({            
            "left" : 0, 
            "top" : 0,
            "opacity" : 1 
        });
                
        enemy_shot_element.removeClass("counter_tuz_var0 counter_tuz_var1 counter_tuz_var2 counter_tuz_var3"); // Add other variant classes if they exist
    } else {        
        console.warn("Attempted to return an enemy shot not found in the pool!");
        enemy_shot_element.remove(); 
    }
}

/**
 * Returns a homing missile data object to the pool, resetting its state.
 * @param {object} missile_data - The missile data object to return to the pool.
 */
function return_homing_missile_to_pool(missile_data) {
    if (missile_data) {
        missile_data.is_active = false;
        
        const missile_element = missile_data.element;
        missile_element.stop(true, false); 
        missile_element.hide();                   
        
        missile_element.css({
            "left": 0, 
            "top": 0,
            "opacity": 1
        });
        missile_element.removeClass("left_missile right_missile"); // Clear status classes
        missile_element.find(".missile_fire_img").remove(); // Remove booster if present

        // Reset data properties
        missile_data.parent_side = null;
        missile_data.rect = null;        
    }
}

/**
 * Returns a tracking lazer data object to the pool, resetting its state.
 * @param {object} lazer_data - The lazer data object to return to the pool.
 */
function return_tracking_lazer_to_pool(lazer_data) {
    const lazer_element = lazer_data.element;
    if (lazer_data  && lazer_data.element) {
        lazer_element.stop(true, true); 
        
        lazer_element.hide();                   
        
        lazer_element.css({
            "left": 0, 
            "top": 0,
            "width" : 0,
            "height" : 0,
            "opacity": 0,
            "display": "none",
            "transform" : "none"
        });
        lazer_data.is_active = false;                
    }
}

/**
 * Returns a boss shot data object to the pool, resets its state.
 * @param {object} boss_shot_data - The boss shot data object to return to the pool.
 */
function return_boss_shot_to_pool(boss_shot_data) {
    if (boss_shot_data) {
        boss_shot_data.is_active = false; 
        
        const boss_shot_element = $(boss_shot_data.element);
        if (boss_shot_data.resolve_animation_promise) { // <--- NEW: Check for and call resolve
            boss_shot_data.resolve_animation_promise();
            boss_shot_data.resolve_animation_promise = null; // Clear the reference
        }
        boss_shot_element.stop(true, false); 
        boss_shot_element.hide();
        boss_shot_data.rect = null;
        boss_shot_data.speed = 0;
        boss_shot_element.removeAttr('style');
        boss_shot_element.css({            
            "left" : 0, 
            "top" : 0,
            "width" : 0,
            "height" : 0,           
            "opacity" : 1 
        });
                
        boss_shot_element.removeClass("celzott_bs_loves bs_lazer_lovedek boss_tuz_3 boss_tuz_2 boss_tuz_1"); 
    } else {        
        console.warn("Attempted to return a boss shot not found in the pool!");
        boss_shot_element.remove(); 
    }
}