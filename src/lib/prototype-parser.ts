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
    
    // If no entry point found, create a simple one
    if (!hasReact && !hasIndexHtml && !files['/index.js'] && !files['/index.html']) {
      const fileKeys = Object.keys(files);
      if (fileKeys.length > 0) {
        // Create a simple index.html that includes the first file
        const firstFile = fileKeys[0].substring(1); // remove leading slash
        files['/index.html'] = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Preview</title>
</head>
<body>
  <h1>Project Files</h1>
  <p>This ZIP didn't have a main entry point. Here are the files found:</p>
  <ul>
    ${fileKeys.map(file => `<li>${file}</li>`).join('\n    ')}
  </ul>
  <p>First file contents:</p>
  <pre>${files[fileKeys[0]].substring(0, 1000)}${files[fileKeys[0]].length > 1000 ? '...' : ''}</pre>
</body>
</html>`;
        hasIndexHtml = true;
      }
    }
    
    // Determine tech stack (React takes precedence)
    const techStack: TechStack = hasReact ? 'react' : 'vanilla';
    
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
        `\n<head>\n  ${tailwindCDN}\n</head>\n` + 
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
