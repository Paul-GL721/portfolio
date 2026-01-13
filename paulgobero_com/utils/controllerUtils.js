
const Author = require("../models/author"); //author model
const crypto = require("crypto"); //generate random names
const async = require("async"); //run async functions

//s3 file upload
const {  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { BUCKET_NAME, BUCKET_REGION, ACCESS_KEY, SECRET_ACCESS_KEY } = require('../configs/config');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

let brandname

//s3 bucket connection parameters
const s3Client = new S3Client({
	region: BUCKET_REGION,
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_ACCESS_KEY
	}
});

//function to delete from s3 bucket
const deletefroms3bucket = async (delparams) => {
	try {
	  const data = await s3Client.send(new DeleteObjectCommand(delparams));
	  console.log("Success. Object deleted.", data);
	  return data; // For unit tests.
	} catch (err) {
	  console.log("Error when deleting images", err);
	}
};

//function to upload to s3
const uploadtos3bucket = async (uploadParams) => {
	try {
		const data = await s3Client.send(new PutObjectCommand(uploadParams));
		console.log("Success. Object uploaded", data);
		return data; // For unit tests.
	} catch (err) {
	  console.log("Error", err);
	}
};

//function to get a signed url
const signedurl = async (bucketName, keyName, expiryTime) => {
	try {
		return await  getSignedUrl(s3Client, new GetObjectCommand({
			Bucket: bucketName,
			Key: keyName
		}), { expiresIn: expiryTime})

	} catch (err) {
		console.log("Signed url Error", err);
	}
}

async function getBrandName() {
	try {
		const brand = await Author.findOne({ authorStatus: 'owner' });
		console.log('brand is');
		//console.log(brand);
		// Do something with the brand
		if (!brand) {
			console.log("No brand");
		} else if(brand.brandName === null || brand.brandName === undefined) {
			console.log("No brand name");
			brandname = brand.name.first + brand.name.last;
		} else {
			console.log("brand name available");
			//brandname = brand.brandName;
			//brand = brand;
		}
		return brand;
	} catch (err) {
		console.log("There was an error in retrieving the brand name");
		console.log(err);
	}
}

module.exports = { s3Client, deletefroms3bucket, uploadtos3bucket, getBrandName, signedurl }