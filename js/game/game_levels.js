/**
 * Holds the configuration settings for the currently active game level.
 * @type {Object}
 */
let current_level_config = {}; 

/**
 * Updates the game state and configuration when transitioning to a new level.
 * Handles configuration retrieval, score limit updates, pool re-initialization, 
 * and reset of enemy variety tracking.
 * 
 * @param {number} game_level - The numerical index of the level to activate.
 */
function game_level_change(game_level) {
   
    if (game_level > GAME_CONSTANTS.MAX_GAME_LEVEL) {
        console.log(`Maximum game level reached: ${GAME_CONSTANTS.MAX_GAME_LEVEL}. `);
        game_data.limits.act_limit = Infinity;               
        return; 
    }

    const new_config = GAME_LEVELS[game_level];

    if (!new_config) {
        console.error(`Configuration for level ${game_level} not found!`);
        game_data.limits.act_limit = Infinity;
        return;
    }

    current_level_config = { ...new_config };      // Create a shallow copy
         
    const target_limit = GAME_CONSTANTS.LEVEL_SCORE_LIMITS[game_level - 1];
    game_data.limits.act_limit = target_limit || Infinity;

    initialize_all_pools();
    console.log(`Level ${game_level} configuration applied. Next level up target: ${game_data.limits.act_limit}`);

    ENEMY_VARIETY_MANAGER.bag = []; 
}

/**
 * Checks the current game level and player's secondary weapon to automatically grant
 *  weapons that might have been missed, based on predefined level thresholds.
 * This ensures the player always has core abilities by certain points in the game.
 *
 * It updates `weapons.flags` and calls the corresponding activation
 * schedules for the granted weapon.
 *
 * @returns {void}
 */
function access_missed_weapons() {
       const current_level = game_data.levels.act_level; 
       const {DUAL_FIRE_SHOT_LEVEL_3, SINGLE_LAZER_LEVEL_5, TRACKING_LAZER_LEVEL_6, DUAL_LAZER_LEVEL_7} 
            = MISSED_WEAPONS_ACCESS_LEVEL;  
   
       // --- Level 3: Dual Fire Shot ---
       if(current_level === DUAL_FIRE_SHOT_LEVEL_3){
           if( !weapons.flags.dual_fire_shot) {
               weapons.flags.standard_shot = false;
               weapons.flags.dual_fire_shot = true;
           }
       }
       // --- Level 5: Single Lazer ---
       if (current_level === SINGLE_LAZER_LEVEL_5) { 
           if (!weapons.flags.single_lazer) { 
               weapons.flags.dual_fire_shot = false;
               weapons.flags.single_lazer = true;
            //    update_center_display("LAZER EQUIPPED !");            
           }
       }   
       // --- Level 6: Tracking Lazer ---
       if (current_level === TRACKING_LAZER_LEVEL_6) { 
           if (!weapons.flags.tracking_lazer) { 
               weapons.flags.tracking_lazer = true;
               tracking_lazer_scheduler();           
           }
       }

       // --- Level 7: Dual Lazer ---
       if(current_level === DUAL_LAZER_LEVEL_7) {
        if(!weapons.flags.dual_lazer) {
            weapons.flags.dual_lazer = true;
            // update_center_display("DUAL LAZER MOUNTED !");
        }
       }
}

/**
 * Determines the required size for the enemy pool based on the current game level.
 * @param {number} game_level - The current game level.
 * @returns {number} The target number of enemies for the pool.
 */
function get_required_enemy_poolsize(game_level) {       
    const {STAGE_1, STAGE_2, STAGE_3} = VARIABLE_POOLSIZE_AT_STAGE.ENEMY_POOLSIZE;          
       switch ( game_level){
          case 1: 
          case 2: return STAGE_1;
          case 3:
          case 4: return STAGE_2;
          case 5:
          case 6: 
          case 7: return STAGE_3;
          default: return STAGE_3;
       };
}
   
/**
 * Determines the required size for the enemy shot pool based on the current game level.
 * @param {number} game_level - The current game level.
 * @returns {number} The target number of enemy shots for the pool.
 */
function get_required_enemy_shot_poolsize(game_level) {
    const {STAGE_1, STAGE_2, STAGE_3} = VARIABLE_POOLSIZE_AT_STAGE.ENEMY_SHOT_POOLSIZE
       switch ( game_level){
           case 1: 
           case 2: return STAGE_1;
           case 3:
           case 4: return STAGE_2;
           case 5:
           case 6: 
           case 7: return STAGE_3;
           default: return STAGE_3;
       };
}   

/**
 * Determines the required size for the player's bazis shot pool based on the current game level.
 * @param {number} game_level - The current game level.
 * @returns {number} The target number of bazis shots for the pool.
 */
function get_required_bazis_shot_poolsize(game_level) {
    const {DEFAULT} = VARIABLE_POOLSIZE_AT_STAGE.BAZIS_SHOT_POOLSIZE;
       return DEFAULT;
}