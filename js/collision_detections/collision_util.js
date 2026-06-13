/**
 * Iterates through a pool of entities and dispatches those currently active 
 * to a resolver function along with their spatial neighbors.
 * 
 * @param {Array<Object>} pool - The collection of entities to check for collisions.
 * @param {Function} resolver_fn - The callback function to handle interaction logic 
 *                                 between an entity and its nearby neighbors.
 */
function dispatch_collisions(pool, resolver_fn) {
    if (!pool) return;
    for (let i = 0; i < pool.length; i++) {
        const entity = pool[i];
        if (entity.is_active && is_entity_valid(entity)) {
            const neighbors = SPATIAL_GRID.get_entities_in_rect(entity.rect);
            if (neighbors.size > 0) {
                resolver_fn(entity, neighbors);
            }
        }
    }
}

/**
 * Performs Axis-Aligned Bounding Box (AABB) collision detection between two rectangular objects.
 * This function checks if two DOMRect objects are overlapping in 2D space.
 *
 * @param {DOMRect} rect1 - The DOMRect object of the first rectangular entity.
 * @param {DOMRect} rect2 - The DOMRect object of the second rectangular entity.
 * @returns {boolean} True if the two rectangles are overlapping, false otherwise.
 */
function check_collision(rect1, rect2) {
    if (!rect1 || !rect2) return false;
    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    );
}