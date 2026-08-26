const nunjucks = require("nunjucks");
const Author = require("../models/author");

describe("Reusable author positioning", () => {
  const env = nunjucks.configure("views", { autoescape: true });

  test("stores optional hero positioning within the author profile", () => {
    const eyebrow = Author.schema.path("about.eyebrow");
    const snapshot = Author.schema.path("about.snapshot");

    expect(eyebrow).toBeDefined();
    expect(snapshot).toBeDefined();
    expect(eyebrow.options.maxLength).toBe(80);
    expect(snapshot.options.maxLength).toBe(160);
    expect(eyebrow.options.required).toBeUndefined();
    expect(snapshot.options.required).toBeUndefined();
  });

  test("provides admin fields for both hero positioning values", () => {
    const html = env.render("reuse_author.njk", {
      posturl: { formid: "author-form", submiturl: "/portfolio/author/update" }
    });

    expect(html).toContain('name="authorheroeyebrow"');
    expect(html).toContain('maxlength="80"');
    expect(html).toContain('name="authorherosnapshot"');
    expect(html).toContain('maxlength="160"');
  });

  test("renders the author-specific eyebrow and snapshot on the portfolio hero", () => {
    const html = env.render("portfolio_index.njk", {
      Title: "Portfolio",
      brand1: { brandName: "Paul Gobero Lwanga", socialmedia: {} },
      index_data: {
        author: {
          about: {
            short_description: "Solutions Engineer | Software, Cloud and Geospatial Systems",
            full_description: "I build useful operational systems.",
            eyebrow: "Solutions engineering · cloud · geospatial",
            snapshot: "From operational discovery to reliable production systems"
          },
          imageUrl: "/profile.jpg"
        },
        author_projects: [],
        author_all_projects: [],
        services: [],
        service_section: {}
      }
    });

    expect(html).toContain("Solutions engineering · cloud · geospatial");
    expect(html).toContain("Solutions Engineer | Software, Cloud and Geospatial Systems");
    expect(html).not.toContain("Software, Cloud And Geospatial Systems");
    expect(html).toContain("From operational discovery to reliable production systems");
    expect(html).not.toContain("Full-stack engineering and DevOps");
    expect(html).not.toContain("From idea to stable release");
  });
});
