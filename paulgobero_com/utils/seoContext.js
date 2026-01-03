// utils/seoContext.js
const Author = require("../models/author");
const mongoose = require('mongoose');

let cachedOwner = null;
let lastFetched = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes

module.exports = async function seoContext(req, res, next) {
  try {
    // If Mongo is not connected, skip DB access
    if (mongoose.connection.readyState !== 1) {
      return next();
    }

    const now = Date.now();

    // Reuse cached owner if still fresh
    if (!cachedOwner || now - lastFetched > CACHE_DURATION) {
      console.log("Fetching author from DB...");
      cachedOwner = await Author.findOne({ authorStatus: "owner" }).lean();
      lastFetched = now;
    }

    const owner = cachedOwner;

    if (owner) {
      res.locals.meta_author = `${owner.name.first} ${owner.name.middle} ${owner.name.last}`;
      res.locals.meta_keywords = owner.yourKeyword?.join(", ");
      res.locals.meta_description =
        owner.about.short_description || "Portfolio of a full stack developer.";
      res.locals.og_url = owner.hostName;
      res.locals.og_image = owner.imageUrl;
      res.locals.hostname = owner.hostName;
      res.locals.social = {
        github: owner.socialmedia?.github,
        linkedin: owner.socialmedia?.linkedin
      };
      res.locals.full_description = owner.about.full_description;
    }
  } catch (err) {
    console.error("SEO middleware error:", err);
  }
  next();
};
