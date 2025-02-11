import { App, TFile } from "obsidian";  // Ensure correct imports

import { createTreeView } from "./TagTreeOps";
import { getDirectChildrenForTagPath } from "./TagTreeOps";
import { fetchFileMetadata } from "./FileFuncs";
import { fetchFolderMetadata } from "./FolderFuncs";





export function renderFileTreeInModal(tagTreeStructure: any) {
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

	// Method to render the file explorer inside the existing container
	export async function  renderFileExplorer(tagPath: string) {
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



    export async function  renderFolderMetadata(path: string) {

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


    export function renderFileMetadata(metadata: { [key: string]: any }) {
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

