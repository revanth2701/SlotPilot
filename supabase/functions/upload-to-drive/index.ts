import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Google Drive API helpers
async function getAccessToken() {
  const clientEmail = Deno.env.get('GOOGLE_DRIVE_CLIENT_EMAIL');
  const privateKeyPem = Deno.env.get('GOOGLE_DRIVE_PRIVATE_KEY');
  
  if (!clientEmail || !privateKeyPem) {
    throw new Error('Google Drive credentials not configured');
  }

  console.log('Creating JWT for Google Drive authentication...');

  // Helpers
  const encoder = new TextEncoder();
  const base64UrlEncode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  };
  const importPrivateKey = async (pem: string) => {
    // Normalize PEM and extract base64
    const pemBody = pem
      .replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/\r?\n|\\n/g, '')
      .trim();
    const derBinary = atob(pemBody);
    const derBytes = new Uint8Array(derBinary.length);
    for (let i = 0; i < derBinary.length; i++) derBytes[i] = derBinary.charCodeAt(i);
    return await crypto.subtle.importKey(
      'pkcs8',
      derBytes.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );
  };

  // JWT header & payload
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  // Sign with RSA-SHA256
  const key = await importPrivateKey(privateKeyPem);
  const signature = new Uint8Array(
    await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(signingInput))
  );
  const signatureB64 = base64UrlEncode(signature);
  const assertion = `${signingInput}.${signatureB64}`;

  console.log('Making token request to Google OAuth2...');

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
    console.error('Token request failed:', errorText);
    throw new Error(`Authentication failed: ${errorText}`);
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