import { App, TFile } from "obsidian";  // Ensure correct imports
import { parseYaml } from "obsidian";



	// Helper function to retrieve file details
	export function getFileDetails(filePath: string, app: App): { path: string; name: string; size: number | null; created: Date | null; modified: Date | null } {
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

    export function getAllPaths(tree: any, currentPath: string = ""): string[] {
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
      
      
    export async function fetchFileMetadata(filePath: string) {
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


    