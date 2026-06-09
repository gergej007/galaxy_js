const STANDARD_SHOT_STYLE = { "position": "absolute", "z-index": 5, 
            "width": "6px", "height": "10px",
            "box-shadow": "2px 2px 7px 2px rgba(66, 208, 247, .6)",
            "-webkit-box-shadow": "2px 2px 7px 2px rgba(66, 208, 247, .6)",
            "border-radius": "2px",
            "background": "rgb(66, 208, 247)",
            "display": "block", "opacity": 1 };

const LAZER_SHOT_STYLE = { "position": "absolute", "z-index": 150,
            "width": "5px", "height": "20px", 
            "box-shadow": "2px 2px 4px rgba(255, 71, 20, 0.772)",
            "-webkit-box-shadow": "2px 2px 4px rgba(255, 71, 20, 0.772)",
            "border-radius": "2px",
            "background": "rgb(218, 0, 0)",
            "display": "block", "opacity": 1 };  
            
            
const PRIMARY_WEAPON_TYPES = {
    DUAL_LAZER: 'dual_lazer',
    SINGLE_LAZER: 'single_lazer',
    DUAL_FIRE: 'dual_fire',
    STANDARD_SHOT: 'standard_shot',
    NONE: 'none'
};            

const BAZIS_SHOTS_CONFIG = {           // --- Primary weapon system config ---
    SINGLE_SHOT: {
        CLASS: 'lovedek',
        DAMAGE: 8,
        TYPE: 'single',
        INITIAL_TOP_OFFSET: 10, 
        SHOT_WIDTH: 6,       
        BASE_STYLE: { ...STANDARD_SHOT_STYLE },
        SHOTS_PER_LAUNCH: 1,
        ANIMATION_EASING: 'linear',
        AUDIO_KEY: "#loves1" 
    },
    DUAL_FIRE_SHOT: {
        CLASS: 'lovedek', 
        DAMAGE: 8,
        TYPE: 'dual',
        OFFSET_X_FACTOR: 0.24, 
        INITIAL_TOP_OFFSET: 10, 
        SHOT_WIDTH: 6,         
        BASE_STYLE: { ...STANDARD_SHOT_STYLE },
        SHOTS_PER_LAUNCH: 2, 
        ANIMATION_EASING: 'linear',
        AUDIO_KEY: "#loves1"
    },
    HYPER_SHOT: {
        CLASS: 'hyper_lovedek', 
        DAMAGE: 3, 
        TYPE: 'Hyper Shot',
        OFFSET_X_FACTOR: 0.24, 
        INITIAL_TOP_OFFSET: 10, 
        SHOT_WIDTH: 7,       
        BASE_STYLE: {
            "position": "absolute",
            "z-index": 5, 
            "box-shadow": "2px 2px 8px 2px rgba(177, 255, 69, 0.653)",
            "-webkit-box-shadow": "2px 2px 8px 2px rgba(177, 255, 69, 0.653)",
            "width": "7px", 
            "height": "15px",
            "border-radius": "2px",
            "background": "rgb(124, 255, 64)", 
            "display": "block",
            "opacity": 1
        },
        ANIMATION_EASING: 'linear',
        AUDIO_KEY: "#loves1" //  different audio for hyper shot?
    },
    
    SINGLE_LAZER_SHOT: {
        CLASS: 'lazer_lovedek',
        DAMAGE: 15,
        TYPE: 'single_lazer',
        SHOT_WIDTH: 5,         
        INITIAL_TOP_OFFSET: 20,         
        ANIMATION_DURATIONS: [40, 100, 90], 
        ANIMATION_TARGET_HEIGHT_OFFSET: 6, 
        ANIMATION_SECOND_STAGE_TOP_OFFSET: 10, 
        ANIMATION_SECOND_STAGE_HEIGHT_FACTOR: 0.8, 
        ANIMATION_EASING: 'linear',
        BASE_STYLE: { ...LAZER_SHOT_STYLE },
        SHOTS_PER_LAUNCH: 1,
        MOVING_SPAWN_MULTIPLIER: 4,
        AUDIO_KEY: "#r_lazer4"
    },
    DUAL_LAZER_SHOT: {
        CLASS: 'lazer_lovedek',
        DAMAGE: 10,
        TYPE: 'dual_lazer',
        SHOT_WIDTH: 5,
        OFFSET_X_FACTOR: 0.24,
        INITIAL_TOP_OFFSET: 20, 
        ANIMATION_DURATIONS: [40, 100, 90],
        ANIMATION_TARGET_HEIGHT_OFFSET: 6,
        ANIMATION_SECOND_STAGE_TOP_OFFSET: 10,
        ANIMATION_SECOND_STAGE_HEIGHT_FACTOR: 0.8,
        ANIMATION_EASING: 'linear',
        BASE_STYLE: { ...LAZER_SHOT_STYLE }, 
        SHOTS_PER_LAUNCH: 2,
        MOVING_SPAWN_MULTIPLIER: 4,
        AUDIO_KEY: "#r_lazer3"
    }    
};

const SECONDARY_WEAPONS_CONFIG = {                 // --- Secondary weapon system config ---
    HOMING_MISSILE: {
        IMAGE: {
            CONTAINER_CLASS: 'homing_missile',
            IMG_SRC: 'kepek/missile1.png',
            IMG_CLASS: 'missile_img'
        },
        MAIN: { 
                                                     // main
            MISSILE_LAUNCH_INTERVAL: 2600,     
            WIDTH: 9,
            HEIGHT: 80,
            OFFSET_X_FACTOR: 0.40,
            PRE_LAUNCH_DISTANCE_X: 30,
            PRE_LAUNCH_DISTANCE_Y: 80,
            PLACEMENT_START_VALUE: -1,
            PLACEMENT_INCREMENT: 2,
            PLACEMENT_END_VALUE: 2,
            RIGHT_MISSILE_SIDE: 'right_missile',                                 
            LEFT_MISSILE_SIDE: 'left_missile',
            ANIMATION_DURATION_1: 300,
            ANIMATION_DURATION_2: 250,
            LAUNCH_PREPARE_DELAY: 1300,
        },                                           // targeting
        TARGETING: {
            HORIZONTAL_BOUND_FACTOR: 0.30,
            BOTTOM_BOUND_PX: 100,
            NO_TARGET_ANIM_TOP: -30,
            NO_TARGET_ANIM_DURATION: 1000,
            HORIZONTAL_TARGETING_DEAD_ZONE: 50,
            RIGHT_MISSILE_SIDE: 'right_missile',                                 
            LEFT_MISSILE_SIDE: 'left_missile',                                 
            TARGET_LOCKED_CLASS: 'locked',
        },                                           // impact
        IMPACT: {
            AUDIO_KEY: '#missile_launch1',
            IGNITION_IMG_SRC: 'missile_fire1.png',
            IGNITION_IMG_CLASS: 'missile_fire_img',
            VERTICAL_IMPACT_OFFSET_PX: 20,
            ANIMATION_EASING: 'linear',
            MILLISECONDS_PER_SECOND: 1000,
            WINDOW_WIDTH_SPEED_FACTOR: 4.8,
            SQUARE_EXPONENT: 2,
            TARGET_DIRECTION: 'moving_left' 
        }
    },
    TRACKING_LAZER: {
        MAX_TRACKED_ENEMIES_PER_BURST: 6,
        TRACKING_LAZER_INTERVAL: 2500,
        MIN_ACTIVE_ENEMIES: 4,
        AUDIO_KEY: '#track_lazer2',
        ANIMATION_DURATION: 50,
        ANIMATION_EASING: 'linear',
        MS_BETWEEN_SHOTS: 100,
      
        TOP_BOUND_FACTOR: 0.17,
        BOTTOM_BOUND_FACTOR: 0.84,
        RAW_HORIZONTAL_BOUND_FACTOR: 0.40,
        TARGET_HORIZONTAL_BOUND_PX: 180,

        MOVING_SPAWN_MULTIPLIER: 2.8,
        LINE_THICKNESS_PX: 3,
        DEGREES_PER_RADIAN: 180
    },
    A_BOMB: {
        A_BOMB_DAMAGE: 20,
        AUDIO_KEYS: ['#abomb1', '#abomb3'],
        BOMB_CLASS: 'bomba',
        LAUNCH_OFFSET_Y: 20,
        DESTINATION_FACTOR_Y: 0.25,
        ANIMATION_DURATIONS: [ 500, 3900, 500],
        EXPLOSION_TIMEOUT_MS: 550,

        EXPLOSION_IMG_SRC: 'robban5.gif',
        EXPLOSION_IMG_CLASS: 'atombomba',
        INITIAL_TOP_Y_FACTOR: 0.18,
        BASE_STYLE: { "border-radius": 10, "opacity": 1},
        EXP_REACTIOM_DELAYS: [500, 1200],
        EXP_ANIM_FACTOR_X_Y: 1.4,
        EXP_ANIM_FACTOR_Y: 0.3,
        ANIMATION_PROPERTIES: { "width": 770, "opacity": 0, "border-radius": 120 },
        EASING: 'linear',
        
        SCREEN_SHAKE_DELAY: 500,
        SCREEN_SHAKE_DURATION: 800        
    },
    GOD_MODE: {
        DURATION_MS: 90000, 
        BAZIS_IMG_NORMAL_SRC: 'kepek/bazis.png', 
        BAZIS_IMG_GOD_MODE_SRC: 'kepek/bounties/god_mode.png', 
        AUDIO_ACTIVATE_KEY: '#powerdwn1' 
    }
};