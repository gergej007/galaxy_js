const GAME_CONSTANTS = {    
    INITIAL_LEVEL_UP_SCORE: 5000,
    // LEVEL_SCORE_LIMITS: [5000, 10000, 17500, 30000, 45000, 60000, 67500],   // Prod Config
    LEVEL_SCORE_LIMITS: [2500, 4000, 7200, 10000, 15000, 20000, 25000],   // Dev Config
    MAX_GAME_LEVEL: 7,
    INITIAL_BOUNTY_LIMIT: 1500,
    // BOSS_LIMIT: 90000,        // Prod Config
    BOSS_LIMIT: 29000,        // Dev Config
    ENEMY_AI_LEVEL: 4
};

const GAME_ENTITY_TYPES = {
  ASTEROID: 'Asteroid',
  BAZIS: 'Bazis',
  BAZIS_SHOT: 'Bazis Shot',
  HOMING_MISSILE: 'Homing Missile',
  TRACKING_LAZER: 'Tracking Lazer',
  BOUNTY: 'Bounty',  
  ENEMY: 'Enemy',
  ENEMY_SHOT: 'Enemy Shot',
  BOSS: 'Boss',
  BOSS_SHOT: 'Boss Shot'
}

const MISSED_WEAPONS_ACCESS_LEVEL = {
  DUAL_FIRE_SHOT_LEVEL_3: 3,
  SINGLE_LAZER_LEVEL_5: 5,
  TRACKING_LAZER_LEVEL_6: 6,
  DUAL_LAZER_LEVEL_7: 7

}

const VARIABLE_POOLSIZE_AT_STAGE = {
  ENEMY_POOLSIZE: {
    STAGE_1: 15,
    STAGE_2: 30,
    STAGE_3: 40
  },
  ENEMY_SHOT_POOLSIZE: {
    STAGE_1: 30,
    STAGE_2: 65,
    STAGE_3: 120
  },
  BAZIS_SHOT_POOLSIZE: {
    DEFAULT: 26
  }
}

const GAME_LEVELS = {   
    1: { // Spacekraft attrs                                       // LEVEL 1
        enemy_hp : 16,                                    
        direction_pattern : 1,
        level_multiplier_load : 450,
        level_seed_load : 750,
        level_multiplier_speed : 800,              
        level_seed_speed : 3.70,
        spacekraft_variance_multiplier : 7,
        spacekraft_variance_seed : 1,
         // Spacekraft shots' attrs
        speed_seed_projectile : 1400,       
        speed_multiplier_projectile : 1.4,
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
        enemy_hp : 22,                                 
        direction_pattern : 2,
        level_multiplier_load : 450,
        level_seed_load : 550,
        level_multiplier_speed : 600,              
        level_seed_speed :  3.3,
        spacekraft_variance_multiplier : 8,
        spacekraft_variance_seed : 1,
         // Spacekraft shots' attrs
        speed_seed_projectile : 1200,
        speed_multiplier_projectile : 1.3,
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
        enemy_hp : 34,                              
        direction_pattern : 2,                               
        level_multiplier_load : 200,
        level_seed_load : 200,
        level_multiplier_speed : 500,              
        level_seed_speed : 3.30,
        spacekraft_variance_multiplier : 11,
        spacekraft_variance_seed : 3,
         // Spacekraft shots' attrs
        speed_seed_projectile : 1100,
        speed_multiplier_projectile : 1.3,
        frequency_seed_projectile : 1700,
        frequency_multiplier_projectile : 1600,
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
        level_multiplier_speed : 450,              
        level_seed_speed : 3.20,        
        spacekraft_variance_multiplier : 12,
        spacekraft_variance_seed : 4,
          // Spacekraft shots' attrs
        speed_seed_projectile : 1000,
        speed_multiplier_projectile : 1.3,
        frequency_seed_projectile : 1600,
        frequency_multiplier_projectile : 1500,
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
        level_multiplier_load : 140,
        level_seed_load : 140,
        level_multiplier_speed : 300,              
        level_seed_speed : 2.80,        
        spacekraft_variance_multiplier : 13,
        spacekraft_variance_seed : 4,
         // Spacekraft shots' attrs
        speed_seed_projectile : 900,
        speed_multiplier_projectile : 1.3,
        frequency_seed_projectile : 1600,
        frequency_multiplier_projectile : 1500,
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
        enemy_hp : 38,
        direction_pattern : 4,
        level_multiplier_load : 120,
        level_seed_load : 120,
        level_multiplier_speed : 200,      
        level_seed_speed : 2.60,        
        spacekraft_variance_multiplier : 13,
        spacekraft_variance_seed : 5,
          // Spacekraft shots' attrs
        speed_seed_projectile : 850,
        speed_multiplier_projectile : 1.2,
        frequency_seed_projectile : 1500,
        frequency_multiplier_projectile : 1400,
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
        enemy_hp : 38,                             
        direction_pattern : 4,                      
        level_multiplier_load : 90,              
        level_seed_load : 90,                    
        level_multiplier_speed : 100,                 
        level_seed_speed : 2.40,                  
        spacekraft_variance_multiplier : 16, 
        spacekraft_variance_seed : 5,     
         // Spacekraft shots' attrs
        speed_seed_projectile : 800,              
        speed_multiplier_projectile : 1.2,        
        frequency_seed_projectile : 1500,         
        frequency_multiplier_projectile : 1400,     
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
