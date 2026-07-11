window.keys_pressed = {};
/**
 * Initializes the keyboard listeners to track key states.
 */
function bazis_key_binding() {
    
    $(document).on('keydown', (e) => {
        if(game_data.game_states.initialize_flag) return;

        window.keys_pressed[e.key] = true;

        switch (e.key){
            case " ":                                     // Spacebar
                handle_fire_input();
                break;

            case "Alt":                                  // A-bomb launch
            case "AltGraph":
                e.preventDefault(); 
                handle_bomb_input();     
                break;
        }
        
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
            e.preventDefault();
        }
    });

    $(document).on('keyup', (e) => {
        // Remove the key from the state when released
        delete window.keys_pressed[e.key];
    });
}

/**
 * Dedicated function to be called from the main Game Loop.
 * Processes active key states and passes Delta Time to movement handlers.
 * @param {number} dt - The delta time multiplier from the game loop.
 */
function process_player_input(dt) {                    // Input Polling

    const bazis_data = base_level_entities.bazis;
    
    if (!is_entity_valid(bazis_data) || game_data.game_states.dialog_flag || game_data.game_states.exit_flag) {
        return;
    }

    if (window.keys_pressed["ArrowUp"]) {
        handle_up_arrow_input(bazis_data, dt);
    }
    if (window.keys_pressed["ArrowDown"]) {
        handle_down_arrow_input(bazis_data, dt);
    }
    if (window.keys_pressed["ArrowLeft"]) {
        handle_left_arrow_input(bazis_data, dt);
    }
    if (window.keys_pressed["ArrowRight"]) {
        handle_right_arrow_input(bazis_data, dt);
    }  
}

/**
 * Global variable to track the timestamp of the previous frame.
 * Initialized with the current time.
 */
let last_frame_time = performance.now();

/**
 * Calculates the time difference between the current and previous frame.
 * Normalizes the result against a 60 FPS target (16.67ms).
 * 
 * @function calculate_delta_time
 * @param {DOMHighResTimeStamp} current_time - The current timestamp from requestAnimationFrame.
 * @returns {number} The delta time multiplier (1.0 = 60 FPS speed).
 */
function calculate_delta_time(current_time) {
    //  Calculate time passed since last frame in milliseconds
    const delta_time_MS = current_time - last_frame_time;
    
    //  Update lastFrameTime for the next frame
    last_frame_time = current_time;

    //  Normalize against 60 FPS (1000ms / 60 frames ≈ 16.67ms)
    // This returns a multiplier: 
    // If game runs at 60fps, dt = 1.0
    // If game runs at 30fps, dt = 2.0 (moves twice as far per frame)
    const dt = delta_time_MS / (1000 / 60);
    
    return dt || 1;
}
