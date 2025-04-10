
import JSZip from 'jszip';

export type TechStack = 'react' | 'vanilla';

interface ParsedPrototype {
  files: Record<string, string>;
  techStack: TechStack;
  hasTailwind: boolean;
  error?: string;
}

export async function parseZipFile(file: File): Promise<ParsedPrototype> {
  try {
    // Load the zip file
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    
    // Initialize the files object
    const files: Record<string, string> = {};
    let hasReact = false;
    let hasIndexHtml = false;
    let hasTailwind = false;
    
    // Keep track of the deepest folder level
    let maxDepth = 0;
    
    // Process each file in the zip
    const processPromises = Object.entries(zipContent.files).map(async ([path, zipEntry]) => {
      // Skip directories and hidden files
      if (zipEntry.dir || path.startsWith("__MACOSX/") || path.includes("/.")) {
        return;
      }
      
      // Check folder depth
      const depth = path.split('/').length;
      maxDepth = Math.max(maxDepth, depth);
      
      // Skip if exceeding max depth (4 levels)
      if (depth > 4) {
        console.warn(`Skipping file due to excessive nesting: ${path}`);
        return;
      }
      
      try {
        // Try to get file as text (will fail for binary files)
        const content = await zipEntry.async('string');
        
        // Normalize path to start with a leading slash
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        
        // Store the file content
        files[normalizedPath] = content;
        
        // Check for React in package.json
        if (normalizedPath.endsWith('package.json')) {
          try {
            const packageJson = JSON.parse(content);
            if (
              (packageJson.dependencies?.react || packageJson.devDependencies?.react) &&
              (packageJson.dependencies?.['react-dom'] || packageJson.devDependencies?.['react-dom'])
            ) {
              hasReact = true;
            }
          } catch (e) {
            console.error('Failed to parse package.json', e);
          }
        }
        
        // Check for index.html
        if (normalizedPath.endsWith('index.html')) {
          hasIndexHtml = true;
          
          // Check for Tailwind
          if (
            content.includes('tailwind') || 
            content.includes('Tailwind') ||
            content.match(/class=["'][^"']*tw-[^"']*["']/)
          ) {
            hasTailwind = true;
          }
        }
        
        // Check for Tailwind in CSS files
        if (normalizedPath.endsWith('.css') && (content.includes('tailwind') || content.includes('@tailwind'))) {
          hasTailwind = true;
        }
      } catch (e) {
        console.error(`Failed to process file: ${path}`, e);
      }
    });
    
    // Wait for all files to be processed
    await Promise.all(processPromises);
    
    // Ensure we have at least one valid file
    if (Object.keys(files).length === 0) {
      return {
        files: { '/index.html': '<html><body><h1>No valid files found in ZIP</h1></body></html>' },
        techStack: 'vanilla',
        hasTailwind: false,
        error: "No valid files found in the ZIP archive."
      };
    }
    
    // Fix any JavaScript files that might cause issues in Sandpack
    Object.keys(files).forEach(filePath => {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        // Replace problematic document.querySelector calls with safer checks
        let content = files[filePath];
        content = content.replace(
          /document\.querySelector\((['"])([^'"]+)\1\)/g,
          'document.querySelector($1$2$1) || { innerHTML: "" }'
        );
        content = content.replace(
          /document\.getElementById\((['"])([^'"]+)\1\)/g,
          'document.getElementById($1$2$1) || document.createElement("div")'
        );
        
        // Add a DOMContentLoaded listener to ensure DOM is ready
        if (content.includes('document.') && !content.includes('DOMContentLoaded')) {
          content = `
// Ensure DOM is ready before accessing elements
document.addEventListener('DOMContentLoaded', function() {
  try {
    ${content}
  } catch (error) {
    console.error('Error executing script:', error);
  }
});`;
        }
        
        files[filePath] = content;
      }
    });
    
    // If no index.html found, create a default one to display all files
    if (!hasIndexHtml) {
      const fileKeys = Object.keys(files);
      // Create a simple index.html that lists all files
      let fileListHtml = fileKeys.map(file => {
        const fileName = file.split('/').pop();
        // Create links for HTML files, just list others
        if (file.endsWith('.html')) {
          return `<li><a href="${file}" target="_blank">${fileName}</a></li>`;
        }
        return `<li>${fileName} - <a href="#" onclick="displayFileContent('${file}'); return false;">View</a></li>`;
      }).join('\n      ');
      
      // Find a good default file to show
      const htmlFiles = fileKeys.filter(f => f.endsWith('.html'));
      const jsFiles = fileKeys.filter(f => f.endsWith('.js'));
      const cssFiles = fileKeys.filter(f => f.endsWith('.css'));
      
      // Choose a sample file to display
      const sampleFile = htmlFiles[0] || jsFiles[0] || cssFiles[0] || fileKeys[0];
      
      files['/index.html'] = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Project Files</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 1rem; }
    .container { display: flex; flex-direction: column; max-width: 1200px; margin: 0 auto; gap: 2rem; }
    @media (min-width: 768px) { .container { flex-direction: row; } }
    .file-list { flex: 1; }
    .file-content { flex: 2; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto; max-height: 400px; }
  </style>
</head>
<body>
  <h1>Project Files</h1>
  <div class="container">
    <div class="file-list">
      <h2>Files</h2>
      <ul>
      ${fileListHtml}
      </ul>
    </div>
    <div class="file-content">
      <h2 id="file-name">File Content</h2>
      <pre id="file-content">${files[sampleFile] ? files[sampleFile].substring(0, 500) + (files[sampleFile].length > 500 ? '...' : '') : 'Select a file to view its content'}</pre>
    </div>
  </div>

  <script>
    // Safely execute the script
    function displayFileContent(filePath) {
      try {
        const content = ${JSON.stringify(files)};
        const fileNameEl = document.getElementById('file-name');
        const fileContentEl = document.getElementById('file-content');
        
        if (fileNameEl && fileContentEl && content[filePath]) {
          fileNameEl.textContent = filePath.split('/').pop();
          fileContentEl.textContent = content[filePath];
        }
      } catch (error) {
        console.error('Error displaying file content:', error);
      }
    }
    
    // Initialize with the first file when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
      try {
        displayFileContent('${sampleFile}');
      } catch (error) {
        console.error('Error initializing file display:', error);
      }
    });
  </script>
</body>
</html>`;
      
      hasIndexHtml = true;
    }
    
    // Determine tech stack (Vanilla JS by default for simplicity)
    const techStack: TechStack = 'vanilla';
    
    return {
      files,
      techStack,
      hasTailwind
    };
  } catch (err: any) {
    console.error("Failed to parse ZIP file:", err);
    return {
      files: { 
        '/index.html': 
        `<html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Error Processing ZIP</title>
          </head>
          <body>
            <h1>Error Processing ZIP</h1>
            <p>${err.message || "Unknown error occurred while processing the ZIP file."}</p>
          </body>
        </html>` 
      },
      techStack: 'vanilla',
      hasTailwind: false,
      error: err.message || "Failed to process ZIP file"
    };
  }
}

export function injectTailwindCDN(files: Record<string, string>): Record<string, string> {
  // Only inject Tailwind for vanilla projects with index.html
  if (!files['/index.html']) {
    return files;
  }
  
  const htmlContent = files['/index.html'];
  const tailwindCDN = '<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">';
  
  // Check if Tailwind is already included
  if (htmlContent.includes('tailwindcss')) {
    return files;
  }
  
  // Inject Tailwind before closing head tag
  const updatedHtml = htmlContent.replace(
    '</head>',
    `  ${tailwindCDN}\n</head>`
  );
  
  // If head tag doesn't exist, try to inject at the beginning of the file
  if (updatedHtml === htmlContent && !htmlContent.includes('</head>')) {
    const htmlStartTag = htmlContent.match(/<html[^>]*>/i);
    if (htmlStartTag) {
      const position = htmlStartTag.index! + htmlStartTag[0].length;
      const newHtml = 
        htmlContent.substring(0, position) + 
        `\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  ${tailwindCDN}\n</head>\n` + 
        htmlContent.substring(position);
      return {
        ...files,
        '/index.html': newHtml
      };
    }
  }
  
  return {
    ...files,
    '/index.html': updatedHtml
  };
}
