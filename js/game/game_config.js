const GAME_LEVELS = {   
    1: { // Spacekraft attrs                                       // LEVEL 1
        enemy_hp : 18,                                    
        direction_pattern : 1,
        level_multiplier_load : 450,
        level_seed_load : 750,
        level_multiplier_speed : 800,              
        level_seed_speed : $(window).width() * 3.20,
        spacekraft_variance_multiplier : 5,
         // Spacekraft shots' attrs
        speed_seed_loves : 1200,       
        speed_multiplier_loves : 1.1,
        frequency_seed_loves : 1100,
        frequency_multiplier_loves : 1500,
         // Score manipulating
        talalat_score_multiplier : 70,
        talalat_score_seed : 70,
        // Bazis shots' attrs
        max_shots_ammount : 4, 
        bazis_shot_repeat : 1,
        bazis_shot_timeout : 170,
        bazis_shot_speed : 1.00,   
    },
   2: {  // Spacekraft attrs                                     // LEVEL 2
        enemy_hp : 18,                                 
        direction_pattern : 2,
        level_multiplier_load : 500,
        level_seed_load : 800,
        level_multiplier_speed : 800,              
        level_seed_speed : $(window).width() * 2.90,
        spacekraft_variance_multiplier : 6,
         // Spacekraft shots' attrs
        speed_seed_loves : 1000,
        speed_multiplier_loves : 1.4,
        frequency_seed_loves : 1000,
        frequency_multiplier_loves : 1200,
         // Score manipulating
        talalat_score_multiplier : 80,
        talalat_score_seed : 40,
         // Bazis shots' attrs
        max_shots_ammount : 8, 
        bazis_shot_repeat : 2,
        bazis_shot_timeout : 170,
        bazis_shot_speed : 0.95,                       
   },
   3: {
        // Spacekraft attrs                                        // LEVEL 3
        enemy_hp : 18,                              
        direction_pattern : 2,                               
        level_multiplier_load : 130,
        level_seed_load : 200,
        level_multiplier_speed : 800,              
        level_seed_speed : $(window).width() * 2.90,
        spacekraft_variance_multiplier : 7,
         // Spacekraft shots' attrs
        speed_seed_loves : 1000,
        speed_multiplier_loves : 1.6,
        frequency_seed_loves : 1300,
        frequency_multiplier_loves : 1400,
         // Score manipulating
        talalat_score_multiplier : 55,
        talalat_score_seed : 40,
        // Bazis shots' attrs
        max_shots_ammount : 6,
        bazis_shot_repeat : 2,
        bazis_shot_timeout : 130,
        bazis_shot_speed : 0.80,
        dual_fire_shot : true,   
   },
   4: {
        // Spacekraft attrs                                         // LEVEL 4
        enemy_hp : 18,                                 
        direction_pattern : 4,
        level_multiplier_load : 110,
        level_seed_load : 210,
        level_multiplier_speed : 750,              
        level_seed_speed : $(window).width() * 2.80,
        spacekraft_variance_multiplier : 9,
          // Spacekraft shots' attrs
        speed_seed_loves : 900,
        speed_multiplier_loves : 1.6,
        frequency_seed_loves : 1500,
        frequency_multiplier_loves : 1000,
         // Score manipulating
        talalat_score_multiplier : 60,
        talalat_score_seed : 30,
         // Bazis shots' attrs
        max_shots_ammount : 8, 
        bazis_shot_repeat : 1,
        bazis_shot_timeout : 150,
        bazis_shot_speed : 0.85,

    //     if( !weapons.flags.homing_missile){          // Player gets missiles if powerup was missed
    //        weapons.flags.homing_missile = true;  
    //        schedule_next_missile_launch_attempt();  
    //     }                
   },
    5: {
        // Spacekraft attrs                             // LEVEL 5 
        enemy_hp : 18,
        direction_pattern : 4,                                           
        level_multiplier_load : 110,
        level_seed_load : 190,
        level_multiplier_speed : 1050,              
        level_seed_speed : $(window).width() * 2.20,
        spacekraft_variance_multiplier : 10,
         // Spacekraft shots' attrs
        speed_seed_loves : 800,
        speed_multiplier_loves : 1.5,
        frequency_seed_loves : 1300,
        frequency_multiplier_loves : 450,
         // Score manipulating
        talalat_score_multiplier : 50,
        talalat_score_seed : 20,
        // Bazis shots' attrs
        max_shots_ammount : 14, 
        bazis_shot_repeat : 1,
        bazis_shot_timeout : 150,
        bazis_shot_speed : 0.85,  
        // if( !weapons.flags.tracking_lazer){             // Player gets tracking lazer if powerup was missed
        //      weapons.flags.tracking_lazer = true;
        //      tracking_lazer_scheduler();
        // }
    },
    6: {
        // Spacekraft attrs                               // LEVEL 6
        enemy_hp : 18,
        direction_pattern : 4,
        level_multiplier_load : 100,
        level_seed_load : 170,
        level_multiplier_speed : 1150,      
        level_seed_speed : $(window).width() * 2.00,
        spacekraft_variance_multiplier : 10,
          // Spacekraft shots' attrs
        speed_seed_loves : 650,
        speed_multiplier_loves : 1.4,
        frequency_seed_loves : 1200,
        frequency_multiplier_loves : 400,
          // Score manipulating
        talalat_score_multiplier : 20,
        talalat_score_seed : 20,
          // Bazis shots' attrs
        max_shots_ammount : 14, 
        bazis_shot_repeat : 1,
        bazis_shot_timeout : 150,
        bazis_shot_speed : 0.85,
    },
    7: {
        // Spacekraft attrs                             // DEFAULT | 7
        enemy_hp : 18,
        direction_pattern : 4,
        level_multiplier_load : 100,
        level_seed_load : 150,
        level_multiplier_speed : 1150,       
        level_seed_speed : $(window).width() * 1.80,
        spacekraft_variance_multiplier : 10,
         // Spacekraft shots' attrs
        speed_seed_loves : 650,
        speed_multiplier_loves : 1.4,
        frequency_seed_loves : 1100,
        frequency_multiplier_loves : 400,
         // Score manipulating
        talalat_score_multiplier : 20,
        talalat_score_seed : 20,
         // Bazis shots' attrs
        max_shots_ammount : 14, 
        bazis_shot_repeat : 1,
        bazis_shot_timeout : 150,
        bazis_shot_speed : 0.85,
    }
};

// You might also want a separate config for constants not tied to levels
const GAME_CONSTANTS = {
    DEFAULT_WINDOW_WIDTH_MULTIPLIER: 8, // Example from previous discussions
    // ...
};


let currentLevelConfig = {}; // Declare this at a higher scope

function game_level_change(game_level) {
    const newConfig = GAME_LEVELS[game_level];
    if (!newConfig) {
        console.error(`Configuration for level ${game_level} not found!`);
        return;
    }
    currentLevelConfig = { ...newConfig }; // Use spread to create a shallow copy

    // Now, if you need window-width dependent values:
    currentLevelConfig.level_speed = currentLevelConfig.level_speed_seed * $(window).width();

    console.log(`Level ${game_level} configuration loaded.`, currentLevelConfig);
}

// Later, in other functions, access:
// const hp = currentLevelConfig.enemy_hp;
// const speed = currentLevelConfig.level_speed;

