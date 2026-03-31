/**
 * Generic guard to check if a game entity has its required components.
 * @param {Object} entity_data - The object to check (enemy, bazis, bounty, etc.)
 * @returns {boolean} True if the entity is valid and ready for use.
 */
function is_entity_valid(entity_data) {
    // Returns true only if the data exists AND has both an element and a rect
    return !!(entity_data?.element && entity_data?.rect);
}

