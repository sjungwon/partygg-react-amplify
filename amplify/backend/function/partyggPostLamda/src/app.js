/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_PARTYGGDISLIKETABLE_ARN
	STORAGE_PARTYGGDISLIKETABLE_NAME
	STORAGE_PARTYGGDISLIKETABLE_STREAMARN
	STORAGE_PARTYGGGAMETABLE_ARN
	STORAGE_PARTYGGGAMETABLE_NAME
	STORAGE_PARTYGGGAMETABLE_STREAMARN
	STORAGE_PARTYGGLIKETABLE_ARN
	STORAGE_PARTYGGLIKETABLE_NAME
	STORAGE_PARTYGGLIKETABLE_STREAMARN
	STORAGE_PARTYGGPOSTTABLE_ARN
	STORAGE_PARTYGGPOSTTABLE_NAME
	STORAGE_PARTYGGPOSTTABLE_STREAMARN
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

let tableName = "partyggPostTable";
let likeTableName = "partyggLikeTable";
let dislikeTableName = "partyggDislikeTable";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
  likeTableName = likeTableName + "-" + process.env.ENV;
  dislikeTableName = dislikeTableName + "-" + process.env.ENV;
}
const gameIndexName = "game-date-index";

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "username";
const partitionKeyType = "S";
const sortKeyName = "date";
const sortKeyType = "S";
const hasSortKey = sortKeyName !== "";
const path = "/posts";
const UNAUTH = "UNAUTH";
const hashKeyPath = "/:" + partitionKeyName;
const sortKeyPath = hasSortKey ? "/:" + sortKeyName : "";
const gameKeyName = "game";
const gameKeyType = "S";
const gameKeyPath = "/:" + gameKeyName;

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

const getLikeDataFromDb = (params) => {
  return dynamodb.query(params).promise();
};

// add likes, dislike data to Post
const addLikeData = (postList) => {
  return Promise.all(
    postList.map(async (post) => {
      let params = {
        KeyConditionExpression: "postId = :p",
        ExpressionAttributeValues: {
          ":p": `${post.username}-${post.date}`,
        },
      };
      const likeParam = {
        TableName: likeTableName,
        ScanIndexForward: false,
        ...params,
      };
      let likes = [];
      const likeDb = await getLikeDataFromDb(likeParam);
      if (likeDb.Items) {
        likes = likeDb.Items.map((item) => item.username);
      } else {
        likes = likeDb;
      }

      const dislikeParam = {
        TableName: dislikeTableName,
        ScanIndexForward: false,
        ...params,
      };
      let dislikes = [];
      const dislikeDb = await getLikeDataFromDb(dislikeParam);
      if (dislikeDb.Items) {
        dislikes = dislikeDb.Items.map((item) => item.username);
      } else {
        dislikes = dislikeDb;
      }

      return {
        ...post,
        likes,
        dislikes,
      };
    })
  );
};

const removeLikeDataFromDb = (params) => {
  return dynamodb.delete(params).promise();
};

//like list를 받아서 promiseall
//post를 받아서 map
const removeLikeData = (likeList, tableNameParam) => {
  return Promise.all(
    likeList.map(async (like) => {
      let params = {
        TableName: tableNameParam,
        Key: {
          postId: like.postId,
          username: like.username,
        },
      };
      console.log(like, params);
      const likeDb = await removeLikeDataFromDb(params);

      return likeDb;
    })
  );
};

/********************************
 * HTTP Get method for first page of game objects *
 ********************************/
app.get(path + "/game" + gameKeyPath, function (req, res) {
  console.log("req for first page of game post");
  const condition = {};
  condition[gameKeyName] = {
    ComparisonOperator: "EQ",
  };

  if (userIdPresent && req.apiGateway) {
    condition[gameKeyName]["AttributeValueList"] = [
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH,
    ];
  } else {
    try {
      condition[gameKeyName]["AttributeValueList"] = [
        convertUrlType(req.params[gameKeyName], gameKeyType),
      ];
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }

  let queryParams = {
    TableName: tableName,
    IndexName: gameIndexName,
    KeyConditionExpression: "game = :g",
    ExpressionAttributeValues: {
      ":g": req.params[gameKeyName],
    },
    ScanIndexForward: false,
    Limit: 6,
  };

  console.log(queryParams);

  dynamodb.query(queryParams, async (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    } else {
      if (data.Items) {
        try {
          const newItem = await addLikeData(data.Items);
          res.json({ data: newItem, LastEvaluatedKey: data.LastEvaluatedKey });
        } catch (error) {
          res.statusCode = 500;
          res.json({ error: "Could not load Items: " + err });
        }
      } else {
        res.json({ data: data, LastEvaluatedKey: data.LastEvaluatedKey });
      }
    }
  });
});

/********************************
 * HTTP Get method for next page of game objects *
 ********************************/
//수정해야함 -> lastEvaluated  key 값 확인 후 수정
app.get(
  path + "/game" + gameKeyPath + hashKeyPath + sortKeyPath,
  function (req, res) {
    console.log("req for next page of game post");

    const lastEvaluatedKey = {
      date: req.params[sortKeyName],
      game: req.params[gameKeyName],
      username: req.params[partitionKeyName],
    };

    let queryParams = {
      TableName: tableName,
      IndexName: gameIndexName,
      KeyConditionExpression: "game = :g",
      ExpressionAttributeValues: {
        ":g": req.params[gameKeyName],
      },
      ScanIndexForward: false,
      ExclusiveStartKey: {
        ...lastEvaluatedKey,
      },
      Limit: 6,
    };

    dynamodb.query(queryParams, async (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.json({ error: "Could not load items: " + err });
      } else {
        if (data.Items) {
          try {
            const newItem = await addLikeData(data.Items);
            res.json({
              data: newItem,
              LastEvaluatedKey: data.LastEvaluatedKey,
            });
          } catch (error) {
            res.statusCode = 500;
            res.json({ error: "Could not load Items: " + err });
          }
        } else {
          res.json({ data: data, LastEvaluatedKey: data.LastEvaluatedKey });
        }
      }
    });
  }
);

/********************************
 * HTTP Get method for first page of user object filter by game*
 ********************************/
app.get(
  path + "/user" + hashKeyPath + "/game" + gameKeyPath,
  function (req, res) {
    console.log("req for first page of game post filter by user");
    if (!req.params[partitionKeyName] && !req.params[gameKeyName]) {
      res.statusCode = 500;
      res.json({ error: "params missing", url: req.url });
      return;
    }

    let params = {
      TableName: tableName,
      IndexName: gameIndexName,
      KeyConditionExpression: "game = :g and username = :u",
      ExpressionAttributeValues: {
        ":g": req.params[gameKeyName],
        ":u": req.params[hashKeyPath],
      },
      ScanIndexForward: false,
      Limit: 6,
    };

    dynamodb.query(params, async (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.json({ error: "Could not load items: " + err });
      } else {
        console.log(data);
        if (data.Items) {
          try {
            const newItem = await addLikeData(data.Items);
            res.json({
              data: newItem,
              lastEvaluatedKey: data.LastEvaluatedKey,
            });
          } catch (error) {
            res.statusCode = 500;
            res.json({ error: "Could not load Items: " + err });
          }
        } else {
          res.json({ data: data, LastEvaluatedKey: data.LastEvaluatedKey });
        }
      }
    });
  }
);

/********************************
 * HTTP Get method for next page of user object filter by game*
 ********************************/
//lastEvaluted key 값 보고 수정해야함
app.get(
  path + "/user" + hashKeyPath + "/game" + gameKeyPath + sortKeyName,
  function (req, res) {
    console.log("req for next page of user post filter by game");
    if (
      !req.params[sortKeyName] &&
      !req.params[partitionKeyName] &&
      !req.params[gameKeyName]
    ) {
      res.statusCode = 500;
      res.json({ error: "params missing", url: req.url });
      return;
    }

    const lastEvaluatedKey = {
      username: req.params[partitionKeyName],
      date: req.params[sortKeyName],
      game: req.params[gameKeyName],
    };

    let params = {
      TableName: tableName,
      IndexName: gameIndexName,
      KeyConditionExpression: "game = :g and username = :u",
      ExpressionAttributeValues: {
        ":g": req.params[gameKeyName],
        ":u": req.params[partitionKeyName],
      },
      ScanIndexForward: false,
      ExclusiveStartKey: {
        ...lastEvaluatedKey,
      },
      Limit: 6,
    };

    dynamodb.query(params, async (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.json({ error: "Could not load items: " + err });
      } else {
        console.log(data);
        if (data.Items) {
          try {
            const newItem = await addLikeData(data.Items);
            res.json({
              data: newItem,
              lastEvaluatedKey: data.LastEvaluatedKey,
            });
          } catch (error) {
            res.statusCode = 500;
            res.json({ error: "Could not load Items: " + err });
          }
        } else {
          res.json({ data: data, LastEvaluatedKey: data.LastEvaluatedKey });
        }
      }
    });
  }
);

/********************************
 * HTTP Get method for first page of user object*
 ********************************/
app.get(path + "/user" + hashKeyPath, function (req, res) {
  console.log("req for first page of user post");
  if (!req.params[partitionKeyName]) {
    res.statusCode = 500;
    res.json({ error: "params missing", url: req.url });
    return;
  }

  let params = {
    TableName: tableName,
    KeyConditionExpression: "username = :u",
    ExpressionAttributeValues: {
      ":u": req.params[partitionKeyName],
    },
    ScanIndexForward: false,
    Limit: 6,
  };

  dynamodb.query(params, async (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    } else {
      console.log(data);
      if (data.Items) {
        try {
          const newItem = await addLikeData(data.Items);
          res.json({
            data: newItem,
            lastEvaluatedKey: data.LastEvaluatedKey,
          });
        } catch (error) {
          res.statusCode = 500;
          res.json({ error: "Could not load Items: " + err });
        }
      } else {
        res.json({ data: data, LastEvaluatedKey: data.LastEvaluatedKey });
      }
    }
  });
});

/********************************
 * HTTP Get method for next page of user object*
 ********************************/
app.get(path + "/user" + hashKeyPath + sortKeyPath, function (req, res) {
  console.log("req for next page of user post");

  if (!req.params[partitionKeyName] && !req.params[sortKeyName]) {
    res.statusCode = 500;
    res.json({ error: "params missing", url: req.url });
    return;
  }

  const lastEvaluatedKey = {
    username: req.params[partitionKeyName],
    date: req.params[sortKeyName],
  };

  let params = {
    TableName: tableName,
    KeyConditionExpression: "username = :u",
    ExpressionAttributeValues: {
      ":u": req.params[partitionKeyName],
    },
    ScanIndexForward: false,
    ExclusiveStartKey: {
      ...lastEvaluatedKey,
    },
    Limit: 6,
  };

  dynamodb.query(params, async (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    } else {
      console.log(data);
      if (data.Items) {
        try {
          const newItem = await addLikeData(data.Items);
          res.json({
            data: newItem,
            lastEvaluatedKey: data.LastEvaluatedKey,
          });
        } catch (error) {
          res.statusCode = 500;
          res.json({ error: "Could not load Items: " + err });
        }
      } else {
        res.json({ data: data, LastEvaluatedKey: data.LastEvaluatedKey });
      }
    }
  });
});

/********************************
 * HTTP Get method for first object page*
 ********************************/
app.get(path, function (req, res) {
  console.log("req for first page of all post");

  let params = {
    TableName: tableName,
    ScanIndexForward: false,
    Limit: 6,
  };

  dynamodb.scan(params, async (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    } else {
      console.log(data);
      if (data.Items) {
        console.log("try to get like data");
        try {
          const newItem = await addLikeData(data.Items);
          res.json({ data: newItem, lastEvaluatedKey: data.LastEvaluatedKey });
        } catch (err) {
          res.statusCode = 500;
          res.json({ error: "Could not load Items: " + err });
        }
      } else {
        res.json({ data: data, LastEvaluatedKey: data.LastEvaluatedKey });
      }
    }
  });
});

/********************************
 * HTTP Get method for next object page *
 ********************************/
app.get(path + hashKeyPath + sortKeyPath, function (req, res) {
  console.log("req for next page of all post");
  if (!req.params[partitionKeyName] && !req.params[sortKeyName]) {
    res.statusCode = 500;
    res.json({ error: "params missing", url: req.url });
    return;
  }

  const lastEvaluatedKey = {
    username: req.params[partitionKeyName],
    date: req.params[sortKeyName],
  };

  let params = {
    TableName: tableName,
    ScanIndexForward: false,
    ExclusiveStartKey: {
      ...lastEvaluatedKey,
    },
    Limit: 6,
  };

  dynamodb.scan(params, async (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    } else {
      console.log(data);
      if (data.Items) {
        try {
          const newItem = await addLikeData(data.Items);
          res.json({
            data: newItem,
            lastEvaluatedKey: data.LastEvaluatedKey,
          });
        } catch (error) {
          res.statusCode = 500;
          res.json({ error: "Could not load Items: " + err });
        }
      } else {
        res.json({ data: data, LastEvaluatedKey: data.LastEvaluatedKey });
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

  dynamodb.get(getItemParams, async (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err.message });
    } else {
      if (data.Item) {
        try {
          const newItem = await addLikeData([data.Item]);
          res.json({
            ...newItem,
          });
        } catch (error) {
          res.statusCode = 500;
          res.json({ error: "Could not load Items: " + err });
        }
        res.json(data.Item);
      } else {
        res.json(data);
      }
    }
  });
});

/************************************
 * HTTP post method for insert object *
 *************************************/

app.post(path, function (req, res) {
  if (!req.body["username"]) {
    res.statusCode = 403;
    res.json({ error: "Unauthorized insert" });
    return;
  }

  if (userIdPresent) {
    req.body["userId"] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  const date = moment().format("YYYY-MM-DD hh:mm:ss a SSS");

  let putItemParams = {
    TableName: tableName,
    Item: {
      ...req.body,
      date: date,
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
        console.log(data.Item);
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

  dynamodb.get(removeItemParams, async (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url });
    } else {
      console.log(data);
      console.log(req.params[partitionKeyName]);
      if (data.Item) {
        //likes 제거
        //dislikes 제거
        let params = {
          KeyConditionExpression: "postId = :p",
          ExpressionAttributeValues: {
            ":p": `${data.Item.username}-${data.Item.date}`,
          },
        };
        try {
          const likeParam = {
            TableName: likeTableName,
            ...params,
          };
          const likeList = await dynamodb.query(likeParam).promise();
          if (likeList.Items) {
            try {
              await removeLikeData(likeList.Items, likeTableName);
            } catch (err) {
              res.statusCode = 500;
              res.json({
                title: "remove like failed",
                error: err,
                url: req.url,
              });
            }
          }
          const dislikeParam = {
            TableName: dislikeTableName,
            ...params,
          };
          const dislikeList = await dynamodb.query(dislikeParam).promise();
          if (dislikeList.Items) {
            try {
              await removeLikeData(dislikeList.Items, dislikeTableName);
            } catch (err) {
              res.statusCode = 500;
              res.json({
                title: "remove dislike failed",
                error: err,
                url: req.url,
              });
            }
          }
        } catch (err) {
          res.statusCode = 500;
          res.json({
            title: "like or dislike query fail",
            error: err,
            url: req.url,
          });
        }
        //comment & subcomment 제거
        //post 제거
        dynamodb.delete(removeItemParams, (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.json({ error: err, url: req.url });
          } else {
            res.json({ url: req.url, data: data });
          }
        });
      } else {
        res.json({ url: req.url, data: data });
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
