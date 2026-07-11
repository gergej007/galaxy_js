const UI_CONFIG = {
    //  MODAL WINDOWS
    DIALOGS: {       
        COMMON: {
            WIDTH: 600,
            HEIGHT: 530,
            MODAL: false,
            DRAGGABLE: false,
            RESIZABLE: false
        },
        START: {
            TITLE: "Galaxy JS",
            TEMPLATE: "tpl/menu.tpl",
            CLASS: "start_panel",
            SECONDARY_COLOR: 'different_dsp_color',
            BG_AUDIO_KEY: "#track2",
            DELAY_START_MS: 100 
        },
        SCORE: {
            TITLE: "High Scores:",
            TEMPLATE: "tpl/high_scores.tpl",
            CLASS: "final_panel",
            READ_URL: "modulok/read_high_scores.php",
            SAVE_URL: "modulok/save_high_scores.php",            
            MAX_RECORDS: 10,
            KEY_LOCK_DURATION: 3000,

            TEMPLATE_CLASSES: {
                DATA_SCORE: "score",
                ROW: "score_records",
                POSITION: "position",
                NAME: "name",
                FINAL_SCORE: "score",
                KILLED: "killed",
                BOTTOM_INFO: "info_lane_bottom",
                TOP_INFO: "info_lane_top",
                NEW_RECORD: "new_record",
                FIELD: "scores_field",
                PLAYER_NAME: "player_name",
                PLACEHOLDER: "_ _ _ _ _ _ _ _ _ _",
                HEADLINE: "headline"
            },
            EVENTS: {
                SAVE_SCORE: "keydown.save_score",
                CLOSE_SCORE: "keydown.close_scores"
            },
            INPUT_STYLE: {
                background: "transparent",
                color: "aliceblue"}
        },
        INPUT: {
            KEYS: {
                PAUSE: "Escape",
                RESUME: " ",
                SUBMIT: "Enter"
            }
        }
    },

    // HEADS-UP DISPLAY (HUD)
    HUD: {
        LEFT: {
            SELECTOR: ".player_display",
            CRITICAL_HP: "rgb(255, 24, 24)",
            VALUE_CLASSES: { HP: "hp_val", LIVES: "lives_val", ATOMIC: "atomic_val", 
                             DIFF_COLOR: 'different_dsp_color', HP_CRITICAL: 'hp_critical' },
            IMAGE: { URL: 'kepek/atomic.png',WRAPPER_CLASS: 'atomic_wrapper', IMG_CLASS: 'atomic', TXT_CLASS: 'atomic_felirat' }
        },
        RIGHT: {
            SELECTOR: ".result_display",
            VALUE_CLASSES: { SCORE: "score", KILLED: "killed", ENEMIES: "enemies", DIFF_COLOR: 'different_dsp_color' }
        },
        CENTER: {
            PROGRESS_BAR: { SELECTOR: "#progress_frame", VALUE_SELECTOR:".ui-progressbar-value", INIT_DELAY: 1300, 
                            GREEN_BG: "rgb(37, 255, 48)", ORANGE_BG: "rgb(255, 175, 26)", RED_BG: "rgb(255, 24, 24)",
                            LOW_HP: 600, CRITICAL_HP: 150},
            ANIMATION: { DELAY: 1500, DURATION: 800 },
            CLASSES: { MAIN: "ui-pop-text" ,POP: "animate-pop", EXIT: "animate-exit", STATIC: "progress_frame_static_text" },
            VICTORY: { TEXT: 'VICTORY!', TEXT_CLASS: "victory-text-animate", DATA_KEY: "ui-progressbar", METHOD_DESTROY: "destroy",
                       LIFE_BONUS_DELAY: 1600 },
            LIFE_BONUS: { CONTAINER_CLASS: 'life_display', BONUS_CLASS: 'bonus_display',
                          INITIAL_DELAY: 3500, TICK_RATE: 35, BONUS_SCORE_PER_LIFE: 5000, COUNTER_INCREMENT: 100}           
        }
    },

    // INPUT TRIGGERS
    INPUT: {
        KEYS: {
            PAUSE: "Escape",
            RESUME: " ",
            SUBMIT: "Enter"
        }
    },

    // VISUAL ASSETS
    ASSETS: {
        ATOMIC_ICON: "kepek/atomic.png"
    },

    // WINDOW AND SCREEN
    WINDOW: {
        RESIZE_DEBOUNCE_MS: 200,
        DIALOG_SELECTOR: ".ui-dialog-content:visible",
        CENTER_POSITION: { 
            my: "center", 
            at: "center", 
            of: window 
        },
        BACKGROUND: {
            ELEMENT:{            
                PATH: "csillag.gif",
                CLASS: "star",
                BASE_DIMENSION_PX: 50,
                HEIGHT_RND_MULTIPLIER: 45,
                HEIGHT_RND_SEED: 30,
                PARENT: ".background_wrapper"                
            },
            GRID: {
                ROWS: 6,
                COLS: 6,
                TOP_MARGIN: 60
            }
        },
        SHAKE_ACTIVE_CLASS: 'shake-active'    
    },
    UI_IMAGES: [ 'galaxy_bg_2.gif', 'keys1.png', 'key2.png', 'key3.jpg', 'key4.png', 'key5.jpg']
};