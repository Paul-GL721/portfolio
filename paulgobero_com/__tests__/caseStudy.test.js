const mongoose = require("mongoose");
const nunjucks = require("nunjucks");
const Project = require("../models/project");
const projectAccess = require("../utils/projectAccess");

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

    const published = new Project({ ...sharedFields, slug: "operations-platform", status: "published" });
    const draftWithSlug = new Project({ ...sharedFields, slug: "draft-platform", status: "draft" });
    const legacy = new Project(sharedFields);

    expect(published.url).toBe("/portfolio/projects/operations-platform");
    expect(draftWithSlug.url).toBe(`/portfolio/project/${draftWithSlug._id}`);
    expect(legacy.url).toBe(`/portfolio/project/${legacy._id}`);
  });

  test("restricts unpublished project previews to administrators", () => {
    const published = { _id: "published-id", slug: "published-project", status: "published" };
    const draft = { _id: "draft-id", slug: "draft-project", status: "draft" };

    expect(projectAccess.canViewProject(published)).toBe(true);
    expect(projectAccess.canViewProject(draft)).toBe(false);
    expect(projectAccess.canViewProject(draft, { role: "member" })).toBe(false);
    expect(projectAccess.canViewProject(draft, { role: "admin" })).toBe(true);
    expect(projectAccess.canonicalProjectPath(published)).toBe("/portfolio/projects/published-project");
    expect(projectAccess.canonicalProjectPath(draft)).toBe("/portfolio/project/draft-id");
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

  test("renders a complete noindex preview without confidential links", () => {
    const env = nunjucks.configure("views", { autoescape: true });
    const project = {
      _id: "draft-id",
      ptitle: "Offline operations platform",
      subtitle: "A complete draft case study",
      psummary: "Connected field and headquarters workflows",
      industry: "Field operations",
      projectType: "Mobile and web platform",
      status: "draft",
      context: "Teams worked with intermittent connectivity.",
      problemStatement: "Reports arrived too late.",
      constraints: ["Unreliable connectivity"],
      architectureSummary: "Offline queue to REST API to PostgreSQL.",
      solution: "Built a synchronized operations platform.",
      decisions: [],
      role: "Designed the architecture\nBuilt the synchronization API",
      metrics: [],
      results: ["Reports became available in minutes"],
      lessonsLearned: ["Make retry state visible"],
      testimonial: {},
      operationalProof: {
        availability: "Offline capture with reconnect synchronization",
        deploymentScale: "Distributed mobile clients"
      },
      projectDates: {},
      mediaUrl: { imageUrl: "https://example.com/architecture.png" },
      skill: [],
      specialisation: [],
      confidential: true,
      githubUrl: "https://example.com/private-code",
      livelinkUrl: "https://example.com/private-demo"
    };

    const html = env.render("case_study.njk", {
      Title: "Offline operations platform | Draft Preview",
      project,
      relatedProjects: [],
      brand1: { brandName: "Portfolio", socialmedia: {} },
      current_year: 2026,
      isPreview: true,
      meta_robots: "noindex, nofollow",
      structured_data_json: '{"@context":"https://schema.org","@type":"CreativeWork"}'
    });

    expect(html).toContain("Draft preview");
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
    expect(html).toContain('"@type":"CreativeWork"');
    expect(html).toContain("System design");
    expect(html).toContain("Reports became available in minutes");
    expect(html).toContain("Code and demo links are confidential.");
    expect(html).not.toContain("https://example.com/private-code");
    expect(html).not.toContain("https://example.com/private-demo");
  });

  test("opens a structured case-study modal from the homepage project card", () => {
    const env = nunjucks.configure("views", { autoescape: true });
    const project = {
      _id: "project-id",
      url: "/portfolio/projects/offline-operations-platform",
      slug: "offline-operations-platform",
      status: "published",
      ptitle: "Offline operations platform",
      subtitle: "Reliable field work without continuous connectivity",
      psummary: "Connected field and headquarters workflows",
      industry: "Field operations",
      projectType: "Mobile and web platform",
      context: "Teams worked with intermittent connectivity.",
      problemStatement: "Reports arrived too late.",
      constraints: ["Unreliable connectivity"],
      architectureSummary: "Offline queue to REST API to PostgreSQL.",
      solution: "Built a synchronized operations platform.",
      decisions: [{
        title: "Offline queue",
        context: "Connections were intermittent",
        choice: "Persist and retry transactions",
        tradeoff: "Eventual consistency"
      }],
      role: "Designed the architecture\nBuilt the synchronization API",
      metrics: [{ value: "90%", label: "Less reconciliation time" }],
      results: ["Reports became available in minutes"],
      lessonsLearned: ["Make retry state visible"],
      testimonial: {},
      operationalProof: { deploymentScale: "Distributed mobile clients" },
      mediaUrl: {
        imageUrl: "https://example.com/architecture.png",
        videoUrl: "https://example.com/demo.mp4"
      },
      skill: [{ name: "Django" }, { name: "PostgreSQL" }],
      specialisation: [{ name: "Systems integration" }],
      confidential: false
    };

    const html = env.render("portfolio_index.njk", {
      Title: "Portfolio",
      navbarurl: {},
      brand1: { brandName: "Portfolio", socialmedia: {} },
      current_year: 2026,
      index_data: {
        author: {
          name: { first: "Portfolio", middle: "", last: "Owner" },
          about: { short_description: "Builder", full_description: "Builds useful systems." },
          socialmedia: {}
        },
        author_projects: [project],
        author_all_projects: [project],
        services: []
      }
    });

    expect(html).toContain('href="#projectmodal-project-id"');
    expect(html).toContain('data-target="#projectmodal-project-id"');
    expect(html).toContain('class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl"');
    expect(html).toContain("Operational context");
    expect(html).toContain("System design");
    expect(html).toContain("Decisions and trade-offs");
    expect(html).toContain("Operational impact");
    expect(html).toContain("Lessons learned");
    expect(html).toContain('href="/portfolio/projects/offline-operations-platform" class="btn btn-primary">Open full case study</a>');
  });
});
