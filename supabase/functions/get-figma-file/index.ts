
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { fileKey } = await req.json();
    
    if (!fileKey) {
      return new Response(
        JSON.stringify({ error: 'File key is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Get the Figma API token from environment variables
    const figmaToken = Deno.env.get('FIGMA_ACCESS_TOKEN');
    
    if (!figmaToken) {
      return new Response(
        JSON.stringify({ error: 'Figma API token not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Fetch file data from Figma API
    const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': figmaToken,
      },
    });

    if (!fileResponse.ok) {
      const errorData = await fileResponse.json();
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch Figma file', 
          details: errorData 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: fileResponse.status,
        }
      );
    }

    const fileData = await fileResponse.json();
    
    // Get a thumbnail for the file
    const imageResponse = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=0&format=png&scale=2`, {
      headers: {
        'X-Figma-Token': figmaToken,
      },
    });

    let previewUrl = null;
    
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      previewUrl = imageData.images['0'];
    }

    // Return the file data and preview URL
    return new Response(
      JSON.stringify({
        name: fileData.name,
        previewUrl,
        lastModified: fileData.lastModified,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
