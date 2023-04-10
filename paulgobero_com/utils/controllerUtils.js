
const Author = require("../models/author"); //author model
const crypto = require("crypto"); //generate random names

//s3 file upload
const {  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { BUCKET_NAME, BUCKET_REGION, ACCESS_KEY, SECRET_ACCESS_KEY } = require('../configs/config');

//s3 bucket connection parameters
const s3Client = new S3Client({
	region: BUCKET_REGION,
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_ACCESS_KEY
	}
});

//generate random videofile name
const generaterandomvidname = () => {
	const randomvideofilename = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
	const projfilename = randomvideofilename();
	return projfilename
}

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

let brandname
function getBrandName(){
	//find the brand name for the owner
	Author.findOne({ authorStatus: 'owner' }, function await(err, brand) {
		if (err){
			console.log("There was an error in retrieving the brand name");
			console.log(err);
		} else if (!brand) {
			console.log("No brand");
		} else if(brand.brandName === null || brand.brandName === undefined) {
			console.log("No brand name");
			brandname = brand.name.first + brand.name.last;
		} else {
			console.log("brand name available");
			brandname = brand.brandName;
		}
	});
	return brandname;
}

module.exports = { s3Client, generaterandomvidname, deletefroms3bucket, uploadtos3bucket, getBrandName }