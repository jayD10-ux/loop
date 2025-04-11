
// process-prototype/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { extract } from 'https://deno.land/x/zip@v1.2.5/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    console.log('Process-prototype function triggered at', new Date().toISOString());
    
    // Get the request body
    const { prototypeId } = await req.json()
    console.log('Processing prototype with ID:', prototypeId);

    if (!prototypeId) {
      console.error('No prototypeId provided in request');
      return new Response(
        JSON.stringify({ error: 'prototypeId is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    console.log('Creating Supabase client with URL:', supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if storage buckets exist and create them if they don't
    try {
      console.log('Checking if storage buckets exist');
      
      // Try to get prototype-uploads bucket
      const { data: uploadsData, error: uploadsError } = await supabase
        .storage
        .getBucket('prototype-uploads');
      
      // Create bucket if it doesn't exist
      if (uploadsError && uploadsError.message.includes('does not exist')) {
        console.log('Creating prototype-uploads bucket');
        await supabase
          .storage
          .createBucket('prototype-uploads', {
            public: false,
          });
        console.log('prototype-uploads bucket created successfully');
      } else {
        console.log('prototype-uploads bucket already exists');
      }
      
      // Try to get prototype-deployments bucket
      const { data: deploymentsData, error: deploymentsError } = await supabase
        .storage
        .getBucket('prototype-deployments');
      
      // Create bucket if it doesn't exist
      if (deploymentsError && deploymentsError.message.includes('does not exist')) {
        console.log('Creating prototype-deployments bucket');
        await supabase
          .storage
          .createBucket('prototype-deployments', {
            public: true,
          });
        console.log('prototype-deployments bucket created successfully');
      } else {
        console.log('prototype-deployments bucket already exists');
      }
    } catch (error) {
      console.error('Error checking or creating buckets:', error);
      // Continue anyway, the error will be caught later if buckets don't exist
    }

    // Get the prototype details
    console.log('Fetching prototype details');
    const { data: prototype, error: prototypeError } = await supabase
      .from('prototypes')
      .select('*')
      .eq('id', prototypeId)
      .single()

    if (prototypeError || !prototype) {
      console.error('Prototype not found:', prototypeError);
      return new Response(
        JSON.stringify({ error: 'Prototype not found', details: prototypeError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    console.log('Retrieved prototype:', {
      id: prototype.id,
      name: prototype.name,
      file_path: prototype.file_path,
      deployment_status: prototype.deployment_status,
    });

    if (!prototype.file_path) {
      console.error('No file path found in prototype record');
      return new Response(
        JSON.stringify({ error: 'No file to process' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Download the uploaded file from storage
    console.log('Downloading file from storage:', prototype.file_path);
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('prototype-uploads')
      .download(prototype.file_path)

    if (downloadError || !fileData) {
      console.error('Failed to download file:', downloadError);
      // Update prototype with failed status
      await supabase
        .from('prototypes')
        .update({
          deployment_status: 'failed',
        })
        .eq('id', prototypeId)

      return new Response(
        JSON.stringify({ error: 'Failed to download file', details: downloadError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    console.log('File downloaded successfully, size:', fileData.size, 'bytes');
    const deploymentPath = `prototype-deployments/${prototypeId}`
    const isZip = prototype.file_path.toLowerCase().endsWith('.zip')

    if (isZip) {
      // Handle ZIP files
      try {
        console.log('Processing ZIP file');
        // Create a temporary directory to extract files
        const tempDir = await Deno.makeTempDir()
        console.log('Created temp directory:', tempDir);
        
        // Write the zip file to temp directory
        const zipPath = `${tempDir}/prototype.zip`
        await Deno.writeFile(zipPath, new Uint8Array(await fileData.arrayBuffer()))
        console.log('Wrote ZIP file to temp directory');
        
        // Extract the zip file
        await extract(zipPath, tempDir)
        console.log('Extracted ZIP file to temp directory');
        
        // Find all files in the extracted directory
        const walkEntries = []
        for await (const entry of Deno.readDir(tempDir)) {
          if (entry.name !== 'prototype.zip') {
            walkEntries.push(entry)
          }
        }
        
        console.log('Files extracted:', walkEntries.map(e => e.name).join(', '));
        
        // Upload each file to the prototype-deployments/{prototypeId} folder
        for (const entry of walkEntries) {
          if (entry.isFile) {
            const fileContent = await Deno.readFile(`${tempDir}/${entry.name}`)
            console.log('Uploading file to deployments:', `${prototypeId}/${entry.name}`);
            const { error: uploadError } = await supabase
              .storage
              .from('prototype-deployments')
              .upload(`${prototypeId}/${entry.name}`, fileContent, {
                contentType: getContentType(entry.name),
                upsert: true,
              })
              
            if (uploadError) {
              console.error(`Error uploading ${entry.name}:`, uploadError);
            } else {
              console.log(`Successfully uploaded ${entry.name}`);
            }
          } else if (entry.isDirectory) {
            // Handle subdirectories recursively
            console.log(`Processing subdirectory: ${entry.name}`);
            await uploadDirectory(supabase, `${tempDir}/${entry.name}`, `${prototypeId}/${entry.name}`)
          }
        }
        
        // Clean up temp directory
        console.log('Cleaning up temp directory');
        await Deno.remove(tempDir, { recursive: true })
      } catch (error) {
        console.error('Failed to process ZIP file:', error);
        // Update prototype with failed status
        const { error: updateError } = await supabase
          .from('prototypes')
          .update({
            deployment_status: 'failed',
          })
          .eq('id', prototypeId)
          
        if (updateError) {
          console.error('Failed to update prototype with failed status:', updateError);
        }

        return new Response(
          JSON.stringify({ error: 'Failed to process ZIP file', details: error.message }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }
    } else {
      // Handle single HTML file
      try {
        console.log('Processing single HTML file');
        const { error: uploadError } = await supabase
          .storage
          .from('prototype-deployments')
          .upload(`${prototypeId}/index.html`, fileData, {
            contentType: 'text/html',
            upsert: true,
          })
          
        if (uploadError) {
          console.error('Failed to upload HTML file:', uploadError);
          throw uploadError;
        }
        
        console.log('HTML file uploaded to deployments path:', `${prototypeId}/index.html`);
      } catch (error) {
        console.error('Failed to upload HTML file:', error);
        // Update prototype with failed status
        const { error: updateError } = await supabase
          .from('prototypes')
          .update({
            deployment_status: 'failed',
          })
          .eq('id', prototypeId)
          
        if (updateError) {
          console.error('Failed to update prototype with failed status:', updateError);
        }

        return new Response(
          JSON.stringify({ error: 'Failed to upload HTML file', details: error.message }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }
    }

    // Get the public URL for the deployment
    console.log('Getting public URL');
    const { data: publicUrlData, error: urlError } = await supabase
      .storage
      .from('prototype-deployments')
      .getPublicUrl(`${prototypeId}/index.html`)

    if (urlError) {
      console.error('Failed to get public URL:', urlError);
    }

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error('Failed to get public URL, data:', publicUrlData);
      // Update prototype with failed status
      const { error: updateError } = await supabase
        .from('prototypes')
        .update({
          deployment_status: 'failed',
        })
        .eq('id', prototypeId)
        
      if (updateError) {
        console.error('Failed to update prototype with failed status:', updateError);
      }

      return new Response(
        JSON.stringify({ error: 'Failed to get public URL' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    console.log('Got public URL:', publicUrlData.publicUrl);

    // Update the prototype with the deployment URL and status
    console.log('Updating prototype record with deployment details');
    const { error: updateError } = await supabase
      .from('prototypes')
      .update({
        deployment_status: 'deployed',
        deployment_url: publicUrlData.publicUrl,
      })
      .eq('id', prototypeId)

    if (updateError) {
      console.error('Failed to update prototype:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update prototype', details: updateError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    console.log('Prototype processing completed successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        deploymentUrl: publicUrlData.publicUrl 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Unexpected error in process-prototype function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper function to recursively upload directory contents
async function uploadDirectory(supabase, localPath, remotePath) {
  console.log('Uploading directory:', localPath, 'to', remotePath);
  for await (const entry of Deno.readDir(localPath)) {
    const entryPath = `${localPath}/${entry.name}`
    const remoteEntryPath = `${remotePath}/${entry.name}`
    
    if (entry.isFile) {
      const fileContent = await Deno.readFile(entryPath)
      console.log('Uploading file:', remoteEntryPath);
      const { error } = await supabase
        .storage
        .from('prototype-deployments')
        .upload(remoteEntryPath, fileContent, {
          contentType: getContentType(entry.name),
          upsert: true,
        })
        
      if (error) {
        console.error(`Error uploading ${remoteEntryPath}:`, error);
      } else {
        console.log(`Successfully uploaded ${remoteEntryPath}`);
      }
    } else if (entry.isDirectory) {
      await uploadDirectory(supabase, entryPath, remoteEntryPath)
    }
  }
}

// Helper function to determine content type based on file extension
function getContentType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const contentTypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
  }
  
  return contentTypes[ext] || 'application/octet-stream'
}
