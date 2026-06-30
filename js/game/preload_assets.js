/**
 * Iterates through a list of URLs and loads them into the browser cache.
 * @param {string[]} url_list 
 * @returns {Promise<void[]>} Resolves when all images are loaded.
 */
function preload_images(url_list) {
    const promises = url_list.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = () => {
                console.warn(`Failed to preload image: ${url}`);
                resolve(); // Resolve anyway to keep the game loading
            };
            img.src = url;
        });
    });
    return Promise.all(promises);
}


/**
 * Preloads audio files by creating hidden DOM elements.
 */
function preload_audio(audio_urls) {
    audio_urls.forEach(url => {
        const audio = new Audio();
        audio.preload = "auto";
        audio.src = url;
        audio.load(); // Forces the browser to start downloading
    });
}

async function initialize_game_assets() {
    // 1. Gather all URLs from your config files
    const image_assets = [
        ...Object.values(ENEMY_SPAWN_CONFIG.TYPES).map(t => t.IMG_SRC),
        BAZIS_SHOTS_CONFIG.SINGLE_LAZER_SHOT.IMG_SRC,
        SECONDARY_WEAPONS_CONFIG.GOD_MODE.BAZIS_IMG_GOD_MODE_SRC,
        // ... add others
    ];

    const audio_assets = Object.values(AUDIO_CONFIG.TRACKS);

    // 2. Show a loading indicator in the UI
    update_center_display("LOADING ASSETS...");

    // 3. Wait for everything to finish
    await preload_images(image_assets);
    preload_audio(audio_assets);

    // 4. Reveal the Start button
    show_start_dialog();
}