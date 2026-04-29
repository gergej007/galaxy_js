/**
 * Validates state and triggers the A-Bomb if conditions are met.
 */
function handle_bomb_input() {
    const launch_enabled = !game_data.game_states.exit_flag && 
                      !game_data.game_states.dialog_flag &&
                      game_data.counters.a_bomb > 0 && 
                      !weapons.flags.a_bomb;

    if (launch_enabled) {
        a_bomb_launch();
    }
}

/**
 * Processes the player's fire command.
 * Manages weapon limits and state checks before triggering a shot.
 */
function handle_fire_input() {
    // if( weapons.flags.single_lazer ) { 
    //     max_shots_ammount = 8; }     
        
    if (game_data.game_states.exit_flag || game_data.game_states.dialog_flag) {
        return;
    } 
    bazis_primary_shot_type_controller();  
}

/**
 * Processes the 'Move Up' command for the player's base.
 * @param {Object} bazis_data - The data object for the player's base.
 * @param {number} dt - Delta time multiplier for frame-rate independence.
 */
function handle_up_arrow_input(bazis_data, dt) {
    
    const { element, rect } = bazis_data;
    const { MOTION_DISTANCE_PX } = BAZIS_CONFIG.ACTIONS;
    const move_amount = MOTION_DISTANCE_PX * dt;

    if(rect.top > 0) {
        const new_top = Math.max(0, rect.top - move_amount);  
        $(element).css({ "top": new_top });
        bazis_data.rect.top = new_top;
        bazis_data.rect.bottom = new_top + rect.height;   
    }
}

/**
 * Processes the 'Move Down' command for the player's base.
 * @param {Object} bazis_data - The data object for the player's base.
 * @param {number} dt - Delta time multiplier for frame-rate independence.
 */
function handle_down_arrow_input(bazis_data, dt) {
   
    const { element, rect } = bazis_data;
    const { MOTION_DISTANCE_PX } = BAZIS_CONFIG.ACTIONS;
    const move_amount = MOTION_DISTANCE_PX * dt;
    const max_allowed_top = $(window).height() - rect.height;

    if(rect.top < max_allowed_top) {
        const new_top = Math.min(max_allowed_top, rect.top + move_amount);
        $(element).css({ "top": new_top });
        bazis_data.rect.top = new_top;
        bazis_data.rect.bottom = new_top + rect.height;
    }
}

/**
 * Processes the 'Move Left' command for the player's base.
 * @param {Object} bazis_data - The data object for the player's base.
 * @param {number} dt - Delta time multiplier for frame-rate independence.
 */
function handle_left_arrow_input(bazis_data, dt) {
   
    const { element, rect } = bazis_data;
    const { MOTION_DISTANCE_PX } = BAZIS_CONFIG.ACTIONS;
    const move_amount = MOTION_DISTANCE_PX * dt;

    if (rect.left > 0) {
        const new_left = Math.max(0, rect.left - move_amount);
        $(element).css({ "left": new_left });
        
        bazis_data.rect.left = new_left;
        bazis_data.rect.right = new_left + rect.width;
    }    
} 

/**
 * Processes the 'Move Right' command for the player's base.
 * @param {Object} bazis_data - The data object for the player's base.
 * @param {number} dt - Delta time multiplier for frame-rate independence.
 */
function handle_right_arrow_input(bazis_data, dt) {      
    const { element, rect } = bazis_data;
    const { MOTION_DISTANCE_PX } = BAZIS_CONFIG.ACTIONS;
    const move_amount = MOTION_DISTANCE_PX * dt;
    
    const win_width = $(window).width();
    const max_allowed_left = win_width - rect.width;

    if (rect.left < max_allowed_left) {
        const new_left = Math.min(max_allowed_left, rect.left + move_amount);
        
        $(element).css({ "left": new_left });
        
        bazis_data.rect.left = new_left;
        bazis_data.rect.right = new_left + rect.width;
    }           
}