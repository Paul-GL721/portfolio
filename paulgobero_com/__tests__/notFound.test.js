const request = require("supertest");
const app = require("../app");

describe("404 page", () => {
  test("renders a branded recovery page for an unknown route", async () => {
    const response = await request(app).get("/route-that-does-not-exist");

    expect(response.status).toBe(404);
    expect(response.type).toMatch(/html/);
    expect(response.text).toContain("This page is outside the current route.");
    expect(response.text).toContain("/route-that-does-not-exist");
    expect(response.text).toContain('href="/portfolio/">Return home</a>');
    expect(response.text).toContain('href="/portfolio/#project_section">View projects</a>');
    expect(response.text).toContain('<meta name="robots" content="noindex, nofollow">');
    expect(response.text).not.toContain("Error: Not Found");
  });

  test("escapes the requested path before rendering it", async () => {
    const response = await request(app).get("/%3Cscript%3Ealert(1)%3C%2Fscript%3E");

    expect(response.status).toBe(404);
    expect(response.text).not.toContain("<script>alert(1)</script>");
  });
});
