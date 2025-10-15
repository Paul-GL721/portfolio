// controllers/sitemapController.js
const { SitemapStream, streamToPromise } = require("sitemap");
const { createGzip } = require("zlib");
const Author = require("../models/author");
const Project = require("../models/project");

exports.getSitemap = async (req, res) => {
  try {
    res.header("Content-Type", "application/xml");
    res.header("Content-Encoding", "gzip");

    // Find the owner author (you can refine this query later per logged-in user)
    const author = await Author.findOne({ authorStatus: "owner" }).lean();

    if (!author) {
      return res.status(404).send("No owner found for sitemap generation");
    }

    //Create the sitemap stream using owner's hostname
    const smStream = new SitemapStream({
      hostname: author.hostName || "https://www.defaultdomain.com",
    });
    const pipeline = smStream.pipe(createGzip());

    //Static routes
    smStream.write({ url: "/portfolio", changefreq: "monthly", priority: 1.0 });
    smStream.write({ url: "/portfolio/about", changefreq: "yearly", priority: 0.8 });
    smStream.write({ url: "/portfolio/projects", changefreq: "monthly", priority: 0.9 });
    smStream.write({ url: "/portfolio/skills", changefreq: "yearly", priority: 0.7 });
    smStream.write({ url: "/portfolio/contact", changefreq: "yearly", priority: 0.6 });
    smStream.write({ url: "/portfolio/blog", changefreq: "weekly", priority: 0.5 });

    //Dynamic project pages for this owner
    const projects = await Project.find({ author: author._id }, "_id updatedAt ptitle");
    projects.forEach((proj) => {
        smStream.write({
            url: `/project/${proj._id}`,
            lastmodISO: proj.updatedAt?.toISOString(),
            changefreq: "monthly",
            priority: 0.9,
        });
    });

    //End sitemap stream and send it
    smStream.end();
    streamToPromise(pipeline).then(() => pipeline.pipe(res)).catch(console.error);
    } catch (err) {
        console.error("Sitemap generation error:", err);
        res.status(500).end();
    }
};
