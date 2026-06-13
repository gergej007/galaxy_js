const BOUNTY_CONTAINER_CONFIG = {
    // Main attributes
    CONTAINER_CLASS: 'bnty_container',
    IMG_SRC: 'bounties/container.png',
    IMG_CLASS: 'bnty_main_img',    
    RIGHT_DIRECTION: 'right',
    LEFT_DIRECTION: 'left',
    // Animation and positioning
    RND_DELAY_MULTIPLIER: 2500,
    RND_DELAY_SEED: 1500,
    DURATION_MULTIPLIER: 4.70,
    ANIMATION_EASING: 'linear',
    RND_POZ_Y_MULTIPLIER_FACTOR: 0.05,
    RND_POZ_Y_MULTIPLIER_SEED: 0.73,
    AUDIO_KEY: '#electric4',
    HP_INDICATOR_POSITION_PX: 16,
    // Damage visuals
    CSS_FILTER: "blur(1px) brightness(110%) contrast(84%) hue-rotate(275deg) opacity(100%) saturate(187%)",
    FILTER_DURATION: 150,
    DAMAGE_IMG_SRC: 'electric2.png',
    DAMAGE_STYLE: {
        'position': 'absolute',
        'left': 0,
        'top': 0,
        'width': '95%',
        'height': '95%',
        'opacity': 1
    },
    DAMAGE_ANIM_DURATION: 250
}

const HP_INDICATOR_CONFIG= {
    WRAPPER_CLASS: 'bnty_hp_indicator',
    FILL_CLASS: 'bnty_hp_fill',
    LOW_TRESHOLD: 50,
    CRITICAL_TRESHOLD: 25,
    LOW_HEALTH_CLASS: 'low-health',
    CRITICAL_HEALTH_CLASS: 'critical-health'
};

const POWERUP_SPAWN_CONFIG = {
    // Positioning
    INITIAL_POS_OFFSET: 15,
    LEFT_SCREEN_EDGE_SAFE_ZONE: 15,
    RIGHT_SCREEN_EDGE_SAFE_ZONE: 30,
    SAFE_LEFT_EDGE_POSITION: 15,
    SAFE_RIGHT_EDGE_OFFSET: 60,
    PARENT_LEFT_DIRECTION: 'left',
    PARENT_RIGHT_DIRECTION: 'right',
    // Image attributes
    IMG_CLASS: 'bnty_img',
    BASE_STYLE: { "width" : 50, "height" : 50, "position" : "absolute"},
    // Animation
    ANIM_DIMENSIONS_GROW: 68,
    ANIM_DIMENSIONS_SHRINK: 60,
    ANIM_DURATION_MS: 1500,
    ANIM_EASING: 'linear',
    FADE_OUT_OPACITY: 0.10,
    PRESENCE_DURATION: 7000,
    AUDIO_KEY: '#bounty1'
}

const POWERUP_REGISTRY = {
            1:{type: 'a_bomb', src: 'bounties/a_bomb1.png'},
            2:{type: 'dual_fire', src: 'bounties/dual_fire1.png'},
            3:{type: 'h_missiles', src: 'bounties/h_missiles1.png'},
            4:{type: 'lazer', src: 'bounties/lazer1.png'},
            5:{type: 'tracking_lazer', src: 'bounties/tracking_lazer1.png'},
            6:{type: 'twin_lazer', src: 'bounties/twin_lazer1.png'},
            7:{type: 'shield', src: 'bounties/shield1.png'}    
}

const POWERUP_TYPES = Object.values(POWERUP_REGISTRY).map(p => p.type);