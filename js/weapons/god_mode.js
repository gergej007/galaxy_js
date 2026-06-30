/**
 * Activates and deactivates "God Mode" for the player's bazis.
 * When activated, the player becomes invulnerable, and their bazis visual
 * changes to a "God Mode" image. After a configured duration, God Mode automatically
 * deactivates, and the bazis image reverts to its normal state.
 *
 * This function handles:
 * - Setting the `weapons.flags.god_mode` state.
 * - Changing the `src` attribute of the bazis image element.
 * - Scheduling the deactivation of God Mode via `setTimeout`.
 * - Includes checks for valid bazis data before proceeding.
 *
 * @returns {void}
 */
function god_mode() {
    const { DURATION_MS, BAZIS_IMG_NORMAL_SRC, BAZIS_IMG_GOD_MODE_SRC } = SECONDARY_WEAPONS_CONFIG.GOD_MODE;
    const bazis_data = base_level_entities.bazis;

    if (!bazis_data?.img_element?.length) return;

    const god_mode_img = new Image();
    
    god_mode_img.onload = function() {
        
        weapons.flags.god_mode = true;
        bazis_data.img_element.attr("src", BAZIS_IMG_GOD_MODE_SRC);

        setTimeout(() => {
            weapons.flags.god_mode = false;
            bazis_data.img_element.attr("src", BAZIS_IMG_NORMAL_SRC);
        }, DURATION_MS);
    };

    god_mode_img.onerror = function() {
        console.error(`God Mode failed: Image not found at ${BAZIS_IMG_GOD_MODE_SRC}`);
    };

    god_mode_img.src = BAZIS_IMG_GOD_MODE_SRC;
}