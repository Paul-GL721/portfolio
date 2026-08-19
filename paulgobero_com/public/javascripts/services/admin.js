$(document).ready(function() {
  $(document).on("click", ".service-edit", function() {
    var serviceId = $(this).closest("tr").data("service-id");
    $.get("/portfolio/service/update", { updateid: serviceId }, function(service) {
      $("#servicetitle").val(service.title);
      $("#servicedescription").val(service.description);
      $("#serviceicon").val(service.icon || "icon-layers");
      $("#servicetags").val((service.tags || []).join("\n"));
      $("#servicedisplayorder").val(service.displayOrder || 1);
      $("#servicepublished").prop("checked", !!service.published);
      $("#serviceUpdateid").val(service._id);
      $("#serviceUpdateModal").modal("show");
    });
  });

  $(document).on("click", ".service-delete", function() {
    var row = $(this).closest("tr");
    var serviceId = row.data("service-id");
    if (!window.confirm("Delete this service?")) return;
    $.post("/portfolio/service/delete", { serviceid: serviceId })
      .done(function() { row.remove(); })
      .fail(function() { window.alert("The service could not be deleted."); });
  });
});
