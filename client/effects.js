Effects = (function() {
  function pixelate(id) {
    var canvas = document.getElementById('canvas-' + id);
    paper.setup(canvas);

    var raster = new paper.Raster('img-' + id);
    raster.visible = false;
    var gridSize = 6;
    var gridDim = 9;
    var colors = [];

    raster.size = new paper.Size(gridDim, gridDim);

    for (var y = 0; y < raster.height; y++) {
      for(var x = 0; x < raster.width; x++) {
        var color = raster.getPixel(x, y);
        colors.push([
          Math.round(256 * color.red),
          Math.round(256 * color.green),
          Math.round(256 * color.blue)
        ]);
        var rec = new paper.Path.Rectangle({
          point: [x * gridSize, y * gridSize],
          size: [gridSize, gridSize],
          strokeColor: color,
          fillColor: color
        });
      }
    }

    paper.view.draw();
    return;

    var quant = MMCQ.quantize(colors, 2);
    var palette = quant.palette();

    var pc1 = new paper.Color(palette[0][0] / 256, palette[0][1] / 256, palette[0][2] / 256);
    var pc2 = new paper.Color(palette[1][0] / 256, palette[1][1] / 256, palette[1][2] / 256);

    var c1 = new paper.Path.Rectangle({
      point: [0, gridDim * gridSize],
      size: [gridSize * gridDim / 2, 50],
      strokeColor: pc1,
      fillColor: pc1
    });

    var c2 = new paper.Path.Rectangle({
      point: [gridSize * gridDim / 2, gridDim * gridSize],
      size: [gridSize * gridDim / 2, 50],
      strokeColor: pc2,
      fillColor: pc2
    });

    paper.view.draw();
  }

  return {
    pixelate: pixelate
  }

})();
