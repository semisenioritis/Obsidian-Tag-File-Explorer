// main.ts

import { App, Modal, Plugin, PluginSettingTab, Setting, TFolder, TFile } from 'obsidian';
import { CachedMetadata } from 'obsidian';
import { normalizePath } from 'obsidian';
import { setIcon } from "obsidian";
import { listeners } from 'process';
import { parseYaml } from "obsidian";



import * as PhysFolderStructOps from "./PhysFolderStructOps";
import * as TagTreeOps from "./TagTreeOps";
import * as FileFuncs from "./FileFuncs";
import * as FolderFuncs from "./FolderFuncs";
import * as RenderView from "./RenderView";
import * as ButtonOperations from "./ButtonOperations";
import * as SearchFuncs from './SearchFuncs';





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

// Define the Modal for the popup
class MyPopupModal extends Modal {
  constructor(app: App) {
    super(app);
  }




// many of my views individually have multiple pages that coexist in the same locations.
// i want to learn how to allow them to exists parallelly in the same location programatically
// i also want to learn how drag and drop stuff functions and how it is implemented	  

// after this i will be refactoring the entire visual chunking and sectioning of the modal.
// currently its in a proof of concept, barly works kinda state. 
// 	  if i want to implement the multi page section issue adn stuff in this  plugin, then i need a better and smoother more object oriented ui

//  also need to update the codebase structure file in obsidian

// create folder and view buttons




	  
  async onOpen() {
    // const { contentEl } = this;
	const { modalEl, contentEl } = this;
	modalEl.style.width = "100%";
	modalEl.style.height = "100%";
	modalEl.classList.add("explorer-modal")



	// Create a custom button and add it beside the close button
	const headerEl = modalEl.querySelector('.modal-close-button')?.parentElement;

	const refreshButton = headerEl?.createDiv();
	refreshButton?.classList.add("refresh-header-button");

	if (refreshButton) {
		setIcon(refreshButton, "rotate-ccw");
	}

	const homeButton = headerEl?.createDiv();
	homeButton?.classList.add("home-header-button");

	if (homeButton) {
		setIcon(homeButton, "house");
	}

	// Define the functionality for the custom button
	refreshButton?.addEventListener("click", async () => {
		await this.refreshPage();	
	});

	// Define the functionality for the custom button
	homeButton?.addEventListener("click", async () => {
		await this.homePage();
	});









	contentEl.classList.add("main_grid");



	// Creating elements and assigning classes
	const topSection = contentEl.createDiv();
	topSection.classList.add(  "itemB", "path_bar");
	// topSection.innerText = "B";
	
	const topSection_right = contentEl.createDiv();
	topSection_right.classList.add(  "itemC");
	
	
	const midSection_right = contentEl.createDiv();
	midSection_right.classList.add(  "itemD", "description");
	// midSection_right.innerText = "D";
	
	const bottomSection_right = contentEl.createDiv();
	bottomSection_right.classList.add(  "itemE", "legend");
	// bottomSection_right.innerText = "E";
	
	const topSection_of_left_bottom = contentEl.createDiv();
	topSection_of_left_bottom.classList.add(  "itemF");
	topSection_of_left_bottom.innerText = "F";
	
	const bottomSection_of_left_bottom = contentEl.createDiv();
	bottomSection_of_left_bottom.classList.add(  "itemG", "file-tree-container");
	// bottomSection_of_left_bottom.innerText = "G";
	
	const topSection_of_right_bottom = contentEl.createDiv();
	topSection_of_right_bottom.classList.add(  "itemH");
	topSection_of_right_bottom.innerText = "H";
	
	const midSection_of_right_bottom = contentEl.createDiv();
	midSection_of_right_bottom.classList.add(  "itemI");
	midSection_of_right_bottom.innerText = "I";
	
	const bottomSection_of_right_bottom = contentEl.createDiv();
	bottomSection_of_right_bottom.classList.add(  "itemJ", "file_exp");
	// bottomSection_of_right_bottom.innerText = "J";
	
	const itemK = contentEl.createDiv();
	itemK.classList.add(  "itemK");
	itemK.innerText = "K";
	
	// Appending elements to the container
	contentEl.appendChild(topSection);
	contentEl.appendChild(topSection_right);
	contentEl.appendChild(midSection_right);
	contentEl.appendChild(bottomSection_right);
	contentEl.appendChild(topSection_of_left_bottom);
	contentEl.appendChild(bottomSection_of_left_bottom);
	contentEl.appendChild(topSection_of_right_bottom);
	contentEl.appendChild(midSection_of_right_bottom);
	contentEl.appendChild(bottomSection_of_right_bottom);
	contentEl.appendChild(itemK);
	
	
	
	const addressOfLocation = topSection.createDiv();
	addressOfLocation.classList.add("tag_path_identifier");
	
	const backupButton = topSection.createDiv();
	backupButton.classList.add("backup-button");
	setIcon(backupButton, "folder-output");
	
	backupButton?.addEventListener("click", async () => {
	
		// const container = document.querySelector(".tag_path_identifier") as HTMLElement;
		// Get the text content and remove the "home/" prefix if it exists
	
		this.moveToParent();	
	});
	
	
	var main_view_container = bottomSection_of_right_bottom.createEl("div", { cls: "file-explorer-container" });
	
	
	
	
	
	
	
	
	const searchContainer = topSection_right.createDiv({ cls: 'search-container' });
	const searchInput = searchContainer.createEl('input', {
		type: 'text',
		placeholder: 'Search files...',
		cls: 'search-input'
	});
	const resultsContainer = searchContainer.createDiv({ cls: 'results-container' });
	resultsContainer.style.display = 'none'; // Hide by default



	searchInput.addEventListener('input', async (event) => {
		this.newQuery(event);
	});
	
	
	

	// const rootStructure = this.getFolderStructure(this.app.vault.getRoot());
	// console.log(JSON.stringify(rootStructure, null, 2));  


	// var tagsTree = this.generateFinalTagsStructure(this.app);

	// console.log("Tags Tree:", JSON.stringify(tagsTree, null, 2));
	// testing this function 
	// this.folderMetadataFileCreation("tree/foreign/super/test/another/please/tree"); // Create the metadata files for the home path
	


	// 🔴🔴🔴🔴🔴🔴🔴 make this a global variable
	var betterTagsTree =  await this.finalCompleteTree(this.app);
	console.log("Better Tags Tree:", JSON.stringify(betterTagsTree, null, 2));

	// this.renderFileTreeInModal(tagsTree);
	this.renderFileTreeInModal(betterTagsTree);



	// const ttagContents = this.getDirectChildrenForTagPath("", this.app);
	// console.log("Direct Children:", JSON.stringify(ttagContents, null, 2));





	const hometagPath = ""; // You can modify this as needed or use an input field

	// Call the renderFileExplorer method with the tagPath
	this.renderFileExplorer.call(this, hometagPath);
















  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty(); // Clear the content when the modal is closed
  }
}


                                                                                                                                  