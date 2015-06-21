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
            strokeWidth: 0,
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
      Session.set(id + ':palette', palette);
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
          strokeWidth: 0,
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
    var g_palette = quant.palette(true);
    var g_p1 = new paper.Color(g_palette[0][0] / 256, g_palette[0][1] / 256, g_palette[0][2] / 256);
    var g_p2 = new paper.Color(g_palette[1][0] / 256, g_palette[1][1] / 256, g_palette[1][2] / 256);

    Session.set('g_p1', g_p1);
    Session.set('g_p2', g_p2);

    return g_palette;
  }

  function averageColor(id) {
    var cols = Session.get(id + ':newcolors');
    var palette = Session.get(id + ':palette');

    var g_p1 = new paper.Color(Session.get('g_p1'));
    var g_p2 = new paper.Color(Session.get('g_p2'));

    var canvas = document.getElementById('canvas-' + id);
    var p = new paper.PaperScope();
    p.setup(canvas);

    // params
    var gridSize = 6;
    var gridDim = 9;

    var p1 = new paper.Color(palette[0][0] / 256, palette[0][1] / 256, palette[0][2] / 256);
    var p2 = new paper.Color(palette[1][0] / 256, palette[1][1] / 256, palette[1][2] / 256);

    var d1 = Math.abs(p1.red - g_p1.red) + Math.abs(p1.green - g_p1.green) + Math.abs(p1.blue - g_p1.blue);
    var d2 = Math.abs(p2.red - g_p1.red) + Math.abs(p2.green - g_p1.green) + Math.abs(p2.blue - g_p1.blue);
    var d3 = Math.abs(p1.red - g_p2.red) + Math.abs(p1.green - g_p2.green) + Math.abs(p1.blue - g_p2.blue);
    var d4 = Math.abs(p2.red - g_p2.red) + Math.abs(p2.green - g_p2.green) + Math.abs(p2.blue - g_p2.blue);


    var flipped = false;

    if (d1+d4 > d2+d3) {
      var t = p2;
      p2 = p1;
      p1 = t;
      flipped = true;
    }

    var finalcols = [];

    for (var y = 0; y < gridDim; y++) {
      for(var x = 0; x < gridDim; x++) {
        var c = cols[(y * gridDim) + x];

        var nc;
        if (c[0] == palette[0][0] && c[1] == palette[0][1] && palette[0][2]) {
          nc = flipped ? g_p2 : g_p1;
        } else {
          nc = flipped ? g_p1 : g_p2;
        }

        finalcols.push(nc);

        var rec = new paper.Path.Rectangle({
          point: [x * gridSize, y * gridSize],
          size: [gridSize, gridSize],
          strokeWidth: 0,
          fillColor: nc
        });
      }
    }

    p.view.draw();

    Session.set(id + ':finalcols', finalcols);
  }

  function drawFinal() {
    var canvas = document.getElementById('canvas-final');
    var p = new paper.PaperScope();
    p.setup(canvas);

    var gridSize = 35;
    var gridDim = 9;

    _.each(Session.get('photos'), function (x, i) {
      var id = x.id;
      _.delay(function () {
        var cols = Session.get(id + ':finalcols');
        for (var y = 0; y < gridDim; y++) {
          for(var x = 0; x < gridDim; x++) {
            var c = cols[(y * gridDim) + x];
            var nc = new paper.Color(c[0], c[1], c[2], 0.5);

            var rec = new paper.Path.Rectangle({
              point: [x * gridSize, y * gridSize],
              size: [gridSize, gridSize],
              strokeWidth: 0,
              fillColor: nc
            });
          }
        }
        p.view.draw();
      }, i * 1000)
    })
  }

  function drawFinalIcon() {
    var canvas = document.getElementById('canvas-final');
    var p = new paper.PaperScope();
    p.setup(canvas);

    var gridSize = 35;
    var gridDim = 9;
    var photos = $('div.photo').length;

    var cols = [];
    _.each(Session.get('photos'), function (x, i) {
      var id = x.id;
      cols.push(Session.get(id + ':finalcols'));
    });

    for (var y = 0; y < gridDim; y++) {
      for(var x = 0; x < gridDim; x++) {

        var c = []
        for (var j = 0; j < photos; j++) {
          c.push(cols[j][(y * gridDim) + x]);
        }

        var freq_col = _.chain(c).countBy().pairs().max(_.last).head().value();
        freq_col = freq_col.split(',');
        var nc = new paper.Color(+freq_col[0], +freq_col[1], +freq_col[2]);

        var rec = new paper.Path.Rectangle({
          point: [x * gridSize, y * gridSize],
          size: [gridSize, gridSize],
          strokeWidth: 0,
          fillColor: nc
        });
      }
    }
    p.view.draw();

  }

  return {
    pixelate: pixelate,
    colorize: colorize,
    average: average,
    averageColor: averageColor,
    drawFinal: drawFinal,
    drawFinalIcon: drawFinalIcon
  }

})();
