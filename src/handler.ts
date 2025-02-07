// src/handler.ts
import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import AWS from 'aws-sdk';

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME; // This should be set in the environment or serverless config

export const listPagesAndDirectories = async (event: { pathParameters?: { filePath?: string } }) => {
  try {
    let filePath = event.pathParameters?.filePath || "";

    // Decode URL-encoded file paths
    filePath = decodeURIComponent(filePath);

    // Determine the prefix based on the directory being accessed
    const prefix = filePath ? `pages/${filePath}/` : "pages/";

    if (!BUCKET_NAME) {
      throw new Error("S3_BUCKET_NAME is not defined");
    }

    const response = await s3
      .listObjectsV2({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        Delimiter: "/", // Groups items into directories
      })
      .promise();

    // Extract directories (S3 "CommonPrefixes" are directories)
    const directories = (response.CommonPrefixes || []).map((dir) =>
      dir.Prefix ? dir.Prefix.replace(prefix, "").replace("/", "") : ""
    );

    // Extract markdown files
    const files = (response.Contents || [])
      .map((file) => file.Key ? file.Key.replace(prefix, "") : "")
      .filter((file) => file.endsWith(".md"));

    return {
      statusCode: 200,
      body: JSON.stringify({ directories, files }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Error listing pages" }) };
  }
};

export const getContent = async (event: { pathParameters?: { filePath?: string } }) => {
  try {
    const filePath = event.pathParameters?.filePath ? decodeURIComponent(event.pathParameters.filePath) : "";

    console.log("Requested path:", filePath);

    if (!BUCKET_NAME) {
      throw new Error("S3_BUCKET_NAME is not defined");
    }

    // Decode the path again to ensure it's properly formatted for S3
    const key = filePath ? `pages/${filePath}/` : "pages/";

    console.log("Key for listing objects:", key);

    // Check if the requested path is a markdown file or a directory
    if (filePath.endsWith(".md")) {
      console.log('Markdown file');
      // Markdown file: Fetch and return content
      return getMarkdown(key);
    } else {
      // Directory: List objects within the directory
      const listResponse = await s3.listObjectsV2({ 
        Bucket: BUCKET_NAME, 
        Prefix: key, 
        Delimiter: "/" 
      }).promise();

      // Extract directories and markdown files from the response
      const directories = listResponse.CommonPrefixes?.map((prefix) => prefix.Prefix?.replace("pages/", "").replace(/\/$/, "")) || [];
      const files = listResponse.Contents?.map((file) => file.Key?.replace("pages/", ""))?.filter((name) => name?.endsWith(".md")) || [];

      console.log('Directories:', directories);
      console.log('Files:', files);

      return {
        statusCode: 200,
        body: JSON.stringify({ type: "directory", directories, files }),
      };
    }
  } catch (error) {
    console.error(error);
    return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
  }
};



export const listPages = async () => {
  try {
    console.log('BUCKET_NAME:', BUCKET_NAME);
    if (!BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME is not defined');
    }

    const response = await s3
      .listObjectsV2({ Bucket: BUCKET_NAME as string, Prefix: "pages/" })
      .promise();

    const files = response.Contents?.map((file) => file.Key) || [];

    return {
      statusCode: 200,
      body: JSON.stringify({ files }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: (error as Error).message }) };
  }
};


export const getMarkdown = async (filePath: string) => {
  try {
    filePath = decodeURIComponent(filePath);
    console.log('decoded filePath:', filePath);
    const key = `${filePath}`;
    const strippedKey = key.replace(".md/", ".md");
    console.log('Key:', strippedKey);
    console.log('Key Encoded:', encodeURIComponent(strippedKey));


    if (!BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME is not defined');
    }

    const response = await s3
      .getObject({ Bucket: BUCKET_NAME as string, Key: strippedKey })
      .promise();

      console.log('Response:', response);
    return {
      statusCode: 200,
      body: JSON.stringify({ content: response.Body ? response.Body.toString("utf-8") : "" }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 404, body: JSON.stringify({ error: "File not found" }) };
  }
};

export const uploadMarkdown = async (event: { body: string; }) => {
  try {
    const { fileName, content } = JSON.parse(event.body);
    const key = `pages/${fileName}.md`;
    
    if (!BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME is not defined');
    }

    await s3
      .putObject({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: content,
        ContentType: "text/markdown",
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "File uploaded successfully", key }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: (error as Error).message }) };
  }
};

// Handler to create a new page
export const createPage = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const { title, slug, content } = JSON.parse(event.body || '{}');
  const fileName = `${slug}.md`; // Using the slug as the file name
  console.log('Title:', title);

  if (!BUCKET_NAME) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({ message: 'S3_BUCKET_NAME is not defined' }),
    });
    return;
  }

  // Prepare the S3 upload parameters
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: content,
    ContentType: 'text/markdown',
  };

  try {
    // Upload the markdown content to the S3 bucket
    await s3.putObject(params).promise();
    callback(null, {
      statusCode: 201,
      body: JSON.stringify({ message: 'Page created successfully' }),
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating page', error }),
    });
  }
};

// src/handler.ts
export const getPage = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
    const slug = event.pathParameters?.slug;
    const fileName = `${slug}.md`; // Use the slug as the file name
  
    // S3 parameters to fetch the file
    if (!BUCKET_NAME) {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({ message: 'S3_BUCKET_NAME is not defined' }),
        });
      return;
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
    };

    try {
      // Get the markdown file from S3
      const data = await s3.getObject(params).promise();
      const content = data.Body?.toString('utf-8') || '';
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({ title: slug, content }), // You could include a title or other metadata here if needed
      });
    } catch (error) {
        console.error(error);
      callback(null, {
        statusCode: 404,
        body: JSON.stringify({ message: 'Page not found' }),
      });
    }
  };
  
