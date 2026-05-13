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
const ENTITY_TYPES = {    
    ENEMY: 'Enemy',
    ENEMY_SHOT: 'Enemy Shot',
    BAZIS_SHOT: 'Bazis Shot',
    HOMING_MISSILE: 'Homing Missile',
    TRACKING_LAZER: 'Tracking Lazer',
    BOSS_SHOT: 'Boss Shot'
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
    [ENTITY_TYPES.BAZIS_SHOT]: POOL_STYLES.BAZIS_SHOT_ELEM_CLASS,  
    [ENTITY_TYPES.HOMING_MISSILE]:POOL_STYLES.H_MISSILE_WRAPPER_CLASS,
    [ENTITY_TYPES.TRACKING_LAZER]: POOL_STYLES.TRACK_LAZER_ELEM_CLASS,
    [ENTITY_TYPES.ENEMY]: POOL_STYLES.ENEMY_ELEM_CLASS,
    [ENTITY_TYPES.ENEMY_SHOT]: POOL_STYLES.ENEMY_SHOT_ELEM_CLASS,
    [ENTITY_TYPES.BOSS_SHOT]: POOL_STYLES.BOSS_SHOT_ELEM_CLASS,
    // Weapon specific
    'single': POOL_STYLES.BAZIS_SHOT_ELEM_CLASS,
    'dual': POOL_STYLES.BAZIS_SHOT_ELEM_CLASS,
    'lazer': POOL_STYLES.BAZIS_SHOT_ELEM_CLASS,
    'twin_lazer': POOL_STYLES.BAZIS_SHOT_ELEM_CLASS,
    'hyper_lovedek': POOL_STYLES.BAZIS_SHOT_ELEM_CLASS
}
