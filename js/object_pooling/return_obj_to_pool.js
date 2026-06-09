/**
 * Returns a bazis shot data object to the pool, resets its state.
 * @param {object} shot_data - The bazis shot data object to return to the pool.
 */
function return_bazis_shot_to_pool(shot_data) { 
    if (!shot_data) {
        console.warn("Attempted to return a null bazis shot to the pool!");
        return;
    }        
        clean_pool_element(shot_data);  
        if(shot_data.enemies_hit_ids){
            shot_data.enemies_hit_ids.clear();
        }
}

/**
 * Returns an enemy ship to the pool and resets its logical and visual state.
 * @param {Object} enemy_data - The data object for the enemy ship.
 */
function return_enemy_to_pool(enemy_data) {
    if (!enemy_data) {
        console.warn("Attempted to return a null enemy to the pool!");
        return;
     }
     if (enemy_data.img_element?.length) {
        enemy_data.img_element.remove();
        enemy_data.img_element = null;
    }
    clean_pool_element(enemy_data);
  
    enemy_data.hp = 0; 
    enemy_data.speed = 0;
    enemy_data.moving_direction = null;
    enemy_data.id = 0;        
}

/**
 * Returns an enemy shot data object to the pool, resets its state.
 * @param {object} enemy_shot_data - The enemy shot data object to return to the pool.
 */
function return_enemy_shot_to_pool(enemy_shot_data) {
    if (!enemy_shot_data) {
        console.warn("Attempted to return a null enemy shot to the pool!");
        return;
    }
    clean_pool_element(enemy_shot_data);
}

/**
 * Returns a homing missile data object to the pool, resetting its state.
 * @param {object} missile_data - The missile data object to return to the pool.
 */
function return_homing_missile_to_pool(missile_data) {
    if (!missile_data) {
        console.warn("Attempted to return a null homing missile to the pool!");
        return;
    }
    clean_pool_element(missile_data);
    missile_data.parent_side = null;
    missile_data?.element.find(`.${POOL_STYLES.H_IGNITION_IMG_CLASS}`).remove();   
}

/**
 * Returns a tracking lazer data object to the pool, resetting its state.
 * @param {object} lazer_data - The lazer data object to return to the pool.
 */
function return_tracking_lazer_to_pool(lazer_data) {
    if (!lazer_data) {
        console.warn("Attempted to return a null tracking lazer to the pool!");
        return;
    }
    clean_pool_element(lazer_data);
}

/**
 * Returns a boss projectile to the pool, resolving any pending animation 
 * promises and resetting its state via the unified cleaner.
 * @param {Object} boss_shot_data - The data object for the boss projectile.
 */
function return_boss_shot_to_pool(boss_shot_data) {
    if (!boss_shot_data) {
        console.warn("Attempted to return a null boss shot to the pool!");
        return;
    }
    if (boss_shot_data.resolve_animation_promise) {
        boss_shot_data.resolve_animation_promise();
        boss_shot_data.resolve_animation_promise = null;
    }
    boss_shot_data.element.stop(true, false);
    boss_shot_data.speed = 0;
    clean_pool_element(boss_shot_data);    
}

/**
 * Unifies the cleanup process for any object being returned to a pool.
 * Uses modular configuration objects for better maintainability.
 * @param {Object} data - The entity data object (enemy, shot, or lazer).
 */
function clean_pool_element(data) {
    if (!data?.element) return;

    const $el = $(data.element);
    $el.hide();
    $el.stop(true, true);   

    const base_class = BASE_CLASSES[data.type];
    $el.attr('class', base_class || '');

    $el.css(POOL_STYLES.MASTER_RESET_STYLE);

    data.is_active = false;
    
    data.rect = { ...POOL_STYLES.ZERO_RECT };
    
    void $el[0].offsetHeight;
}