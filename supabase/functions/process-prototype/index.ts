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
    // Get the request body
    const { prototypeId } = await req.json()

    if (!prototypeId) {
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
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the prototype details
    const { data: prototype, error: prototypeError } = await supabase
      .from('prototypes')
      .select('*')
      .eq('id', prototypeId)
      .single()

    if (prototypeError || !prototype) {
      return new Response(
        JSON.stringify({ error: 'Prototype not found', details: prototypeError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    if (!prototype.file_path) {
      return new Response(
        JSON.stringify({ error: 'No file to process' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Download the uploaded file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('prototype-uploads')
      .download(prototype.file_path)

    if (downloadError || !fileData) {
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

    const deploymentPath = `prototype-deployments/${prototypeId}`
    const isZip = prototype.file_path.toLowerCase().endsWith('.zip')

    if (isZip) {
      // Handle ZIP files
      try {
        // Create a temporary directory to extract files
        const tempDir = await Deno.makeTempDir()
        
        // Write the zip file to temp directory
        const zipPath = `${tempDir}/prototype.zip`
        await Deno.writeFile(zipPath, new Uint8Array(await fileData.arrayBuffer()))
        
        // Extract the zip file
        await extract(zipPath, tempDir)
        
        // Find all files in the extracted directory
        const walkEntries = []
        for await (const entry of Deno.readDir(tempDir)) {
          if (entry.name !== 'prototype.zip') {
            walkEntries.push(entry)
          }
        }
        
        // Upload each file to the prototype-deployments/{prototypeId} folder
        for (const entry of walkEntries) {
          if (entry.isFile) {
            const fileContent = await Deno.readFile(`${tempDir}/${entry.name}`)
            await supabase
              .storage
              .from('prototype-deployments')
              .upload(`${prototypeId}/${entry.name}`, fileContent, {
                contentType: getContentType(entry.name),
                upsert: true,
              })
          } else if (entry.isDirectory) {
            // Handle subdirectories recursively
            await uploadDirectory(supabase, `${tempDir}/${entry.name}`, `${prototypeId}/${entry.name}`)
          }
        }
        
        // Clean up temp directory
        await Deno.remove(tempDir, { recursive: true })
      } catch (error) {
        // Update prototype with failed status
        await supabase
          .from('prototypes')
          .update({
            deployment_status: 'failed',
          })
          .eq('id', prototypeId)

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
        await supabase
          .storage
          .from('prototype-deployments')
          .upload(`${prototypeId}/index.html`, fileData, {
            contentType: 'text/html',
            upsert: true,
          })
      } catch (error) {
        // Update prototype with failed status
        await supabase
          .from('prototypes')
          .update({
            deployment_status: 'failed',
          })
          .eq('id', prototypeId)

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
    const { data: publicUrlData } = await supabase
      .storage
      .from('prototype-deployments')
      .getPublicUrl(`${prototypeId}/index.html`)

    if (!publicUrlData || !publicUrlData.publicUrl) {
      // Update prototype with failed status
      await supabase
        .from('prototypes')
        .update({
          deployment_status: 'failed',
        })
        .eq('id', prototypeId)

      return new Response(
        JSON.stringify({ error: 'Failed to get public URL' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Update the prototype with the deployment URL and status
    const { error: updateError } = await supabase
      .from('prototypes')
      .update({
        deployment_status: 'deployed',
        deployment_url: publicUrlData.publicUrl,
      })
      .eq('id', prototypeId)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update prototype', details: updateError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

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
  for await (const entry of Deno.readDir(localPath)) {
    const entryPath = `${localPath}/${entry.name}`
    const remoteEntryPath = `${remotePath}/${entry.name}`
    
    if (entry.isFile) {
      const fileContent = await Deno.readFile(entryPath)
      await supabase
        .storage
        .from('prototype-deployments')
        .upload(remoteEntryPath, fileContent, {
          contentType: getContentType(entry.name),
          upsert: true,
        })
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
