const mongoose = require("mongoose");
const nunjucks = require("nunjucks");
const Project = require("../models/project");

describe("Reusable project case studies", () => {
  test("uses a slug URL for enriched projects and preserves legacy ID URLs", () => {
    const sharedFields = {
      ptitle: "Operations platform",
      psummary: "A reusable case study",
      problemStatement: "Manual workflows",
      solution: "A connected platform",
      role: "Designed and delivered the system",
      skill: [new mongoose.Types.ObjectId()],
      specialisation: [new mongoose.Types.ObjectId()],
      mediaName: { imageName: "image", videoName: "video" }
    };

    const published = new Project({ ...sharedFields, slug: "operations-platform" });
    const legacy = new Project(sharedFields);

    expect(published.url).toBe("/portfolio/projects/operations-platform");
    expect(legacy.url).toBe(`/portfolio/project/${legacy._id}`);
  });

  test("validates structured metrics and decisions", () => {
    const project = new Project({
      ptitle: "Operations platform",
      psummary: "A reusable case study",
      problemStatement: "Manual workflows",
      solution: "A connected platform",
      role: "Designed and delivered the system",
      slug: "operations-platform",
      status: "published",
      featuredRank: 1,
      metrics: [{ value: "70%", label: "Reduction in arrears" }],
      decisions: [{ title: "Offline support", choice: "Local queue with retry" }],
      skill: [new mongoose.Types.ObjectId()],
      specialisation: [new mongoose.Types.ObjectId()],
      mediaName: { imageName: "image", videoName: "video" }
    });

    expect(project.validateSync()).toBeUndefined();
  });

  test("renders proof and engineering decisions on the public template", () => {
    const env = nunjucks.configure("views", { autoescape: true });
    const project = {
      ptitle: "Operations platform",
      slug: "operations-platform",
      subtitle: "A verified operational result",
      psummary: "A reusable case study",
      industry: "Operations",
      projectType: "Web platform",
      context: "Operational context",
      problemStatement: "Manual workflows",
      solution: "A connected platform",
      role: "Designed the system\nDeployed the system",
      metrics: [{ value: "70%", label: "Reduction in arrears" }],
      decisions: [{
        title: "Offline support",
        context: "Unreliable connectivity",
        choice: "Local queue with retry",
        tradeoff: "Eventual consistency"
      }],
      constraints: [],
      results: [],
      lessonsLearned: [],
      testimonial: {},
      operationalProof: {},
      projectDates: {},
      mediaName: {},
      mediaUrl: {},
      skill: [],
      confidential: false,
      url: "/portfolio/projects/operations-platform"
    };

    const html = env.render("case_study.njk", {
      Title: "Operations platform | Case Study",
      project,
      relatedProjects: [],
      brand1: { brandName: "Portfolio", socialmedia: {} },
      current_year: 2026
    });

    expect(html).toContain("70%");
    expect(html).toContain("Decisions and trade-offs");
    expect(html).toContain("Local queue with retry");
  });
});
