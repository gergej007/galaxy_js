/**
 * Spawns and initializes a power-up at the location of a destroyed bounty ship.
 * 
 * This function handles the selection of the power-up type based on current progress,
 * calculates a safe spawn position to ensure the item remains within the viewport 
 * boundaries, loads the appropriate asset, and triggers the floating animation.
 * 
 * @function spawn_actual_powerup
 * @param {Object} bounty_data - The data object of the bounty ship that was destroyed.
 * 
 * @returns {void}
 * 
 * @description
 * 1. Validates bounty_data; aborts if missing.
 * 2. Destructures spatial and styling constants from `POWER_UP_CONFIG`.
 * 3. Calculates initial (x, y) coordinates based on the bounty's last position.
 * 4. Adjusts 'poz_x' if the bounty was too close to the screen edges to keep the power-up visible.
 * 5. Loads the power-up image via `unified_image_loader`.
 * 6. Updates `base_level_entities.powerup` state with the new type and DOM element.
 * 7. Applies `BASE_STYLE` and calculated coordinates to the element before initiating `animate_powerup`.
 */
function spawn_actual_powerup( bounty_data) {     
    if( !bounty_data){
        console.warn("spawn powerup failed due to missing bounty_data!");
        return;
    }

    const { INITIAL_POS_OFFSET, LEFT_SCREEN_EDGE_SAFE_ZONE, SAFE_LEFT_EDGE_POSITION,SAFE_RIGHT_EDGE_OFFSET, 
            RIGHT_SCREEN_EDGE_SAFE_ZONE, PARENT_RIGHT_DIRECTION, PARENT_LEFT_DIRECTION, IMG_CLASS, BASE_STYLE}
             = POWERUP_SPAWN_CONFIG;
        
    const { powerup_img_src, type } = select_actual_powerup();
    const spawn_data = extract_powerup_spawn_data(bounty_data);   

    const bounty_direction = spawn_data.direction;
    const win_width = $(window).width();

    let poz_x = spawn_data.left + INITIAL_POS_OFFSET;
    let poz_y = spawn_data.top + INITIAL_POS_OFFSET;
                                                       // Powerup stays in screen when appears close to edges
     if( bounty_direction === PARENT_LEFT_DIRECTION && poz_x < LEFT_SCREEN_EDGE_SAFE_ZONE )            
        { poz_x = SAFE_LEFT_EDGE_POSITION; }                                  
    else if( bounty_direction === PARENT_RIGHT_DIRECTION && poz_x > win_width - RIGHT_SCREEN_EDGE_SAFE_ZONE)
        { poz_x = win_width - SAFE_RIGHT_EDGE_OFFSET; }   

    unified_image_loader(powerup_img_src, (powerup_img_element) => {

            if (!powerup_img_element?.length){

            console.warn("image was not find or corrupted!");
            return; }

        powerup_img_element.addClass(IMG_CLASS);

        const powerup_data = base_level_entities.powerup;        
        powerup_data.type = type; 
        powerup_data.element = powerup_img_element;
        powerup_img_element.appendTo($("body"));                    

            if(!spawn_data?.element){
            console.warn("image position is 0 or undefined!");
            $(powerup_img_element).remove();
            return;
        }
        powerup_img_element.css({
            ...BASE_STYLE,
            "left" : poz_x, 
            "top" : poz_y
    });   
    powerup_img_element.show();                   
    animate_powerup(powerup_data);  
    });
}

/**
 * Manages the visual lifecycle and expiration of a spawned power-up.
 * 
 * This function initiates a recursive "pulse" animation (growing and shrinking) 
 * to make the power-up noticeable. It also sets a self-destruction timer based 
 * on the configured presence duration. When the timer expires, the power-up 
 * fades out, is removed from the DOM, and the global game state is reset.
 * 
 * @function animate_powerup
 * @param {Object} powerup_data - The data object representing the active power-up.
 * 
 * @returns {void}
 * 
 * @description
 * 1. Validates the existence of the power-up element.
 * 2. Destructures animation constants (durations, dimensions, easing) from `POWER_UP_CONFIG`.
 * 3. Defines `pulse_animation_loop`: A recursive function that uses jQuery `.animate()` 
 *    to create a continuous breathing effect.
 * 4. Implements an expiration timer using `setTimeout`:
 *    - After `PRESENCE_DURATION`, the pulsing stops and a fade-out animation begins.
 *    - Upon completion, the element is removed from the DOM.
 *    - Global state references in `base_level_entities.powerup` are nulled.
 *    - The `game_data.game_states.bounty_flag` is reset to allow new spawns.
 */
function animate_powerup(powerup_data) {
    if (!powerup_data?.element) return;

    const { ANIM_DIMENSIONS_GROW, ANIM_DIMENSIONS_SHRINK, ANIM_DURATION_MS, ANIM_EASING,
            FADE_OUT_OPACITY, PRESENCE_DURATION } = POWERUP_SPAWN_CONFIG;
    
    const powerup_element = powerup_data.element;

    function pulse_animation_loop() {
        // If element is gone, stop the loop
        if (!powerup_data.element) return;

        powerup_element.animate({
            height: ANIM_DIMENSIONS_GROW,
            width: ANIM_DIMENSIONS_GROW
        }, ANIM_DURATION_MS, ANIM_EASING)
        .animate({
            height: ANIM_DIMENSIONS_SHRINK,
            width: ANIM_DIMENSIONS_SHRINK
        }, ANIM_DURATION_MS, ANIM_EASING, function() {
            pulse_animation_loop(); 
        });
    }

    pulse_animation_loop();

    // 3. The Presence Timer (Set ONLY ONCE)
    // Clear any old timer just in case
    if (powerup_data.timer) clearTimeout(powerup_data.timer);

    powerup_data.timer = setTimeout(() => {
        if (!powerup_data.element) return;

        powerup_element.stop(true, false);

        powerup_element.animate({
            opacity: FADE_OUT_OPACITY,
            height: ANIM_DIMENSIONS_GROW,
            width: ANIM_DIMENSIONS_GROW
        }, ANIM_DURATION_MS, ANIM_EASING, function() {
            reset_powerup_data(powerup_data);
        });
    }, PRESENCE_DURATION);
}

/**
 * Extracts essential spatial and state data from a bounty entity to prepare for power-up spawning.
 * 
 * This helper function acts as a data mapper, converting a complex bounty object into a 
 * simplified flat object containing only the coordinates and direction needed to position 
 * a new power-up.
 * 
 * @function extract_powerup_spawn_data
 * @param {Object} bounty_data - The source data object of the bounty ship.
 * 
 * @returns {Object} A simplified data object for the power-up spawn logic.
 * @returns {number} return.left - The horizontal coordinate of the bounty.
 * @returns {number} return.top - The vertical coordinate of the bounty.
 * @returns {string|null} return.direction - The direction to inherit.
 * @returns {jQuery|null} return.element - The original DOM element reference.
 * 
 * @description
 * 1. Validates the input using `is_entity_valid`.
 * 2. Returns a "Safe Default" object with zeroed values if validation fails to prevent downstream crashes.
 * 3. Maps the nested `rect` properties and `direction` into a flat return object for easier consumption.
 */
function extract_powerup_spawn_data( bounty_data){
    if( !is_entity_valid(bounty_data)){
        console.warn("extract_bounty_animation_data: Invalid bounty data provided.");
        return { 
            left: 0, top: 0, direction: null, element: null
        };
    }
    return {
        left : bounty_data.rect.left,
        top : bounty_data.rect.top,
        direction : bounty_data.direction,
        element : bounty_data.element
    };
}

/**
 * Resets the power-up state and removes its element from the DOM.
 * @param {Object} powerup_data - The power-up data object to reset.
 */
function reset_powerup_data(powerup_data) {
    if( !is_entity_valid(powerup_data)){
        return;
    }
    
    powerup_data && (clearTimeout(powerup_data.timer), powerup_data.timer = null);
    powerup_data.element?.remove();
    powerup_data.element = null;
    powerup_data.type = null;
    powerup_data.rect = {
        top: 0, 
        left: 0, 
        width: 0, 
        height: 0, 
        bottom: 0, 
        right: 0 };

        if (game_data?.game_states?.bounty_flag  && !base_level_entities.bounty?.element?.length )  
            { 
            game_data.game_states.bounty_flag = false;
            }
    console.log("Power-up state fully reset and element removed.");
}