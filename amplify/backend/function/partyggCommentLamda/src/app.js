/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_PARTYGGCOMMENTTABLE_ARN
	STORAGE_PARTYGGCOMMENTTABLE_NAME
	STORAGE_PARTYGGCOMMENTTABLE_STREAMARN
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
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "partyggCommentTable";
let subcommentTableName = "partyggSubcommentTable";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
  subcommentTableName = subcommentTableName + "-" + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "postId";
const partitionKeyType = "S";
const sortKeyName = "date";
const sortKeyType = "S";
const hasSortKey = sortKeyName !== "";
const path = "/comments";
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
 * HTTP Get method for list objects  -> post의 comment 리스트 반환함*
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
      if (data.Items) {
        const newData = data.Items.map((item) => `${item.postId}/${item.date}`);
        res.json(newData);
      } else {
        res.json(data.Items);
      }
    }
  });
});

/*****************************************
 * HTTP Get method for get single object *
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

//post에서 comment 가져간 후에 추가 comment 가져갈 때 사용
/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path + hashKeyPath + sortKeyPath, function (req, res) {
  const lastEvaluatedKey = {
    postId: req.params[partitionKeyName],
    date: req.params[sortKeyName],
  };

  let params = {
    TableName: tableName,
    KeyConditionExpression: "postId = :p",
    ExpressionAttributeValues: {
      ":p": req.params[partitionKeyName],
    },
    ExclusiveStartKey: {
      ...lastEvaluatedKey,
    },
    ScanIndexForward: false,
    Limit: 6,
  };

  let queryParams = {
    TableName: tableName,
    ...params,
  };

  dynamodb.query(queryParams, async (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    } else {
      if (data.Items) {
        try {
          const newItem = await Promise.all(
            data.Items.map(async (comment) => {
              let params = {
                KeyConditionExpression: "commentId = :c",
                ExpressionAttributeValues: {
                  ":c": `${comment.postId}/${comment.date}`,
                },
              };
              const subcommentParams = {
                TableName: subcommentTableName,
                ...params,
                ScanIndexForward: false,
                Limit: 6,
              };
              const subcommentList = await dynamodb.query(subcommentParams);
              if (subcommentList.Items) {
                return {
                  ...comment,
                  subcomments: subcommentList.Items,
                  subcommentsLastEvaluatedKey: subcommentList.LastEvaluatedKey,
                };
              } else {
                return {
                  ...comment,
                  subcomments: [],
                };
              }
            })
          );
          res.json({
            data: newItem,
            lastEvaluatedKey: data.LastEvaluatedKey,
          });
        } catch (error) {
          res.statusCode = 500;
          res.json({ error: "Could not load Items: " + err });
        }
      } else {
        res.json({ data: data, lastEvaluatedKey: data.LastEvaluatedKey });
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

  const date = moment().format("YYYY-MM-DD HH:mm:ss SSS");

  let putItemParams = {
    TableName: tableName,
    Item: {
      ...req.body,
      date,
    },
  };

  dynamodb.put(putItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({
        success: "put call succeed!",
        url: req.url,
        data: putItemParams.Item,
      });
    }
  });
});

/************************************
 * HTTP post method for insert object *
 *************************************/

app.post(path, function (req, res) {
  if (userIdPresent) {
    req.body["userId"] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  const date = moment().format("YYYY-MM-DD HH:mm:ss SSS");

  let putItemParams = {
    TableName: tableName,
    Item: {
      ...req.body,
      date,
    },
  };

  dynamodb.put(putItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({
        success: "post call succeed!",
        url: req.url,
        data: putItemParams.Item,
      });
    }
  });
});

/************************************
 * HTTP post method for update object *
 *************************************/

app.post(path + "/object" + hashKeyPath + sortKeyPath, function (req, res) {
  const params = {};

  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  } else {
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
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      if (data.Item) {
        if (data.Item.username !== req.body.username) {
          res.statusCode = 500;
          res.json({ error: "update error", url: req.url, body: req.body });
          return;
        }
        let putItemParams = {
          TableName: tableName,
          Item: {
            ...data.Item,
            ...req.body,
          },
        };
        dynamodb.put(putItemParams, (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.json({ error: err, url: req.url, body: req.body });
          } else {
            res.json({
              success: "post update succeed!",
              url: req.url,
              data: putItemParams.Item,
            });
          }
        });
      } else {
        res.statusCode = 500;
        res.json({ error: "update error", url: req.url, body: req.body });
      }
    }
  });
});

/**************************************
 * HTTP remove method to delete object *
 ***************************************/

app.delete(path + "/object" + hashKeyPath + sortKeyPath, function (req, res) {
  const params = {};
  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  } else {
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

  let subcommentsParams = {
    TableName: subcommentTableName,
    KeyConditionExpression: "commentId = :c",
    ExpressionAttributeValues: {
      ":c": req.params[partitionKeyName],
    },
  };

  dynamodb.query(subcommentsParams, async (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url });
    } else {
      try {
        if (data.Items) {
          for (const subcomment of data.Items) {
            let removesubCommentParams = {
              TableName: subcommentTableName,
              KeyConditionExpression: "commentId = :c and date = :d",
              ExpressionAttributeValues: {
                ":c": subcomment.commentId,
                ":d": subcomment.date,
              },
            };
            try {
              await dynamodb.delete(removesubCommentParams).promise();
            } catch (err) {
              res.statusCode = 500;
              res.json({ error: err, url: req.url });
              return;
            }
          }
        }
        await dynamodb.delete(removeItemParams).promise();
        res.json({ url: req.url, data: data });
      } catch (err) {
        res.statusCode = 500;
        res.json({ error: err, url: req.url });
      }
    }
  });
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
