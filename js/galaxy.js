/**
 * Global keyboard listener for forcing a clean game state reset.
 * 
 * Intercepts the configured reset key (default: F5) to:
 * 1. Prevent the browser's default reload behavior.
 * 2. Generate a unique timestamp ('cache-buster').
 * 3. Force a full page reload via the URL API to ensure all assets 
 *    and state objects are perfectly synchronized from the server.
 * 
 * @listens keydown
 * @requires UI_CONFIG - Accesses the HARD_RESET key definition.
 */
$(document).on("keydown", function(e) {
    if (e.key === CORE_CONFIG.INPUT_KEYS.HARD_RESET) {                           // F5 key
        e.preventDefault(); 
        
        console.log("F5 pressed: Performing hard reset.");
        
        const url = new URL(window.location.href);
        url.searchParams.set(CORE_CONFIG.URL_PARAMS.CACHE_BUSTER, Date.now()); 
        window.location.href = url.toString();        
    }
});


primary_game_loop();

$(document).ready(
    function () {                         
        show_start_panel();
        create_background(); 
        
        initalize_displays();

        create_bazis();        
        update_base_entity_rects();  
        bazis_key_binding();
        
        game_level_change(1);  
        initialize_all_pools(game_data.levels.act_level);                    
                                           
        update_right_display();
        score_dependent_fns();  
    }
);

/**
 * Resets the player ship (Bazis) to the default starting position.
 * 
 * This function handles the "respawn" sequence by:
 * 1. Activating the exit_flag to pause collisions and game logic.
 * 2. Stopping all active jQuery animations and clearing inline styles.
 * 3. Hiding the ship and centering it horizontally at the bottom of the viewport.
 * 4. Scheduling a 1000ms delay to restore visibility and re-enable active physics.
 * 
 * @function bazis_reset
 * @requires jQuery - Used for element animation management and positioning.
 * @requires CORE_CONFIG - Accesses PLAYER.RESET_DELAY_MS and WIDTH_OFFSET.
 * @global {Object} game_data - Updates exit_flag to protect the ship during reset.
 * @global {Object} base_level_entities - Accesses the Bazis element and exploding state.
 */
function bazis_reset() {
    game_data.game_states.exit_flag = true; 

    const { RESET_DELAY_MS, WIDTH_OFFSET, HIDDEN, VISIBLE, AUDIO_KEY} = CORE_CONFIG.BAZIS_RESET;
    const bazis_data = base_level_entities.bazis;  
    const bazis_element = bazis_data.element;

    bazis_element.stop(true, true)
    .css({
        "top": "",
        "left": ""
    });

    bazis_element.css("visibility", HIDDEN);
    bazis_element.css({
        "left": $(window).width() / 2 - WIDTH_OFFSET,
        "top": $(window).height() - bazis_element.height()
    });
  
    setTimeout(function () { 
        
        bazis_element.css("visibility", VISIBLE);
        bazis_data.is_exploding = false;
        game_data.game_states.exit_flag = false;
     }, RESET_DELAY_MS);
    audio_play(AUDIO_KEY);
}

/**
 * Halts all standard enemy activity and clears active entities from the battlefield.
 * 
 * This function is typically called during game pauses or state transitions (entering Boss phase).
 * If the traffic_flag is disabled, it:
 * 1. Cancels the pending enemy spawn timer.
 * 2. Refreshes the score display.
 * 3. Iterates through the enemy ship pool, deactivating and returning all active ships.
 * 4. Iterates through the enemy projectile pool, deactivating and returning all active shots.
 * 
 * @function stop_base_level_enemies
 * @global {number} spacekraft_spawn_timeout - The ID of the current spawn timer.
 * @global {Object} game_data - Accesses current game state flags.
 * @global {Object} base_level_entities - Accesses pools for ships and shots.
 * @requires update_right_display - To sync the HUD during the halt.
 * @requires return_enemy_to_pool - To recycle ship entities.
 * @requires return_enemy_shot_to_pool - To recycle projectile entities.
 */
function stop_base_level_enemies() {
    if (!game_data.game_states.traffic_flag) {
        clearTimeout(spacekraft_spawn_timeout);           
        update_right_display();

        base_level_entities.enemy_ships.filter( enemy_data => 
            enemy_data.is_active).forEach(
                enemy_data => {
                    return_enemy_to_pool(enemy_data);
                }); 

       base_level_entities.enemy_shots.filter( enemy_shot_data => 
        enemy_shot_data.is_active).forEach(
            enemy_shot_data => {
                return_enemy_shot_to_pool(enemy_shot_data)
            });                   
    }  
}

/**
 * Asynchronously loads an image and executes a callback once the asset is ready.
 * Handles both fresh network requests and cached images.
 * 
 * @param {string} relative_src - The filename of the image.
 * @param {function} on_ready - Callback receiving the jQuery-wrapped <img> element.
 */
function unified_image_loader(relative_src, on_ready) {
    const { IMAGES } = CORE_CONFIG.PATHS;
    const full_src = `${IMAGES}${relative_src}`;
    const $img = $("<img />").attr("src", full_src).hide();

    const handle_ready = () => {
        if ($img.data('img-ready')) return;
        $img.data('img-ready', true);
        
        // Pass the ready image back to the caller
        if (typeof on_ready === 'function') {
            on_ready($img);
        }
    };

    // 1. Attach the load listener
    $img.on("load", handle_ready);

    // 2. Immediate cache check
    if ($img[0].complete && $img[0].naturalWidth !== 0) {
        handle_ready();
    }

    // 3. Error handling
    $img.on("error", () => {
        console.error(`Failed to load image: ${relative_src}`);
        $img.remove();
    });
}

/**
 * Evaluates the player's score to trigger game progression and state transitions.
 * 
 * This function serves as the central logic hub for:
 * 1. **Level Progression**: Increments the game level, grants bonus lives, and 
 *    triggers level-change configurations when the 'act_limit' is reached.
 * 2. **Bounty Triggers**: Initiates special item/power-up phases based on score thresholds.
 * 3. **UI Synchronization**: Ensures the HUD (left display) reflects the current score state.
 * 4. **Boss Transition**: Halts standard gameplay traffic and initializes the 
 *    boss level once the 'boss_limit' is achieved.
 * 
 * @function score_dependent_fns
 * @requires game_data - Accesses score, limits, and current game states.
 * @requires base_level_entities - Accesses player lives and power-up state.
 * @requires GAME_CONSTANTS - Accesses MAX_GAME_LEVEL limit.
 * @requires CORE_CONFIG - Accesses BOSS_LEVEL configuration delays.
 * @requires update_center_display - Displays level-up notifications.
 * @requires initalize_boss_level - Sets up the final encounter environment.
 */
function score_dependent_fns() {

    const player_score = game_data.counters.score;
    const { act_limit, boss_limit, bounty_limit } = game_data.limits;

    // --- 1. Level Up Logic ---
    if (player_score >= act_limit && game_data.game_states.traffic_flag) {

        if (game_data.levels.act_level >= GAME_CONSTANTS.MAX_GAME_LEVEL) {
            
            game_data.limits.act_limit = Infinity;
            console.log("INFO: Max level reached. No further level-ups.");
            
            return; 
        }

        game_data.levels.act_level++;
        console.log(`Level Up! New Level: ${game_data.levels.act_level}`);

        // Call game_level_change to load the new level's configuration and calculate its next act_limit
        game_level_change(game_data.levels.act_level);

        update_center_display("+ LEVEL UP +");
        base_level_entities.bazis.lives++;

        access_missed_weapons();

        // --- 2. Bounty Logic (Linked to Level Up) ---
        // This will now use the new bounty_score_threshold from the currentLevelConfig
        bounty_container_controller();
        base_level_entities.powerup.level++;      
    }

    // --- 3. First Bounty Trigger (if it's independent of level up for level 1) ---
    
    if (game_data.levels.act_level === 1 && player_score >= bounty_limit) {
        bounty_container_controller();
        game_data.limits.bounty_limit = Infinity; // Use Infinity instead of a very large number for clarity
        base_level_entities.powerup.level++;          
    }

    // --- 4. UI Updates ---
    update_left_display();   

    // --- 5. Boss Logic ---
    // Initalize Boss level
    if (player_score >= boss_limit) {
       
        game_data.game_states.traffic_flag = false;
        stop_base_level_enemies();                                      
        if (!game_data.game_states.boss_flag ) {
          game_data.game_states.boss_flag = true;
          initalize_boss_level();
    }
        setTimeout(() => {
            explode_all_spacekrafts();
        }, CORE_CONFIG.BOSS_LEVEL.ERASE_ENEMIES_DELAY_MS);
    }
}

/**
 * Increments kill counts and awards randomized points to the player's total score.
 * 
 * This function:
 * 1. Increments the global 'killed' counter if gameplay traffic is active.
 * 2. Calculates a randomized point value using level-specific multipliers and seeds.
 * 3. Triggers 'score_dependent_fns' to evaluate level progression or boss triggers.
 * 4. Refreshes the right HUD display to show updated stats.
 * 
 * @function add_score_n_hit
 * @global {Object} game_data - Accesses and updates score and kill counters.
 * @global {Object} current_level_config - Provides point calculation constants.
 * @requires score_dependent_fns - Evaluates if the new score triggers a state change.
 * @requires update_right_display - Refreshes the score and kill count UI.
 */
function add_score_n_hit()
{   if( game_data.game_states.traffic_flag){
    game_data.counters.killed++;
}
    const {hit_score_multiplier, hit_score_seed} = current_level_config;
    game_data.counters.score += Math.ceil(Math.random() * hit_score_multiplier) + hit_score_seed;
    score_dependent_fns();   
    update_right_display();
}
