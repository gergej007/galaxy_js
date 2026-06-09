/**
 * Orchestrates the creation and initialization of a bounty container.
 * 
 * This controller ensures that only one container exists at a time, manages its 
 * health state, determines its horizontal movement direction based on the current 
 * level's pattern, and initiates the movement animation if gameplay is active.
 * 
 * @function bounty_container_controller
 * @returns {void}
 * 
 * @description
 * 1. Checks if a container already exists in the DOM; exits early to prevent duplicates.
 * 2. Activates the `bounty_flag` global game state.
 * 3. Resets the bounty entity's HP and generates a new DOM element via `get_bounty_container`.
 * 4. Assigns a movement direction ('right' or 'left') derived from `current_level_config`.
 * 5. If `traffic_flag` is active, triggers the movement animation via `animate_bounty_container`.
 * 
 * @global {Object} base_level_entities - Stores the reference to the active bounty data and element.
 * @global {Object} game_data - Updated with the bounty encounter status.
 * @see {@link get_bounty_container} For the element creation logic.
 * @see {@link animate_bounty_container} For the physics and movement logic.
 */
function bounty_container_controller() {  
     
    if( base_level_entities.bounty?.element?.length > null){   
        return;
    }
    const { RIGHT_DIRECTION, LEFT_DIRECTION} = BOUNTY_CONTAINER_CONFIG;

    game_data.game_states.bounty_flag = true;  
    
    const bounty_data = base_level_entities.bounty;
    bounty_data.hp = bounty_data.max_hp;
    const new_element = get_bounty_container();
    bounty_data.element = new_element; 
    
    const direction_pattern = current_level_config.direction_pattern || 1;      

    const bounty_direction = (direction_pattern === 1) ? RIGHT_DIRECTION : LEFT_DIRECTION;
    bounty_data.direction = bounty_direction;    
    if( game_data.game_states.traffic_flag ){
        animate_bounty_container( bounty_data );   
    }
    else console.log("Bounty container is failed due to game state");
}

/**
 * Executes the visual appearance and traversal animation of a bounty container.
 * 
 * This function schedules the container's arrival after a randomized delay. It 
 * initializes the health (HP) indicator as a child element, sets the starting 
 * coordinates, and animates the container across the screen. On completion, it 
 * handles DOM cleanup and state resetting.
 * 
 * @function animate_bounty_container
 * @param {Object} bounty_data - The state object for the bounty entity.
 * @param {jQuery} bounty_data.element - The jQuery-wrapped DOM element of the container.
 * @returns {void}
 * 
 * @description
 * 1. Calculates a random entry delay based on `RND_DELAY_MULTIPLIER`.
 * 2. Within the delay timer:
 *    - Appends a new HP indicator widget via `get_hp_indicator`.
 *    - Uses `calculate_container_x/y` to determine screen entry and exit points.
 *    - Scales animation duration relative to window width via `DURATION_MULTIPLIER`.
 *    - Initiates a jQuery `.animate()` call to move the container horizontally.
 * 3. On animation completion (off-screen):
 *    - Removes the element from the DOM.
 *    - If the container survived the pass without being destroyed, resets its data state.
 * 
 * @see {@link calculate_container_x} For entry/exit coordinate logic.
 * @see {@link get_hp_indicator} For the visual health bar setup.
 */
function animate_bounty_container(bounty_data) {

    const { RND_DELAY_MULTIPLIER, RND_DELAY_SEED, DURATION_MULTIPLIER, HP_INDICATOR_POSITION_PX,
            ANIMATION_EASING } = BOUNTY_CONTAINER_CONFIG;

    const delay_appearance = RANDOM_PROVIDER.get_in_range(RND_DELAY_MULTIPLIER, RND_DELAY_SEED);
    //Math.round( Math.random() * RND_DELAY_MULTIPLIER ) + RND_DELAY_SEED;    
    setTimeout(() => 
    {    
        const bounty_element = bounty_data.element; 
        if ( !bounty_element?.length) {
            console.log("Bounty animation aborted");
            return;
        }        
        bounty_element.show();
        
        const bnty_container_duration = ($(window).width() * DURATION_MULTIPLIER );       
        const hp_indicator = get_hp_indicator();
        hp_indicator.appendTo(bounty_element);
        // Get Bounty css and animation positions
        const initial_y_poz = calculate_container_y();
        const { initial_x_poz, anim_x_poz } = calculate_container_x( bounty_data);           

        bounty_element.css({
            "display" : "block",
            "left" : initial_x_poz,
            "top" : initial_y_poz
        });

        hp_indicator.css({
            "position": "absolute",
            "left": HP_INDICATOR_POSITION_PX,  
            "top": -HP_INDICATOR_POSITION_PX   
        });

        bounty_element.animate({
            "left" : anim_x_poz        
        }, bnty_container_duration, ANIMATION_EASING,
        function()
        {                                                       //  container goes off-screen 
            $(this).remove(); 
            if ( game_data.game_states.bounty_flag && base_level_entities.bounty.hp > 1 
                && !base_level_entities.powerup.element )
            {   
              reset_bounty_data(bounty_data);           
              game_data.game_states.bounty_flag = false;           
            }         
        });     

    }, delay_appearance);   
}

/**
 * Creates and appends a hidden bounty container to the document body, 
 * loading an image into it using a unified image loader.
 * 
 * @returns {jQuery} The jQuery object representing the created bounty container.
 */
function get_bounty_container() {
    const { CONTAINER_CLASS, IMG_SRC, IMG_CLASS} = BOUNTY_CONTAINER_CONFIG;
   
    const bounty_frame = $(`<div class=${CONTAINER_CLASS}></div>`);
    bounty_frame.hide();

    unified_image_loader( IMG_SRC, (bounty_img)=>{
        bounty_img.addClass(IMG_CLASS);
        bounty_img.appendTo(bounty_frame).show();       
    });
    
    bounty_frame.appendTo($("body"));  

    return bounty_frame;
}

