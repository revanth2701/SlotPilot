import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing Google Drive connection...');
    
    // Check if secrets are available
    const clientEmail = Deno.env.get('GOOGLE_DRIVE_CLIENT_EMAIL');
    const privateKey = Deno.env.get('GOOGLE_DRIVE_PRIVATE_KEY');
    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');
    
    console.log('Secrets check:');
    console.log('Client email:', clientEmail ? 'Present' : 'Missing');
    console.log('Private key:', privateKey ? `Present (${privateKey.length} chars)` : 'Missing');
    console.log('Folder ID:', folderId ? `Present (${folderId})` : 'Empty');
    
    if (!clientEmail || !privateKey) {
      throw new Error('Missing Google Drive credentials');
    }
    
    // Test private key format
    console.log('Private key starts with:', privateKey.substring(0, 30));
    console.log('Private key contains BEGIN:', privateKey.includes('-----BEGIN'));
    console.log('Private key contains END:', privateKey.includes('-----END'));
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Google Drive secrets are configured',
        clientEmail: clientEmail,
        privateKeyLength: privateKey.length,
        privateKeyFormat: privateKey.includes('-----BEGIN') ? 'PEM format' : 'Base64 format',
        folderId: folderId || 'Not set'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Test failed:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});