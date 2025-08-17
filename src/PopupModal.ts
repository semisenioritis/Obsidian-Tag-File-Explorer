import { App, Modal, TFolder, TFile } from 'obsidian';
import { CachedMetadata } from 'obsidian';
import { normalizePath } from 'obsidian';
import { setIcon } from "obsidian";
import { listeners } from 'process';
import { parseYaml } from "obsidian";


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

interface ButtonConfig {
    className: string,
    icon: string,
    onClick: (this: GlobalEventHandlers, ev: MouseEvent) => void;

}

// Define the Modal for the popup
class MyPopupModal extends Modal {
    $modal_wrapper: HTMLElement;
    $modal_content: HTMLElement;
    $close_button: HTMLElement | null | undefined;
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
        this.$modal_wrapper = this.modalEl;
        this.$modal_content = this.contentEl;
        this.$close_button = this.$modal_wrapper.querySelector('.modal-close-button')?.parentElement

        this.setup()
        // Create a custom button and add it beside the close button
        const me = this
        const buttons_beside_close = [{
            "className": "refresh-header-button",
            "onClick": async function(){
                const container = document.querySelector(".tag_path_identifier") as HTMLElement;
                // Get the text content and remove the "home/" prefix if it exists
                const tagPath = container.textContent?.replace(/^home\//, "") || "";
                me.renderFileExplorer.call(me, tagPath);

                var tagsTree = await me.finalCompleteTree(me.app);
                me.renderFileTreeInModal(tagsTree);
            },
            "icon": "rotate-ccw"
            },{
            "className": "home-header-button",
            "icon": "house",
            "onClick": async function(){
                // Call the renderFileExplorer method with the tagPath
                me.renderFileExplorer.call(me, "");

                var tagsTree = await me.finalCompleteTree(me.app);
                me.renderFileTreeInModal(tagsTree);
            }
        }]

        buttons_beside_close.forEach((b) => {
            me.makeButton(me.$modal_wrapper, b)
        })

        // Set up flex container to hold two columns
        this.$modal_content.style.display = "flex";
        this.$modal_content.style.flexDirection = "row";
        this.$modal_content.classList.add("blocks");

        // Create the left (3x width) column
        const leftColumn = this.$modal_content.createDiv();
        leftColumn.classList.add("rect_border");
        leftColumn.style.flex = "3";  // 3 parts of the ratio


        // Create the right (1x width) column
        const rightColumn = this.$modal_content.createDiv();
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
        midSection_right.classList.add("description");










        // Create the bottom section (flexible height)
        const bottomSection_right = rightColumn.createDiv();
        bottomSection_right.classList.add("rect_border");
        bottomSection_right.style.flex = "1"; // Takes the remaining height
        bottomSection_right.createEl("span", { text: "Legend" });
        bottomSection_right.classList.add("legend");




        // Inside the leftColumn definition
        leftColumn.style.display = "flex";
        leftColumn.style.flexDirection = "column";

        // Create the top section (thin)
        const topSection = leftColumn.createDiv();
        topSection.classList.add("rect_border");

        
        topSection.style.height = "var(--size-height)"; // Fixed height for the top section
        topSection.style.display = "flex"; // Set display to flex for the top section
        

        
        // topSection.createEl("span", { text: "File Path" });



        const addressOfLocation = topSection.createDiv();
        addressOfLocation.classList.add("tag_path_identifier");

        const backupButton = topSection.createDiv();
        backupButton.classList.add("backup-button");
        setIcon(backupButton, "folder-output");

        backupButton?.addEventListener("click", async () => {
            
        
            const container = document.querySelector(".tag_path_identifier") as HTMLElement;
            // Get the text content and remove the "home/" prefix if it exists
            this.moveToParent();		

        });







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
    setup(){
        this.$modal_wrapper.style.width = "100%";
        this.$modal_wrapper.style.height = "100%";
        this.$modal_wrapper.classList.add("explorer-modal")
    }

    makeButton(parent: HTMLElement, config:ButtonConfig){
        let button  = parent.createDiv()
        button.classList.add(config.className)
        setIcon(button, config.icon)
        button.onclick = config.onClick
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
		if (node.children && node.children.length > 0 || node.files && node.files.length >= 0) {
			labelDiv.classList.add("folder");
			arrow.addEventListener("click", () => {
			arrow.textContent = arrow.textContent === "▶" ? "▼" : "▶"; // Toggle arrow
			childrenContainer.style.display =
				childrenContainer.style.display === "none" ? "block" : "none";
			});
		





			nametitle.addEventListener("click", () => {

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
			// const filePath = `${nodePath}/${file}`;
			fileDiv.setAttribute("data-path", file); 
			// THIS CONTAINS THE ACTUAL REAL PATH OF THE FILE TO BE OPENED
			
			childrenContainer.appendChild(fileDiv);


		const placeholder = document.createElement("div");
		placeholder.classList.add("placeholder");
		placeholder.textContent = "▶"; // Default arrow for folders


		const filenametitle = document.createElement("span");
		filenametitle.classList.add("file_label");	
		filenametitle.textContent = (file.split('/').pop() || file).split('.').slice(0, -1).join('.');

		fileDiv.appendChild(placeholder);
		fileDiv.appendChild(filenametitle);	
		
		
		filenametitle.addEventListener("click", () => {


// TODO OPEN THIS FILE IN THE ACTUAL MAIN OBSIDIAN BACKGROUND TAB




			});
		


		
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


	async getDirectChildrenForTagPath(tagPath: string, app: App): Promise<TagContents | null> {
		const tagsTree = await this.finalCompleteTree(app);
	
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
	async renderFileExplorer(tagPath: string) {
		// Locate the container element
		const explorerContainer = document.querySelector(".file-explorer-container") as HTMLElement;
		
		if (!explorerContainer) return;
		
		// Clear existing content inside the container
		explorerContainer.innerHTML = '';

		// Retrieve files and subfolders to render based on the tag path
		const tagContents = await this.getDirectChildrenForTagPath(tagPath, this.app);
		console.log("Tag Contents:", tagContents);
		console.log("Explorer Path:", tagPath);




		const container = document.querySelector(".tag_path_identifier") as HTMLElement;
		// gotta change this to the right container
		if (container) {
			container.innerHTML = ""; // Clear any existing content
			
			container.textContent = "home/" + tagPath;
			// write code to click on this 

		}



		this.renderFolderMetadata(tagPath); 
		
		const mainExplorerContainer = document.querySelector(".file_exp") as HTMLElement;

			if (tagContents) {
				// Render subfolders (children tags)
				tagContents.childrenTags.forEach(childTag => {
					// console.log("Child Tag:", childTag);
					// Create each subfolder block (square)
					const folderBlock = explorerContainer.createEl("div", { cls: "folder-block" });
					folderBlock.createEl("div", { cls: "folder-icon", text: "📁" }); // Folder icon
					folderBlock.createEl("div", { cls: "folder-name", text: childTag }); // Folder name



					const newPath = tagPath ? `${tagPath}/${childTag}` : childTag;
					// Tooltip with folder details on hover
					folderBlock.setAttribute("title", `Folder: ${newPath}`);
					

					// Add click event to navigate into subfolder with correctly formatted path
					folderBlock.addEventListener("click", () => {
						
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
					// fileBlock.setAttribute("title", `Path: ${file.path}\nSize: ${file.size} bytes\nCreated: ${file.created}\nModified: ${file.modified}`);



					// Add click event to navigate into subfolder with correctly formatted path
					fileBlock.addEventListener("click", async (e: MouseEvent) => {
		
						let fileMetadata = await this.fetchFileMetadata.call(this, file.path);
						fileMetadata.path = file.path;
						fileMetadata.size = file.size;
						fileMetadata.created = file.created;
						fileMetadata.modified = file.modified;

						this.renderFileMetadata(fileMetadata)
						e.stopPropagation();
					});

				});

				
			}

			// Add click event to navigate into subfolder with correctly formatted path


	}

	async folderMetadataFileCreation(inputPath: string) {
		const tagFolder = ".tagfoldermeta"; // Folder name
		const segments = inputPath.split("/"); // Split the path into segments
		let cumulativePath = "";

		for (const [index, segment] of segments.entries()) {
			// Build the cumulative file path
			cumulativePath += (index === 0 ? "" : "_-_-_") + segment;
			const fileName = `${tagFolder}/${cumulativePath}.md`; // Construct the file path
	
			// Check if the file exists
			const fileExists = await this.app.vault.adapter.exists(fileName) ;

			if (!fileExists) {
				// File doesn't exist, create it
				await this.app.vault.create(fileName, `---\ndesc: desc of this file \n---`);
				// console.log(`File "${fileName}" created successfully.`);
			} else {
				// console.log(`File "${fileName}" already exists.`);
			}
		}
	}
	


	 getAllPaths(tree: any, currentPath: string = ""): string[] {
		const paths: string[] = [];
	  
		// Loop through each child in the tree
		tree.forEach((node: any) => {
		  // Construct the full path for the current node
		  const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
	  
		  // Add the full path to the list of paths
		  paths.push(fullPath);
	  
		  // Recursively process children and add their paths
		  if (node.children && node.children.length > 0) {
			const childPaths = this.getAllPaths(node.children, fullPath);
			paths.push(...childPaths);
		  }
		});
	  
		return paths;
	  }
	  
	  async  getPathsFromTagFolder(): Promise<string[]> {
		const tagFolder = ".tagfoldermeta"; // Folder name
		const paths: string[] = [];
	
		// Check if the folder exists
		const folderExists = await this.app.vault.adapter.exists(tagFolder);
	
		if (folderExists) {
			// List all files in the folder
			const files = await this.app.vault.adapter.list(tagFolder);
	
			// Process only `.md` files
			files.files.forEach((file) => {
				if (file.endsWith(".md")) {
					// Replace '&' with '/' to reconstruct the path
					const reconstructedPath = file.replace(`${tagFolder}/`, "").replace(".md", "").replace(/_-_-_/g, "/");
					paths.push(reconstructedPath);
				}
			});
		} else {
			// console.log(`Folder ${tagFolder} does not exist.`);
		}
	
		return paths;
	}

	   addPathToTree(tree: any[], pathSegments: string[]) {
		// console.log("Path Segments:", pathSegments);
		const currentSegment = pathSegments[0];
	//   console.log("Current Segment:", currentSegment);
		// Find or create the current segment in the tree
		let currentNode = tree.find(node => node.name === currentSegment);
		if (!currentNode) {
			// console.log("Current Node:", currentSegment);
		  currentNode = { name: currentSegment, files: [], children: [] };
		  tree.push(currentNode);
		}
	  
		// If there are more segments, recurse into the children
		if (pathSegments.length > 1) {
		  this.addPathToTree(currentNode.children, pathSegments.slice(1));
		}
	  }
	  
	  // Function to add an array of paths to the existing tree structure
	   integratePathsToTree(tree: any[], paths: string[]) {
		paths.forEach(path => {
		  const pathSegments = path.split("/"); // Split the path into segments
		//   console.log("Path Segments:", pathSegments);
		  this.addPathToTree(tree, pathSegments); // Add the segments to the tree
		});
	  }
	  


	
	


	  async finalCompleteTree(app: App) {
		// Generate the final tags structure
		const finalTagsStructure = this.generateFinalTagsStructure(app); // Assumes the function exists
	  
		// Extract all folder paths from the children of the root
		const allPaths = this.getAllPaths(finalTagsStructure.children);
	  
		// Log the result
		// console.log("All Folder Paths:", allPaths);


		// Iterate over each path and call the folderMetadataFileCreation function
		for (const path of allPaths) {
			await this.folderMetadataFileCreation(path);
		}


		const paths = await this.getPathsFromTagFolder();
		// console.log("these are paths", paths);

		this.integratePathsToTree(finalTagsStructure.children, paths);


		// console.log("Final Tags Structure:", JSON.stringify(finalTagsStructure, null, 2));

		
		return finalTagsStructure
	  }

	   moveToParent(): void {
		// Find the div with the class .tag_path_identifier
		const pathDiv = document.querySelector(".tag_path_identifier");
	  
		// Ensure the div exists
		if (!pathDiv) {
		  console.error("No path found in .tag_path_identifier");
		  return; // Exit the function
		}
	  
		// Use non-null assertion to access textContent
		const path = pathDiv.textContent!.trim();
	  
		// Function to get the parent path
		const getParentPath = (path: string): string => {
		  const trimmedPath = path.endsWith("/") ? path.slice(0, -1) : path;
		  const parts = trimmedPath.split("/");
		  if (parts.length <= 1) {
			return path; // Root-level path returns itself
		  }
		  return parts.slice(0, -1).join("/");
		};
	  
		// Calculate the parent path
		let parentPath = getParentPath(path);
		console.log("Parent Path 1:", parentPath);
		parentPath = parentPath.replace(/^home\//, "");
		parentPath = parentPath.replace(/^home/, "");


		this.renderFileExplorer.call(this, parentPath);
		// Log the parent path
		console.log("Parent Path 2:", parentPath);
	  }
	  
	  async fetchFolderMetadata(inputPath: string) {
		const tagFolder = ".tagfoldermeta"; // Folder name
		const segments = inputPath.split("/"); // Split the path into segments
		let cumulativePath = "";
	  
		for (const [index, segment] of segments.entries()) {
		  // Build the cumulative file path
		  cumulativePath += (index === 0 ? "" : "_-_-_") + segment;

		}
		const fileName = `${tagFolder}/${cumulativePath}.md`; // Construct the file path
		console.log("File Name:", fileName);
	  // Check if the file exists
	  const fileExists = await this.app.vault.adapter.exists(fileName);
  
	  if (fileExists) {
		// Read the file's contents
		const fileContents = await this.app.vault.adapter.read(fileName);
		// console.log("File Contents:", fileContents);
		// Extract the metadata (assuming it's in YAML frontmatter)
		const metadataMatch = fileContents.match(/^---\r?\n([\s\S]*?)\r?\n---/);
		// console.log("Metadata Match:", metadataMatch);
		if (metadataMatch) {
		  const yamlMetadata = metadataMatch[1];
		  const metadata = parseYaml(yamlMetadata);
		  console.log(`Metadata for ${fileName}:`, metadata);
  
		  // You can return, store, or process the metadata as needed
		  return metadata;
		} else {
		  console.log(`No metadata found in ${fileName}`);
		}
	  } else {
		console.log(`File does not exist: ${fileName}`);
	  }		
	  }
			
	  
	  async renderFolderMetadata(path: string) {

		if (path !== "") {
		// Call the fetchFolderMetadata function to get metadata
		const metadata = await this.fetchFolderMetadata(path);
	  
		// Find the target div with the class "description"
		const descriptionDiv = document.querySelector(".description");
	  
		if (!descriptionDiv) {
		  console.error('Div with class "description" not found!');
		  return;
		}
	  
		// Clear any previous content
		descriptionDiv.innerHTML = "";


		const legendDiv = document.querySelector(".legend");
		if (!legendDiv) {
			console.error('Div with class "legend" not found!');
			return;
		  }
		
		  // Clear any previous content
		  legendDiv.innerHTML = "";
		  
		  
		  
		if (metadata) {

			const legendContainer = document.createElement("div");
			


		  // Create a structured HTML representation of the metadata
		  const metadataContainer = document.createElement("div");
	  
		  // Add a header
		  const header = document.createElement("h3");
		  header.textContent = `Path: home/${path}`;
		  metadataContainer.appendChild(header);
	  
		  // Add metadata as key-value pairs
		  const metadataList = document.createElement("ul");
		  for (const [key, value] of Object.entries(metadata)) {
			if (key === "legend") {


		  // Add a header
		  const legendHeader = document.createElement("h3");
		  legendHeader.textContent = `Legend`;
		  legendContainer.appendChild(legendHeader);
		  
		  		const legendList = document.createElement("ul");
				  for (const item of metadata.legend) {
					const listItem = document.createElement("li");
					listItem.textContent = item;
					legendList.appendChild(listItem);
				  }
				  legendContainer.appendChild(legendList);
			} else {
			const listItem = document.createElement("li");
			listItem.textContent = `${key}: ${value}`;
			metadataList.appendChild(listItem);
			}
		  }
	  
		  
		  metadataContainer.appendChild(metadataList);
	  
		  // Append the metadataContainer to the descriptionDiv
		  legendDiv.appendChild(legendContainer);
		  descriptionDiv.appendChild(metadataContainer);
		} else {
		  // If no metadata was found
		  const noMetadataMessage = document.createElement("p");
		  noMetadataMessage.textContent = `No metadata found for the path: ${path}`;
		  descriptionDiv.appendChild(noMetadataMessage);
		}
	}
	else{

		
		// Find the target div with the class "description"
		const descriptionDiv = document.querySelector(".description");
	  
		if (!descriptionDiv) {
		  console.error('Div with class "description" not found!');
		  return;
		}
	  
		// Clear any previous content
		descriptionDiv.innerHTML = "";
	  
	  

		const legendDiv = document.querySelector(".legend");
		if (!legendDiv) {
			console.error('Div with class "legend" not found!');
			return;
		  }
		
		  // Clear any previous content
		  legendDiv.innerHTML = "";
		  




		
		// Create a structured HTML representation of the metadata
		const metadataContainer = document.createElement("div");

		// Add a header
		const header = document.createElement("h3");
		header.textContent = `Home Folder`;
		metadataContainer.appendChild(header);
		// Append the metadataContainer to the descriptionDiv
		descriptionDiv.appendChild(metadataContainer);		  

	}
	  }


	  async fetchFileMetadata(filePath: string) {
		// Check if the file exists
		const fileExists = await this.app.vault.adapter.exists(filePath);
	  
		if (!fileExists) {
		  console.log(`File does not exist: ${filePath}`);
		  return {};
		}
	  
		// Read the file's contents
		const fileContents = await this.app.vault.adapter.read(filePath);
		console.log("File Contents:", fileContents);
	  
		// Extract metadata from YAML frontmatter
		const metadataMatch = fileContents.match(/^---\r?\n([\s\S]*?)\r?\n---/);
		if (metadataMatch) {
		  const yamlMetadata = metadataMatch[1];
		  console.log("YAML Metadata Content:", yamlMetadata);
	  
		  // Parse the YAML frontmatter
		  try {
			const metadata = parseYaml(yamlMetadata);
			console.log(`Parsed Metadata for ${filePath}:`, metadata);
			return metadata;
		  } catch (error) {
			console.error("Error parsing YAML Metadata:", error);
		  }
		} else {
		  console.log(`No metadata found in ${filePath}`);
		  return {}
		}
	  
		return null;
	  }
	  
	  renderFileMetadata(metadata: { [key: string]: any }) {
		// Find the target div with the class "description"
		const descriptionDiv = document.querySelector(".description");
	  
		if (!descriptionDiv) {
		  console.error('Div with class "description" not found!');
		  return;
		}
	  
		// Clear any previous content
		descriptionDiv.innerHTML = "";
	  
		if (metadata && Object.keys(metadata).length > 0) {
		  // Create a structured HTML representation of the metadata
		  const metadataContainer = document.createElement("div");
	  
		  // Add a header
		  const header = document.createElement("h3");
		  header.textContent = `File Metadata`;
		  metadataContainer.appendChild(header);
	  
		  // Add the metadata as key-value pairs
		  const metadataList = document.createElement("ul");
		  for (const [key, value] of Object.entries(metadata)) {
			const listItem = document.createElement("li");
	  
			if (Array.isArray(value)) {
			  // Render arrays as a comma-separated string
			  listItem.textContent = `${key}: ${value.join(", ")}`;
			} else {
			  // Render simple key-value pairs
			  listItem.textContent = `${key}: ${value}`;
			}
	  
			metadataList.appendChild(listItem);
		  }
	  
		  metadataContainer.appendChild(metadataList);
	  
		  // Append the metadataContainer to the descriptionDiv
		  descriptionDiv.appendChild(metadataContainer);
		} else {
		  // If no metadata was found
		  const noMetadataMessage = document.createElement("p");
		  noMetadataMessage.textContent = `No metadata available for this file.`;
		  descriptionDiv.appendChild(noMetadataMessage);
		}
	  }
	  


}

export default MyPopupModal