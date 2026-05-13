const GAME_CONSTANTS = {    
    INITIAL_LEVEL_UP_SCORE: 2000,
    SUBSEQUENT_LEVEL_UP_SCORE_INCREMENT: 3000,
    MAX_GAME_LEVEL: 7,
    INITIAL_BOUNTY_LIMIT: 1000,
    BOSS_LIMIT: 6000,
    ENEMY_AI_LEVEL: 4
};

const GAME_LEVELS = {   
    1: { // Spacekraft attrs                                       // LEVEL 1
        enemy_hp : 16,                                    
        direction_pattern : 1,
        level_multiplier_load : 450,
        level_seed_load : 750,
        level_multiplier_speed : 800,              
        level_seed_speed : 3.70,
        spacekraft_variance_multiplier : 5,
         // Spacekraft shots' attrs
        speed_seed_projectile : 1300,       
        speed_multiplier_projectile : 1.3,
        frequency_seed_projectile : 1900,
        frequency_multiplier_projectile : 1600,
         // Score manipulating
        hit_score_multiplier : 70,
        hit_score_seed : 70,
        // Bazis shots' attrs
        max_shots_ammount : 6, 
        bazis_shot_repeat : 1,
        bazis_shot_timeout : 170,
        bazis_shot_speed : 1.00   
    },
   2: {  // Spacekraft attrs                                     // LEVEL 2
        enemy_hp : 24,                                 
        direction_pattern : 2,
        level_multiplier_load : 450,
        level_seed_load : 550,
        level_multiplier_speed : 600,              
        level_seed_speed :  3.3,
        spacekraft_variance_multiplier : 6,
         // Spacekraft shots' attrs
        speed_seed_projectile : 1100,
        speed_multiplier_projectile : 1.2,
        frequency_seed_projectile : 1500,
        frequency_multiplier_projectile : 1400,
         // Score manipulating
        hit_score_multiplier : 80,
        hit_score_seed : 40,
         // Bazis shots' attrs
        max_shots_ammount : 8, 
        bazis_shot_repeat : 1,
        bazis_shot_timeout : 170,
        bazis_shot_speed : 0.95                       
   },
   3: {
        // Spacekraft attrs                                        // LEVEL 3
        enemy_hp : 36,                              
        direction_pattern : 2,                               
        level_multiplier_load : 200,
        level_seed_load : 200,
        level_multiplier_speed : 500,              
        level_seed_speed : 3.30,
        spacekraft_variance_multiplier : 7,
         // Spacekraft shots' attrs
        speed_seed_projectile : 1000,
        speed_multiplier_projectile : 1.3,
        frequency_seed_projectile : 1500,
        frequency_multiplier_projectile : 1400,
         // Score manipulating
        hit_score_multiplier : 55,
        hit_score_seed : 40,
        // Bazis shots' attrs
        max_shots_ammount : 10,
        bazis_shot_repeat : 2,
        bazis_shot_timeout : 130,
        bazis_shot_speed : 0.85
   },
   4: {
        // Spacekraft attrs                                         // LEVEL 4
        enemy_hp : 30,                                 
        direction_pattern : 4,
        level_multiplier_load : 200,
        level_seed_load : 200,
        level_multiplier_speed : 400,              
        level_seed_speed : 3.10,
        spacekraft_variance_multiplier : 9,
          // Spacekraft shots' attrs
        speed_seed_projectile : 900,
        speed_multiplier_projectile : 1.6,
        frequency_seed_projectile : 1400,
        frequency_multiplier_projectile : 1300,
         // Score manipulating
        hit_score_multiplier : 60,
        hit_score_seed : 30,
         // Bazis shots' attrs
        max_shots_ammount : 10, 
        bazis_shot_repeat : 1,
        bazis_shot_timeout : 150,
        bazis_shot_speed : 0.85            
   },
    5: {
        // Spacekraft attrs                             // LEVEL 5 
        enemy_hp : 32,
        direction_pattern : 4,                                           
        level_multiplier_load : 200,
        level_seed_load : 200,
        level_multiplier_speed : 300,              
        level_seed_speed : 2.80,
        spacekraft_variance_multiplier : 10,
         // Spacekraft shots' attrs
        speed_seed_projectile : 800,
        speed_multiplier_projectile : 1.5,
        frequency_seed_projectile : 1300,
        frequency_multiplier_projectile : 1200,
         // Score manipulating
        hit_score_multiplier : 50,
        hit_score_seed : 20,
        // Bazis shots' attrs
        max_shots_ammount : 14, 
        bazis_shot_repeat : 1,
        bazis_shot_timeout : 150,
        bazis_shot_speed : 0.85        
    },
    6: {
        // Spacekraft attrs                               // LEVEL 6
        enemy_hp : 32,
        direction_pattern : 4,
        level_multiplier_load : 120,
        level_seed_load : 120,
        level_multiplier_speed : 200,      
        level_seed_speed : 2.60,
        spacekraft_variance_multiplier : 10,
          // Spacekraft shots' attrs
        speed_seed_projectile : 650,
        speed_multiplier_projectile : 1.4,
        frequency_seed_projectile : 1100,
        frequency_multiplier_projectile : 900,
          // Score manipulating
        hit_score_multiplier : 20,
        hit_score_seed : 20,
          // Bazis shots' attrs
        max_shots_ammount : 14, 
        bazis_shot_repeat : 1,
        bazis_shot_timeout : 150,
        bazis_shot_speed : 0.85
    },
    7: {
        // Spacekraft attrs                             // DEFAULT | 7
        enemy_hp : 32,                             
        direction_pattern : 4,                      
        level_multiplier_load : 100,              
        level_seed_load : 100,                    
        level_multiplier_speed : 100,                 
        level_seed_speed : 2.40,                  
        spacekraft_variance_multiplier : 10,      
         // Spacekraft shots' attrs
        speed_seed_projectile : 650,              
        speed_multiplier_projectile : 1.4,        
        frequency_seed_projectile : 1000,         
        frequency_multiplier_projectile : 800,     
         // Score manipulating
        hit_score_multiplier : 20,                
        hit_score_seed : 20,                      
         // Bazis shots' attrs
        max_shots_ammount : 14,                   
        bazis_shot_repeat : 1,                    
        bazis_shot_timeout : 150,                 
        bazis_shot_speed : 0.85                  
    }
};
