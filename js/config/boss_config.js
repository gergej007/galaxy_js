const BOSS_BEHAVIOR_CONFIG = {
    MOVEMENT_PHASES : {
        MOVEMENT_1: { direction_1: "moving_right", direction_2: "moving_left", audio_key: "#boss_hang2", 
                      offset_y: 90, duration_ms: 2500, timeout_ms: 3000 },
        MOVEMENT_2: { direction_2: "moving_left", audio_key: "#boss_hang1", final_x_poz: 30, final_y_poz: 30, duration_ms: 2500, 
                      timeout_ms: 0 },
        MOVEMENT_3: { direction_1: "moving_right", audio_key: "#boss_hang2", offset_y: 90, duration_ms: 2500, 
                      timeout_ms: 3000 },
        MOVEMENT_4: { direction_1: "moving_right", audio_key: "#boss_hang4", anim_offset_x: 30, anim_ofset_y: 40, duration_ms: 2500, 
                      timeout_ms: 0 }                                          
    },
    PHASE_SEQUENCE :[ 
        { type: "boss_movement_1", config_key: "MOVEMENT_1", attacks_config_key: "PHASE_1" }, 
        { type: "boss_movement_2", config_key: "MOVEMENT_2", attacks_config_key: "PHASE_2" }, 
        { type: "boss_movement_3", config_key: "MOVEMENT_3", attacks_config_key: "PHASE_1" }, 
        { type: "boss_movement_4", config_key: "MOVEMENT_4", attacks_config_key: "PHASE_2" }
        ]
    }
    
const BOSS_ATTACK_CONFIG = {
    PHASE_1: [ { type: 'cone_shots', shots: 9, spread_dist: 33, speed: 1000, type_key: "CONE_SHOT_TYPE_1", audio: "#lazer11" , delay_ms: 300  },
               { type: 'cone_shots', shots: 9, spread_dist: 33, speed: 1000, type_key: "CONE_SHOT_TYPE_1", audio: "#lazer8" ,  delay_ms: 900  },
               { type: 'cone_shots', shots: 9, spread_dist: 33, speed: 1000, type_key: "CONE_SHOT_TYPE_1", audio: "#lazer13" , delay_ms: 1500  },
               { type: 'cone_shots', shots: 9, spread_dist: 33, speed: 900,  type_key: "CONE_SHOT_TYPE_3", audio: "#lazer15" , delay_ms: 2100  },
               { type: 'homing_shots', shots: 4, speed: 900, audio: "#lazer5", interval_ms: 400, delay_ms: 3200, type_key: "HOMING_SHOT" }               
            ],
    PHASE_2: [ { type: 'lazer_shots', shots: 5, speed: 0, audio: "#r_lazer5", interval_ms: 50, delay_ms: 100, type_key: "LAZER_SHOT"} ]
}; 

//   --- Damage and Death ---
const IMPACT_VISUALS_CONFIG = { 
    IMAGE_SRC: 'robban2.png', CLASS: 'robbanas_y',    
    INITIAL_WIDTH: 15, 
    FINAL_WIDTH: 50, 
    ANIM_DURATION: 250, 
    ANIM_EASING: 'linear',  
    ZONE_PERCENTAGES: { SIDE_WIDTH_PERCENT: 0.25 },
    EDGE_CORRECTION : { THRESHOLD_PERCENT: 0.1, 
                        AMOUNT_X: 15, 
                        AMOUNT_Y: 10, },

  ALIGNMENT: { Y_OUTER: 68, Y_MIDDLE: 50 },
  SAFE_EDGE_ZONE : 12,
  // --- Horizontal Following for Animation (based on window width) ---
  HORIZONTAL_FOLLOW_RATE_WINDOW_WIDTH_PERCENT: 0.04,
  MOVING_LEFT: "moving_left",
  MOVING_RIGHT: "moving_right"

}  

const BOSS_DIES_CONFIG = { ANIM_DURATION : 500, BOSS_KILLED_SCORE : 15000, DELAY_AUDIO : 1700, 
                           SCREEN_SHAKE_DURATION: 800, AUDIO_KEYS : ["#robbanas7","#powerdwn1"],
                           LAZER_SOUND: "#r_lazer5" };

//   --- Final Explosions ---   
const MAIN_EXPLOSION_CONFIG = { IMAGE_SRC : 'robban5.gif',IMAGE_CLASS: 'robbanas_x', HORIZONTAL_CORRECTION : 100, VERTICAL_CORRECTION : 80, HEIGHT : 250,
    FINAL_HEIGHT : 650, FINAL_RADIUS : 90, FINAL_HORIZONTAL_CORRECTION : 100,
    FINAL_VERTICAL_CORRECTION : 200, ANIM_DURATION : 3900, ANIM_EASING: 'linear',
    HIDE_DURATION : 500
  };
const SIDE_EXPLOSION_CONFIG = { IMAGE_SRC : 'robban.gif', IMAGE_CLASS: 'robbanas_z',
    HORIZONTAL_START_PERCENT : 0.1, HORIZONTAL_END_PERCENT : 0.9, VERTICAL_OFFSET_PERCENT : 0.25,
    WIDTH : 50, FINAL_WIDTH : 180, VERTICAL_CORRECTION : 100, ANIM_DURATION : 1200
  };     
  
//  --- Boss Animations ---
const ANIMATION_CONFIG = {
    BOSS_EXIT: { DISTANCE_Y: -200, ANIM_DURATION: 1400},

    A_BOMB_REACTION_CONFIG: { IMG_SRC: "villam1.gif", IMG_CLASS: "villam2",
                              ANIM_OPACITY: 0.5, ANIM_INITIAL_DELAY: 800, 
                              ANIM_COUNTER: 3, ANIM_INTERVAL: 190,
                              ANIM_DURATION_1: 140, ANIM_DURATION_2: 100, 
                              ANIM_DURATION_HIDE: 50, LIGHTNING_INITIAL_WIDTH: 200, 
                              LIGHTNING_FINAL_WIDTH: 380, ANIM_X_RELATIVE: 40, 
                              ANIM_Y_RELATIVE: 20, A_BOMB_DAMAGE_FOR_BOSS: 25
    },

    SHOTS_EXPLOSION: { ANIM_SIZE_PX: 35, ANIM_DURATION: 250 },
    FIREWORKS: {
        AUDIO_KEY: "#robbanas8",
        IMAGE_SRC: 'fireworks1.gif',
        CLASS: 'tuzijatek',
        ANIM_DURATION: 4000,
        HIDE_DURATION: 500,
        ANIM_EASING: 'linear',
        FINAL_WIDTH: 620,
        // Positioning percentages relative to window dimensions
        LEFT_FIREWORK_OFFSET_X_PERCENT: 0.05, 
        RIGHT_FIREWORK_OFFSET_X_PERCENT: 0.95, 
        Y_OFFSET_PERCENT: 0.50        
    },
    INITIAL_LIGHTNING: { DURATION: 1200, IMG_SRC: 'villam1.gif', 
                         IMG_CLASS:'villam2', IMG_WIDTH: 500},
    BAZIS_EXIT: {
        EXIT_DELAY: 3000,
        FINAL_DELAY: 4700,
        // Horizontal duration rules
        HORIZONTAL_DURATION_THRESHOLD_PERCENT: 0.25,
        HORIZONTAL_DURATION_LONG: 1250,
        HORIZONTAL_DURATION_SHORT: 900,

        // Vertical duration rules
        VERTICAL_DURATION_THRESHOLD_PERCENT: 0.75,
        VERTICAL_DURATION_LONG: 1350,
        VERTICAL_DURATION_SHORT: 900,

        ANIM_EASING: 'linear', 
        AUDIO_KEY: "#exit1"
    }                     
                         
}  