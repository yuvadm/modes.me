Effects = (function() {
  function pixelate(id) {
    var canvas = document.getElementById('canvas-' + id);
    var p = new paper.PaperScope();
    p.setup(canvas);

    var raster = new paper.Raster('img-' + id);
    raster.visible = false;
    var gridSize = 8;
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

          cols.push([
            Math.round(256 * color.red),
            Math.round(256 * color.green),
            Math.round(256 * color.blue),
          ]);

          var rec = new paper.Path.Rectangle({
            point: [x * gridSize, y * gridSize],
            size: [gridSize, gridSize],
            strokeWidth: 0,
            fillColor: color
          });
        }
      }

      p.view.draw();

      var hsvcols = _.map(cols, function(c) {
        var tc = new tinycolor({r: c[0], g: c[1], b: c[2]});
        return tc.toHsv()
      });

      var hscols = _.map(hsvcols, function(c) {
        return new Array(c.h, c.s);
      });

      var k = new KMeans();
      k.cluster(hscols, 2);
      var centroids = k.centroids;

      var valued_centroids = _.map(centroids, function(cent, i) {
        var cluster = _.filter(hsvcols, function(c) {
          return k.classify(new Array(c.h, c.s)) == i;
        });
        var vval = _.reduce(cluster, function(m, c) {
          return m + c.v;
        }, 0) / cluster.length;
        var r = new tinycolor({h: cent[0], s: cent[1], v: vval});
        var rgb = r.toRgb();
        return new Array(rgb.r, rgb.g, rgb.b);
      });

      _.each(hsvcols, function(c) {
        var hs = new Array(c.h, c.s);
        var cent = centroids[k.classify(hs)];
      });

      var newcols = _.map(cols, function(col) {
        var c = new tinycolor({r: col[0], g: col[1], b: col[2]});
        var hsv = c.toHsv();
        var hs = new Array(hsv.h, hsv.s);
        return valued_centroids[k.classify(hs)];
      });

      // console.log(centroids, valued_centroids, cols, newcols);

      Session.set(id + ':colors', cols);
      Session.set(id + ':palette', valued_centroids);
      Session.set(id + ':newcolors', newcols);
    });
  }

  function colorize(id) {
    var canvas = document.getElementById('canvas-' + id);
    var p = new paper.PaperScope();
    p.setup(canvas);

    // params
    var gridSize = 8;
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
    var all_colors = _.flatten(
      _.union(
        _.map(
          Session.get('photos'), function (x) {
            return Session.get(x.id + ':colors');
          }
        )
      ), true  // shallow
    );

    var all_colors_hsv = _.map(all_colors, function(col) {
      var c = new tinycolor({r: col[0], g: col[1], b: col[2]});
      var hsv = c.toHsv();
      return hsv;
      return new Array(hsv.h, hsv.s, hsv.v);
    });

    var all_colors_hs = _.map(all_colors_hsv, function(hsv) {
      return new Array(hsv.h, hsv.s);
    });

    var k = new KMeans();
    k.cluster(all_colors_hs, 2);
    var centroids = k.centroids;

    var valued_centroids = _.map(centroids, function(cent, i) {
      var cluster = _.filter(all_colors_hsv, function(c) {
        return k.classify(new Array(c.h, c.s)) == i;
      });
      var vval = _.reduce(cluster, function(m, c) {
        return m + c.v;
      }, 0) / cluster.length;
      var r = new tinycolor({h: cent[0], s: cent[1], v: vval});
      var rgb = r.toRgb();
      return new Array(rgb.r, rgb.g, rgb.b);
    });

    var g_p1 = new paper.Color(valued_centroids[0][0] / 256, valued_centroids[0][1] / 256, valued_centroids[0][2] / 256);
    var g_p2 = new paper.Color(valued_centroids[1][0] / 256, valued_centroids[1][1] / 256, valued_centroids[1][2] / 256);

    Session.set('g_p1', g_p1);
    Session.set('g_p2', g_p2);

    valued_centroids = _.map(valued_centroids, function(c) {
      return _.map(c, function(cc) {
        return Math.round(cc);
      })
    });

    return valued_centroids;
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
    var gridSize = 8;
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
      }, i * 400)
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
    _.each(Session.get('photos'), function (p, i) {
      var id = p.id;
      cols.push(Session.get(id + ':finalcols'));
    });

    // transpose to get pixel color groups
    cols = _.zip.apply(_, cols);

    for (var y = 0; y < gridDim; y++) {
      for (var x = 0; x < gridDim; x++) {
        _.delay(function(x, y) {

          // get most recurring item/color
          var col = cols[(y * gridDim) + x];
          var c = _.chain(col).countBy().pairs().max(_.last).head().value().split(',');
          var nc = new paper.Color(+c[0], +c[1], +c[2]);

          var rec = new paper.Path.Rectangle({
            point: [x * gridSize, y * gridSize],
            size: [gridSize, gridSize],
            strokeWidth: 0,
            fillColor: nc
          });

          p.view.draw();
        }, ((y * gridDim) + x) * 35, x, y);
      }
    }
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
