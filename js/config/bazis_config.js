const BAZIS_CONFIG = {
    ELEMENT: {
        BAZIS_FRAME_CLASS: 'bazis',
        BAZIS_IMG_CLASS: 'bazis_img',
        BAZIS_IMG_SRC: 'bazis.png'
    },
    ACTIONS: {      
        MOTION_DISTANCE_PX: 8,
        HP_RESTORE_VALUE: 4,
    },  
    DAMAGE: {
        GAME_OVER_DELAY: 1000,
        GAME_OVER_TEXT: "Game Over",
        CSS_FILTER: "brightness(1.5) sepia(1) hue-rotate(180deg) saturate(5)",
        DAMAGE_DURATION: 150,
        DAMAGE_IMG_SRC: "villam1.gif",
        DAMAGE_IMG_CSS:  { "width": 15,
                           "height": 15,
                           "position": "absolute",
                           "z-index": 0, 
                           "left" : 25, 
                           "top" : 0,
                           "mix-blend-mode": "screen" } ,
        DAMAGE_IMG_ANIMATION: { "width": 120,
                                "height": 120,  
                                'left': -46, 
                                'top': -15   },
        ANIMATION_EASING: 'linear'                                                  
    },
    EXPLOSION: {
        AUDIO_KEY: ["#robbanas7", "#powerdwn1"],        
        EXPLOSION_IMG_SRC:"robban.gif",
        EXPLOSION_IMG_CLASS:'robbanas',
        CSS_HEIGHT: 270,
        Y_OFFSET_PX: 70,
        ANIM_OPACITY: 0.1,
        ANIM_DURATION: 800,
        ANIM_EASING: 'linear'
    },
    COLLISION: {
        KICK_DISTANCE: 70,
        DURATION: 250,
        EASING: "easeOutExpo"
    }  
}

