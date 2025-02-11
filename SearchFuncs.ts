import { App, TFile } from "obsidian";  // Ensure correct imports





    export function newQuery(event): void {

        const resultsContainer = document.querySelector(".results-container") as HTMLElement;
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





	  }