// src/handler.ts
import { APIGatewayEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import { marked } from "marked";

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.DOCS_BUCKET_NAME; // This should be set in the environment or serverless config

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
        headers: {
          "Access-Control-Allow-Origin": "*", // Allow requests from any origin (you can restrict this to specific origins)
          "Access-Control-Allow-Methods": "OPTIONS,GET,POST", // Allow specific HTTP methods
          "Access-Control-Allow-Headers": "Content-Type,Authorization", // Allow specific headers
        },
        body: JSON.stringify({ type: "directory", directories, files }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 404,
      headers: { "Access-Control-Allow-Origin": "*"},
      body: JSON.stringify({ error: "Not found" }),
    };
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
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow requests from any origin (you can restrict this to specific origins)
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST", // Allow specific HTTP methods
        "Access-Control-Allow-Headers": "Content-Type,Authorization", // Allow specific headers
      },
      body: JSON.stringify({ content: response.Body ? response.Body.toString("utf-8") : "" }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 404, headers: { "Access-Control-Allow-Origin": "*"}, body: JSON.stringify({ error: "File not found" }) };
  }
};

export const uploadMarkdown = async (event: APIGatewayEvent) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: "No file uploaded" }) };
    }

    // Parse the request body
    const body = JSON.parse(event.body);
    const { fileName, fileContent } = body;

    if (!fileName || !fileName.endsWith(".md")) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid file type. Only .md files are allowed." }) };
    }

    // Validate Markdown
    try {
      await marked.parse(fileContent);
    } catch (error) {
      console.error("Invalid Markdown syntax:", error);
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*"}, body: JSON.stringify({ error: "Invalid Markdown syntax" }) };
    }

    // Upload to S3
    const params = {
      Bucket: BUCKET_NAME as string,
      Key: `pages/${fileName}`,
      Body: fileContent,
      ContentType: "text/markdown",
    };

    await s3.upload(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow requests from any origin (you can restrict this to specific origins)
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST", // Allow specific HTTP methods
        "Access-Control-Allow-Headers": "Content-Type,Authorization", // Allow specific headers
      },
      body: JSON.stringify({ message: "File uploaded successfully!" }),
    };
  } catch (error) {
    console.error("Upload failed:", error);
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*"}, body: JSON.stringify({ error: "Upload failed" }) };
  }
};

export const saveContent = async (event: APIGatewayEvent) => {
  try {
    if (!BUCKET_NAME) {
      throw new Error("DOCS_BUCKET_NAME is not defined");
    }

    const filePath = event.pathParameters?.filePath
      ? decodeURIComponent(event.pathParameters.filePath)
      : "";

    if (!filePath.endsWith(".md")) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid file format" }) };
    }

    const requestBody = JSON.parse(event.body || "{}");

    if (!requestBody.content) {
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*"}, body: JSON.stringify({ error: "No content provided" }) };
    }

    console.log("Saving file:", filePath);

    const params = {
      Bucket: BUCKET_NAME,
      Key: `pages/${filePath}`,
      Body: requestBody.content,
      ContentType: "text/markdown",
    };

    await s3.putObject(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow requests from any origin (you can restrict this to specific origins)
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST", // Allow specific HTTP methods
        "Access-Control-Allow-Headers": "Content-Type,Authorization", // Allow specific headers
      },
      body: JSON.stringify({ message: "File saved successfully", filePath }),
    };
  } catch (error) {
    console.error("Error saving file:", error);
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*"}, body: JSON.stringify({ error: "Failed to save file" }) };
  }
};

export const deleteMarkdown = async (event: APIGatewayEvent) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: "No file specified" }) };
    }

    const { filePath } = JSON.parse(event.body);
    if (!filePath || !filePath.endsWith(".md")) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid file path" }) };
    }

    const params = {
      Bucket: BUCKET_NAME as string,
      Key: `pages/${filePath}`, // Ensure it's under `pages/`
    };

    await s3.deleteObject(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow requests from any origin (you can restrict this to specific origins)
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST", // Allow specific HTTP methods
        "Access-Control-Allow-Headers": "Content-Type,Authorization", // Allow specific headers
      },
      body: JSON.stringify({ message: "File deleted successfully!" }),
    };
  } catch (error) {
    console.error("Delete failed:", error);
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*"}, body: JSON.stringify({ error: "Delete failed" }) };
  }
};
