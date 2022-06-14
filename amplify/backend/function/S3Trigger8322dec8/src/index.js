/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_PARTYGGCONTENTSTORAGE_BUCKETNAME
Amplify Params - DO NOT EDIT */ // dependencies
const AWS = require("aws-sdk");
const Sharp = require("sharp");

// get reference to S3 client
const S3 = new AWS.S3();

function checkProfileImage(key) {
  return key.includes("profiles");
}

const transforms = {
  default: {
    width: 600,
    height: 350,
  },
  profile: {
    width: 50,
    height: 50,
  },
};

function makeProfile(photo) {
  return Sharp(photo)
    .resize(transforms.profile.width, transforms.profile.height)
    .toBuffer();
}

function makeResizedImage(photo) {
  return Sharp(photo)
    .resize(transforms.default.width, transforms.default.height)
    .toBuffer();
}

function resizeKey(key) {
  return `public/resized/${key}`;
}

async function resize(bucketName, key) {
  console.log(key);
  if (!key.includes("fullsize")) return;

  const originalPhotoName = key.replace("public/fullsize/", "");

  const typeMatch = originalPhotoName.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log("Could not determine the image type.");
    return;
  }
  const imageType = typeMatch[1].toLowerCase();
  if (imageType != "jpg" && imageType != "png" && imageType != "jpeg") {
    console.log(`Unsupported image type: ${imageType}`);
    return;
  }

  const originalPhoto = (
    await S3.getObject({ Bucket: bucketName, Key: key }).promise()
  ).Body;

  let resizedImage = null;

  if (checkProfileImage(key)) {
    resizedImage = await makeProfile(originalPhoto);
  } else {
    resizedImage = await makeResizedImage(originalPhoto);
  }

  if (!resizedImage) {
    return new Error(`photo resize error`);
  }

  await S3.putObject({
    Body: resizedImage,
    Bucket: bucketName,
    Key: resizeKey(originalPhotoName),
  }).promise();
}

exports.handler = async function (event) {
  console.log("Received S3 event:", JSON.stringify(event, null, 2));
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const decodeKey = decodeURIComponent(key);
  console.log(`Bucket: ${bucket}`, `Key: ${decodeKey}`);
  try {
    await resize(bucket, decodeKey);
    console.log("image process complete");
  } catch (error) {
    console.log("image process fail", error);
  }
};
