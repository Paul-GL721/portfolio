$(document).ready(function() {
    $('.project-modal-link').on('click', function() {
      var projectId = $(this).data('project-id');
      $('#projectmodal-' + projectId).modal()
    });
});