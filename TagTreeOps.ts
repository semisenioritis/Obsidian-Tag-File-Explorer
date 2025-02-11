import { App, TFile } from "obsidian";  // Ensure correct imports
import { CachedMetadata } from 'obsidian';

import { getAllPaths } from "./FileFuncs";
import { getFileDetails } from "./FileFuncs";
import { folderMetadataFileCreation } from "./FolderFuncs";
import { getPathsFromTagFolder } from "./FolderFuncs";
import { renderFileExplorer } from "./RenderView";



interface TreeNode {
	name: string;
	files?: string[];
	children?: TreeNode[];
  }

type FileDetails = {
    path: string;
    name: string;
    size: number | null;
    created: Date | null;
    modified: Date | null;
};


type TagContents = {
	childrenTags: string[];
	files: FileDetails[];
};


	
	// Recursive function to add tags to the tree structure
	// 🟣🟣🟣🟣🟣🟣🟣This function pulls the all the tags from the files and actually generates the tree	
	export function addTagToTree(tree: any[], tagSegments: string[], filePath: string) {
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


    export function generateFinalTagsStructure(app: App) {
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


    export async function  finalCompleteTree(app: App) {
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


      export function createTreeView(container: HTMLElement, node: TreeNode, currentPath: string = "") {

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


    
        export async function  getDirectChildrenForTagPath(tagPath: string, app: App): Promise<TagContents | null> {
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



    export function addPathToTree(tree: any[], pathSegments: string[]) {
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
      export function integratePathsToTree(tree: any[], paths: string[]) {
		paths.forEach(path => {
		  const pathSegments = path.split("/"); // Split the path into segments
		//   console.log("Path Segments:", pathSegments);
		  this.addPathToTree(tree, pathSegments); // Add the segments to the tree
		});
	  }    

