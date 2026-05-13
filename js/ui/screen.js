/**
 * Global window resize listener for responsive layout maintenance.
 * 
 * Implements a debounced execution pattern (200ms) to prevent performance 
 * degradation during active resizing. On completion, it:
 * 1. Re-generates the background stars to match new viewport dimensions.
 * 2. Mathematically re-centers any visible jQuery UI dialog instances.
 * 
 * @listens window:resize
 * @requires create_background - Function to redraw background elements.
 * @requires UI_CONFIG - Accesses RESIZE_DEBOUNCE_MS and CENTER_POSITION.
 */
let resize_timer;
$(window).on('resize', function() {
    const { RESIZE_DEBOUNCE_MS, DIALOG_SELECTOR, CENTER_POSITION } = UI_CONFIG.WINDOW;

    clearTimeout(resize_timer);
    resize_timer = setTimeout(function() {
        create_background();

        const $active_dialog = $(DIALOG_SELECTOR);
        if ($active_dialog.length > 0) {
            //  re-center jQuery UI dialogs
            $active_dialog.dialog("option", "position", CENTER_POSITION);
        }
    }, RESIZE_DEBOUNCE_MS); 
});

/**
 * Triggers a screen shake effect for a specified duration.
 * @param {number} delay - Initial delay of effect in milliseconds.
 * @param {number} duration - How long the shake lasts in milliseconds.
 */
function trigger_screen_shake( delay, duration) {
    setTimeout(() => {        
    const SHAKE_CLASS = UI_CONFIG.WINDOW.SHAKE_ACTIVE_CLASS;
    const $container = $("body"); 
    
    $container.addClass(SHAKE_CLASS);
    
    setTimeout(() => {
        $container.removeClass(SHAKE_CLASS);
        $container.css("transform", ""); 
    }, duration);
   }, delay); 
}

/**
 * Generates a grid-based star background using configuration constants.
 * Ensures a protected top margin is maintained.
 */
function create_background() {
    const { CLASS, PATH, BASE_DIMENSION_PX, HEIGHT_RND_MULTIPLIER, HEIGHT_RND_SEED, PARENT} 
           = UI_CONFIG.WINDOW.BACKGROUND.ELEMENT;
    const { ROWS, COLS, TOP_MARGIN} = UI_CONFIG.WINDOW.BACKGROUND.GRID;    

    $(`.${CLASS}`).remove();
    
    const win_w = $(window).width();
    const win_h = $(window).height();
    
    const cell_width = win_w / COLS;
    const cell_height = (win_h - TOP_MARGIN) / ROWS;

     /**
     * Internal helper to load and position an individual star.
     */
    function place_star(col, row) {
        unified_image_loader(PATH, (one_star_img) => {
            one_star_img.addClass(CLASS);

            const original_width = one_star_img[0].naturalWidth || BASE_DIMENSION_PX;
            const original_height = one_star_img[0].naturalHeight || BASE_DIMENSION_PX;

            const img_height = Math.round(Math.random() * HEIGHT_RND_MULTIPLIER) + HEIGHT_RND_SEED; 
            const img_width = (original_width / original_height) * img_height;

            const pozx = (col * cell_width) + (Math.random() * (cell_width - img_width));
            const pozy = TOP_MARGIN + (row * cell_height) + (Math.random() * (cell_height - img_height));

            one_star_img.css({                
                "top": Math.max(0, pozy),
                "left": Math.max(0, pozx),
                "height": img_height,
                "width": img_width
            });
            one_star_img.appendTo($(PARENT)).show();
        });
    }

    //  Loop through the 6x6 grid
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            
            place_star(c, r);
        }
    } 
}