let current_level_config = {}; 


function game_level_change(game_level) {

       if (game_level > GAME_CONSTANTS.MAX_GAME_LEVEL) {
              console.log(`Maximum game level reached: ${GAME_CONSTANTS.MAX_GAME_LEVEL}. `);
              game_data.levels.act_level = GAME_CONSTANTS.MAX_GAME_LEVEL; 
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
         

    if (game_level === 1) {                        // When setting up initial state for level 1
        game_data.limits.act_limit = GAME_CONSTANTS.INITIAL_LEVEL_UP_SCORE;
    } else {
       
        if (game_data.levels.act_level === 2) {    // From level 2
             game_data.limits.act_limit = GAME_CONSTANTS.INITIAL_LEVEL_UP_SCORE + GAME_CONSTANTS.SUBSEQUENT_LEVEL_UP_SCORE_INCREMENT;
        } else if (game_data.levels.act_level > 2) { 
             game_data.limits.act_limit += GAME_CONSTANTS.SUBSEQUENT_LEVEL_UP_SCORE_INCREMENT;
        }
    }   

    initialize_all_pools();
    console.log(`Level ${game_level} configuration applied. Next level up target: ${game_data.limits.act_limit}`);
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
   
       // --- Level 3: Dual Fire Shot ---
       if(current_level === 3){
           if( !weapons.flags.dual_fire_shot) {
               weapons.flags.standard_shot = false;
               weapons.flags.dual_fire_shot = true;
           }
       }
       // --- Level 4: Single Lazer ---
       if (current_level === 5) { 
           if (!weapons.flags.single_lazer) { 
               weapons.flags.dual_fire_shot = false;
               weapons.flags.single_lazer = true;
               update_center_display("LAZER EQUIPPED !");            
           }
       }
   
       // --- Level 5: Tracking Lazer ---
       if (current_level === 6) { 
           if (!weapons.flags.tracking_lazer) { 
               weapons.flags.tracking_lazer = true;
               tracking_lazer_scheduler();           
           }
       }
}

/**
 * Determines the required size for the enemy pool based on the current game level.
 * @param {number} game_level - The current game level.
 * @returns {number} The target number of enemies for the pool.
 */
function get_required_enemy_poolsize(game_level) {                  // introduce pool config
       switch ( game_level){
          case 1: 
          case 2: return 15;
          case 3:
          case 4: return 30;
          case 5:
          case 6: 
          case 7: return 40;
          default: return 40;
       };
}
   
/**
 * Determines the required size for the enemy shot pool based on the current game level.
 * @param {number} game_level - The current game level.
 * @returns {number} The target number of enemy shots for the pool.
 */
function get_required_enemy_shot_poolsize(game_level) {
       switch ( game_level){
           case 1: 
           case 2: return 20;
           case 3:
           case 4: return 45;
           case 5:
           case 6: 
           case 7: return 60;
           default: return 60;
       };
}   

/**
 * Determines the required size for the player's bazis shot pool based on the current game level.
 * @param {number} game_level - The current game level.
 * @returns {number} The target number of bazis shots for the pool.
 */
function get_required_bazis_shot_poolsize(game_level) {
       return 25;
}