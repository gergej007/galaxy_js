/* --- SCORE PANEL --- */
/**
 * Initializes and displays the final high score leaderboard dialog.
 * 
 * This function performs the following setup:
 * 1. Creates the modal container if it does not already exist.
 * 2. Initializes the jQuery UI Dialog with specific dimensions and behaviors.
 * 3. Updates global game state flags to halt gameplay (traffic_flag) and 
 *    signal the end-of-game sequence (exit_flag).
 * 4. Invokes the template loading and data processing sequence via load_template.
 * 
 * @requires jQuery
 * @requires jQueryUI
 * @requires load_template - To populate the dialog with high score data.
 * @global {Object} game_data - Updates dialog_flag, exit_flag, and traffic_flag.
 * @global {Object} dialogs - Accesses and stores the score_panel element reference.
 */
function show_scores_table(){
    if (!dialogs.score_panel.element) {
        dialogs.score_panel.element = $(`<div class='${UI_CONFIG.DIALOGS.START.CLASS} ${UI_CONFIG.DIALOGS.SCORE.CLASS}'>`);
    }
    
    const {  WIDTH, HEIGHT, MODAL, DRAGGABLE, RESIZABLE } = UI_CONFIG.DIALOGS.COMMON;
    const { KEY_LOCK_DURATION} = UI_CONFIG.DIALOGS.SCORE;
    const score_panel = dialogs.score_panel;
    score_panel.element.dialog({
        title: UI_CONFIG.DIALOGS.SCORE.TITLE,
        resizable: RESIZABLE,
        draggable: DRAGGABLE,
        modal: MODAL,
        width: WIDTH,
        height: HEIGHT,
        closeOnEscape: false,
        open: function () {    
       
            load_template(score_panel);
            game_data.game_states.dialog_flag = true;     
            game_data.game_states.exit_flag = true;   
            game_data.game_states.traffic_flag = false; 
            game_data.game_states.input_lock = true;
            
            setTimeout(() => {
                game_data.game_states.input_lock = false;
            }, KEY_LOCK_DURATION);
        }
    });
}

/**
 * Loads the high score UI template and populates it with live server data.
 * 
 * This function performs the following asynchronous operations:
 * 1. Retrieves the HTML structure from the template URL.
 * 2. Fetches the current leaderboard rankings from the PHP backend.
 * 
 * Upon receiving data, it dynamically clones template rows, populates them with 
 * existing scores, and evaluates if the current player's score qualifies for the 
 * Top 10. If a record is achieved, it inserts an interactive name input field; 
 * otherwise, it displays the final score and enables the game restart listener.
 * 
 * @param {Object} score_panel - The score panel configuration object.
 * @param {jQuery} score_panel.element - The jQuery-wrapped dialog container.
 * @param {string} score_panel.template_url - The path to the .tpl file.
 * 
 * @requires jQuery.ajax
 * @requires setup_save_listener - To handle new record name entry.
 * @requires close_scores_dialog - To handle the "Space to Restart" interaction.
 */
function load_template(score_panel){

    $.get(score_panel.template_url, function (template) {
        const tempobj = $().add(template);
        tempobj.appendTo(score_panel.element);

    $.ajax({
        type: "post",
        url: UI_CONFIG.DIALOGS.SCORE.READ_URL,
        data: {},
        dataType: "json",
        success: function (response) {
            render_high_scores(response, tempobj, score_panel.element);
            },
        error: (err) => console.error("Score fetch failed", err)      
    });
    }); 
}

/**
 * Processes the server response and renders the high score leaderboard.
 * 
 * @param {Array} response - Array of score objects from PHP.
 * @param {jQuery} tempobj - The loaded template fragment.
 * @param {jQuery} $dialog - The dialog element container.
 */
function render_high_scores(response, tempobj, $dialog) {

    const { DATA_SCORE, ROW, POSITION, NAME, FINAL_SCORE, KILLED } = UI_CONFIG.DIALOGS.SCORE.TEMPLATE_CLASSES;
    let pos = 1;
    let templines = [];
    const $target = $(`.${UI_CONFIG.DIALOGS.SCORE.CLASS}`);
    const max_records = UI_CONFIG.DIALOGS.SCORE.MAX_RECORDS;

    //  Render existing scores from server
    response.forEach((item) => {
        const $row = tempobj.find(`.${ROW}`).clone(true, true);
        $row.data(DATA_SCORE, parseInt(item.score));

        $row.find(`.${POSITION}`).text(pos);
        $row.find(`.${NAME}`).text(item.name);
        $row.find(`.${FINAL_SCORE}`).text(item.score);
        $row.find(`.${KILLED}`).text(item.killed);

        $row.appendTo($target);
        templines[pos] = $row;
        pos++;
    });

    // Remove hidden template prototype
    tempobj.find(`.${ROW}`).remove();

    const { BOTTOM_INFO, TOP_INFO, NEW_RECORD, FIELD, PLAYER_NAME, PLACEHOLDER, HEADLINE} 
        = UI_CONFIG.DIALOGS.SCORE.TEMPLATE_CLASSES;

    const bottom_info_lane = tempobj.find(`.${BOTTOM_INFO}`);
    const top_info_lane = tempobj.find(`.${TOP_INFO}`);
    const player_score = game_data.counters.score;

    //  Check for Top 10 qualification
    if (player_score >= (templines[max_records]?.data(DATA_SCORE) || 0)) {

        for (let i = 1; i <= max_records; i++) {
            if (player_score >= (templines[i]?.data(DATA_SCORE) || 0)) {
                const $player_row = $(`
                    <div class="${ROW} ${NEW_RECORD}">
                        <div class="${POSITION} ${FIELD}">${i}</div>
                        <div class="${NAME} ${FIELD}">
                            <input type="text" id="${PLAYER_NAME}" placeholder="${PLACEHOLDER}"/>
                        </div>
                        <div class="${FINAL_SCORE} ${FIELD}">${player_score}</div>
                        <div class="${KILLED} ${FIELD}">${game_data.counters.killed}</div>
                    </div>`);

                $player_row.insertBefore(templines[i]);
                $(`#${PLAYER_NAME}`).focus();
                templines[max_records]?.remove();
                break;
            }
        }

        //  Prepare data for server sync
        let data_to_post = {};
        const current_rows = $(`.${ROW}`);

        for (let i = 0; i < current_rows.length; i++) {
            const $row = $(current_rows[i]);
            $row.find(`.${POSITION}`).text(i + 1);

            data_to_post[i] = {
                "class": $row.attr("class"),
                "name": $row.find(`.${NAME}`).text().trim(),
                "score": $row.find(`.${FINAL_SCORE}`).text().trim(),
                "killed": $row.find(`.${KILLED}`).text().trim()
            };
        }

        //  Finalize UI State
        bottom_info_lane.insertAfter($(current_rows[max_records-1]));
        bottom_info_lane.text("Type your name and press Enter!");
        top_info_lane.text("Congratulations! YOU HAVE A TOP 10 SCORE!");
        top_info_lane.insertBefore(tempobj.find(`.${HEADLINE}`));

        //  Bind Save Listener
        setup_save_listener(data_to_post, bottom_info_lane, $dialog);

    } else {
        // Handle non-qualification
        top_info_lane.text(`Congratulations! Your score: ${player_score}`);
        top_info_lane.insertBefore(tempobj.find(`.${HEADLINE}`));
        bottom_info_lane.insertAfter(templines[max_records]);
        bottom_info_lane.html("Press Space to proceed!");
        close_scores_dialog($dialog);
    }
}

/**
 * Configures the event listener for saving a new high score record.
 * 
 * Binds a namespaced keydown listener to the document to detect the "Enter" key. 
 * Upon a valid name entry, it:
 * 1. Identifies the player's specific record within the data set.
 * 2. Updates the record with the provided name.
 * 3. Triggers the server-side save via AJAX.
 * 4. Provides visual feedback and transitions the UI to the final exit state.
 * 
 * @param {Object} data_to_post - Map of score record objects, including the new entry.
 * @param {jQuery} bottom_info_lane - The UI element used to display instructions and status.
 * @param {jQuery} dialog_element - The jQuery-wrapped DOM element of the score dialog.
 * 
 * @requires save_records - Function defined to handle the PHP high score persistence.
 * @requires close_scores_dialog - Function to bind the final "Space to Restart" listener.
 */
function setup_save_listener(data_to_post, bottom_info_lane, dialog_element) {
    const {INPUT_STYLE} = UI_CONFIG.DIALOGS.SCORE;
    const {SAVE_SCORE} = UI_CONFIG.DIALOGS.SCORE.EVENTS;
    const {SUBMIT} = UI_CONFIG.DIALOGS.INPUT.KEYS;
    const {PLAYER_NAME, NEW_RECORD} = UI_CONFIG.DIALOGS.SCORE.TEMPLATE_CLASSES;

    $(document).off(SAVE_SCORE).on(SAVE_SCORE, function(e) {
        
        if (e.key === SUBMIT) {
            const $input = $(`#${PLAYER_NAME}`);
            const player_name = $input.val().trim();

            if (player_name !== "") {
                //  Visual Feedback: Lock the UI immediately
                $input.prop('disabled', true).css({
                    ...INPUT_STYLE
                });

                //  Update the name in data object
                const player_record = Object.values(data_to_post).find(
                    item => item.class.includes(NEW_RECORD)
                );
                if (player_record) player_record.name = player_name;

                save_records(data_to_post);

                bottom_info_lane.text("Saved! Press SPACE to proceed.");
                
                $(document).off(SAVE_SCORE);
                
                close_scores_dialog(dialog_element);
            }
        }
    });
}

/**
 * Persists the updated high score leaderboard to the server.
 * 
 * This function sends the complete top 10 data set (including the player's 
 * newly entered record) to the PHP backend via an asynchronous POST request. 
 * The server is expected to process this data and update the persistent 
 * storage (e.g., high_scores.csv).
 * 
 * @param {Object} data_to_post - A map of objects representing the top 10 scores.
 * @param {string} data_to_post[i].name - The player's name for rank i.
 * @param {string|number} data_to_post[i].score - The score achieved for rank i.
 * @param {string|number} data_to_post[i].killed - The kill count for rank i.
 * @param {string} data_to_post[i].class - The CSS classes associated with the row.
 * 
 * @requires jQuery.ajax
 * 
 * @example
 * // Called after the player enters their name and presses Enter
 * save_records(data_to_post);
 */
function save_records(data_to_post){
    $.ajax({
        type: "post",
        url: UI_CONFIG.DIALOGS.SCORE.SAVE_URL,
        data: data_to_post,
        dataType: "JSON",
        success: function (response) {
            console.log(response);
         }
    });    
}

/**
 * Binds a global key listener for the Space key to exit the high score screen.
 * Triggers a full page reload to reset the game state and object pools.
 * 
 * @param {jQuery} score_panel_element - The jQuery-wrapped DOM element of the score dialog.
 */
function close_scores_dialog(score_panel_element) {
    const {CLOSE_SCORE} = UI_CONFIG.DIALOGS.SCORE.EVENTS;
    const { RESUME } = UI_CONFIG.INPUT.KEYS;

    $(document).off(CLOSE_SCORE).on(CLOSE_SCORE, (e) => {
        if (e.key === RESUME) {
            e.preventDefault(); 
            
            if(!game_data.game_states.input_lock){
                score_panel_element.dialog("close");
                window.location.reload(true); 
            }            
        }
    });
}
