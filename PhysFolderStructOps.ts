import { TFolder, TFile } from "obsidian";  // Ensure correct imports





    // Recursive function to get the entire folder structure with children as an array
    // 🟣🟣🟣🟣🟣🟣🟣This function creates the structure of the physical folder structure
    export function getFolderStructure(folder: TFolder): { name: string; children: any[]; files: string[] } {
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
    

