import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import busboy from 'busboy';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle streams
  },
};

/**
 * This API route handler streams a file from a client request to the Walrus Upload Relay service.
 * It uses busboy to parse the multipart/form-data stream from the client and pipes the file
 * directly into a new POST request to the Walrus relay, avoiding buffering the file in memory.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const bb = busboy({ headers: req.headers });

  bb.on('file', (fieldname, file, info) => {
    const { filename, mimeType } = info;

    // Create a new form-data instance to stream the file to the relay service.
    const formData = new FormData();
    formData.append(fieldname, file, {
      filename: filename,
      contentType: mimeType,
    });

    // Post the form data stream to the Walrus relay service.
    axios.post('https://upload-relay.testnet.walrus.space/v1/blobs', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity, // Allow large file uploads
      maxBodyLength: Infinity,
    })
    .then(response => {
      // On success, return the blobId from the relay service.
      res.status(200).json({ blobId: response.data.blobId });
    })
    .catch(error => {
      console.error('Error uploading to Walrus Relay:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ 
        error: 'Failed to upload file to Walrus Relay.',
        details: error.response?.data,
      });
    });
  });

  // Pipe the incoming request to busboy for parsing.
  req.pipe(bb);
}

