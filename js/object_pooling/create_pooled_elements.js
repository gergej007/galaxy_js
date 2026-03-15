function create_new_bazis_shot_element() {              
    return $("<div class='lovedek'></div>");
}

function create_new_enemy_shot_element(){
    return $("<div class='counter_tuz'></div>");
}


/**
 * Creates and returns frame(<div>) for a new enemy spacekraft. 
 *
 * @returns {jQueryObject} A jQuery object representing the frame of the new enemy's DOM structure.
 */
function create_new_enemy_element() {    
    const sapcekraft_frame = $("<div class='urhajo'></div>");    
   
    return sapcekraft_frame; 
}

/**
 * Creates and returns the full jQuery DOM structure for a new homing missile.
 * @returns {jQueryObject} A jQuery object representing the new homing missile.
 */
function create_new_homing_missile_element() {
    
    const missile_frame = $("<div class='homing_missile'></div>");
    unified_image_loader("missile1.png", (missile_img)=>{
        missile_img.addClass('missile_img').appendTo(missile_frame)
        .css({ display: 'none', position: 'absolute', left: 0, top: 0 });
    });
   
    missile_frame.appendTo($("body"));
    return missile_frame;
}

function create_new_tracking_lazer_element() {
    const lazer_element = $("<div class='tracking_lazer_lovedek'></div>");
    lazer_element.css({ "opacity": 0, "display": "none", "position": "absolute" });
    return lazer_element;    
}

function create_new_boss_shot_element() {
    return $("<div class='bs_loves'></div>");
}
