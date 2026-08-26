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
});
