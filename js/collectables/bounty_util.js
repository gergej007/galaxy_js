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
 * @param {string} bnty_container_direction - "left" or "right".
 * @returns {object} { css_xpoz, anim_xpoz }
 */
function get_bounty_movement_data( bounty_data, bnty_container_direction ) {
   let css_xpoz;
   let anim_xpoz;     

    if(bnty_container_direction == "right"){                      // direction right
        css_xpoz  = -bounty_data.element.width();
        anim_xpoz = $(window).width() ;       
        bounty_data.direction = "right";      
    }
    else if(bnty_container_direction == "left"){                  // direction left
        css_xpoz  = $(window).width();
        anim_xpoz = -bounty_data.element.width();        
        bounty_data.direction = "left";
    }

    return { css_xpoz : css_xpoz, anim_xpoz : anim_xpoz }
}