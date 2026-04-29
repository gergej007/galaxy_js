/**
 * Resets the data for a bounty object, removing its associated DOM element
 * from the document and nullifying its references.
 *
 * This function is typically called when a bounty has been destroyed,
 * ensuring that its visual representation is gone and its data is cleaned up.
 *
 * @param {object} bounty_data - The data object representing the bounty to be reset.
 *                               Expected to contain an `element` property (jQuery object or raw DOM element)
 *                               and potentially `direction` and `rect` properties.
 * @returns {void}
 */
function reset_bounty_data(bounty_data) {
    if( !bounty_data ) { return; }

    if (bounty_data.element && typeof bounty_data.element.remove === 'function') {
        bounty_data.element.remove();

    } else if (bounty_data.element && bounty_data.element.parentNode) {
        bounty_data.element.parentNode.removeChild(bounty_data.element);
    }
    bounty_data.direction = null;
    bounty_data.element = null;
    bounty_data.rect = null;
}


/**
 * Calculates initial and target X coordinates for the bounty container
 * based on its visual width and movement direction.
 * 
 * @param {object} bounty_data - The global bounty data object.
 * @returns {object} { initial_x_poz, anim_x_poz }
 */
function calculate_container_x( bounty_data) {
   const { RIGHT_DIRECTION, LEFT_DIRECTION} = BOUNTY_CONTAINER_CONFIG;   
   let initial_x_poz;
   let anim_x_poz;
   const win_width = $(window).width();     

    if(bounty_data.direction === RIGHT_DIRECTION){                      // direction right
        initial_x_poz  = -bounty_data.element.width();
        anim_x_poz = win_width;       
    }
    else if(bounty_data.direction === LEFT_DIRECTION){                  // direction left
        initial_x_poz  = win_width;
        anim_x_poz = -bounty_data.element.width();        
    }

    return { initial_x_poz, anim_x_poz }
}

/**
 * Calculates a randomized vertical (Y) coordinate for the bounty container.
 * 
 * The calculation uses a multiplier and a seed value from the configuration to 
 * define a specific "spawn band" relative to the window height. This ensures 
 * the container appears within a predictable vertical range while maintaining 
 * variability.
 * 
 * @function calculate_container_y
 * @returns {number} The randomized Y-coordinate in pixels.
 */
function calculate_container_y(){
    const { RND_POZ_Y_MULTIPLIER_FACTOR, RND_POZ_Y_MULTIPLIER_SEED} = BOUNTY_CONTAINER_CONFIG;
    const win_height = $(window).height();

    const rnd_y_poz = Math.round(Math.random() * (win_height *RND_POZ_Y_MULTIPLIER_FACTOR)+ win_height * RND_POZ_Y_MULTIPLIER_SEED);
    return rnd_y_poz;
}