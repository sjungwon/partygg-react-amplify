/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_PARTYGGCOMMENTTABLE_ARN
	STORAGE_PARTYGGCOMMENTTABLE_NAME
	STORAGE_PARTYGGCOMMENTTABLE_STREAMARN
	STORAGE_PARTYGGPOSTTABLE_ARN
	STORAGE_PARTYGGPOSTTABLE_NAME
	STORAGE_PARTYGGPOSTTABLE_STREAMARN
	STORAGE_PARTYGGPROFILETABLE_ARN
	STORAGE_PARTYGGPROFILETABLE_NAME
	STORAGE_PARTYGGPROFILETABLE_STREAMARN
	STORAGE_PARTYGGSUBCOMMENTTABLE_ARN
	STORAGE_PARTYGGSUBCOMMENTTABLE_NAME
	STORAGE_PARTYGGSUBCOMMENTTABLE_STREAMARN
Amplify Params - DO NOT EDIT */ /*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const AWS = require("aws-sdk");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const bodyParser = require("body-parser");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "partyggProfileTable";
let postTableName = "partyggPostTable";
let commentTableName = "partyggCommentTable";
let subcommentTableName = "partyggSubcommentTable";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
  postTableName = postTableName + "-" + process.env.ENV;
  commentTableName = commentTableName + "-" + process.env.ENV;
  subcommentTableName = subcommentTableName + "-" + process.env.ENV;
}

const profileIdIndexName = "profileId-date-index";

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "username";
const partitionKeyType = "S";
const sortKeyName = "id";
const sortKeyType = "S";
const hasSortKey = sortKeyName !== "";
const path = "/profiles";
const UNAUTH = "UNAUTH";
const hashKeyPath = "/:" + partitionKeyName;
const sortKeyPath = hasSortKey ? "/:" + sortKeyName : "";

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch (type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
};

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path + hashKeyPath, function (req, res) {
  const condition = {};
  condition[partitionKeyName] = {
    ComparisonOperator: "EQ",
  };

  if (userIdPresent && req.apiGateway) {
    condition[partitionKeyName]["AttributeValueList"] = [
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH,
    ];
  } else {
    try {
      condition[partitionKeyName]["AttributeValueList"] = [
        convertUrlType(req.params[partitionKeyName], partitionKeyType),
      ];
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }

  let queryParams = {
    TableName: tableName,
    KeyConditions: condition,
  };

  dynamodb.query(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    } else {
      res.json(data.Items);
    }
  });
});

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get(path + "/object" + sortKeyPath, function (req, res) {
  let scanParams = {
    TableName: tableName,
    FilterExpression: "id = :i",
    ExpressionAttributeValues: {
      ":i": req.params[sortKeyName],
    },
  };

  dynamodb.scan(scanParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err.message });
    } else {
      if (data.Items && data.Items.length) {
        res.json(data.Items);
      } else {
        res.json([]);
      }
    }
  });
});

/*****************************************
 * HTTP Get method for get single object With id *
 *****************************************/
app.get(path + "/object" + hashKeyPath + sortKeyPath, function (req, res) {
  const params = {};
  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  } else {
    params[partitionKeyName] = req.params[partitionKeyName];
    try {
      params[partitionKeyName] = convertUrlType(
        req.params[partitionKeyName],
        partitionKeyType
      );
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }
  if (hasSortKey) {
    try {
      params[sortKeyName] = convertUrlType(
        req.params[sortKeyName],
        sortKeyType
      );
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }

  let getItemParams = {
    TableName: tableName,
    Key: params,
  };

  dynamodb.get(getItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err.message });
    } else {
      if (data.Item) {
        res.json(data.Item);
      } else {
        res.json(data);
      }
    }
  });
});

/************************************
 * HTTP put method for insert object *
 *************************************/

app.put(path, function (req, res) {
  if (userIdPresent) {
    req.body["userId"] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body,
  };
  dynamodb.put(putItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({ success: "put call succeed!", url: req.url, data: data });
    }
  });
});

/************************************
 * HTTP post method for insert object *
 *************************************/

app.post(path, async function (req, res) {
  if (userIdPresent) {
    req.body["userId"] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: {
      ...req.body,
      id: uuidv4(),
    },
  };

  console.log(putItemParams);

  const findParam = {
    TableName: tableName,
    Key: {
      username: putItemParams.Item.username,
      id: putItemParams.Item.id,
    },
  };
  //중복 방지
  let i = 0;
  while (i < 3) {
    try {
      const findIdRedundancy = await dynamodb.get(findParam).promise();
      if (findIdRedundancy.Item?.id) {
        findParam.Key.id = putItemParams.Item.id = uuidv4();
        i++;
        continue;
      } else {
        await dynamodb.put(putItemParams).promise();
        res.json({
          success: "post call succeed!",
          url: req.url,
          data: putItemParams.Item,
        });
        return;
      }
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
      return;
    }
  }
});

/************************************
 * HTTP post method for update object *
 *************************************/

app.post(
  path + "/object" + hashKeyPath + sortKeyPath,
  async function (req, res) {
    if (userIdPresent) {
      req.body["userId"] =
        req.apiGateway.event.requestContext.identity.cognitoIdentityId ||
        UNAUTH;
    }

    let putItemParams = {
      TableName: tableName,
      Item: {
        ...req.body,
      },
    };

    try {
      await dynamodb.put(putItemParams).promise();
      const updateFunc = async () => {
        const param = {
          IndexName: profileIdIndexName,
          KeyConditionExpression: "profileId = :p",
          ExpressionAttributeValues: {
            ":p": req.params[sortKeyName],
          },
          ScanIndexForward: false,
        };
        const updateParam = {
          ExpressionAttributeNames: {
            "#P": "profile",
          },
          ExpressionAttributeValues: {
            ":p": { ...req.body },
          },
          UpdateExpression: "SET #P = :p",
        };
        const postUpdate = new Promise(async (res) => {
          const postQueryParam = {
            TableName: postTableName,
            ...param,
          };
          const posts = await dynamodb.query(postQueryParam).promise();
          let result;
          if (posts.Items) {
            result = await Promise.all(
              posts.Items.map(async (item) => {
                const postUpdateParam = {
                  TableName: postTableName,
                  Key: {
                    username: item.username,
                    date: item.date,
                  },
                  ...updateParam,
                };
                const test = await dynamodb.update(postUpdateParam).promise();
                return test;
              })
            );
          }
          res(result);
        });
        const commentUpdate = new Promise(async (res) => {
          const commentQueryParam = {
            TableName: commentTableName,
            ...param,
          };
          const comments = await dynamodb.query(commentQueryParam).promise();
          let result;
          if (comments.Items) {
            result = await Promise.all(
              comments.Items.map(async (item) => {
                const commentUpdateParam = {
                  TableName: commentTableName,
                  Key: {
                    postId: item.postId,
                    date: item.date,
                  },
                  ...updateParam,
                };
                const test = await dynamodb
                  .update(commentUpdateParam)
                  .promise();
                return test;
              })
            );
          }
          res(result);
        });
        const subcommentUpdate = new Promise(async (res) => {
          const subcommentQueryParam = {
            TableName: subcommentTableName,
            ...param,
          };
          const subcomments = await dynamodb
            .query(subcommentQueryParam)
            .promise();
          let result;
          if (subcomments.Items) {
            result = await Promise.all(
              subcomments.Items.map(async (item) => {
                const subcommentUpdateParam = {
                  TableName: subcommentTableName,
                  Key: {
                    commentId: item.commentId,
                    date: item.date,
                  },
                  ...updateParam,
                };
                const test = await dynamodb
                  .update(subcommentUpdateParam)
                  .promise();
                return test;
              })
            );
          }
          res(result);
        });

        await Promise.all([postUpdate, commentUpdate, subcommentUpdate]);
      };
      await updateFunc();

      res.json({
        success: "post call succeed!",
        url: req.url,
        data: putItemParams.Item,
      });
    } catch (err) {
      console.log("Profile update error: " + err);
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    }
  }
);

/**************************************
 * HTTP remove method to delete object *
 ***************************************/

app.delete(
  path + "/object" + hashKeyPath + sortKeyPath,
  async function (req, res) {
    const params = {};
    if (userIdPresent && req.apiGateway) {
      params[partitionKeyName] =
        req.apiGateway.event.requestContext.identity.cognitoIdentityId ||
        UNAUTH;
    } else {
      params[partitionKeyName] = req.params[partitionKeyName];
      try {
        params[partitionKeyName] = convertUrlType(
          req.params[partitionKeyName],
          partitionKeyType
        );
      } catch (err) {
        res.statusCode = 500;
        res.json({ error: "Wrong column type " + err });
      }
    }
    if (hasSortKey) {
      try {
        params[sortKeyName] = convertUrlType(
          req.params[sortKeyName],
          sortKeyType
        );
      } catch (err) {
        res.statusCode = 500;
        res.json({ error: "Wrong column type " + err });
      }
    }

    let removeItemParams = {
      TableName: tableName,
      Key: params,
    };

    // dynamodb.delete(removeItemParams, (err, data) => {
    //   if (err) {
    //     res.statusCode = 500;
    //     res.json({ error: err, url: req.url });
    //   } else {
    //     res.json({ url: req.url, data: data });
    //   }
    // });
    try {
      const profileDb = await dynamodb.get(removeItemParams).promise();
      const profile = profileDb.Item;
      if (!profile) {
        throw new Error("Not exist profile");
      }
      await dynamodb.delete(removeItemParams).promise();
      const updateFunc = async () => {
        const param = {
          IndexName: profileIdIndexName,
          KeyConditionExpression: "profileId = :p",
          ExpressionAttributeValues: {
            ":p": req.params[sortKeyName],
          },
          ScanIndexForward: false,
        };
        const updateParam = {
          ExpressionAttributeNames: {
            "#P": "profile",
          },
          ExpressionAttributeValues: {
            ":p": {
              ...profile,
              nickname: "삭제된 프로필",
              profileImage: undefined,
            },
          },
          UpdateExpression: "SET #P = :p",
        };
        const postUpdate = new Promise(async (res) => {
          const postQueryParam = {
            TableName: postTableName,
            ...param,
          };
          const posts = await dynamodb.query(postQueryParam).promise();
          let result;
          if (posts.Items) {
            result = await Promise.all(
              posts.Items.map(async (item) => {
                const postUpdateParam = {
                  TableName: postTableName,
                  Key: {
                    username: item.username,
                    date: item.date,
                  },
                  ...updateParam,
                };
                const test = await dynamodb.update(postUpdateParam).promise();
                return test;
              })
            );
          }
          res(result);
        });
        const commentUpdate = new Promise(async (res) => {
          const commentQueryParam = {
            TableName: commentTableName,
            ...param,
          };
          const comments = await dynamodb.query(commentQueryParam).promise();
          let result;
          if (comments.Items) {
            result = await Promise.all(
              comments.Items.map(async (item) => {
                const commentUpdateParam = {
                  TableName: commentTableName,
                  Key: {
                    postId: item.postId,
                    date: item.date,
                  },
                  ...updateParam,
                };
                const test = await dynamodb
                  .update(commentUpdateParam)
                  .promise();
                return test;
              })
            );
          }
          res(result);
        });
        const subcommentUpdate = new Promise(async (res) => {
          const subcommentQueryParam = {
            TableName: subcommentTableName,
            ...param,
          };
          const subcomments = await dynamodb
            .query(subcommentQueryParam)
            .promise();
          let result;
          if (subcomments.Items) {
            result = await Promise.all(
              subcomments.Items.map(async (item) => {
                const subcommentUpdateParam = {
                  TableName: subcommentTableName,
                  Key: {
                    commentId: item.commentId,
                    date: item.date,
                  },
                  ...updateParam,
                };
                const test = await dynamodb
                  .update(subcommentUpdateParam)
                  .promise();
                return test;
              })
            );
          }
          res(result);
        });

        await Promise.all([postUpdate, commentUpdate, subcommentUpdate]);
      };
      await updateFunc();
      res.json({ success: "delete call succeed!", url: req.url });
    } catch (err) {
      console.log("Profile delete error: " + err);
      res.statusCode = 500;
      res.json({ error: err, url: req.url });
    }
  }
);

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
