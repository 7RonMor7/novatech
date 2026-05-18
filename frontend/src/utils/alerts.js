import Swal from "sweetalert2";

export const confirmDelete = async (nombre) => {
  const result = await Swal.fire({
    title: "¿Eliminar registro?",
    html: `<span style="color:#94a3b8;font-size:0.9rem;">Se eliminará permanentemente:</span><br/>
           <strong style="color:#f1f5f9;font-size:1rem;">"${nombre}"</strong>`,
    icon: false,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    background: "#0f172a",
    color: "#f1f5f9",
    customClass: {
      popup:         "swal-minimal-popup",
      title:         "swal-minimal-title",
      htmlContainer: "swal-minimal-html",
      confirmButton: "swal-minimal-confirm",
      cancelButton:  "swal-minimal-cancel",
      actions:       "swal-minimal-actions",
    },
    showClass: {
      popup: "swal-fade-in",
    },
    hideClass: {
      popup: "swal-fade-out",
    },
  });

  return result.isConfirmed;
};