// main.ts

import { App, Modal, Plugin, PluginSettingTab, Setting, TFolder, TFile } from 'obsidian';
import { CachedMetadata } from 'obsidian';
import { normalizePath } from 'obsidian';


interface TreeNode {
	name: string;
	files?: string[];
	children?: TreeNode[];
  }
  
type TagContents = {
	childrenTags: string[];
	files: FileDetails[];
};
type FileDetails = {
	path: string;
	name: string;
	size: number | null;
	created: Date | null;
	modified: Date | null;
};


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



	// Recursive function to get the entire folder structure with children as an array
	// 🟣🟣🟣🟣🟣🟣🟣This function creates the structure of the physical folder structure
	getFolderStructure(folder: TFolder): { name: string; children: any[]; files: string[] } {
		// Collect all files in the current folder
		const files = folder.children
		.filter((child) => child instanceof TFile)
		.map((file) => file.name);
	
		// Recursively collect all subfolders
		const children = folder.children
		.filter((child) => child instanceof TFolder)
		.map((subFolder) => this.getFolderStructure(subFolder as TFolder));  // Recursive call for subfolders
	
		return {
		name: folder.name,   // Folder's name
		children,            // Recursively collected subfolders as an array
		files,               // Direct files within the current folder
		
		};
	}
	
	// Recursive function to add tags to the tree structure
	// 🟣🟣🟣🟣🟣🟣🟣This function pulls the all the tags from the files and actually generates the tree	
	addTagToTree(tree: any[], tagSegments: string[], filePath: string) {
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
		this.addTagToTree(currentNode.children, tagSegments.slice(1), filePath);
		}
	}


	generateFinalTagsStructure(app: App) {
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
			this.addTagToTree(tagsTree, tagSegments, file.path);
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
	
	createTreeView(container: HTMLElement, node: TreeNode, currentPath: string = "") {

		// Calculate the full path for the current node
		const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;

		// Create a root div for this node
		const nodeDiv = document.createElement("div");
		nodeDiv.classList.add("node");
		
		// Folder or file label
		const labelDiv = document.createElement("div");
		labelDiv.classList.add("row_folder_holder");
		labelDiv.setAttribute("data-path", nodePath || ""); // Store the path as a data attribute



		// labelDiv.textContent = node.name || " "; // Label for root node
		nodeDiv.appendChild(labelDiv);

		const arrow = document.createElement("div");
		arrow.classList.add("arrow");
		arrow.textContent = "▶"; // Default arrow for folders


		const nametitle = document.createElement("div");
		nametitle.classList.add("label");	
		nametitle.textContent = node.name || ""; // Label for root node

		if (!node.name) {
			arrow.classList.add("hidden");
		}

		
		labelDiv.appendChild(arrow);
		labelDiv.appendChild(nametitle);
		
		// If this node has children (folders) or files, create a collapsible container
		const childrenContainer = document.createElement("div");
		childrenContainer.classList.add("children");
		childrenContainer.style.display = "none"; // Initially hidden
		
		// Toggle visibility on click if it's a folder
		if (node.children && node.children.length > 0 || node.files && node.files.length > 0) {
			labelDiv.classList.add("folder");
			arrow.addEventListener("click", () => {
			arrow.textContent = arrow.textContent === "▶" ? "▼" : "▶"; // Toggle arrow
			childrenContainer.style.display =
				childrenContainer.style.display === "none" ? "block" : "none";
			});
		





			nametitle.addEventListener("click", () => {
				// Get the path dynamically from an input field or set it manually
				const tagPath = "tree"; // You can modify this as needed or use an input field

				// Call the renderFileExplorer method with the tagPath
				this.renderFileExplorer.call(this, nodePath);
				});
			



			// Recursively add each child folder
			node.children?.forEach(childNode => {
			this.createTreeView(childrenContainer, childNode, nodePath);
			});
		}
		
		// Add file nodes within the same childrenContainer
		if (node.files && node.files.length > 0) {
			node.files.forEach(file => {

			const fileDiv = document.createElement("div");




			fileDiv.classList.add("row_folder_holder");
			// Extract filename and path for display
			const filePath = `${nodePath}/${file}`;
			fileDiv.setAttribute("data-path", filePath); // Store the path as a data attribute
			
			childrenContainer.appendChild(fileDiv);


		const placeholder = document.createElement("div");
		placeholder.classList.add("placeholder");
		placeholder.textContent = "▶"; // Default arrow for folders


		const filenametitle = document.createElement("span");
		filenametitle.classList.add("file_label");	
		filenametitle.textContent = (file.split('/').pop() || file).split('.').slice(0, -1).join('.');

		fileDiv.appendChild(placeholder);
		fileDiv.appendChild(filenametitle);		
		
		
			});
		}
		
		// Append children container to the current nodeDiv (if it has children or files)
		if (childrenContainer.children.length > 0) {
			nodeDiv.appendChild(childrenContainer);
		}
		
		// Append the node to the parent container
		container.appendChild(nodeDiv);
		}

	renderFileTreeInModal(tagTreeStructure: any) {
		const container = document.querySelector(".file-tree-container") as HTMLElement;
		// gotta change this to the right container
		if (container) {
			container.innerHTML = ""; // Clear any existing content
			
			this.createTreeView(container, tagTreeStructure);
			// write code to click on this 
			
			const firstFolderOrFile = container.querySelector(".arrow")  as HTMLElement;
			if (firstFolderOrFile) {
				firstFolderOrFile.click();
			}

		}
		}


	getDirectChildrenForTagPath(tagPath: string, app: App): TagContents | null {
		const tagsTree = this.generateFinalTagsStructure(app);
	
		// Handle the case where tagPath is empty
		if (tagPath.trim() === "") {
			return {
				childrenTags: tagsTree.children.map((child: any) => child.name),
				files: tagsTree.files.map(filePath => this.getFileDetails(filePath, app)),
			};
		}
	
		const tagSegments = tagPath.split("/");
		let currentNode = tagsTree;
	
		for (const segment of tagSegments) {
			currentNode = currentNode.children.find((node: any) => node.name === segment);
			if (!currentNode) return null; // Path does not exist
		}
	
		return {
			childrenTags: currentNode.children.map((child: any) => child.name),
			files: currentNode.files.map(filePath => this.getFileDetails(filePath, app)),
		};
	}
	
	// Helper function to retrieve file details
	getFileDetails(filePath: string, app: App): { path: string; name: string; size: number | null; created: Date | null; modified: Date | null } {
		const file = app.vault.getAbstractFileByPath(filePath);
		if (file && file instanceof TFile) {
			return {
				path: file.path,
				name: file.name,
				size: file.stat.size,
				created: new Date(file.stat.ctime),
				modified: new Date(file.stat.mtime),
			};
		}
		// Return basic file details if file not found
		return { path: filePath, name: filePath.split("/").pop() || "", size: null, created: null, modified: null };
	}
	

	// Method to render the file explorer inside the existing container
	renderFileExplorer(tagPath: string) {
		// Locate the container element
		const explorerContainer = document.querySelector(".file-explorer-container") as HTMLElement;
		
		if (!explorerContainer) return;
		
		// Clear existing content inside the container
		explorerContainer.innerHTML = '';

		// Retrieve files and subfolders to render based on the tag path
		const tagContents = this.getDirectChildrenForTagPath(tagPath, this.app);
		console.log("Tag Contents:", tagContents);
		console.log("Explorer Path:", tagPath);




const container = document.querySelector(".tag_path_identifier") as HTMLElement;
// gotta change this to the right container
if (container) {
	container.innerHTML = ""; // Clear any existing content
	
	container.textContent = "home/" + tagPath;
	// write code to click on this 

}


		if (tagContents) {
			// Render subfolders (children tags)
			tagContents.childrenTags.forEach(childTag => {
				console.log("Child Tag:", childTag);
				// Create each subfolder block (square)
				const folderBlock = explorerContainer.createEl("div", { cls: "folder-block" });
				folderBlock.createEl("div", { cls: "folder-icon", text: "📁" }); // Folder icon
				folderBlock.createEl("div", { cls: "folder-name", text: childTag }); // Folder name

				// Tooltip with folder details on hover
				folderBlock.setAttribute("title", `Folder: ${childTag}`);
				

				// Add click event to navigate into subfolder with correctly formatted path
				folderBlock.addEventListener("click", () => {
					const newPath = tagPath ? `${tagPath}/${childTag}` : childTag;
					this.renderFileExplorer.call(this, newPath);
					
				});

			});

			// Render files
			tagContents.files.forEach(file => {
				// console.log("File:", file);
				// Create each file block (square)
				const fileBlock = explorerContainer.createEl("div", { cls: "file-block" });
				fileBlock.createEl("div", { cls: "file-icon", text: "📄" }); // File icon
				fileBlock.createEl("div", { cls: "file-name", text: file.name }); // File name

				// Tooltip with file details on hover
				fileBlock.setAttribute("title", `Path: ${file.path}\nSize: ${file.size} bytes\nCreated: ${file.created}\nModified: ${file.modified}`);
			});
		}


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
	
		const container = document.querySelector(".tag_path_identifier") as HTMLElement;
		// Get the text content and remove the "home/" prefix if it exists
		const tagPath = container.textContent?.replace(/^home\//, "") || "";
		this.renderFileExplorer.call(this, tagPath);

		var tagsTree = this.generateFinalTagsStructure(this.app);
		this.renderFileTreeInModal(tagsTree);

	});

	// Define the functionality for the custom button
	homeButton?.addEventListener("click", () => {
		// TODO: Add the functionality for the custom button

		// Call the renderFileExplorer method with the tagPath
		this.renderFileExplorer.call(this, "");

		var tagsTree = this.generateFinalTagsStructure(this.app);
		this.renderFileTreeInModal(tagsTree);
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
	topSection.classList.add("tag_path_identifier");
	topSection.style.height = "var(--size-height)"; // Fixed height for the top section
	// topSection.createEl("span", { text: "File Path" });

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
	
	const bottomSection_of_left_bottom = leftBottomColumn.createEl("div", { cls: "file-tree-container" });
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
	const bottomSection_of_right_bottom = rightBottomColumn.createEl("div", { cls: "" });
	bottomSection_of_right_bottom.classList.add("rect_border");
	bottomSection_of_right_bottom.classList.add("file_exp");
	bottomSection_of_right_bottom.style.flex = "1"; // Takes the remaining height
	var main_view_container = bottomSection_of_right_bottom.createEl("div", { cls: "file-explorer-container" });
	// bottomSection_of_right_bottom.createEl("span", { text: "Contents of the current folder" });








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
					// TODO: Add functionality to open the parent of the clicked file
				});
			});
		}
	});



	// const rootStructure = this.getFolderStructure(this.app.vault.getRoot());
	// console.log(JSON.stringify(rootStructure, null, 2));  



	// this.generateFinalTagsStructure(this.app);


	var tagsTree = this.generateFinalTagsStructure(this.app);
	this.renderFileTreeInModal(tagsTree);



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


