function get_bazis_shot_from_pool() {
    for (let i = 0; i < bazis_shot_pool.length; i++) {
        
        const index = (next_bazis_shot_index + i) % bazis_shot_pool.length;
        if (!bazis_shot_pool[index].is_active) {
            bazis_shot_pool[index].is_active = true;  
            next_bazis_shot_index = (index + 1) % bazis_shot_pool.length; // Advance pointer

            return bazis_shot_pool[index]; 
        }
    }
    console.warn("Bazis shot pool exhausted! Cannot fire more shots.");
    return null; 
}

/**
 * Retrieves an inactive enemy from the pool.
 * @returns {object|null} An enemy data object from the pool, or null if pool exhausted.
 */
function get_enemy_from_pool(){
    for (let i = 0; i < enemy_pool.length; i++) {
        const index = (next_enemy_index + i) % enemy_pool.length;
        if (!enemy_pool[index].is_active) {
            enemy_pool[index].is_active = true;
            next_enemy_index = ( index + 1) % enemy_pool.length;

            return enemy_pool[index];
        }
    }
    console.log("Enemy pool exhausted! Cannot load more enemies.");
    return null;
}

function get_enemy_shot_from_pool() {
    for (let i = 0; i < enemy_shot_pool.length; i++) {
        
        const index = (next_enemy_shot_index + i) % enemy_shot_pool.length;
        if (!enemy_shot_pool[index].is_active) {
            enemy_shot_pool[index].is_active = true;  
            next_enemy_shot_index = (index + 1) % enemy_shot_pool.length; // Advance pointer

            return enemy_shot_pool[index]; // Return the jQuery element
        }
    }
    console.warn("Enemy shot pool exhausted! Cannot fire more shots.");
    return null; 
}

/**
 * Retrieves an inactive homing missile from the pool.
 * @returns {object|null} A missile data object from the pool, or null if pool exhausted.
 */
function get_homing_missile_from_pool() {
    for (let i = 0; i < homing_missile_pool.length; i++) {
        const index = (next_homing_missile_index + i) % homing_missile_pool.length;
        if (!homing_missile_pool[index].is_active) {
            homing_missile_pool[index].is_active = true;
            next_homing_missile_index = (index + 1) % homing_missile_pool.length;

            return homing_missile_pool[index]; 
        }
    }
    console.warn("Homing missile pool exhausted! Cannot launch more missiles.");
    return null;
}

/**
 * Retrieves an inactive lazer beam from the pool.
 * @returns {object|null} A lazer data object from the pool, or null if pool exhausted.
 */
function get_tracking_lazer_from_pool() {
    for (let i = 0; i < tracking_lazer_pool.length; i++) {
        const index = (next_tracking_lazer_index + i) % tracking_lazer_pool.length;
        if (!tracking_lazer_pool[index].is_active) {
            tracking_lazer_pool[index].is_active = true;
            next_tracking_lazer_index = (index + 1) % tracking_lazer_pool.length;

            return tracking_lazer_pool[index]; 
        }
    }
    console.warn("Tracking lazer pool exhausted! Cannot emit more lazer beam.");
    return null;
}

function get_boss_shot_from_pool() {
    for (let i = 0; i < boss_shot_pool.length; i++) {
        
        const index = (next_boss_shot_index + i) % boss_shot_pool.length;
        if (!boss_shot_pool[index].is_active) {
            boss_shot_pool[index].is_active = true;  
            next_boss_shot_index = (index + 1) % boss_shot_pool.length; 

            return boss_shot_pool[index]; 
        }
    }
    console.warn("Boss shot pool exhausted! Cannot fire more shots.");
    return null; 
}
