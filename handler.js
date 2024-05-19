const DynamoDB = require("aws-sdk/clients/dynamodb");
const { v4: uuidV4 } = require("uuid");
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;
const documentClient = new DynamoDB.DocumentClient({
  region: "us-west-2",
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
  },
});

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data),
  };
};

module.exports.createNote = async (event, ctx, cb) => {
  // Prevent the Lambda function from waiting for the event loop to be empty
  ctx.callbackWaitsForEmptyEventLoop = false;

  const { title, body } = JSON.parse(event.body);

  const newNote = {
    note_id: uuidV4(),
    timestamp: new Date().toISOString(),
    title,
    body,
  };

  try {
    await documentClient
      .put({
        ConditionExpression: "attribute_not_exists(note_id)", // Check if the note_id attribute does not exist
        TableName: NOTES_TABLE_NAME,
        Item: newNote,
      })
      .promise();

    cb(
      null,
      send(201, {
        message: "The note was successfully created",
        data: newNote,
      })
    );
  } catch (error) {
    console.error({ error });

    cb(
      null,
      send(500, {
        message: "An error occurred while creating the note",
        error,
      })
    );
  }
};

module.exports.getNotes = async (event, ctx, cb) => {
  // Prevent the Lambda function from waiting for the event loop to be empty
  ctx.callbackWaitsForEmptyEventLoop = false;

  const { limit = 10 } = event.queryStringParameters ?? {};

  try {
    const response = await documentClient
      .scan({
        TableName: NOTES_TABLE_NAME,
        Limit: limit,
      })
      .promise();

    const notes = response.Items;

    cb(
      null,
      send(200, {
        message: "The notes were successfully retrieved",
        data: notes,
      })
    );
  } catch (error) {
    console.error({ error });

    cb(
      null,
      send(500, {
        message: "An error occurred while retrieving the notes",
        error,
      })
    );
  }
};

module.exports.getNote = async (event, ctx, cb) => {
  // Prevent the Lambda function from waiting for the event loop to be empty
  ctx.callbackWaitsForEmptyEventLoop = false;

  const { id } = event.pathParameters;

  try {
    const response = await documentClient
      .get({
        TableName: NOTES_TABLE_NAME,
        Key: { note_id: id },
      })
      .promise();

    const note = response.Item;

    if (!note) {
      return send(404, {
        message: "The note was not found",
      });
    }

    cb(
      null,
      send(200, {
        message: "The note was successfully retrieved",
        data: note,
      })
    );
  } catch (error) {
    console.error({ error });

    cb(
      null,
      send(500, {
        message: "An error occurred while retrieving the note",
        error,
      })
    );
  }
};

module.exports.updateNote = async (event, ctx, cb) => {
  // Prevent the Lambda function from waiting for the event loop to be empty
  ctx.callbackWaitsForEmptyEventLoop = false;

  const { id } = event.pathParameters;
  const { title, body } = JSON.parse(event.body);

  if (!title && !body) {
    return send(400, {
      message: "The request must contain either a title or a body",
    });
  }

  let updateExpression = "set ";
  let expressionAttributeValues = {};

  if (title) {
    updateExpression += "title = :title, ";
    expressionAttributeValues[":title"] = title;
  }

  if (body) {
    updateExpression += "body = :body, ";
    expressionAttributeValues[":body"] = body;
  }

  // Remove the last comma and space from the updateExpression
  updateExpression = updateExpression.slice(0, -2);

  try {
    const response = await documentClient
      .update({
        TableName: NOTES_TABLE_NAME,
        Key: { note_id: id },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: "attribute_exists(note_id)", // Check if the record exists
        ReturnValues: "ALL_NEW",
      })
      .promise();

    const updatedNote = response.Attributes;

    cb(
      null,
      send(200, {
        message: "The note was successfully updated",
        data: updatedNote,
      })
    );
  } catch (error) {
    console.error({ error });

    cb(
      null,
      send(500, {
        message: "An error occurred while updating the note",
        error,
      })
    );
  }
};

module.exports.deleteNote = async (event, ctx, cb) => {
  // Prevent the Lambda function from waiting for the event loop to be empty
  ctx.callbackWaitsForEmptyEventLoop = false;

  const { id } = event.pathParameters;

  try {
    await documentClient
      .delete({
        TableName: NOTES_TABLE_NAME,
        Key: { note_id: id },
        ConditionExpression: "attribute_exists(note_id)", // Check if the record exists
      })
      .promise();

    cb(
      null,
      send(200, {
        message: "The note was successfully deleted",
      })
    );
  } catch (error) {
    console.error({ error });

    cb(
      null,
      send(500, {
        message: "An error occurred while deleting the note",
        error,
      })
    );
  }
};
