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
    
    // Try to create a JWT to test the private key
    console.log('Testing JWT creation...');
    try {
      // Test JWT creation like the upload function does
      const encoder = new TextEncoder();
      const base64UrlEncode = (bytes: Uint8Array) => {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
      };
      
      const importPrivateKey = async (keyData: string) => {
        let cleanKey = keyData;
        
        // Handle JSON escaped strings (\\n -> \n)
        if (cleanKey.includes('\\n')) {
          cleanKey = cleanKey.replace(/\\n/g, '\n');
        }
        
        // Extract the base64 content from PEM format
        let base64Content = cleanKey
          .replace(/-----BEGIN PRIVATE KEY-----/g, '')
          .replace(/-----END PRIVATE KEY-----/g, '')
          .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '')
          .replace(/-----END RSA PRIVATE KEY-----/g, '')
          .replace(/\r/g, '')
          .replace(/\n/g, '')
          .replace(/\s/g, '')
          .trim();
        
        // Convert base64 to binary
        const derBinary = atob(base64Content);
        const derBytes = new Uint8Array(derBinary.length);
        for (let i = 0; i < derBinary.length; i++) {
          derBytes[i] = derBinary.charCodeAt(i);
        }
        
        return await crypto.subtle.importKey(
          'pkcs8',
          derBytes.buffer,
          { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
          false,
          ['sign']
        );
      };

      const header = { alg: 'RS256', typ: 'JWT' };
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/drive',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
      };

      const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
      const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
      const signingInput = `${headerB64}.${payloadB64}`;

      console.log('Importing private key...');
      const key = await importPrivateKey(privateKey);
      console.log('Private key imported successfully');
      
      console.log('Signing JWT...');
      const signature = new Uint8Array(
        await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(signingInput))
      );
      const signatureB64 = base64UrlEncode(signature);
      const assertion = `${signingInput}.${signatureB64}`;
      console.log('JWT created successfully');
      
      console.log('Testing OAuth token request...');
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`OAuth failed: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('OAuth token obtained successfully');
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Google Drive connection test PASSED',
          details: {
            clientEmail: clientEmail,
            privateKeyLength: privateKey.length,
            privateKeyFormat: 'Valid PEM format',
            folderId: folderId || 'Not set',
            tokenType: tokenData.token_type,
            expiresIn: tokenData.expires_in
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
      
    } catch (jwtError) {
      console.error('JWT/OAuth test failed:', jwtError);
      throw new Error(`Authentication test failed: ${jwtError.message}`);
    }

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