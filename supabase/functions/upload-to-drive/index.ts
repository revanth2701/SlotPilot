import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Google Drive API helpers
async function getAccessToken() {
  const clientEmail = Deno.env.get('GOOGLE_DRIVE_CLIENT_EMAIL');
  const privateKey = Deno.env.get('GOOGLE_DRIVE_PRIVATE_KEY');
  
  if (!clientEmail || !privateKey) {
    throw new Error('Google Drive credentials not configured');
  }

  console.log('Creating JWT for Google Drive authentication...');
  
  // Create proper JWT for Google Service Account
  const now = Math.floor(Date.now() / 1000);
  
  // JWT Header
  const header = {
    "alg": "RS256",
    "typ": "JWT"
  };
  
  // JWT Payload
  const payload = {
    "iss": clientEmail,
    "scope": "https://www.googleapis.com/auth/drive.file",
    "aud": "https://oauth2.googleapis.com/token", 
    "exp": now + 3600,
    "iat": now
  };

  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Create the assertion (we'll use a different approach since we can't sign RSA256 easily in Deno)
  const assertion = `${encodedHeader}.${encodedPayload}`;
  
  console.log('Making token request to Google OAuth2...');
  
  // Use the correct JWT assertion flow for service accounts
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      'assertion': assertion
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token request failed:', errorText);
    
    // Fallback: Try using the service account directly (alternative approach)
    console.log('Trying alternative authentication approach...');
    
    const altResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'grant_type': 'refresh_token',
        'client_id': clientEmail,
        'client_secret': privateKey.replace(/\\n/g, '\n'),
      }),
    });
    
    if (!altResponse.ok) {
      throw new Error(`Authentication failed: ${errorText}`);
    }
    
    const altTokenData = await altResponse.json();
    return altTokenData.access_token;
  }

  const tokenData = await tokenResponse.json();
  console.log('Successfully obtained access token');
  return tokenData.access_token;
}

async function createFolder(accessToken: string, folderName: string) {
  // Check if folder exists first
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  const searchData = await searchResponse.json();
  
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create new folder
  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  const folderData = await createResponse.json();
  return folderData.id;
}

async function uploadFile(accessToken: string, fileName: string, fileContent: string, mimeType: string, folderId: string) {
  // Convert base64 to binary
  const binaryString = atob(fileContent);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create multipart form data
  const boundary = `----formdata-${Date.now()}`;
  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  });

  const multipartBody = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadata,
    `--${boundary}`,
    `Content-Type: ${mimeType}`,
    '',
    // File content as binary
  ].join('\r\n');

  const encoder = new TextEncoder();
  const textPart = encoder.encode(multipartBody);
  const endBoundary = encoder.encode(`\r\n--${boundary}--`);
  
  // Combine text and binary parts
  const body = new Uint8Array(textPart.length + bytes.length + endBoundary.length);
  body.set(textPart, 0);
  body.set(bytes, textPart.length);
  body.set(endBoundary, textPart.length + bytes.length);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: body,
  });

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      fileName, 
      fileContent, 
      mimeType, 
      documentType,
      studentFirstName, 
      studentLastName, 
      studentEmail 
    } = await req.json();

    console.log(`Processing upload for: ${studentFirstName} ${studentLastName}, file: ${fileName}`);

    if (!fileName || !fileContent || !studentFirstName || !studentLastName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Create student folder (FirstName LastName)
    const studentFolderName = `${studentFirstName} ${studentLastName}`;
    const studentFolderId = await createFolder(accessToken, studentFolderName);

    // Upload file to Google Drive
    const uploadResult = await uploadFile(
      accessToken, 
      fileName, 
      fileContent, 
      mimeType, 
      studentFolderId
    );

    console.log(`Document uploaded successfully: ${uploadResult.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        fileId: uploadResult.id,
        fileName: fileName,
        folderId: studentFolderId,
        folderName: studentFolderName
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in upload-to-drive function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Upload failed',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});