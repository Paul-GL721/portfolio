const Project = require("../models/project");
const controllerUtils = require("../utils/controllerUtils");
const projectController = require("../controllers/projectController");

const queryFor = project => ({
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(project)
});

const requestFor = (projectId, userinfo) => ({
  params: { id: projectId },
  originalUrl: `/portfolio/project/${projectId}`,
  protocol: "https",
  get: jest.fn().mockReturnValue("portfolio.example.com"),
  userinfo
});

const response = () => {
  const res = {
    locals: { sessionExpired: false },
    redirect: jest.fn(),
    render: jest.fn(),
    send: jest.fn(),
    set: jest.fn(),
    status: jest.fn()
  };
  res.status.mockReturnValue(res);
  return res;
};

const draftProject = () => ({
  _id: "draft-id",
  status: "draft",
  ptitle: "Offline operations platform",
  psummary: "Connected field operations",
  mediaName: { imageName: "architecture.png", videoName: "demo.mp4" },
  mediaUrl: {},
  projectDates: {},
  operationalProof: {}
});

describe("Project details access and rendering", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(controllerUtils, "getBrandName").mockResolvedValue({ brandName: "Portfolio" });
    jest.spyOn(controllerUtils, "signedurl").mockResolvedValue("https://media.example.com/signed");
  });

  test("redirects anonymous draft visitors to login with a safe next path", async () => {
    jest.spyOn(Project, "findById").mockReturnValue(queryFor(draftProject()));
    const req = requestFor("draft-id");
    const res = response();

    await projectController.project_detail(req, res, jest.fn());

    expect(res.redirect).toHaveBeenCalledWith(
      "/portfolio/login?next=%2Fportfolio%2Fproject%2Fdraft-id"
    );
    expect(res.render).not.toHaveBeenCalled();
  });

  test("rejects non-admin users who request a draft preview", async () => {
    jest.spyOn(Project, "findById").mockReturnValue(queryFor(draftProject()));
    const req = requestFor("draft-id", { role: "member" });
    const res = response();

    await projectController.project_detail(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.render).not.toHaveBeenCalled();
  });

  test("renders the complete noindex case-study preview for an admin", async () => {
    jest.spyOn(Project, "findById").mockReturnValue(queryFor(draftProject()));
    const req = requestFor("draft-id", { role: "admin" });
    const res = response();

    await projectController.project_detail(req, res, jest.fn());

    expect(res.set).toHaveBeenCalledWith("X-Robots-Tag", "noindex, nofollow");
    expect(res.render).toHaveBeenCalledWith("case_study", expect.objectContaining({
      isPreview: true,
      meta_robots: "noindex, nofollow",
      project: expect.objectContaining({ ptitle: "Offline operations platform" })
    }));
  });

  test("redirects a published ID URL to its canonical slug URL", async () => {
    const project = { ...draftProject(), status: "published", slug: "offline-operations-platform" };
    jest.spyOn(Project, "findById").mockReturnValue(queryFor(project));
    const req = requestFor("published-id");
    const res = response();

    await projectController.project_detail(req, res, jest.fn());

    expect(res.redirect).toHaveBeenCalledWith(
      301,
      "/portfolio/projects/offline-operations-platform"
    );
    expect(res.render).not.toHaveBeenCalled();
  });
});
