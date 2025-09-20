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
  const importPrivateKey = async (keyData: string) => {
    try {
      console.log('Processing private key...');
      let cleanKey = keyData;
      
      // Handle JSON escaped strings (\\n -> \n)
      if (cleanKey.includes('\\n')) {
        cleanKey = cleanKey.replace(/\\n/g, '\n');
      }
      
      // If it doesn't have PEM headers, assume it's base64 encoded
      if (!cleanKey.includes('-----BEGIN')) {
        try {
          cleanKey = atob(cleanKey);
        } catch (e) {
          console.error('Failed to base64 decode key');
          throw new Error('Invalid base64 encoded private key');
        }
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
      
      console.log('Extracted base64 content length:', base64Content.length);
      
      // Convert base64 to binary
      const derBinary = atob(base64Content);
      const derBytes = new Uint8Array(derBinary.length);
      for (let i = 0; i < derBinary.length; i++) {
        derBytes[i] = derBinary.charCodeAt(i);
      }
      
      console.log('DER bytes length:', derBytes.length);
      
      // Try to import as PKCS#8 first
      try {
        return await crypto.subtle.importKey(
          'pkcs8',
          derBytes.buffer,
          { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
          false,
          ['sign']
        );
      } catch (pkcs8Error) {
        console.log('PKCS#8 import failed, trying different approach:', pkcs8Error.message);
        throw pkcs8Error;
      }
    } catch (error) {
      console.error('Private key import failed:', error);
      console.error('Key starts with:', keyData.substring(0, 50));
      throw new Error(`Invalid private key format: ${error.message}`);
    }
  };

  // JWT header & payload
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

async function createFolder(accessToken: string, folderName: string, parentId?: string) {
  // Check if folder exists first
  const parentFilter = parentId ? ` and '${parentId}' in parents` : '';
  const query = encodeURIComponent(`name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentFilter}`);
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
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
      ...(parentId ? { parents: [parentId] } : {}),
    }),
  });

  if (!createResponse.ok) {
    throw new Error(`Failed to create folder: ${await createResponse.text()}`);
  }

  const folderData = await createResponse.json();
  return folderData.id;
}

async function uploadFile(accessToken: string, fileName: string, fileContent: string, mimeType: string, folderId: string) {
  // Convert base64 to binary
  const binaryString = atob(fileContent);
  const fileBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    fileBytes[i] = binaryString.charCodeAt(i);
  }

  // Build proper multipart/related body per Google Drive spec
  const boundary = `===============${Date.now()}==`;
  const encoder = new TextEncoder();

  const preamble = `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify({ name: fileName, parents: [folderId] }) +
    `\r\n--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`;

  const closing = `\r\n--${boundary}--`;

  const preambleBytes = encoder.encode(preamble);
  const closingBytes = encoder.encode(closing);

  const body = new Uint8Array(preambleBytes.length + fileBytes.length + closingBytes.length);
  body.set(preambleBytes, 0);
  body.set(fileBytes, preambleBytes.length);
  body.set(closingBytes, preambleBytes.length + fileBytes.length);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,parents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Drive upload failed: ${errText}`);
  }

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
    console.log(`Document type: ${documentType}, MIME type: ${mimeType}`);

    if (!fileName || !fileContent || !studentFirstName || !studentLastName) {
      console.error('Missing required fields:', { fileName: !!fileName, fileContent: !!fileContent, studentFirstName: !!studentFirstName, studentLastName: !!studentLastName });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get access token
    console.log('Getting Google Drive access token...');
    const accessToken = await getAccessToken();
    console.log('Access token obtained successfully');

    // Optional root folder to place student folders inside
    const rootFolderId = (Deno.env.get('GOOGLE_DRIVE_FOLDER_ID') || '').trim() || undefined;
    console.log('Root folder ID:', rootFolderId || 'none (will create in root)');

    // Create student folder (FirstName LastName) inside root if provided
    const studentFolderName = `${studentFirstName} ${studentLastName}`;
    console.log(`Creating/finding student folder: ${studentFolderName}`);
    const studentFolderId = await createFolder(accessToken, studentFolderName, rootFolderId);
    console.log(`Student folder ID: ${studentFolderId}`);

    // Upload file to Google Drive
    console.log(`Uploading file ${fileName} to folder ${studentFolderId}`);
    const uploadResult = await uploadFile(
      accessToken,
      fileName,
      fileContent,
      mimeType,
      studentFolderId
    );

    console.log(`Upload successful! File ID: ${uploadResult.id}, Name: ${uploadResult.name}`);

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