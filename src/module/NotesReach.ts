import { i18n, i18nFormat } from '../foundryvtt-arms-reach';
import {
  computeDistanceBetweenCoordinates,
  computeDistanceBetweenCoordinatesOLD,
  getCharacterName,
  getFirstPlayerToken,
  getPlaceableCenter,
  iteractionFailNotification,
} from './ArmsReachHelper';
import { ARMS_REACH_MODULE_NAME } from './settings';
import { canvas, game } from './settings';

export const NotesReach = {
  globalInteractionDistance: function (character: Token, note: Note, userId?: String): boolean {
    let isOwned = false;
    if (!character) {
      character = <Token>getFirstPlayerToken();
      if (character) {
        isOwned = true;
      }
    }
    if (!character) {
      if (game.user?.isGM) {
        return true;
      } else {
        return false;
      }
    }

    // Sets the global maximum interaction distance
    // OLD SETTING
    let globalInteraction = <number>game.settings.get(ARMS_REACH_MODULE_NAME, 'globalInteractionDistance');
    if (globalInteraction <= 0) {
      globalInteraction = <number>game.settings.get(ARMS_REACH_MODULE_NAME, 'globalInteractionMeasurement');
    }
    // Global interaction distance control. Replaces prototype function of Stairways. Danger...
    if (globalInteraction > 0) {
      // Check distance
      //let character:Token = getFirstPlayerToken();
      if (
        !game.user?.isGM ||
        (game.user?.isGM && <boolean>game.settings.get(ARMS_REACH_MODULE_NAME, 'globalInteractionDistanceForGM'))
      ) {
        if (!character) {
          iteractionFailNotification(i18n(`${ARMS_REACH_MODULE_NAME}.noCharacterSelectedForNote`));
          return false;
        } else {
          let isNotNearEnough = false;
          // OLD SETTING
          if (<number>game.settings.get(ARMS_REACH_MODULE_NAME, 'globalInteractionDistance') > 0) {
            const dist = computeDistanceBetweenCoordinatesOLD(NotesReach.getNotesCenter(note), character);
            isNotNearEnough = dist > <number>game.settings.get(ARMS_REACH_MODULE_NAME, 'globalInteractionDistance');
          } else {
            const dist = computeDistanceBetweenCoordinates(
              NotesReach.getNotesCenter(note),
              character,
              NoteDocument.documentName,
            );
            isNotNearEnough = dist > <number>game.settings.get(ARMS_REACH_MODULE_NAME, 'globalInteractionMeasurement');
          }
          if (isNotNearEnough) {
            const tokenName = getCharacterName(character);
            if (tokenName) {
              iteractionFailNotification(
                i18nFormat(`${ARMS_REACH_MODULE_NAME}.notesNotInReachFor`, { tokenName: tokenName }),
              );
            } else {
              iteractionFailNotification(i18n(`${ARMS_REACH_MODULE_NAME}.notesNotInReach`));
            }
            return false;
          } else {
            return true;
          }
        }
      } else if (game.user?.isGM) {
        // DO NOTHING
        return true;
      }
    }

    return false;
  },

  getNotesCenter: function (note: Note) {
    const noteCenter = {
      x: note.x - <number>canvas.dimensions?.size / 2,
      y: note.y - <number>canvas.dimensions?.size / 2,
      w: note.width,
      h: note.height,
    };
    return noteCenter;
    // return getPlaceableCenter(note);
  },
};
