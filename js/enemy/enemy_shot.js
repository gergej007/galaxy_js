/**
 * Initiates and manages the automated firing sequence for an individual enemy ship.
 * 
 * The function implements a recursive firing loop that continues as long as the 
 * enemy is visible. It includes safety checks to prevent firing when the enemy 
 * is too close to the base or off-screen, and uses a pooling system for projectiles.
 * 
 * @function spacekraft_shot
 * @param {Object} enemy_data - The data object for the enemy ship attempting to shoot.
 * 
 * @returns {void}
 * 
 * @description
 * 1. Schedules an initial shot after a random delay defined in `ENEMY_SHOT_CONFIG`.
 * 2. Validates the existence and active state of both the enemy and the player base.
 * 3. Calculates target coordinates (`target_coords`) aimed at the base or the bottom of the screen.
 * 4. Requests a projectile from the pool via `get_enemy_shot_from_pool`.
 * 5. Performs safety checks: calls check_no_fire_zones( bazis_data, enemy_data)
 * 6. If safe, initializes the projectile's starting position and triggers `projectile_selector`.
 * 7. Recursively calls itself with a new random frequency defined by `current_level_config` 
 *    as long as the enemy remains visible.
 */
function spacekraft_shot( enemy_data) {

    const { FIRST_SHOT_DELAY_MULTIPLIER, FIRST_SHOT_DELAY_SEED} = ENEMY_SHOT_CONFIG;
    const first_shot_delay = Math.round( Math.random() * FIRST_SHOT_DELAY_MULTIPLIER) + FIRST_SHOT_DELAY_SEED ;         

    setTimeout( ()=> {  
    const bazis_data = base_level_entities.bazis;

    if(!is_entity_valid(enemy_data) || !enemy_data.is_active || !is_entity_valid(bazis_data)){
        return;
    }   

    const bazis_rect = bazis_data.rect;      
    const enemy_element = enemy_data.element;
    const enemy_rect = enemy_data.rect;    
       
    const bazis_left = bazis_rect.left;
    const bazis_top = bazis_rect.top;
    const bazis_width = bazis_rect.width;
    const bazis_height = bazis_rect.height;
    const enemy_left = enemy_rect.left;
    const enemy_bottom = enemy_rect.bottom;
    const enemy_width = enemy_rect.width;

    const { BAZIS_TARGET_Y_DIVISOR, CSS_POSITION} = ENEMY_SHOT_CONFIG;
    
    // Bazis target X , Y
    let bazis_target_x = bazis_left + bazis_width / 2;
    let bazis_target_y = bazis_top + bazis_height / BAZIS_TARGET_Y_DIVISOR;
    
    const shot_initial_x = Math.round(enemy_left + enemy_width / 2); 
    const shot_initial_y = enemy_bottom;                

    if (bazis_top <= enemy_bottom) {                               // If Bazis is above enemy
        bazis_target_x = shot_initial_x; 
        bazis_target_y = $(window).height();   
    }    

    const target_coords = { bazis_target_x, bazis_target_y};

    const enemy_shot_data = get_from_pool(POOL_KEYS.ENEMY_SHOT);
    if( !enemy_shot_data) {
        console.log("enemy shot dropped due to invalid shot data!");
        return;
    }    
    enemy_shot_data.shooter_id = enemy_data.id;   
    
    if (check_no_fire_zones(bazis_data, enemy_data))
    {
        if( !enemy_shot_data?.element?.length ){
            console.log("enemy shot dropped due to invalid shot element!");
            return;
        }
        const enemy_shot_element = enemy_shot_data.element;

        enemy_shot_element.hide();
        enemy_shot_element.appendTo($("body"));
        enemy_shot_element.css({
            "left": shot_initial_x,
            "top": shot_initial_y,
            "position" : CSS_POSITION
        });                             
                
        projectile_selector( enemy_data, enemy_shot_data, target_coords);       
    }
    const {frequency_multiplier_projectile, frequency_seed_projectile } = current_level_config;
    
    if( enemy_element?.is(':visible')){
          let frequency = Math.round(Math.random() * frequency_multiplier_projectile) + frequency_seed_projectile;
          setTimeout(function () { 
            spacekraft_shot( enemy_data ); }, frequency);  
        }
    }, first_shot_delay); 
}

/**
 * Determines if an enemy is in a valid position to fire a projectile.
 * 
 * This function enforces "safe zones" to prevent enemies from shooting when they are
 * too close to the player's base (vertically) or too close to the screen edges (horizontally).
 * 
 * @function check_no_fire_zones
 * @param {Object} bazis_data - Data object for the player's base.
 * @param {Object} enemy_data - Data object for the enemy attempting to fire.
 * @returns {boolean} - Returns true if the enemy is in a valid firing zone, false otherwise.
 */
function check_no_fire_zones( bazis_data, enemy_data) {
    const { RIGHT_DIRECTION, LEFT_DIRECTION } = ENEMY_SPAWN_CONFIG;
    const { VERTICAL_SAFE_ZONE_OFFSET_PX, VERTICAL_SCREEN_EDGE_SAFE_PX} = ENEMY_SHOT_CONFIG;

    if( !is_entity_valid(bazis_data) || !is_entity_valid(enemy_data)){
        return false;
    }
    const {bottom: enemy_bottom ,left: enemy_left, width: enemy_width} = enemy_data.rect;
    const {height: bazis_height} = bazis_data.rect;

    const is_vertically_clear = (enemy_bottom < $(window).height() - ( bazis_height + VERTICAL_SAFE_ZONE_OFFSET_PX));
    const is_horizontally_in_range =
    (enemy_data.moving_direction === RIGHT_DIRECTION && enemy_left > -enemy_width 
     && enemy_left < $(window).width() - VERTICAL_SCREEN_EDGE_SAFE_PX) 
    || 
    (enemy_data.moving_direction === LEFT_DIRECTION && enemy_left < $(window).width() 
     && enemy_left > VERTICAL_SCREEN_EDGE_SAFE_PX);
   
    return is_horizontally_in_range && is_vertically_clear;
}

/**
 * Main orchestrator for selecting and initializing a new projectile.
 * 
 * This function calculates the physics (speed, slide/inertia) and type of 
 * the projectile based on the firing enemy's current state and level configuration.
 * It then delegates the trajectory calculation and animation execution to helper functions.
 * 
 * @function projectile_selector
 * @param {Object} enemy_data - The data object of the ship firing the shot.
 * @param {Object} enemy_data.rect - The current bounding box of the ship.
 * @param {string} enemy_data.moving_direction - The direction the ship is currently moving.
 * @param {Object} shot_data - An available projectile object retrieved from the pool.
 * @param {Object} target_coords - The current target coordinates (usually the player base).
 * @returns {void}
 */
function projectile_selector(enemy_data, shot_data, target_coords) {    
    if (!is_entity_valid(enemy_data) || !shot_data) return;

    // 1. Config & Data Setup
    const { RND_SHOT_TYPE, SHOT_X_SLIDE_PX } = ENEMY_SHOT_CONFIG;
    const { left: enemy_left, bottom: enemy_bottom } = enemy_data.rect;
    const { speed_multiplier_projectile, speed_seed_projectile } = current_level_config;

    // 2. Calculations
    const rnd_speed = Math.round(Math.random() * (speed_multiplier_projectile * ($(window).height() - enemy_bottom))) + speed_seed_projectile;
    const rnd_type = Math.round(Math.random() * RND_SHOT_TYPE);
    const slide_px = (enemy_data.moving_direction === ENEMY_SPAWN_CONFIG.RIGHT_DIRECTION ? 1 : -1) * 
                     parseInt((enemy_data.speed / $(window).width()) * SHOT_X_SLIDE_PX);

    // 3. Get Trajectory & Class name
    const target = get_shot_trajectory(rnd_type, enemy_left, slide_px, target_coords);
    const type_class = ENEMY_SHOT_CONFIG[`SHOT_TYPE_CLASS_${rnd_type}`];

    // 4. Fire
    lazer_audio();
    execute_projectile_animation(shot_data, target, rnd_speed, type_class);
}

/**
 * Calculates the target coordinates for a projectile based on its randomized type.
 * 
 * This logic separates 'targeted' shots (aimed at the player base) from 
 * 'untargeted' shots (linear fire with horizontal slide).
 * 
 * @function get_shot_trajectory
 * @param {number} type - The randomized shot type index (from ENEMY_SHOT_CONFIG).
 * @param {number} enemy_left - The current horizontal position of the firing enemy.
 * @param {number} slide_px - The calculated horizontal offset based on enemy speed.
 * @param {Object} target_coords - The coordinates of the player's base.
 * @param {number} target_coords.bazis_target_x - X-coordinate of the base.
 * @param {number} target_coords.bazis_target_y - Y-coordinate of the base.
 * @returns {Object} An object containing {x, y} destination coordinates.
 */
function get_shot_trajectory(type, enemy_left, slide_px, target_coords) {
    const { bazis_target_x, bazis_target_y } = target_coords;
    const window_height = $(window).height();

    // Types to behaviors: 0 & 2 are targeted, 1 & 3 are untargeted
    const behaviors = {
        0: { x: bazis_target_x, y: bazis_target_y },
        1: { x: enemy_left + slide_px, y: window_height },
        2: { x: bazis_target_x, y: bazis_target_y },
        3: { x: enemy_left + slide_px, y: window_height }
    };

    return behaviors[type] || behaviors[1]; 
}

/**
 * Executes the visual movement of a projectile and handles its lifecycle.
 * 
 * It applies the necessary CSS classes, initiates the jQuery animation, 
 * and ensures the projectile is returned to the object pool upon completion.
 * 
 * @function execute_projectile_animation
 * @param {Object} shot_data - The data object representing the projectile from the pool.
 * @param {jQuery} shot_data.element - The jQuery-wrapped DOM element of the shot.
 * @param {Object} target - The destination coordinates {x, y}.
 * @param {number} speed - The duration of the animation in milliseconds.
 * @param {string} typeClass - The CSS class associated with the specific shot type.
 * @returns {void}
 */
function execute_projectile_animation(shot_data, target, speed, type_class) {
    const { element } = shot_data;
    const { ANIM_EASING } = ENEMY_SPAWN_CONFIG;

    element
        .addClass(type_class)
        .show()
        .animate({
            "top": target.y,
            "left": target.x
        }, speed, ANIM_EASING, function () {
           
            return_enemy_shot_to_pool(shot_data);
        });
}