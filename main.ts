// main.ts

import { App, Modal, Plugin, PluginSettingTab, Setting, TFolder, TFile } from 'obsidian';
import { CachedMetadata } from 'obsidian';
import { normalizePath } from 'obsidian';


interface TreeNode {
	name: string;
	files?: string[];
	children?: TreeNode[];
  }
  

export default class MyPlugin extends Plugin {
  async onload() {
    console.log("Loading MyPlugin here");

    // Register the command to open the popup
    this.addCommand({
      id: "open-popup",
      name: "Open Popup",
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

  // Method to display search results in the modal
	displaySearchResults(files: TFile[]) {
		const { contentEl } = this;

		// Clear previous search results if any
		let resultsContainer = contentEl.querySelector(".results-container");
		if (resultsContainer) {
			resultsContainer.remove();
		}

		// Create a new container for the search results
		resultsContainer = contentEl.createEl("div", { cls: "results-container" });

		files.forEach(file => {
			// Display each file as a list item or any desired format
			const fileItem = resultsContainer.createEl("div", { cls: "file-item", text: file.name });
			
			// Optional: Add a click event to handle opening the file, etc.
			fileItem.addEventListener("click", () => {
				// Add file opening functionality here
			});
		});

		contentEl.appendChild(resultsContainer);
	}





  onOpen() {
    // const { contentEl } = this;
	const { modalEl, contentEl } = this;
	modalEl.style.width = "100%";
	modalEl.style.height = "100%";
	modalEl.classList.add("explorer-modal")



	// Create a custom button and add it beside the close button
	const headerEl = modalEl.querySelector('.modal-close-button')?.parentElement;
	const refreshButton = headerEl?.createEl("div", { cls: "refresh-header-button" });
	const homeButton = headerEl?.createEl("div", { cls: "home-header-button" });

	// Define the functionality for the custom button
	refreshButton?.addEventListener("click", () => {
		// TODO: Add the functionality for the custom button
	});

	// Define the functionality for the custom button
	homeButton?.addEventListener("click", () => {
		// TODO: Add the functionality for the custom button
	});


	// Set up flex container to hold two columns
	contentEl.style.display = "flex";
	contentEl.style.flexDirection = "row";
	contentEl.classList.add("blocks");

	// Create the left (3x width) column
	const leftColumn = contentEl.createDiv();
	leftColumn.classList.add("rect_border");
	leftColumn.style.flex = "3";  // 3 parts of the ratio


	// Create the right (1x width) column
	const rightColumn = contentEl.createDiv();
	rightColumn.classList.add("rect_border");
	rightColumn.style.flex = "1";  // 1 part of the ratio



	// Inside the leftColumn definition
	rightColumn.style.display = "flex";
	rightColumn.classList.add("blocks");
	rightColumn.style.flexDirection = "column";

	// Create the top section (thin)
	const topSection_right = rightColumn.createDiv();
	topSection_right.classList.add("rect_border");
	topSection_right.style.height = "var(--size-height)"; // Fixed height for the top section
	// topSection_right.createEl("span", { text: "Search..." });



	// Create the mid section (thin)
	const midSection_right = rightColumn.createDiv();
	midSection_right.classList.add("rect_border");
	midSection_right.style.flex = "3"; // Fixed height for the top section
	midSection_right.createEl("span", { text: "Description" });



	// Create the bottom section (flexible height)
	const bottomSection_right = rightColumn.createDiv();
	bottomSection_right.classList.add("rect_border");
	bottomSection_right.style.flex = "1"; // Takes the remaining height
	bottomSection_right.createEl("span", { text: "Legend" });




	// Inside the leftColumn definition
	leftColumn.style.display = "flex";
	leftColumn.style.flexDirection = "column";

	// Create the top section (thin)
	const topSection = leftColumn.createDiv();
	topSection.classList.add("rect_border");
	topSection.style.height = "var(--size-height)"; // Fixed height for the top section
	topSection.createEl("span", { text: "File Path" });

	// Create the bottom section (flexible height)
	const bottomSection = leftColumn.createDiv();
	bottomSection.classList.add("rect_border");
	bottomSection.style.flex = "1"; // Takes the remaining height





	// Inside the bottomSection definition
	bottomSection.style.display = "flex"; // Set display to flex for the bottom section
	bottomSection.style.flexDirection = "row"; // Arrange children in a row
	bottomSection.classList.add("blocks");

	// Create the left (1x width) column of the bottom section
	const leftBottomColumn = bottomSection.createDiv();
	leftBottomColumn.classList.add("rect_border");
	leftBottomColumn.style.flex = "1"; // 1 part of the ratio

	// Create the right (3x width) column of the bottom section
	const rightBottomColumn = bottomSection.createDiv();
	rightBottomColumn.classList.add("rect_border");
	rightBottomColumn.style.flex = "3"; // 3 parts of the ratio


	// Inside the leftColumn definition
	leftBottomColumn.style.display = "flex";
	leftBottomColumn.style.flexDirection = "column";
	leftBottomColumn.classList.add("blocks");

	// Create the top section (thin)
	const topSection_of_left_bottom = leftBottomColumn.createDiv();
	topSection_of_left_bottom.classList.add("rect_border");
	topSection_of_left_bottom.style.height = "var(--size-height)"; // Fixed height for the top section
	topSection_of_left_bottom.createEl("span", { text: "Sort system" });



	// Create the bottom section (flexible height)
	const bottomSection_of_left_bottom = leftBottomColumn.createDiv();
	bottomSection_of_left_bottom.classList.add("rect_border");
	bottomSection_of_left_bottom.style.flex = "1"; // Takes the remaining height
	bottomSection_of_left_bottom.createEl("span", { text: "File hierarchy tree" });
	



	// Inside the leftColumn definition
	rightBottomColumn.style.display = "flex";
	rightBottomColumn.style.flexDirection = "column";
	rightBottomColumn.classList.add("blocks");

	// Create the top section (thin)
	const topSection_of_right_bottom = rightBottomColumn.createDiv();
	topSection_of_right_bottom.classList.add("rect_border");
	topSection_of_right_bottom.style.height = "var(--size-height)"; // Fixed height for the top section
	topSection_of_right_bottom.createEl("span", { text: "Tabs and open folders" });


	// Create the mid section (thin)
	const midSection_of_right_bottom = rightBottomColumn.createDiv();
	midSection_of_right_bottom.classList.add("rect_border");
	midSection_of_right_bottom.style.height = "var(--size-height)"; // Fixed height for the top section
	midSection_of_right_bottom.createEl("span", { text: "Actions in current folder" });



	// Create the bottom section (flexible height)
	const bottomSection_of_right_bottom = rightBottomColumn.createDiv();
	bottomSection_of_right_bottom.classList.add("rect_border");
	bottomSection_of_right_bottom.style.flex = "1"; // Takes the remaining height
	bottomSection_of_right_bottom.createEl("span", { text: "Contents of the current folder" });








	const searchContainer = topSection_right.createDiv({ cls: 'search-container' });
	const searchInput = searchContainer.createEl('input', {
		type: 'text',
		placeholder: 'Search files...',
	});
	const resultsContainer = searchContainer.createDiv({ cls: 'results-container' });
	resultsContainer.style.display = 'none'; // Hide by default



	searchInput.addEventListener('input', async (event) => {
		const query = (event.target as HTMLInputElement).value.toLowerCase();
		
		resultsContainer.empty(); // Clear previous results

		// Toggle visibility of results container based on query
		resultsContainer.style.display = query ? 'block' : 'none';
		
		
		if (query) {
			const files = this.app.vault.getFiles();
			const matchedFiles = files.filter(file => file.name.toLowerCase().includes(query));
			
			matchedFiles.forEach(file => {
				const fileItem = resultsContainer.createEl('div', { cls: 'result-item', text: file.name });
				fileItem.addEventListener('click', () => {
					console.log(`Selected file: ${file.name}`);
					// You can add functionality to open or preview the file here
				});
			});
		}
	});





	// Recursive function to get the entire folder structure with children as an array
	function getFolderStructure(folder: TFolder): { name: string; children: any[]; files: string[] } {
		// Collect all files in the current folder
		const files = folder.children
		.filter((child) => child instanceof TFile)
		.map((file) => file.name);
	
		// Recursively collect all subfolders
		const children = folder.children
		.filter((child) => child instanceof TFolder)
		.map((subFolder) => getFolderStructure(subFolder as TFolder));  // Recursive call for subfolders
	
		return {
		name: folder.name,   // Folder's name
		children,            // Recursively collected subfolders as an array
		files,               // Direct files within the current folder
		
		};
	}
	

	const rootStructure = getFolderStructure(this.app.vault.getRoot());
	console.log(JSON.stringify(rootStructure, null, 2));  // Pretty-print the structure in JSON format




	// Recursive function to add tags to the tree structure
	function addTagToTree(tree: any[], tagSegments: string[], filePath: string) {
		// Remove '#' if it exists at the beginning of the first segment
		const currentSegment = tagSegments[0].startsWith("#") ? tagSegments[0].substring(1) : tagSegments[0];
	
		// Find or create the current segment in the tree
		let currentNode = tree.find(node => node.name === currentSegment);
		if (!currentNode) {
		currentNode = { name: currentSegment, children: [], files: [] };
		tree.push(currentNode);
		}
	
		// If this is the last segment, add the file path to this tag's files
		if (tagSegments.length === 1) {
		currentNode.files.push(filePath);
		} else {
		// Otherwise, recurse into the children to add deeper levels
		addTagToTree(currentNode.children, tagSegments.slice(1), filePath);
		}
	}
	
	function generateFinalTagsStructure(app: App) {
		const tagsTree: any[] = [];
		const untaggedFiles: string[] = [];
	
		// Loop through all files in the vault
		app.vault.getFiles().forEach((file: TFile) => {
		const metadata: CachedMetadata | null = app.metadataCache.getFileCache(file);
	
		if (metadata?.tags) {
			// Add tags to the tag tree structure
			metadata.tags.forEach(tagObj => {
			const tag = tagObj.tag;
			const tagSegments = tag.split("/"); // Split the tag into segments
	
			// Add the tag's segments to the tags tree
			addTagToTree(tagsTree, tagSegments, file.path);
			});
		} else {
			// If no tags, add the file path to untaggedFiles
			untaggedFiles.push(file.path);
		}
		});
	
		// Create the final object
		const finalTagsStructure = {
		name: "",
		children: tagsTree,
		files: untaggedFiles,
		};
	
		// Print the final structure
		// console.log("Final Tags Structure:", JSON.stringify(finalTagsStructure, null, 2));
		return finalTagsStructure;
	}
	
	// generateFinalTagsStructure(this.app);




	function createTreeView(container: HTMLElement, node: TreeNode) {
		// Create a root div for this node
		const nodeDiv = document.createElement("div");
		nodeDiv.classList.add("node");
		
		// Folder or file label
		const labelDiv = document.createElement("div");
		labelDiv.classList.add("label");
		labelDiv.textContent = node.name || " "; // Label for root node
		nodeDiv.appendChild(labelDiv);
		
		// If this node has children (folders) or files, create a collapsible container
		const childrenContainer = document.createElement("div");
		childrenContainer.classList.add("children");
		childrenContainer.style.display = "none"; // Initially hidden
		
		// Toggle visibility on click if it's a folder
		if (node.children && node.children.length > 0 || node.files && node.files.length > 0) {
			labelDiv.classList.add("folder");
			labelDiv.addEventListener("click", () => {
			childrenContainer.style.display =
				childrenContainer.style.display === "none" ? "block" : "none";
			});
		
			// Recursively add each child folder
			node.children?.forEach(childNode => {
			createTreeView(childrenContainer, childNode);
			});
		}
		
		// Add file nodes within the same childrenContainer
		if (node.files && node.files.length > 0) {
			node.files.forEach(file => {
			const fileDiv = document.createElement("div");
			fileDiv.classList.add("file");
			fileDiv.textContent = (file.split('/').pop() || file).split('.').slice(0, -1).join('.');
			childrenContainer.appendChild(fileDiv);
			});
		}
		
		// Append children container to the current nodeDiv (if it has children or files)
		if (childrenContainer.children.length > 0) {
			nodeDiv.appendChild(childrenContainer);
		}
		
		// Append the node to the parent container
		container.appendChild(nodeDiv);
		}
		

		
		
		
	// Function to initialize and render the tree in the modal section
	function renderFileTreeInModal(tagTreeStructure: any) {
	const container = bottomSection_of_left_bottom
	if (container) {
		container.innerHTML = ""; // Clear any existing content
		container.classList.add("file-tree-container");
		
		createTreeView(container, tagTreeStructure);
	}
	}


	renderFileTreeInModal(generateFinalTagsStructure(this.app));




















  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty(); // Clear the content when the modal is closed
  }
}


