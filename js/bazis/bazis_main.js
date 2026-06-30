/**
 * Creates and initializes the player's base (Bazis) element.
 * 
 * This function generates the main container for the player's base, centers it 
 * horizontally at the bottom of the screen, and asynchronously loads the 
 * base's visual asset. It also stores references to the created elements in 
 * the global `base_level_entities` object for easy access.
 * 
 * @function create_bazis
 * @returns {void}
 */
function create_bazis() {

    const { BAZIS_FRAME_CLASS, BAZIS_IMG_CLASS, BAZIS_IMG_SRC} = BAZIS_CONFIG.ELEMENT;
    const bazis_frame = $(`<div class="${BAZIS_FRAME_CLASS}">`);
    base_level_entities.bazis.element = bazis_frame;
    bazis_frame.appendTo($("body"))
    .css({
        "left": $(window).width() / 2 - (bazis_frame.width() /2)
    }); 

    unified_image_loader( BAZIS_IMG_SRC, (bazis_img)=> {
        bazis_img.addClass(BAZIS_IMG_CLASS)
        .appendTo( bazis_frame)
        .show();
        
       base_level_entities.bazis.img_element = bazis_img;
    });   
}

/**
 * Increments the player's health points when an enemy projectile is destroyed.
 * The health gain is clamped to the entity's maximum HP value using Math.min
 * to prevent over-healing, followed by a UI update.
 * 
 * @returns {void}
 */
function gain_bazis_healthpoint() {
    const bazis_data = base_level_entities.bazis;
    if(!is_entity_valid(bazis_data) || bazis_data.is_exploding) return;
    const {HP_RESTORE_VALUE} = BAZIS_CONFIG.ACTIONS;

    const max_hp = bazis_data.max_hp;
    if(bazis_data.hp < max_hp) {
        bazis_data.hp = Math.min( bazis_data.hp + HP_RESTORE_VALUE, max_hp);
        update_left_display();
    }
}