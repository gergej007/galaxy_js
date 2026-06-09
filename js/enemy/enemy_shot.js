/**
 * Initiates the recursive firing loop for an enemy ship, managing timing, 
 * geometry calculation, and projectile initialization.
 * 
 * @param {Object} enemy_data - Data object of the enemy ship attempting to shoot.
 */
function spacekraft_shot(enemy_data) {
    const { FIRST_SHOT_DELAY_MULTIPLIER, FIRST_SHOT_DELAY_SEED } = ENEMY_SHOT_CONFIG;
    const initial_delay = RANDOM_PROVIDER.get_in_range(FIRST_SHOT_DELAY_MULTIPLIER, FIRST_SHOT_DELAY_SEED);

    setTimeout(() => {
        const bazis_data = base_level_entities.bazis;

        if (!is_entity_valid(enemy_data) || !enemy_data.is_active || !is_entity_valid(bazis_data)) return;

        if (check_no_fire_zones(bazis_data, enemy_data)) {
            const { initial, target } = calculate_shot_geometry(enemy_data, bazis_data);
            const shot_data = initialize_shot_element(initial, enemy_data.id);

            if (shot_data) {
                projectile_selector(enemy_data, shot_data, target);
            }
        }

        if (enemy_data.element?.is(':visible')) {
            const { frequency_multiplier_projectile, frequency_seed_projectile } = current_level_config;
            const next_delay = RANDOM_PROVIDER.get_in_range(frequency_multiplier_projectile, frequency_seed_projectile);
            
            setTimeout(() => spacekraft_shot(enemy_data), next_delay);
        }
    }, initial_delay);
}

/**
 * Retrieves a shot from the pool and positions it at the starting point.
 */
function initialize_shot_element(initial_pos, enemy_id) {
    const shot_data = get_from_pool(POOL_KEYS.ENEMY_SHOT);
    
    if (!is_entity_valid(shot_data)) {
        console.warn("Shot dropped: Invalid shot data or element");
        return null;
    }

    shot_data.shooter_id = enemy_id;
    shot_data.element.hide().appendTo($("body")).css({
        left: initial_pos.x,
        top: initial_pos.y,
        position: ENEMY_SHOT_CONFIG.CSS_POSITION
    });

    return shot_data;
}

/**
 * Calculates initial spawn coordinates and target destination for a shot.
 */
function calculate_shot_geometry(enemy_data, bazis_data) {
    const { BAZIS_TARGET_Y_DIVISOR, HORIZONTAL_SAFE_ZONE_PX } = ENEMY_SHOT_CONFIG;
    const { rect: e_rect } = enemy_data;
    const { rect: b_rect } = bazis_data;

    const initial = {
        x: Math.round(e_rect.left + e_rect.width / 2),
        y: e_rect.bottom
    };

    let target_x = b_rect.left + b_rect.width / 2;
    let target_y = b_rect.top + b_rect.height / BAZIS_TARGET_Y_DIVISOR;

    // Override if player is above enemy
    if (b_rect.top - HORIZONTAL_SAFE_ZONE_PX <= e_rect.bottom) {
        target_x = initial.x;
        target_y = $(window).height();
    }

    return { initial, target: { bazis_target_x: target_x, bazis_target_y: target_y } };
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

    //  Config & Data Setup
    const { RND_SHOT_TYPE, SHOT_X_SLIDE_PX } = ENEMY_SHOT_CONFIG;
    const { left: enemy_left, bottom: enemy_bottom } = enemy_data.rect;
    const { speed_multiplier_projectile, speed_seed_projectile } = current_level_config;

    //  Calculations
    const rnd_speed = Math.round(Math.random() * (speed_multiplier_projectile * ($(window).height() - enemy_bottom))) + speed_seed_projectile;
    const rnd_type = RANDOM_PROVIDER.get_in_range(RND_SHOT_TYPE);
    const slide_px = (enemy_data.moving_direction === ENEMY_SPAWN_CONFIG.RIGHT_DIRECTION ? 1 : -1) * 
                     parseInt((enemy_data.speed / $(window).width()) * SHOT_X_SLIDE_PX);

    //  Get Trajectory & Class name
    const target = get_shot_trajectory(rnd_type, enemy_left, slide_px, target_coords);
    const type_class = ENEMY_SHOT_CONFIG[`SHOT_TYPE_CLASS_${rnd_type}`];

    //  Fire
    lazer_audio();
    execute_projectile_animation(shot_data, target, rnd_speed, type_class, rnd_type);
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
function execute_projectile_animation(shot_data, target, speed, type_class, type) {
    const { element } = shot_data;
    const { ANIM_EASING } = ENEMY_SPAWN_CONFIG;

    element
        .addClass(type_class)
        .show()
        .animate({
            "top": target.y,
            "left": target.x
        }, speed, ANIM_EASING, function () {
            
            if (type === 0 || type === 2){
                shots_explosion_lightning( shot_data.rect.left, shot_data.rect.top);
            }

            return_enemy_shot_to_pool(shot_data);
        });
}