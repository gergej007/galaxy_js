/**
 * Updates the visual state of the HP indicator based on current health percentage.
 * Applies CSS classes for low/critical thresholds and handles entity destruction
 * when health reaches zero, triggering powerup spawns and explosion effects.
 */
function hp_indicator_handler() {
    const { LOW_TRESHOLD, CRITICAL_TRESHOLD, LOW_HEALTH_CLASS, CRITICAL_HEALTH_CLASS} = HP_INDICATOR_CONFIG;
    const hp_indicator_container = base_level_entities.hp_indicator.element;
    if (!hp_indicator_container) return;

    const current_hp = base_level_entities.bounty.hp;
    const max_hp =  base_level_entities.bounty.max_hp; 
    
    const hp_fill = base_level_entities.hp_indicator.fill;     
    
    const hp_percentage = (current_hp / max_hp) * 100;
    
    hp_fill.css({
        "width": `${hp_percentage}%`
    });

    hp_fill.removeClass(`${LOW_HEALTH_CLASS} ${CRITICAL_HEALTH_CLASS}`); 
    if (hp_percentage <= CRITICAL_TRESHOLD) {
        hp_fill.addClass(CRITICAL_HEALTH_CLASS); 
    } else if (hp_percentage <= LOW_TRESHOLD) {
        hp_fill.addClass(LOW_HEALTH_CLASS); 
    } else {
        // Default green 
    }

    if (current_hp <= 0) { 
        hp_fill.css({ opacity: 0 }); 

        const bounty_data = base_level_entities.bounty;
        if (!bounty_data || bounty_data.rect === null) {
            return; 
        } 
        
        base_level_entities.hp_indicator.element = null;
        base_level_entities.hp_indicator.fill = null;

        spawn_actual_powerup(bounty_data );       
        explode_spacekraft( bounty_data );
    }
}

/**
 * Creates the HP indicator DOM structure and initializes its references.
 * 
 * @returns {jQuery} The jQuery object representing the HP indicator container.
 */
function get_hp_indicator(){     
    const { WRAPPER_CLASS, FILL_CLASS} = HP_INDICATOR_CONFIG;            
   
    const hp_indicator_frame = $(`<div class = ${WRAPPER_CLASS}><div class=${FILL_CLASS}></div></div>`); 
    base_level_entities.hp_indicator.element = hp_indicator_frame; 
    base_level_entities.hp_indicator.fill = hp_indicator_frame.find(`.${FILL_CLASS}`);
    return hp_indicator_frame;
}