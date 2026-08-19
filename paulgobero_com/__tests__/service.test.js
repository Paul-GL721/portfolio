const nunjucks = require("nunjucks");
const Service = require("../models/service");

describe("Reusable portfolio services", () => {
  test("validates service content and presentation settings", () => {
    const service = new Service({
      title: "Geospatial systems",
      description: "Build spatial data platforms that support operational decisions.",
      icon: "icon-location-pin",
      tags: ["GIS platforms", "Spatial analysis"],
      displayOrder: 3,
      published: true
    });

    expect(service.validateSync()).toBeUndefined();
    expect(service.tags).toEqual(["GIS platforms", "Spatial analysis"]);
  });

  test("rejects invalid display order and icon classes", () => {
    const service = new Service({
      title: "Cloud delivery",
      description: "Deploy maintainable systems using cloud infrastructure.",
      icon: "invalid icon",
      displayOrder: 0
    });

    const error = service.validateSync();
    expect(error.errors.displayOrder).toBeDefined();
    expect(error.errors.icon).toBeDefined();
  });

  test("renders database services instead of legacy fallback content", () => {
    const env = nunjucks.configure("views", { autoescape: true });
    const html = env.render("portfolio_index.njk", {
      index_data: {
        author: { about: {}, imageUrl: "" },
        services: [{
          title: "Geospatial systems and location intelligence",
          description: "Turn spatial data into operational insight.",
          icon: "icon-location-pin",
          tags: ["GIS", "Spatial analysis"]
        }],
        author_projects: [],
        author_all_projects: []
      },
      brand1: { brandName: "Portfolio", socialmedia: {} },
      current_year: 2026
    });

    expect(html).toContain("Geospatial systems and location intelligence");
    expect(html).toContain("Spatial analysis");
    expect(html).not.toContain("Custom Software &amp; Integration");
  });
});
