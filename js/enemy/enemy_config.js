const ENEMY_SPAWN_CONFIG = {
    PLAY_AREA_HEIGHT_FACTOR: 0.82,         // Spawning managment
    VERTICAL_OFFSET: 55,
    MAX_SPAWN_ATTEMPTS: 15,
    ELEM_DEFAULT_WIDTH: 100,
    ELEM_DEFAULT_HEIGHT: 60,
    LANE_PADDING_PX: 5,
    RESET_STYLE: { "transition": "none", "display": "block", "left": "-999px" },

    ELEM_WIDTH_MULTIPLIER: 86,            // Spawning logic
    ELEM_WIDTH_SEED: 110,
    ELEM_CLASS: 'urhajo_img',
    LOCKED_CLASS: 'locked',
    IMG_SRC: 'enemy/urhajo',
    IMG_EXTENSION: '.png',   
    Z_INDEX: 100,
    ANIM_EASING: 'linear',
    SAFE_DISTANCE_X: 10,
    MIN_HORIZONTAL_SPACING_PX: 70, 
    BOUNTY_SAFE_ZONE_X_FACTOR: 0.6,
    RIGHT_DIRECTION: 'moving_right',
    LEFT_DIRECTION: 'moving_left',
    ROTATE_0_DEG: 'rotateY(0deg)',
    ROTATE_180_DEG: 'rotateY(180deg)'
};

const  ENEMY_SHOT_CONFIG = {
    FIRST_SHOT_DELAY_MULTIPLIER: 600,      
    FIRST_SHOT_DELAY_SEED: 200,
    BAZIS_TARGET_Y_DIVISOR: 4,
    VERTICAL_SAFE_ZONE_OFFSET_PX: 80,       
    VERTICAL_SCREEN_EDGE_SAFE_PX: 200,
    SHOT_X_SLIDE_PX: 100,
    CSS_POSITION: 'absolute',    
    RND_SHOT_TYPE: 3,                       // CSS styles of projectiles
    SHOT_TYPE_CLASS_0: 'counter_tuz_var0',
    SHOT_TYPE_CLASS_1: 'counter_tuz_var1',
    SHOT_TYPE_CLASS_2: 'counter_tuz_var2',
    SHOT_TYPE_CLASS_3: 'counter_tuz_var3',
};

const DAMAGE_N_EXPLOSION = {      // Explosion
    ENEMY_TYPE: 'Enemy',          // Object data types          
    HOMING_MISSILE_TYPE: 'Homing Missile',
    BOUNTY_TYPE: 'Bounty',
    ASTEROID_TYPE: 'Asteroid',

    IMG_SRC: 'robban.gif',        // Visuals
    IMG_CLASS: 'robbanas',
    HIDE_DURATION_MS: 1200,
    RND_HEIGHT_MULTIPLIER: 100,
    RND_HEIGHT_SEED: 190,
    HORIZONTAL_OFFSET_PX: 50,
    AUDIO_KEY: '#robbanas5',       
    
    CSS_FILTER_TIMEOUT_MS: 80,   // Damage
    ENEMY_DAMAGED_FILTER: "brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(5)"
};