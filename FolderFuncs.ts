    

    import { parseYaml } from "obsidian";
    
    
    
    export async function (inputPath: string) {
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


    export async function getPathsFromTagFolder(): Promise<string[]> {
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


    export async function fetchFolderMetadata(inputPath: string) {
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
	


