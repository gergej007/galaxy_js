const POOLED_ENTITY_TYPES = {    
    ENEMY: GAME_ENTITY_TYPES.ENEMY,
    ENEMY_SHOT: GAME_ENTITY_TYPES.ENEMY_SHOT,
    BAZIS_SHOT: GAME_ENTITY_TYPES.BAZIS_SHOT,
    HOMING_MISSILE: GAME_ENTITY_TYPES.HOMING_MISSILE,
    TRACKING_LAZER: GAME_ENTITY_TYPES.TRACKING_LAZER,
    BOSS_SHOT: GAME_ENTITY_TYPES.BOSS_SHOT
};

const POOL_DEFAULT_PROPS = {
    [POOLED_ENTITY_TYPES.ENEMY]: () => ({
        img_element: null,
        damage: DEFAULT_VALUES.ENEMY_DAMAGE,
        speed: 0,
        moving_direction: null,
        hp: current_level_config.enemy_hp,
        max_hp: current_level_config.enemy_hp,
        id: 0
    }),
    [POOLED_ENTITY_TYPES.BAZIS_SHOT]: () => ({
        damage: DEFAULT_VALUES.BAZIS_SHOT_DAMAGE,
        enemies_hit_ids: new Set() // New Set for every shot instance
    }),
    [POOLED_ENTITY_TYPES.ENEMY_SHOT]: () => ({
        damage: DEFAULT_VALUES.ENEMY_SHOT_DAMAGE,
        shooter_id: 0
    }),
    [POOLED_ENTITY_TYPES.HOMING_MISSILE]: ()=> ({
        parent_side : null
    }),
    [POOLED_ENTITY_TYPES.TRACKING_LAZER]: ()=> ({
        damage: DEFAULT_VALUES.TRACK_LAZER_DAMAGE
    }),
    [POOLED_ENTITY_TYPES.BAZIS_SHOT]: ()=> ({
        damage : DEFAULT_VALUES.BOSS_SHOT_DAMAGE, 
        speed : 0
    })
};

const POOL_KEYS = {
    ENEMY: 'enemy_pool',           
    BAZIS_SHOT: 'bazis_shot_pool', 
    ENEMY_SHOT: 'enemy_shot_pool',
    HOMING_MISSILE: 'homing_missile_pool',
    TRACKING_LAZER: 'tracking_lazer_pool',
    BOSS_SHOT: 'boss_shot_pool'
}

const POOL_LIMITS = {
    // Pool size
    H_MISSILE_COUNT: 4,
    TRACK_LAZER_COUNT: 10,
    BOSS_SHOT_COUNT: 20
};

const DEFAULT_VALUES = { 
    ENEMY_DAMAGE: 25,
    BAZIS_SHOT_DAMAGE: 10,
    ENEMY_SHOT_DAMAGE: 5,
    TRACK_LAZER_DAMAGE: 20,
    BOSS_SHOT_DAMAGE: 10
};
const POOL_STYLES = {
    // Elements
    BAZIS_SHOT_ELEM_CLASS: 'lovedek',
    ENEMY_ELEM_CLASS: 'urhajo',
    ENEMY_SHOT_ELEM_CLASS: 'counter_tuz',
    BOSS_SHOT_ELEM_CLASS: 'bs_loves',
    H_MISSILE_WRAPPER_CLASS: 'homing_missile',
    H_MISSILE_IMG_SRC: 'missile1.png',
    H_MISSILE_IMG_CLASS: 'missile_img',
    H_IGNITION_IMG_CLASS: 'missile_fire_img',
    H_MISSILE_RESET_STYLE: { display: 'none', position: 'absolute', left: -999, top: -999, height: 80, width: 10 },
    TRACK_LAZER_ELEM_CLASS: 'tracking_lazer_lovedek',
    TRACK_LAZER_RESET_STYLE: { "opacity": 0, "display": "none", "position": "absolute" },
    // Return to pool
    ZERO_RECT: { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 },
    MASTER_RESET_STYLE: {
        'display': 'none',
        'left': -999,
        'top': -999,
        'width': "",      
        'height': "",     
        'opacity': 1,
        'transform': 'none',
        'filter': 'none',
        'transition': 'none'
    }
};
const BASE_CLASSES= {
    [POOLED_ENTITY_TYPES.BAZIS_SHOT]: POOL_STYLES.BAZIS_SHOT_ELEM_CLASS,  
    [POOLED_ENTITY_TYPES.HOMING_MISSILE]:POOL_STYLES.H_MISSILE_WRAPPER_CLASS,
    [POOLED_ENTITY_TYPES.TRACKING_LAZER]: POOL_STYLES.TRACK_LAZER_ELEM_CLASS,
    [POOLED_ENTITY_TYPES.ENEMY]: POOL_STYLES.ENEMY_ELEM_CLASS,
    [POOLED_ENTITY_TYPES.ENEMY_SHOT]: POOL_STYLES.ENEMY_SHOT_ELEM_CLASS,
    [POOLED_ENTITY_TYPES.BOSS_SHOT]: POOL_STYLES.BOSS_SHOT_ELEM_CLASS,
    // Weapon specific
    'single': POOL_STYLES.BAZIS_SHOT_ELEM_CLASS,
    'dual': POOL_STYLES.BAZIS_SHOT_ELEM_CLASS,
    'lazer': POOL_STYLES.BAZIS_SHOT_ELEM_CLASS,
    'twin_lazer': POOL_STYLES.BAZIS_SHOT_ELEM_CLASS,
    'hyper_lovedek': POOL_STYLES.BAZIS_SHOT_ELEM_CLASS
}
