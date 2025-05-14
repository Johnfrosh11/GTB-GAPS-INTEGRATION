import { corsHeaders } from '../_shared/cors.ts';

interface ProxyRequest {
  endpoint: string;
  data: string;
  isTest?: boolean;
}

const TEST_BASE_URL = 'https://gtweb.gtbank.com/Gaps_FileUploader/FileUploader.asmx';
const LIVE_BASE_URL = 'https://ebank2.gtbank.com/Gaps_FileUploader/FileUploader.asmx';

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { endpoint, data, isTest = true }: ProxyRequest = await req.json();
    const baseUrl = isTest ? TEST_BASE_URL : LIVE_BASE_URL;
    
    // Remove any leading slash to prevent double slashes in the URL
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const url = `${baseUrl}/${cleanEndpoint}`;

    console.log('Making request to:', url);
    console.log('Request body:', data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': `http://tempuri.org/${cleanEndpoint}`,
      },
      body: data,
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }

    return new Response(responseText, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml;charset=UTF-8',
      },
    });
  } catch (error) {
    console.error('GAPS Proxy Error:', error);
    
    // Return a more detailed error response
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});