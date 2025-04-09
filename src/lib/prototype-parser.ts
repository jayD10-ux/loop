import JSZip from 'jszip';

export type TechStack = 'react' | 'vanilla';

interface ParsedPrototype {
  files: Record<string, string>;
  techStack: TechStack;
  hasTailwind: boolean;
}

export async function parseZipFile(file: File): Promise<ParsedPrototype> {
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
  
  // Validate the ZIP contents
  if (!hasReact && !hasIndexHtml) {
    throw new Error("No valid entry point found. Upload must contain either index.html or a React project with package.json.");
  }
  
  if (maxDepth > 4) {
    console.warn("ZIP contains deeply nested folders (>4 levels). Some files may be excluded.");
  }
  
  // Determine tech stack (React takes precedence)
  const techStack: TechStack = hasReact ? 'react' : 'vanilla';
  
  return {
    files,
    techStack,
    hasTailwind
  };
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
  
  return {
    ...files,
    '/index.html': updatedHtml
  };
}
