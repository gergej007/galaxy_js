BOSS_SHOTS_CONFIG = {
    CONE_SHOT_TYPE_1: {
        CLASS: 'boss_tuz_1',
        DAMAGE: 5,
        TYPE: 'Boss Shot 1',
        BASE_STYLE : {
            "position": "absolute", "box-shadow": "0px -1px 1px 2px rgba(79, 245, 245, 0.982)", "z-index": "220",
            "width": "10px", "height": "10px", "border-radius": "3px", "background":" rgb(221, 109, 255)"
        }
    },
    CONE_SHOT_TYPE_3: {
        CLASS: 'boss_tuz_3',
        DAMAGE: 8,
        TYPE: 'Boss Shot 3',
        BASE_STYLE : {
            "position": "absolute", "box-shadow": "0px -1px 1px 2px rgba(254, 93, 57, 0.954)", "z-index": 220,
            "width": 8, "height": 8, "border-radius": "4px", "background":" rgb(223, 36, 2)"
        }
    },
    HOMING_SHOT: {
        CLASS: 'celzott_bs_loves',
        DAMAGE: 12,
        TYPE: 'Boss Shot Homing', 
        INITIAL_OFFSET_Y: 0.85,      
        BASE_STYLE: {
            "position": "absolute", "box-shadow":" 0px -1px 1px 2px rgba(209, 253, 255, 0.954)", "z-index": 220,
            "width": 10, "height": 10, "border-radius": "4px", "background":" rgb(38, 255, 248)"
        }
    },
    HOMING_SHOT_EXPLOSION: {
        DISTANCE_FROM_SCREEN_BOTTOM: 0.98,
        ANIM_X: 55,
        ANIM_Y: 55,
        ANIM_DURATION: 500
    },
    LAZER_SHOT: { 
        CLASS: 'bs_lazer_lovedek', 
        DAMAGE: 10, 
        TYPE: 'Boss Twin Lazer',           
        X_OFFSET_PERCENT_FROM_CENTER: 0.10,       
        Y_OFFSET_CORRECTION: -10, // Y offset from boss bottom for launch point
        DIRECTION_CORRECTION: 0.032,
        LAZER_ANIM_TARGET_TOP_PERCENT: 0.44, // Where top of lazer animates to (e.g., 60% down screen)
        LAZER_ANIM_HEIGHT_PERCENT: 0.4, // How much of window height the lazer expands/shrinks to
        ANIM_OPACITY_1: 1,
        ANIM_OPACITY_2: 0.3,
        ANIM_HEIGHT_2: 400,
        BASE_STYLE: { "position": "absolute", "z-index": 300, "width":7, "height": 20,
                      "background":"rgb(218, 0, 0)", "box-shadow": "2px 2px 4px rgba(255, 71, 20, 0.772)",
                      "border-radius": "2px"} 
    },
    EMP_SHAKE: {
        ANIM_WIDTH: 500,
        ANIM_TOP: -50, 
        ANIM_LEFT_MULTIPLIER: 0.30,
        ANIM_DURATION: 250,
        HIDE_DURATION: 100,
        KICK_BACK_AMMOUNT: 90,
        KICK_BACK_DURATION: 250 
    }
};