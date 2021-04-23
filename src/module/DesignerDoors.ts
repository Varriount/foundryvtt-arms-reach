import { MODULE_NAME } from "./settings";


export const DesignerDoors = {


  // Global function to cache default textures
  cacheTex : (key) => {

    const defaultPath = <string>game.settings.get(MODULE_NAME, key);
    TextureLoader.loader.loadTexture(defaultPath);

  },

  init : function(){

    // Cache default icons on setup of world
    console.log(`Loading ${MODULE_NAME} default door textures`);
    DesignerDoors.cacheTex('doorClosedDefault');
    DesignerDoors.cacheTex('doorOpenDefault');
    DesignerDoors.cacheTex('doorLockedDefault');
    console.log(`${MODULE_NAME} texture loading complete`);

  },

  // Override of the original getTexture method.
  // Adds additional logic for checking which icon to return
  getTextureOverride : async function(doorControl) {

      if (doorControl.wall.getFlag(MODULE_NAME, 'doorIcon') === undefined) {

          let s = doorControl.wall.data.ds;
          const ds = CONST.WALL_DOOR_STATES;
          if (!game.user.isGM && s === ds.LOCKED ) s = ds.CLOSED;
          const textures = {
              [ds.LOCKED]: game.settings.get(MODULE_NAME, 'doorLockedDefault'),
              [ds.CLOSED]: game.settings.get(MODULE_NAME, 'doorClosedDefault'),
              [ds.OPEN]: game.settings.get(MODULE_NAME, 'doorOpenDefault'),
          };
          return getTexture(textures[s] || ds.CLOSED);

      }

      let s = doorControl.wall.data.ds;
      const ds = CONST.WALL_DOOR_STATES;
      if (!game.user.isGM && s === ds.LOCKED) s = ds.CLOSED;
      const wallPaths = doorControl.wall.getFlag(MODULE_NAME, 'doorIcon');
      const textures = {
          [ds.LOCKED]: wallPaths.doorLockedPath,
          [ds.CLOSED]: wallPaths.doorClosedPath,
          [ds.OPEN]: wallPaths.doorOpenPath,
      };
      return getTexture(textures[s] || ds.CLOSED);

  },

  // Wall Config extension. Allows each door to have individual icons
  renderWallConfigHandler : function(app, html, data) {

    // If the wall is not a door, break out of this script.
    // This will stop Designer Doors being added to the wall config form
    if (data.object.door === 0) {

        app.setPosition({
            height: 270,
            width: 400,
        });
        return;

    }

    // If the wall is a door, extend the size of the wall config form
    app.setPosition({
        height: 700,
        width: 400,
    });

    let thisDoor; // Object containing closed, open and locked paths as parameters

    // Flag logic.
    // Check for initial flag. If not present set default values.
    if (app.object.getFlag(MODULE_NAME, 'doorIcon') === undefined) {

        // If wall has no flag, populate thisDoor from default settings
        thisDoor = {
            doorClosedPath: game.settings.get(MODULE_NAME, 'doorClosedDefault'),
            doorOpenPath: game.settings.get(MODULE_NAME, 'doorOpenDefault'),
            doorLockedPath: game.settings.get(MODULE_NAME, 'doorLockedDefault'),
        };
        // Then set flag with contents of thisDoor
        app.object.setFlag(MODULE_NAME, 'doorIcon', thisDoor);

    } else {

        // If the flag already exist, populate thisDoor with the flag
        thisDoor = app.object.getFlag(MODULE_NAME, 'doorIcon');

    }

    const doorClosedFlag = thisDoor.doorClosedPath;
    const doorOpenFlag = thisDoor.doorOpenPath;
    const doorLockedFlag = thisDoor.doorLockedPath;

    // html to extend Wall Config form
    const message =
    `<div class="form-group">
        <label>Door Icons</label>
        <p class="notes">File paths to icons representing various door states.</p>
        </div>

    <div class="form-group">
		<label>Door Close</label>
		<div class="form-fields">
			<button type="button" class="file-picker" data-type="img" data-target="flags.${MODULE_NAME}.doorIcon.doorClosedPath" title="Browse Files" tabindex="-1">
			    <i class="fas fa-file-import fa-fw"></i>
			</button>
			<input class="img" type="text" name="flags.${MODULE_NAME}.doorIcon.doorClosedPath" value="${doorClosedFlag ? doorClosedFlag : ``}" placeholder="Closed Door Icon Path" data-dtype="String" />
		</div>
	</div>

    <div class="form-group">
		<label>Door Open</label>
		<div class='form-fields'>
			<button type='button' class='file-picker' data-type='img' data-target='flags.${MODULE_NAME}.doorIcon.doorOpenPath' title='Browse Files' tabindex='-1'>
				<i class='fas fa-file-import fa-fw'></i>
			</button>
			<input class='img' type='text' name='flags.${MODULE_NAME}.doorIcon.doorOpenPath' value='${doorOpenFlag ? doorOpenFlag : ``}' placeholder='Open Door Icon Path' data-dtype='String' />
	    </div>
	</div>

    <div class='form-group'>
		<label>Door Locked</label>
		<div class='form-fields'>
			<button type='button' class='file-picker' data-type='img' data-target='flags.${MODULE_NAME}.doorIcon.doorLockedPath' title='Browse Files' tabindex='-1'>
			    <i class='fas fa-file-import fa-fw'></i>
			</button>
			<input class='img' type='text' name='flags.${MODULE_NAME}.doorIcon.doorLockedPath' value='${doorLockedFlag ? doorLockedFlag : ``}' placeholder='Locked Door Icon Path' data-dtype='String' />
        </div>
	</div>
    `;

    // Thanks to Calego#0914 on the League of Extraordinary FoundryVTT Developers
    // Discord server for the jQuery assistance here.
    // Adds form-group and buttons to the correct position on the Wall Config
    html.find('.form-group').last().after(message);

    // File Picker buttons
    const button1 = html.find(`button[data-target="flags.${MODULE_NAME}.doorIcon.doorClosedPath"]`)[0];
    const button2 = html.find(`button[data-target="flags.${MODULE_NAME}.doorIcon.doorOpenPath"]`)[0];
    const button3 = html.find(`button[data-target="flags.${MODULE_NAME}.doorIcon.doorLockedPath"]`)[0];

    app._activateFilePicker(button1);
    app._activateFilePicker(button2);
    app._activateFilePicker(button3);

    // On submitting the Wall Config form, requested textures are added to the cache

    const form = document.getElementById('wall-config');
    form.addEventListener('submit', (e) => {

        const nameDefCP = `flags.${MODULE_NAME}.doorIcon.doorClosedPath`;
        const nameDefOP = `flags.${MODULE_NAME}.doorIcon.doorOpenPath`;
        const nameDefLP = `flags.${MODULE_NAME}.doorIcon.doorLockedPath`;

        //@ts-ignore
        const wallConfDCD = document.getElementsByName(nameDefCP)[0].value; // TODO HTMLElement property value not mapped
        //@ts-ignore
        const wallConfDOD = document.getElementsByName(nameDefOP)[0].value; // TODO HTMLElement property value not mapped
        //@ts-ignore
        const wallConfDLD = document.getElementsByName(nameDefLP)[0].value; // TODO HTMLElement property value not mapped

        e.preventDefault();
        TextureLoader.loader.loadTexture(wallConfDCD);
        TextureLoader.loader.loadTexture(wallConfDOD);
        TextureLoader.loader.loadTexture(wallConfDLD);

    });

  },

  // Cache default textures on submitting Settings Config
  // Only really needed if default textures are changed, but as I haven't
  // yet figured out how to only run on changes, it will just run on every
  // submission of the settings form.
  renderSettingsConfigHandler: function(app, html, user){

    const form = document.getElementById('client-settings');
    form.addEventListener('submit', (e) => {

        const setDefCD = document.getElementsByName(`${MODULE_NAME}.doorClosedDefault`);
        const setDefOD = document.getElementsByName(`${MODULE_NAME}.doorOpenDefault`);
        const setDefLD = document.getElementsByName(`${MODULE_NAME}.doorLockedDefault`);

        e.preventDefault();
        //@ts-ignore
        TextureLoader.loader.loadTexture(setDefCD[0].value); // TODO HTMLElement property value not mapped
        //@ts-ignore
        TextureLoader.loader.loadTexture(setDefOD[0].value); // TODO HTMLElement property value not mapped
        //@ts-ignore
        TextureLoader.loader.loadTexture(setDefLD[0].value); // TODO HTMLElement property value not mapped

    });
  },

  // On scene change, scan for doors and cache textures
  canvasInitHandler : function(){

    // List of all walls in scene
    const sceneWalls = game.scenes.viewed.data.walls;

    for (let i = 0; i < sceneWalls.length; i++) {

        // Check wall for designerdoors flag
        if (MODULE_NAME in sceneWalls[i].flags) {

            const wall = sceneWalls[i];

            // If flag found, extract three paths and add files to cache
            // const wcCD = wall.flags.designerdoors.doorIcon.doorClosedPath;
            // const wcOD = wall.flags.designerdoors.doorIcon.doorOpenPath;
            // const wcLD = wall.flags.designerdoors.doorIcon.doorLockedPath;

            const nameDefCP = `flags.${MODULE_NAME}.doorIcon.doorClosedPath`;
            const nameDefOP = `flags.${MODULE_NAME}.doorIcon.doorOpenPath`;
            const nameDefLP = `flags.${MODULE_NAME}.doorIcon.doorLockedPath`;

            //@ts-ignore
            const wcCD = document.getElementsByName(nameDefCP)[0].value; // TODO HTMLElement property value not mapped
            //@ts-ignore
            const wcOD = document.getElementsByName(nameDefOP)[0].value; // TODO HTMLElement property value not mapped
            //@ts-ignore
            const wcLD = document.getElementsByName(nameDefLP)[0].value; // TODO HTMLElement property value not mapped

            TextureLoader.loader.loadTexture(wcCD);
            TextureLoader.loader.loadTexture(wcOD);
            TextureLoader.loader.loadTexture(wcLD);

        }

    }

    // Cache default icons on scene change
    console.log(`Loading ${MODULE_NAME} default door textures`);
    DesignerDoors.cacheTex('doorClosedDefault');
    DesignerDoors.cacheTex('doorOpenDefault');
    DesignerDoors.cacheTex('doorLockedDefault');
    console.log(`${MODULE_NAME} texture loading complete`);
  }



}