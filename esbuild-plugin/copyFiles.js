var path = require('path');
const fs = require('fs');

function postBuildPlugin(vaultPath, prod) {
	return {
	name: 'post-build',
	setup(build) {
		build.onEnd(async (result) => {
			console.log("Build finished. Running post-build logic...");
			let projectRoot = process.cwd()
			let filesToCopy = ["manifest.json", "styles.css", "main.js"]
			let pluginsDir = path.join(vaultPath, ".obsidian", "plugins")
			let manifestDetails = {
				path: path.join(projectRoot, "manifest.json"),
				content: {}
			}

			if(Object.keys(manifestDetails.content).length == 0){
				const data = fs.readFileSync(manifestDetails.path, 'utf8');
				manifestDetails.content = JSON.parse(data)
			}
			let pluginDir = createExtensionDir(pluginsDir, manifestDetails.content.id)
			filesToCopy.forEach((f)=> {
				let sourceDir = path.join(projectRoot,f)
				let targetDir = path.join(pluginDir,f)
				copyFile(sourceDir, targetDir)
			})
			if(!prod){
				const hotReload = path.join(pluginDir, ".hotreload")
				createEmptyFile(hotReload)
			}

		});
	},
};
}


function createEmptyFile(filename) {
    if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, '');
    }
}
function createExtensionDir(pluginsDir,extensionName){	
	let dir = path.join(pluginsDir, extensionName)
	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}
	return dir 
}

function copyFile(source, destination){
	try {
		fs.copyFileSync(source, destination);
	} catch (err) {
		console.error('Error copying file:', err);
	}
}

module.exports = {
	postBuildPlugin
};