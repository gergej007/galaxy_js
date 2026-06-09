
/*  --- START PANEL ---  */
/**
 * Initializes and displays the main menu or pause dialog.
 * 
 * This function performs the following operations:
 * 1. Halts gameplay by updating 'traffic_flag' and stopping enemy logic.
 * 2. Signals that a UI modal is active via 'dialog_flag'.
 * 3. Lazily initializes the jQuery UI dialog container if it doesn't exist.
 * 4. Asynchronously retrieves the menu template and populates the dialog.
 * 5. Updates the center HUD with the current boss score requirement.
 * 
 * @requires jQuery
 * @requires jQueryUI
 * @requires stop_base_level_enemies - Function to freeze active enemy entities.
 * @global {Object} game_data - Accesses game states and score limits.
 * @global {Object} dialogs - Accesses start_panel element and template URL.
 * @global {Object} displays - Accesses center_display for status messages.
 */                                                     
function show_start_panel() {
    // 1. Update Game State
    game_data.game_states.dialog_flag = true;
    game_data.game_states.traffic_flag = false;
    stop_base_level_enemies();

    const { WIDTH, HEIGHT, MODAL, DRAGGABLE, RESIZABLE} = UI_CONFIG.DIALOGS.COMMON;
    const { TITLE, CLASS, SECONDARY_COLOR} = UI_CONFIG.DIALOGS.START;

    // 2. Create/Reference Element
    if (!dialogs.start_panel.element) {
        dialogs.start_panel.element = $(`<div class='${CLASS}'>`);
    }
    const $panel = dialogs.start_panel.element;

    // 3. Initialize jQuery UI Dialog
    $panel.dialog({
        title: TITLE,
        resizable: RESIZABLE,
        draggable: DRAGGABLE,
        modal: MODAL,
        width: WIDTH,
        height: HEIGHT,
        closeOnEscape: false,
        open: function () {
            
            $.get(dialogs.start_panel.template_url, (template) => {
                $panel.html(template);
                
                // use displays object + visibility reset
                const msg = `Reach score <span class='${SECONDARY_COLOR}'>${game_data.limits.boss_limit}</span> to face the Boss!`;
                displays.center_display.element
                    .css("opacity", 1)
                    .show()
                    .html(msg);
            });
        },
        close: () => {
            game_data.game_states.dialog_flag = false;
            displays.center_display.element.empty();
        }
    });
}

/**
 * Global keyboard event listener for managing core game state transitions.
 * 
 * Handles the following interactions:
 * 1. SPACE: Resumes the game if a dialog is currently open and the game is not exiting.
 *    - Closes the start panel.
 *    - Switches background music to active combat track.
 *    - Re-enables enemy traffic and spawning if the boss is not currently active.
 * 
 * 2. ESCAPE: Pauses the game if no boss is active, the game is not exiting, 
 *    traffic is active, and no special bounty phase is running.
 *    - Triggers the display of the main menu/pause panel via show_start_panel().
 * 
 * @listens keydown
 * @param {KeyboardEvent} e - The native browser keyboard event.
 * @requires show_start_panel - Function to initialize and display the pause menu.
 * @requires play_bg_music - Function to handle audio track transitions.
 * @requires schedule_next_enemy_spawn_attempt - Logic to resume enemy waves.
 * @global {Object} game_data - Accesses current game state flags.
 * @global {Object} dialogs - Accesses start panel dialog reference.
 */
$(document).on("keydown", (e) => {
    const states = game_data.game_states;
    const { BG_AUDIO_KEY, DELAY_START_MS} = UI_CONFIG.DIALOGS.START;
    const { RESUME, PAUSE} = UI_CONFIG.INPUT.KEYS;

    // SPACE - Start/Resume Game
    if (e.key === RESUME && states.dialog_flag && !states.exit_flag) {
        e.preventDefault();
        dialogs.start_panel.element.dialog("close");
        play_bg_music(BG_AUDIO_KEY);

        if (!states.boss_flag) {
            states.traffic_flag = true;
            schedule_next_enemy_spawn_attempt(DELAY_START_MS, current_level_config.direction_pattern);
        }
    }

    // ESCAPE - Pause Game
    if (e.key === PAUSE && !states.boss_flag && !states.exit_flag && states.traffic_flag && !states.bounty_flag) {
        show_start_panel();
        const homing_missiles = base_level_entities.homing_missiles;
       
        homing_missiles.forEach(missile => {
             if (missile.is_active) {
                   if (missile.element) missile.element.stop(true, true);        
                      return_homing_missile_to_pool(missile);
            }
        });
    }
});