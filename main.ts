// main.ts
import { Plugin, PluginSettingTab, Setting} from 'obsidian'
import MyPopupModal from "src";

export default class MyPlugin extends Plugin {
  async onload() {
    console.log("Loading MyPlugin here");

    // Register the command to open the popup
    this.addCommand({
      id: "open-explorer",
      name: "File Explorer",
      callback: () => {
        new MyPopupModal(this.app).open();
      },
    });

    // Add a ribbon icon that opens the popup
    const ribbonIconEl = this.addRibbonIcon("popup-open", "Open Popup", (evt: MouseEvent) => {
      new MyPopupModal(this.app).open();
    });
    
    // Optional: add a tooltip for the ribbon icon
    ribbonIconEl.setAttribute("aria-label", "Open Popup");


			const folderPath = ".tagfoldermeta"; 
	        // Check if the folder exists
			const folderExists = await this.app.vault.adapter.exists(folderPath);

			if (!folderExists) {
				// Folder doesn't exist, create it
				await this.app.vault.createFolder(folderPath);
				// console.log(`Folder "${folderPath}" created successfully.`);
			} else {
				// console.log(`Folder "${folderPath}" already exists.`);
			}

  }

  onunload() {
    console.log("Unloading MyPlugin");
  }
}


                                                                                                                                  