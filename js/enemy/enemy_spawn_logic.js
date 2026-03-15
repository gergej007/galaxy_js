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
    const rnd_duration = Math.round(Math.random() * level_multiplier_speed) + level_seed_speed;
    const rnd_width = Math.round(Math.random() * 86) + 120;
    const spacekraft_variance = Math.ceil(Math.random() * spacekraft_variance_multiplier);

    const enemy_element = enemy_data.element;
       
    const enemy_id = generate_enemy_Id();
    
    enemy_data.id = enemy_id; 
    enemy_data.speed = rnd_duration;
    enemy_data.hp = enemy_data.max_hp;      
    enemy_data.is_active = true;
    enemy_element.removeClass("locked");
    // enemy_element.removeClass("moving_left moving_right locked");
    /*enemy_element.find(".urhajo_img").remove();*/
    // enemy_data.img_element.remove();

    enemy_element.hide();

    await new Promise((resolve) => {
            unified_image_loader(`enemy/urhajo${spacekraft_variance}.png`, (spacekraft_img)=>{

                let original_width = spacekraft_img[0].naturalWidth;
                let original_height = spacekraft_img[0].naturalHeight;
                const new_height = (original_height / original_width) * rnd_width;
                spacekraft_img.appendTo(enemy_element)
                .addClass("urhajo_img").show();
                
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
function setup_spacekraft_animation_behaviour( enemy_data, pozy_top, pozx, anim_pozx, moving_class, transform_Y, rnd_duration) {
    const enemy_element = enemy_data.element; 
    
    enemy_element.css({
        "left": pozx,
        "top": pozy_top,
        "z-index": 100, 
        "transform": transform_Y
    });
    enemy_element.show(); 
   
    enemy_data.rect = enemy_element[0].getBoundingClientRect();
    
    spacekraft_shot(enemy_data); 
    
    //enemy_element.addClass(moving_class);          // ********************** delete
    enemy_data.moving_direction = moving_class;
 
    enemy_element.animate({
        "left": anim_pozx
    }, rnd_duration, "linear", function () {
        
        return_enemy_to_pool(enemy_data);       
    });
}

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

    let selected_j = -1;                                                      
    for(let i = 1; i <= move_pattern; i++) {
        let current_j = move_pattern - (i - 1); 
        let hr_line_bottom = ($(window).height() / move_pattern) * current_j;
        let hr_line_top = hr_line_bottom - ($(window).height() / move_pattern);

        if(pozy_top >= hr_line_top && pozy_top < hr_line_bottom) {
            selected_j = current_j;
            break; 
        }
    }
    if (selected_j !== -1) {
        let pozx;
        let moving_class;
        let anim_pozx;
        let transform_Y;

        if( selected_j % 2 != 0){
            pozx = 0 - enemy_element.width();
            moving_class = "moving_right";
            anim_pozx = $(window).width();
            transform_Y = "rotateY(0deg)";
        } else {
            pozx = $(window).width()+10;
            moving_class = "moving_left";
            anim_pozx = 0-enemy_element.width();
            transform_Y = "rotateY(180deg)";
        }        
        return {
            selected_j: selected_j,
            pozx: pozx,
            anim_pozx: anim_pozx,
            moving_class: moving_class,
            transform_Y: transform_Y
        };
    } else return null;
}

/**
 * Checks if a newly spawned enemy spacekraft is positioned within a specific
 * "bounty lane" and meets certain movement pattern conditions, indicating it
 * should be removed or handled specially (e.g., to prevent collision with a bounty object).
 *
 * @param {jQueryObject} enemy_element - The jQuery object representing the enemy spacekraft.
 * @param {number} pozy_top - The vertical (top) position of the enemy.
 * @param {number} move_pattern - The movement pattern of the enemy (used for specific lane conditions).
 * @param {jQueryObject} bounty_element - The jQuery object representing the bounty element.
 * @param {DOMRect} bounty_rect - The DOMRect object representing the position and dimensions of the bounty.
 * @returns {boolean} True if the enemy is in the bounty lane and meets removal criteria, false otherwise.
 */
function check_enemy_in_bounty_lane( enemy_element, pozy_top, move_pattern, bounty_element, bounty_rect) {
    if (game_data.game_states.bounty_flag && bounty_element.length > 0  
        && bounty_element.is(':visible') && bounty_rect) {
        if (pozy_top + enemy_element.height() >= bounty_rect.top) {
            if ((move_pattern == 1 && bounty_rect.left < $(window).width() * 0.6)
                 || (move_pattern > 1 )) {
                
                console.log("Enemy removed from bounty's lane.");               
               
                return true;
            }
        }
    }
    return false;
}