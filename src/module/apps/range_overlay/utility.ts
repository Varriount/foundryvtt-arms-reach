import CONSTANTS from '../../constants';

export function getCurrentToken() {
  const tokens = <Token[]>canvasTokensControlled();
  if (tokens?.length > 0) {
    return tokens[0];
  } else {
    const activeTokens = game.user?.character?.getActiveTokens();
    if (activeTokens) {
      return activeTokens[0];
    } else {
      return undefined;
    }
  }
}

export function getWeaponRanges(): number[] {
  const rangeStringsSetting = <string>game.settings.get(CONSTANTS.MODULE_NAME, 'ranges');
  const rangeStrings = rangeStringsSetting.split(',');
  const ranges: number[] = [];
  for (const rangeString of rangeStrings) {
    const range = parseInt(rangeString);
    if (!isNaN(range)) {
      ranges.push(range);
    }
  }
  if (ranges.length) {
    return ranges;
  } else {
    return CONSTANTS.DEFAULT_WEAPON_RANGES.split(',').map((r) => parseInt(r));
  }
}

export function safeDestroy(thing) {
  try {
    thing.destroy();
  } catch (error) {
    // Already destroyed; ignore
  }
}

// For some reason the combatant just has the Token's data structure, not the Token object
export function getCombatantToken(combatant) {
  const tokenId = combatant.token.id;
  // noinspection JSUnresolvedFunction
  return canvas.tokens?.get(tokenId);
}

// Abstract this to avoid Idea's warnings
export function getCombatantTokenDisposition(combatantToken) {
  // noinspection JSUnresolvedVariable
  return combatantToken.data.disposition;
}

export function calculateGridDistance(pt1, pt2) {
  const dx = Math.abs(pt1.x - pt2.x);
  const dy = Math.abs(pt1.y - pt2.y);
  return Math.abs(dx - dy) + Math.floor((Math.min(dx, dy) * 3) / 2);
}

/*
 * Abstract these to avoid Idea's warnings
 */
export function canvasGridSize() {
  // noinspection JSUnresolvedVariable
  return canvas.grid?.size;
}

export function canvasTokensGet(tokenId) {
  // noinspection JSUnresolvedFunction
  return canvas.tokens?.get(tokenId);
}

export function canvasTokensControlled() {
  // noinspection JSUnresolvedVariable
  return canvas.tokens?.controlled;
}
