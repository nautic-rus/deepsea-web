require(['Ember', 'cnc/ui/graphicView', 'cnc/cam/cam', 'cnc/util', 'cnc/ui/gcodeEditor', 'cnc/gcode/gcodeSimulation', 'templates'],
  function (Ember, GraphicView, cam, util, gcodeEditor, gcodeSimulation) {
    var demoCode = $('#demoCode').text();

    Ember.Handlebars.helper('num', function (value) {
      return new Handlebars.SafeString(Handlebars.Utils.escapeExpression(util.formatCoord(value)));
    });
    Ember.TEMPLATES['application'] = Ember.TEMPLATES['camApp'];

    window.Simulator = Ember.Application.create({
      rootElement: '#app'
    });

    Simulator.GcodeEditorComponent = gcodeEditor.GcodeEditorComponent;
    Simulator.GraphicView = GraphicView;

    Simulator.ApplicationController = Ember.ObjectController.extend({
      init: function () {
        this._super();
        var _this = this;
        $(window).on('dragover', function (event) {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        });

        $(window).on('drop', function (evt) {
          evt.preventDefault();
          evt.stopPropagation();
          var files = evt.dataTransfer.files;
          var file = files[0];
          var reader = new FileReader();
          reader.onload = function (e) {
            _this.set('code', e.target.result);
            _this.launchSimulation();
          };
          reader.readAsText(file);
        });
        this.launchSimulation();
      },
      actions: {
        simulate: function () {
          this.launchSimulation();
        },
      },
      launchSimulation: function () {
        var _this = this;

        function handleResult(result) {
          _this.flushFragmentFile();
          var errors = [];
          for (var i = 0; i < result.errors.length; i++) {
            var error = result.errors[i];
            errors.push({row: error.lineNo, text: error.message, type: "error"});
          }
          _this.set('errors', errors);
          _this.set('bbox', {min: result.min, max: result.max});
          _this.set('totalTime', result.totalTime);
          _this.set('lineSegmentMap', result.lineSegmentMap);
          _this.set('computing', false);
          console.timeEnd('simulation');
        }

        console.time('simulation');
        this.set('computing', true);
        _this.set('lineSegmentMap', []);
        this.get('simulatedPath').clear();
        gcodeSimulation.parseInWorker(this.get('code'), new util.Point(0, 0, 0),
          Ember.run.bind(_this, handleResult),
          Ember.run.bind(_this, function (fragment) {
            _this.get('fragmentFile').pushObject(fragment);
            Ember.run.throttle(_this, _this.flushFragmentFile, 500);
          }));
      },
      flushFragmentFile: function () {
        this.get('simulatedPath').pushObjects(this.get('fragmentFile'));
        this.get('fragmentFile').clear();
      },
      formattedTotalTime: function () {
        var totalTime = this.get('totalTime');
        var humanized = util.humanizeDuration(totalTime);
        return {humanized: humanized, detailed: Math.round(totalTime) + 's'};
      }.property('totalTime'),
      currentHighLight: function () {
        return this.get('lineSegmentMap')[this.get('currentRow')];
      }.property('currentRow', 'lineSegmentMap').readOnly(),
      code: demoCode,
      errors: [],
      bbox: {},
      totalTime: 0,
      lineSegmentMap: [],
      currentRow: null,
      simulatedPath: [],
      computing: false,
      fragmentFile: [],
      canSelectLanguage: false,
      usingGcode: true,
      decorations: []
    });
  });
