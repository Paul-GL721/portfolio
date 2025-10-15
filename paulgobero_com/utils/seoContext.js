// utils/seoContext.js
const Author = require("../models/author");

module.exports = async function seoContext(req, res, next) {
  try {
    // Assuming one owner per SaaS tenant
    const owner = await Author.findOne({ authorStatus: "owner" }).lean();

    if (owner) {
      res.locals.meta_author = `${owner.name.first} ${owner.name.last}`;
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
