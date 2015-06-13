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
        colors.push(
          Math.round(256 * color.red),
          Math.round(256 * color.green),
          Math.round(256 * color.blue),
          1 // alpha
        );
        var rec = new paper.Path.Rectangle({
          point: [x * gridSize, y * gridSize],
          size: [gridSize, gridSize],
          strokeColor: color,
          fillColor: color
        });
      }
    }

    paper.view.draw();

    // quantize now
    var quant = new RgbQuant({
      colors: 2,
      minHueCols: 2
    });
    quant.sample(colors);
    var palette = quant.palette(true);
    var newcolors = quant.reduce(colors);

    var newcolors2 = [];
    for (var x=0; x < gridDim * gridDim; x++) {
      newcolors2.push([newcolors[(x*4)], newcolors[(x*4)+1], newcolors[(x*4)+2]]);
      // skip dummy alpha value (x*4)+3
    }

    // two primary colors
    var pc1 = new paper.Color(palette[0][0] / 256, palette[0][1] / 256, palette[0][2] / 256);
    var pc2 = new paper.Color(palette[1][0] / 256, palette[1][1] / 256, palette[1][2] / 256);

    // save for later
    Session.set(id + ':pc1', pc1);
    Session.set(id + ':pc2', pc2);
    Session.set(id + ':colors', colors);
    Session.set(id + ':newcolors', newcolors2);
    console.log(newcolors2);
  }

  function colorize(id) {
    var canvas = document.getElementById('canvas-' + id);
    paper.setup(canvas);

    // params
    var gridSize = 6;
    var gridDim = 9;

    // fetch the new colors
    var pc1 = new paper.Color(Session.get(id + ':pc1'));
    var pc2 = new paper.Color(Session.get(id + ':pc2'));
    var colors = Session.get(id + ':newcolors');

    console.log(colors);

    // sample each color, diff and color new pixels
    for (var y = 0; y < gridDim; y++) {
      for(var x = 0; x < gridDim; x++) {
        var c = colors[(y * gridDim) + x];
        var nc = new paper.Color(c[0] / 256, c[1] / 256, c[2] / 256);

        // console.log(x * gridSize, y * gridSize, nc);

        var rec = new paper.Path.Rectangle({
          point: [x * gridSize, y * gridSize],
          size: [gridSize, gridSize],
          strokeColor: nc,
          fillColor: nc
        });
      }
    }

    paper.view.draw();
  }

  return {
    pixelate: pixelate,
    colorize: colorize
  }

})();
