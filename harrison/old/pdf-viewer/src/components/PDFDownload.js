download.addEventListener("click", function() {
    var pdf = new jsPDF();
    var canvases = document.getElementsByClassName('pdf-page-canvas')
    var imgData;
  
    console.log(canvases)
    var pdfLength = canvases.length;
    for (var i = 0; i < pdfLength; i++) {
      canvas = canvases[i];
      imgData = canvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0);
    };
  
    pdf.save("download.pdf");
  }, false);
  