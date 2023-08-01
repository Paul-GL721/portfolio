/* ---------------Script to upload Images and Videos--------------------- */

const multer = require('multer');

/*var path = require('path');
const uploadimgfilepath = path.join(__dirname, 'images')*/
const storage = multer.memoryStorage();

/*const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, uploadimgfilepath);
    },
    filename: function(req, file, cb) {
      cb(null, new Date().toISOString() + file.originalname);
    }
  });*/
  
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'video/mp4' || file.mimetype === 'video/mkv' || file.mimetype === 'video/mov') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
  
const uploadimg = multer({
  storage: storage,
  limits: {fileSize: 1024 * 1024 * 5},
  fileFilter: fileFilter
});
  
const uploadvideo = multer({
  storage: storage,
  limits: {fileSize: 1024 * 1024 * 100},
  fileFilter: fileFilter
});

module.exports = {storage, fileFilter, uploadimg, uploadvideo };