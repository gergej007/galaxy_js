/**
 * Factory function that creates a new DOM element for a player (bazis) projectile.
 * 
 * This function is utilized by the object pooling system to generate the 
 * initial HTML structure for player shots. It ensures that every shot 
 * created follows the style defined in the centralized configuration.
 * 
 * @function create_new_bazis_shot_element
 * @returns {jQuery} A jQuery-wrapped `<div>` element representing the projectile.
 */
function create_new_bazis_shot_element() {              
    return $(`<div class="${POOL_STYLES.BAZIS_SHOT_ELEM_CLASS}"></div>`);
}


/**
 * Factory function that creates a new DOM element for an enemy projectile.
 * 
 * This function is utilized by the object pooling system to generate the 
 * initial HTML structure for player shots. It ensures that every shot 
 * created follows the style defined in the centralized configuration.
 * 
 * @function create_new_bazis_shot_element
 * @returns {jQuery} A jQuery-wrapped `<div>` element representing the projectile.
 */
function create_new_enemy_shot_element(){
    return $(`<div class="${POOL_STYLES.ENEMY_SHOT_ELEM_CLASS}"></div>`);
}


/**
 * Factory function that creates a new DOM element for an enemy unit.
 * 
 * This function generates the initial container structure for an enemy "spacekraft."
 * It is called by the object pooling system during initialization or when 
 * the pool needs to expand.
 * 
 * @function create_new_enemy_element
 * @returns {jQuery} A jQuery-wrapped `<div>` element with the base enemy class.
 */
function create_new_enemy_element() {    
    const sapcekraft_frame = $(`<div class="${POOL_STYLES.ENEMY_ELEM_CLASS}"></div>`);    
   
    return sapcekraft_frame; 
}

/**
 * Factory function that creates a new DOM element for a homing missile.
 * 
 * This function generates a container (frame) for the missile, applies initial
 * reset styles from the configuration, and asynchronously loads the missile's 
 * image asset. The completed frame is then appended to the document body.
 * 
 * @function create_new_homing_missile_element
 * @returns {jQuery} A jQuery-wrapped `<div>` element acting as the missile container.
 */
function create_new_homing_missile_element() {
    const { H_MISSILE_WRAPPER_CLASS, H_MISSILE_IMG_SRC, H_MISSILE_IMG_CLASS, H_MISSILE_RESET_STYLE}
          = POOL_STYLES;

    const missile_frame = $(`<div class="${H_MISSILE_WRAPPER_CLASS}"></div>`);
    missile_frame.css(H_MISSILE_RESET_STYLE);
    unified_image_loader( H_MISSILE_IMG_SRC, (missile_img)=>{
        missile_img.addClass(H_MISSILE_IMG_CLASS).appendTo(missile_frame);
    });
   
    missile_frame.appendTo($("body"));
    return missile_frame;
}

/**
 * Factory function that creates a new DOM element for a tracking laser.
 * 
 * This function generates the initial container structure for tracking lasers,
 * which are utilized by the object pooling system. It applies specialized 
 * reset styles specific to tracking lasers (e.g., initial opacity) 
 * as defined in the configuration.
 * 
 * @function create_new_tracking_lazer_element
 * @returns {jQuery} A jQuery-wrapped `<div>` element representing the tracking laser.
 */
function create_new_tracking_lazer_element() {
    const lazer_element = $(`<div class="${POOL_STYLES.TRACK_LAZER_ELEM_CLASS}"></div>`);
    lazer_element.css(POOL_STYLES.TRACK_LAZER_RESET_STYLE);
    return lazer_element;    
}

/**
 * Factory function that creates a new DOM element for a boss projectile.
 * 
 * This function is utilized by the object pooling system to generate the 
 * initial HTML structure for boss-specific shots. It ensures that every 
 * projectile created follows the style defined in the centralized configuration.
 * 
 * @function create_new_boss_shot_element
 * @returns {jQuery} A jQuery-wrapped `<div>` element representing the boss projectile.
 */
function create_new_boss_shot_element() {
    return $(`<div class="${POOL_STYLES.BOSS_SHOT_ELEM_CLASS}"></div>`);
}
