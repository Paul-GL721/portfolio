function isPublished(project) {
    return project?.status === 'published';
}

function isAdmin(userinfo) {
    return userinfo?.role === 'admin';
}

function canViewProject(project, userinfo) {
    return isPublished(project) || isAdmin(userinfo);
}

function canonicalProjectPath(project) {
    if (isPublished(project) && project?.slug) {
        return `/portfolio/projects/${project.slug}`;
    }

    return `/portfolio/project/${project._id}`;
}

module.exports = {
    isPublished,
    isAdmin,
    canViewProject,
    canonicalProjectPath
};
