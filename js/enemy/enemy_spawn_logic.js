/**
 * Asynchronously configures an inactive enemy spacekraft retrieved from the pool,
 * preparing it for a new spawn. This involves:
 * - Generating random properties (movement speed, visual width, image variance).
 * - Setting/resetting essential game-state data on the `enemy_data` object (HP, active status, ID).
 * - Dynamically loading the enemy's image and setting the `spacekraft_frame`'s dimensions based on image aspect ratio.
 * - Making the enemy's image visible once loaded.
 *
 * This function waits for the image to load to ensure correct dimensions are applied.
 *
 * @param {object} enemy_data - The enemy data object from the enemyPool, which contains the `element` (jQuery object) to configure.
 * @returns {Promise<void>} A Promise that resolves once the enemy's image is loaded and dimensions are set, and the enemy is ready for positioning.
 *                           Rejects if the image fails to load.
 */
async function configure_pooled_spacekraft( enemy_data) {

    const {level_multiplier_speed, level_seed_speed, spacekraft_variance_multiplier, enemy_hp} = current_level_config;
    const { ELEM_WIDTH_MULTIPLIER, ELEM_WIDTH_SEED, IMG_SRC, IMG_EXTENSION, ELEM_CLASS,
            LOCKED_CLASS, 
    } = ENEMY_SPAWN_CONFIG;

    const rnd_duration = Math.round(Math.random() * level_multiplier_speed) + (level_seed_speed * $(window).width());
    const rnd_width = Math.round(Math.random() * ELEM_WIDTH_MULTIPLIER) + ELEM_WIDTH_SEED;
    const spacekraft_variance = Math.ceil(Math.random() * spacekraft_variance_multiplier);

    const enemy_element = enemy_data.element;
       
    const enemy_id = generate_enemy_Id();
    
    enemy_data.id = enemy_id; 
    enemy_data.speed = rnd_duration;
    enemy_data.max_hp = enemy_hp;
    enemy_data.hp = enemy_data.max_hp;      
    enemy_data.is_active = true;
    enemy_element.removeClass( LOCKED_CLASS );
                                                             
    enemy_element.hide();   

    await new Promise((resolve) => {
        const img_url = `${IMG_SRC}${spacekraft_variance}${IMG_EXTENSION}`;
        unified_image_loader(img_url, (spacekraft_img)=>{

                let original_width = spacekraft_img[0].naturalWidth;
                let original_height = spacekraft_img[0].naturalHeight;
                const new_height = (original_height / original_width) * rnd_width;
                spacekraft_img.appendTo(enemy_element)
                .addClass(ELEM_CLASS).show();
                
                enemy_element.css({
                    "width": rnd_width,
                    "height": new_height,
                    "filter" : "none"                    
                });          
                spacekraft_img.show(); 
                enemy_data.img_element = spacekraft_img;           
                                                               
                resolve();      
            });           
    });    
}

/**
 * Generates a unique string ID for an enemy ship and increments the global counter.
 * 
 * @function generate_enemy_Id
 * @returns {string} A unique ID in the format 'enemy-N'.
 */
let enemy_ship_Id = 0;
function generate_enemy_Id() {
    return `enemy-${enemy_ship_Id++}`;
}

/**
 * Sets the initial visual state and initiates the movement animation for a newly spawned enemy spacekraft.
 * This includes applying its calculated position, rotation, and making it visible.
 * It also triggers the enemy's shooting behavior and ensures the enemy is returned to the pool
 * upon completing its movement animation.
 *
 * @param {object} enemy_data - The enemy data object from the enemyPool, containing the `element` and other properties.
 * @param {number} pozy_top - The vertical (top) position for the enemy's initial placement.
 * @param {number} pozx - The horizontal (left) position for the enemy's initial placement (start of animation).
 * @param {number} anim_pozx - The horizontal (left) position for the enemy's animation target (end of animation).
 * @param {string} moving_class - The CSS class indicating the enemy's horizontal movement direction (e.g., "moving_right").
 * @param {string} transform_Y - The CSS transform value (e.g., "rotateY(0deg)") for visual orientation.
 * @param {number} rnd_duration - The duration in milliseconds for the enemy's movement animation across the screen.
 * @returns {void}
 */
function setup_spacekraft_animation_behaviour( enemy_data, lane_info) {
    const enemy_element = enemy_data.element; 
    const { pozx, anim_pozx, moving_class, transform_Y } = lane_info;
    const { Z_INDEX, ANIM_EASING } = ENEMY_SPAWN_CONFIG;
    const pozy_top = enemy_data.rect.top;
    const rnd_duration = enemy_data.speed;
    
    enemy_element.css({
        "left": pozx,
        "top": pozy_top,
        "z-index": Z_INDEX, 
        "transform": transform_Y
    });
    enemy_element.show(); 
   
    enemy_data.rect = enemy_element[0].getBoundingClientRect();
    
    spacekraft_shot(enemy_data); 
    
    enemy_data.moving_direction = moving_class;
 
    enemy_element.animate({
        "left": anim_pozx
    }, rnd_duration, ANIM_EASING, function () {
        
        return_enemy_to_pool(enemy_data);       
    });
}


/**
 * Executes a GPU-accelerated smooth movement animation.
 */  /*
function setup_spacekraft_animation_behaviour(enemy_data, lane_info) {
    const { element, speed } = enemy_data;
    const { pozx, anim_pozx, transform_Y } = lane_info;
    const $el = $(element);

    // 1. Reset state & Teleport to start
    $el.css({
        "transition": "none",
        "display": "block",
        "top": enemy_data.rect.top + "px",
        "left": "0px", // Base position at 0
        "transform": `${transform_Y} translateX(${pozx}px)`, // Start off-screen
        "will-change": "transform" // Hint to the GPU to prepare
    });

    // 2. Force reflow to commit start position
    void $el[0].offsetHeight;

    // 3. Start the smooth GPU-accelerated journey
    $el.css({
        "transition": `transform ${speed}ms linear`,
        "transform": `${transform_Y} translateX(${anim_pozx}px)`
    });

    // 4. Cleanup when finished
    $el.one('transitionend', () => {
        return_enemy_to_pool(enemy_data);
    });
}*/

/**
 * Divides the screen into horizontal lanes and determines which lane an enemy
 * should spawn in based on its random vertical position (`pozy_top`).
 * It also calculates the initial and final horizontal positions, movement class,
 * and CSS transform for the enemy based on the selected lane and its intended direction.
 *
 * @param {object} enemy_data - The enemy data object, containing its `element` (jQuery object) for width calculations.
 * @param {number} pozy_top - The random vertical position (top) for the enemy's initial placement.
 * @param {number} move_pattern - The number of horizontal lanes to divide the screen into.
 * @returns {{selected_j: number, pozx: number, anim_pozx: number, moving_class: string, transform_Y: string}|null}
 *          An object containing the selected lane index (`selected_j`),
 *          the initial (`pozx`) and final (`anim_pozx`) horizontal positions,
 *          the CSS class for movement (`moving_class`), and the CSS transform (`transform_Y`).
 *          Returns `null` if no valid lane is found (enemy spawns out of vertical bounds).
 */
function divide_screen_to_lanes(enemy_data, pozy_top, move_pattern) {
    if( !enemy_data || !enemy_data.element){
        return;
    }
    const enemy_element = $(enemy_data.element);

    const {VERTICAL_OFFSET, PLAY_AREA_HEIGHT_FACTOR } = ENEMY_SPAWN_CONFIG;
    const play_area_height = ($(window).height() - VERTICAL_OFFSET) * PLAY_AREA_HEIGHT_FACTOR;

    const enemy_height = enemy_data.rect?.height || enemy_element.outerHeight();
    const enemy_center_y = pozy_top + (enemy_height / 2);

    let final_lane = -1;                                                      
    for(let i = 1; i <= move_pattern; i++) {
        let current_lane = move_pattern - (i - 1); 
        let hr_line_bottom = ((play_area_height / move_pattern) * current_lane) + VERTICAL_OFFSET;
        let hr_line_top = hr_line_bottom - (play_area_height / move_pattern);

        if(enemy_center_y >= hr_line_top && enemy_center_y < hr_line_bottom) {
            final_lane = current_lane;
            break; 
        }
    }
    if (final_lane !== -1) {
        const { RIGHT_DIRECTION, LEFT_DIRECTION, ROTATE_0_DEG, ROTATE_180_DEG} = ENEMY_SPAWN_CONFIG;
        let pozx;
        let moving_class;
        let anim_pozx;
        let transform_Y;

        if( final_lane % 2 != 0){
            pozx = -enemy_element.width();
            moving_class = RIGHT_DIRECTION;
            anim_pozx = $(window).width();
            transform_Y = ROTATE_0_DEG;
        } else {
            pozx = $(window).width() /*+ 10*/;
            moving_class = LEFT_DIRECTION;
            anim_pozx = -enemy_element.width();
            transform_Y = ROTATE_180_DEG;
        }        
        return {
            selected_j: final_lane,
            pozx: pozx,
            anim_pozx: anim_pozx,
            moving_class: moving_class,
            transform_Y: transform_Y
        };
    } else return null;
}

/**
 * Checks if a proposed enemy spawn position conflicts with any active enemies already on screen.
 * This prevents enemies from spawning too close to each other, especially at similar vertical positions.
 *
 * @param {object} proposed_enemy_data - The enemy_data object for the new enemy (needs current .rect).
 * @param {number} proposed_pozy_top - The proposed top (Y) position of the new enemy.
 * @returns {boolean} True if there's a spatial conflict, false otherwise.
 */     
function check_spawn_proximity_conflict(proposed_enemy_data) {
    const { MIN_HORIZONTAL_SPACING_PX } = ENEMY_SPAWN_CONFIG;
    const p_rect = proposed_enemy_data.rect;
    const p_bottom = p_rect.top + p_rect.height;
    const p_right = p_rect.left + p_rect.width;

    // Check against the array of active enemy data, not the DOM
    return base_level_entities.enemy_ships.some(active_enemy => {
        if (!active_enemy.is_active || active_enemy.id === proposed_enemy_data.id) return false;

        const a_rect = active_enemy.rect;
        const a_bottom = a_rect.top + a_rect.height;
        const a_right = a_rect.left + a_rect.width;

        // Vertical Overlap Check
        const v_overlap = p_rect.top < a_bottom && p_bottom > a_rect.top;
        if (!v_overlap) return false;

        // Horizontal Overlap Check (with spacing)
        const h_overlap = p_rect.left < (a_right + MIN_HORIZONTAL_SPACING_PX) && 
                          p_right > (a_rect.left - MIN_HORIZONTAL_SPACING_PX);

        return h_overlap;
    });
}

/**
 * Checks if a newly spawned enemy spacekraft is positioned within a specific
 * "bounty lane" and meets certain movement pattern conditions, indicating it
 * should be removed or handled specially (e.g., to prevent collision with a bounty object).
 *
 * @param {jQueryObject} enemy_element - The jQuery object representing the enemy spacekraft.
 * @param {number} pozy_top - The vertical (top) position of the enemy.
 * @param {number} move_pattern - The movement pattern of the enemy (used for specific lane conditions).
 * @param {object} bounty_data - The object data representing the bounty container.
 * @returns {boolean} True if the enemy is in the bounty lane and meets removal criteria, false otherwise.
 */
function check_enemy_in_bounty_lane( enemy_element, pozy_top, move_pattern, bounty_data) {
    if (!bounty_data || !bounty_data.element || bounty_data.element.length === 0) {
        return false;
    } 

    const {BOUNTY_SAFE_ZONE_X_FACTOR} = ENEMY_SPAWN_CONFIG;
    
    if (game_data.game_states.bounty_flag && bounty_data.rect 
        && (bounty_data.element.is(':visible') || base_level_entities.powerup?.element?.is(':visible') )) {
        if (pozy_top + enemy_element.height() >= bounty_data.rect.top) {
            if ((move_pattern == 1 && bounty_data.rect.left < $(window).width() * BOUNTY_SAFE_ZONE_X_FACTOR)
                 || (move_pattern > 1 )) {
                
                console.log("Enemy removed from bounty's lane.");               
               
                return true;
            }
        }
    }   
    return false;
}