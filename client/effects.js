Effects = (function() {
  function pixelate(id) {
    var canvas = document.getElementById('canvas-' + id);
    var p = new paper.PaperScope();
    p.setup(canvas);

    var raster = new paper.Raster('img-' + id);
    raster.visible = false;
    var gridSize = 6;
    var gridDim = 9;
    var cols = [];

    raster.size = new paper.Size(153, 153); // hard coded workaround to round values
    raster.position = p.view.center;

    raster.on('load', function() {
      var h = Math.round(raster.height / gridDim);
      var w = Math.round(raster.width / gridDim);

      for (var y = 0; y < gridDim; y++) {
        for(var x = 0; x < gridDim; x++) {

          var color = raster.getAverageColor(new paper.Path.Rectangle({
            point: [w*x, h*y],
            size: [w, h]
          }));

          // console.log(w, h, x, y, color.red, color.green, color.blue);

          cols.push(
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

      p.view.draw();

      cols = new Uint8Array(cols);

      var quant = new RgbQuant({
        colors: 2,
        minHueCols: 16
      });
      quant.sample(cols);
      var palette = quant.palette(true);
      var newcolors = quant.reduce(cols);

      // if (window.gb === undefined)
      //   window.gb = [];
      // window.gb.push(palette[0][0], palette[0][1], palette[0][2], 0.16);
      // window.gb.push(palette[1][0], palette[1][1], palette[1][2], 0.16);

      var newcolors2 = [];
      for (var x=0; x < gridDim * gridDim; x++) {
        newcolors2.push([newcolors[(x*4)], newcolors[(x*4)+1], newcolors[(x*4)+2]]);
        // skip dummy alpha value (x*4)+3
      }

      Session.set(id + ':colors', cols);
      Session.set(id + ':newcolors', newcolors2);
    });
  }

  function colorize(id) {
    var canvas = document.getElementById('canvas-' + id);
    var p = new paper.PaperScope();
    p.setup(canvas);

    // params
    var gridSize = 6;
    var gridDim = 9;

    // fetch the new colors
    var pc1 = new paper.Color(Session.get(id + ':pc1'));
    var pc2 = new paper.Color(Session.get(id + ':pc2'));
    var colors = Session.get(id + ':newcolors');

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

    p.view.draw();
  }

  function average() {
    var canvas = document.getElementById('canvas-all');
    var p = new paper.PaperScope();
    p.setup(canvas);

    var i = 0;
    var photos = $('.instagram-photo');
    canvas.width = 150;
    canvas.style.width = 150;

    _.each(photos, function(x) {
      var raster = new paper.Raster(x);
      raster.position = new paper.Size(75, 75);
      raster.opacity = 1 / photos.length;
    })

    p.view.draw();

    var quant = new RgbQuant({
      colors: 2,
      minHueCols: 16
    });
    quant.sample(canvas);
    var palette = quant.palette(true);

    console.log(palette);
  }

  return {
    pixelate: pixelate,
    colorize: colorize,
    average: average
  }

})();
