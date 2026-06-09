/**
 * Orchestrates the transition into the boss encounter by initializing unique level components.
 * 
 * This function triggers the boss-specific background music, prepares the boss health bar, 
 * spawns the boss ship and environmental hazards (asteroids), and modifies the player's 
 * weapon state. It also includes a delayed sequence to clear remaining standard enemies 
 * and grant the player an A-Bomb power-up.
 * 
 * @function initalize_boss_level
 * @returns {void}
 * 
 * @description
 * 1. Switches background music to the boss theme.
 * 2. Initializes the Boss HP progress bar via `progress_bar_setup`.
 * 3. Spawns the boss entity and asteroid hazard.
 * 4. Forces player weapons to 'Dual Fire' mode.
 * 5. After a delay (`LEVEL_DELAY_MS`):
 *    - Triggers `explode_all_spacekrafts` if any regular enemies remain active.
 *    - Increments the player's A-Bomb inventory.
 *    - Notifies the player via the center HUD display.
 * 
 * @see {@link explode_all_spacekrafts} For the mass-destruction cleanup logic.
 * @see {@link boss_enemy_setup} For boss spawning details.
 */
function initalize_boss_level() {     

    play_bg_music(BOSS_SETUP_CONFIG.BG_AUDIO_KEY);    
    
    boss_enemy_setup();
    progress_bar_setup(); 

    explode_all_spacekrafts();

    weapons.flags.dual_lazer = false;
    weapons.dual_fire_shot = true;

    setTimeout(function () {     
           
        animate_asteroid();   
      
        game_data.counters.a_bomb ++;
        update_left_display();     
       
    }, BOSS_SETUP_CONFIG.LEVEL_DELAY_MS);
}

/**
 * Configures and spawns the main boss entity into the game world.
 * 
 * This function creates the DOM wrapper for the boss, uses an asynchronous loader 
 * for the boss image asset, and performs an introductory animation from an 
 * "off-screen" position to the starting battle position. It also triggers 
 * visual and audio effects upon appearance.
 * 
 * @function boss_enemy_setup
 * @returns {void}
 * 
 * @description
 * 1. Creates a container element based on `BOSS_WRAPPER_CLASS`.
 * 2. Positions the container at an initial off-screen coordinate.
 * 3. Invokes `unified_image_loader` to fetch the boss sprite.
 * 4. On successful load:
 *    - Appends the image to the container and triggers lightning/audio effects.
 *    - Animates the boss to its on-screen starting position (`INITIAL_ANIM_POS_Y`).
 * 5. On animation completion:
 *    - Performs a safety check on player health; if dead, triggers `boss_exit`.
 *    - Initiates the boss attack loop via `boss_phase_scheduler`.
 * 
 * @global {Object} boss_level_entities - Stores the reference to the boss element and image.
 * @see {@link unified_image_loader} For the asset loading mechanism.
 * @see {@link boss_phase_scheduler} For the logic governing boss attack patterns.
 */
function boss_enemy_setup() {
    
    const { OUT_OF_SCREEN_POS_X, OUT_OF_SCREEN_POS_Y, BOSS_WRAPPER_CLASS, BOSS_IMG_SRC, BOSS_IMG_CLASS,
            AUDIO_KEY, INITIAL_ANIM_DURATION_MS, INITIAL_ANIM_OFFSET_X, INITIAL_ANIM_POS_Y
          } = BOSS_SETUP_CONFIG;

    const boss_frame = $(`<div class=${BOSS_WRAPPER_CLASS}></div>`);
    boss_frame.appendTo($("body"))    
    .css({
        "left": $(window).width() - boss_frame.width() - OUT_OF_SCREEN_POS_X,    
        "top": OUT_OF_SCREEN_POS_Y       
        })
    .hide();

    boss_level_entities.boss.element = boss_frame;
   
    unified_image_loader(BOSS_IMG_SRC, (boss_image_element)=> {
        if (!boss_image_element || boss_image_element.length === 0) {
            console.error("Error: Boss image failed to load or is corrupted!");
            boss_frame.remove(); 
            base_level_entities.boss = null; 
            return;
        }
        
        boss_level_entities.boss.img_element = boss_image_element;
        boss_image_element.addClass(BOSS_IMG_CLASS)
        .appendTo(boss_frame)
        .show();
        boss_frame.show();

        initial_lightning_effect();
        audio_play(AUDIO_KEY);
       
        boss_frame.animate({
            "left": $(window).width() - boss_frame.width() - INITIAL_ANIM_OFFSET_X,
            "top": INITIAL_ANIM_POS_Y
        }, INITIAL_ANIM_DURATION_MS,
            function () 
            {  
            if(base_level_entities.bazis.hp < 1 && base_level_entities.bazis.lives < 1){  
                boss_exit();
            }     
            boss_phase_scheduler(boss_level_entities.boss);                                  
        });
    });   
}