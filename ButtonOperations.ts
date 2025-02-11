import { App, TFile } from "obsidian";  // Ensure correct imports

import { renderFileExplorer } from "./RenderView";
import { renderFileTreeInModal } from "./RenderView";
import { finalCompleteTree } from "./TagTreeOps";

    export function moveToParent(): void {
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


	  export async function refreshPage(): Promise<void> {
		const container = document.querySelector(".tag_path_identifier") as HTMLElement;
		// Get the text content and remove the "home/" prefix if it exists
		const tagPath = container.textContent?.replace(/^home\//, "") || "";
		this.renderFileExplorer.call(this, tagPath);

		var tagsTree = await this.finalCompleteTree(this.app);
		this.renderFileTreeInModal(tagsTree);
        return;
	  }

	  export async function  homePage(): Promise<void> {
		// Call the renderFileExplorer method with the tagPath
		this.renderFileExplorer.call(this, "");

		var tagsTree = await this.finalCompleteTree(this.app);
		this.renderFileTreeInModal(tagsTree);

        return;
	  }      
	        
   