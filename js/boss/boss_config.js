const BOSS_BEHAVIOR_CONFIG = {
    MOVEMENT_PHASES : {
        MOVEMENT_1: { direction_1: "moving_right", direction_2: "moving_left", audio_key: "#boss_hang2", 
                      offset_y: 90, duration_ms: 2500, timeout_ms: 3000 },
        MOVEMENT_2: { audio_key: "#boss_hang1", final_x_poz: 30, final_y_poz: 30, duration_ms: 2500, 
                      timeout_ms: 0 },
        MOVEMENT_3: { direction_1: "moving_right", audio_key: "#boss_hang2", offset_y: 90, duration_ms: 2500, 
                      timeout_ms: 3000 },
        MOVEMENT_4: { audio_key: "#boss_hang4", anim_offset_x: 30, anim_ofset_y: 40, duration_ms: 2500, 
                      timeout_ms: 0 }                                          
    },
    PHASE_SEQUENCE :[ 
        { type: "boss_movement_1", config_key: "MOVEMENT_1", attacks_config_key: "PHASE_1" }, 
        { type: "boss_movement_2", config_key: "MOVEMENT_2", attacks_config_key: "PHASE_2" }, 
        { type: "boss_movement_3", config_key: "MOVEMENT_3", attacks_config_key: "PHASE_1" }, 
        { type: "boss_movement_4", config_key: "MOVEMENT_4", attacks_config_key: "PHASE_2" }
        ]
    }
    
BOSS_ATTACK_CONFIG = {
    PHASE_1: [ { type: 'cone_shots', shots: 9, spread_dist: 33, speed: 1000, type_key: "CONE_SHOT_TYPE_1", audio: "#lazer11" , delay_ms: 300  },
               { type: 'cone_shots', shots: 9, spread_dist: 33, speed: 1000, type_key: "CONE_SHOT_TYPE_1", audio: "#lazer8" ,  delay_ms: 900  },
               { type: 'cone_shots', shots: 9, spread_dist: 33, speed: 1000, type_key: "CONE_SHOT_TYPE_1", audio: "#lazer13" , delay_ms: 1500  },
               { type: 'cone_shots', shots: 9, spread_dist: 33, speed: 900,  type_key: "CONE_SHOT_TYPE_3", audio: "#lazer15" , delay_ms: 2100  },
               { type: 'homing_shots', shots: 4, speed: 900, audio: "#lazer5", interval_ms: 400, delay_ms: 3200, type_key: "HOMING_SHOT" }               
            ],
    PHASE_2: [ { type: 'lazer_shots', shots: 5, speed: 140, audio: "#r_lazer2", interval_ms: 40, type_key: "LAZER_SHOT"} ]
    }; 