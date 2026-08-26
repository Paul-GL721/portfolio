const nunjucks = require("nunjucks");

describe("Portfolio navigation", () => {
  const env = nunjucks.configure("views", { autoescape: true });

  test("uses canonical portfolio links when a page provides no overrides", () => {
    const html = env.render("portfolio_base.njk", {
      brand1: { brandName: "Portfolio", socialmedia: {} }
    });

    expect(html).toContain('class="navbar-brand" href="/portfolio/"');
    expect(html).toContain('href="/portfolio/#about_section">About</a>');
    expect(html).toContain('href="/portfolio/#services-section">Services</a>');
    expect(html).toContain('href="/portfolio/#project_section">Projects</a>');
    expect(html).toContain('href="/portfolio/#skill_section">Skills</a>');
    expect(html).toContain('href="/portfolio/#contact_section">Contact</a>');
    expect(html).toContain('href="https://blog.paulgobero.com">Blog</a>');
  });

  test("keeps project administration links anchored to the portfolio homepage", () => {
    const html = env.render("project_Admin.njk", {
      Title: "Admin Project",
      abtprojects: [],
      brand1: { brandName: "Portfolio", socialmedia: {} }
    });

    expect(html).toContain('href="/portfolio/#project_section">Projects</a>');
    expect(html).toContain('href="/portfolio/#services-section">Services</a>');
    expect(html).not.toContain('href="#project_section"');
    expect(html).not.toContain('href="/portfolio/project#project_section"');
  });

  test("shows the admin login action to signed-out visitors", () => {
    const html = env.render("portfolio_base.njk", {
      brand1: { brandName: "Portfolio", socialmedia: {} },
      isAuthenticated: false
    });

    expect(html).toContain('id="projectlogin"');
    expect(html).toContain('href="/portfolio/login">Admin login</a>');
    expect(html).not.toContain('href="/portfolio/admin">Admin dashboard</a>');
  });

  test("turns the login action into a dashboard return for signed-in administrators", () => {
    const html = env.render("portfolio_base.njk", {
      brand1: { brandName: "Portfolio", socialmedia: {} },
      isAuthenticated: true
    });

    expect(html).toContain('id="projectlogin"');
    expect(html).toContain('href="/portfolio/admin">Admin dashboard</a>');
    expect(html).toContain('href="/portfolio/logout">Sign out</a>');
    expect(html).not.toContain('href="/portfolio/login">Admin login</a>');
  });
});
